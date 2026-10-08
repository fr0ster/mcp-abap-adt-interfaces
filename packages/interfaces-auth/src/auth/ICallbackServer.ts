import type { ILogger } from '@mcp-abap-adt/interfaces-utils';

/**
 * Local callback server used by interactive authorization flows.
 *
 * This interface is intentionally domain-agnostic: it describes the lifetime of
 * a short-lived local listener that receives a redirect, not what the redirect
 * carries. OAuth authorization codes, OIDC `code` + `state` and SAML
 * `SAMLResponse` all fit through the same contract, parameterised by result.
 *
 * The handle is borrowed: it exists for the duration of the factory's callback,
 * and the port is released on the first terminal outcome. Releasing the socket
 * is therefore never a consequence of a wait settling — which is exactly what
 * lets an abandoned login hold a port for the lifetime of a process.
 */

/**
 * @deprecated Since 7.4.0. Interactive authorization is composed of parts —
 * `IAuthorizationPresentation`, `IAnswerTransport`, `IAuthorizationProtocol`
 * (see `IAuthorizationParts`) — and no package implements or reads this option set
 * any more. Kept so a consumer written against 7.3.0 still compiles; removed
 * in the next major of this package made for another reason.
 */
export interface ICallbackServerOptions {
  /**
   * Port for the local listener. Must be an integer in 0..65535.
   *
   * `0` means "bind an ephemeral port": the handle then reports what the OS
   * actually gave, and the authorization URL must be built from
   * `handle.redirectUri` rather than from anything known beforehand. A flow
   * that assembles its URL before binding — or one whose redirect is
   * registered with the identity provider, as a SAML ACS always is — cannot
   * use it, because the redirect would advertise a port nobody is listening on.
   */
  readonly port: number;

  /**
   * External cancellation — "this login is no longer needed". Honoured whether
   * it fires before the bind, during it, or while waiting for the callback.
   *
   * **The only way a scope ends without a result** other than by its own
   * body (returning, throwing, `fail`) or an explicit error from the identity
   * provider. There is no timeout: a consumer that wants a bound composes one
   * — `AbortSignal.timeout(ms)`, or its own controller. Absent, the scope
   * waits until one of the others happens.
   */
  readonly signal?: AbortSignal | undefined;

  /**
   * Where the transport reports what it did — an ignored request that was not
   * our redirect, for instance. Absent means silence; never stdout.
   */
  readonly logger?: ILogger | undefined;
  /**
   * The bind address. Not given, a transport binds loopback only
   * (`127.0.0.1`, and `::1` when the redirect host is `localhost`) — never
   * every interface. A consumer that wants the transport reachable from
   * another machine sets it (e.g. `0.0.0.0`) together with `allowedHosts`.
   */
  readonly host?: string | undefined;
  /**
   * The authorities (`host` or `host:port`) a browser may use to reach the
   * transport besides loopback; an entry without a port matches the bound
   * port. Every request whose `Host` header is neither loopback with the
   * bound port nor one of these is refused before anything is served — so a
   * DNS-rebound name cannot read a page or settle a callback. The bind
   * address is not an authority: a browser never sends `Host: 0.0.0.0`.
   */
  readonly allowedHosts?: readonly string[] | undefined;
  /**
   * `true`: from the bind on, every request to the callback (a payload or an
   * explicit error) is refused and ignored until the strategy arms the gate
   * with {@link ICallbackServerHandle.expectState}. Lets a strategy build its
   * authorization URL — which may await network discovery — while the socket
   * listens, without a forged callback settling the scope meanwhile.
   */
  readonly gated?: boolean | undefined;
}

/**
 * @deprecated Since 7.4.0 — see `ICallbackServerOptions`; the parts of
 * `IAuthorizationParts` replace it.
 *
 * Borrowed handle on a listening callback server.
 *
 * Valid until the scope reaches its first terminal outcome, which may be before
 * the factory's callback has finished: an abort ends the scope without
 * stopping an already-running callback. Members behave differently once
 * that has happened, so a still-running body cannot be harmed by touching it:
 *
 * - `fail()` becomes a silent no-op and never throws;
 * - `waitForResult()` returns a rejected promise, never throwing synchronously;
 * - `port` and `redirectUri` remain readable, being values rather than
 *   operations.
 */
export interface ICallbackServerHandle<TResult> {
  /** The port actually bound. */
  readonly port: number;

  /** Redirect URI the authorization request must use. */
  readonly redirectUri: string;

  /**
   * The result delivered to the callback endpoint.
   *
   * Returns the same promise on every call, so it is safe to call repeatedly.
   * Rejects on cancellation (the `signal`), on `fail`, and when the scope ends
   * while it is still pending — the last of which is why an implementation must
   * mark the promise handled on creation, so a body that creates it and walks
   * away cannot raise `unhandledRejection`.
   *
   * Receiving a result does **not** end the scope. It hands the value to
   * whoever is awaiting; the scope ends when the factory's callback returns.
   */
  waitForResult(): Promise<TResult>;

  /**
   * End the wait with an error — typically because the browser could not be
   * launched.
   *
   * Safe to call at any time, including after the scope has ended, because it
   * is meant to be used fire-and-forget:
   *
   * ```ts
   * launchBrowser(url).catch((e) => server.fail(e));
   * ```
   *
   * A launcher that rejects after the login has already been aborted must not
   * turn that into a fresh unhandled rejection.
   */
  fail(error: Error): void;
  /**
   * Arms the gate of a transport opened with `gated: true`. A string: only a
   * callback whose `state` equals it (compared in constant time) settles the
   * scope — a payload or an explicit error alike; every other request is
   * refused, counted and ignored, and the wait goes on. `null`: the
   * authorization URL carries no `state` (one the consumer configured), and
   * callbacks are accepted as without a gate.
   *
   * Optional, so a transport written before 7.3.0 still satisfies the
   * contract; a strategy that needs the gate refuses a transport without it.
   */
  expectState?(state: string | null): void;
}

/**
 * @deprecated Since 7.4.0 — see `ICallbackServerOptions`; an `IAnswerTransport`
 * replaces it.
 *
 * The only way to obtain a callback server.
 *
 * There is deliberately no `close` on the handle: closing belongs to the
 * factory, so it cannot be forgotten.
 *
 * The factory settles on the first terminal outcome — the callback returning or
 * throwing, `fail`, or an abort of `signal` — and only once the listening
 * socket has been released, so a settled result always means the port is free.
 * On success it resolves with whatever the callback returned — which need not be
 * the payload itself, so `transform(await server.waitForResult())` resolves with
 * the transformed value.
 *
 * It does **not** promise to stop the callback: an arbitrary async function
 * cannot be force-terminated. A failure outcome ends the scope without waiting
 * for it, and a later settlement from the abandoned body is discarded.
 *
 * There are two type parameters, and the split matters:
 *
 * - `TResult` is on the alias, because the payload a flow's callback endpoint
 *   delivers is fixed by that flow. Were it generic per call, a browser-code
 *   factory would type-check against a caller expecting something it can never
 *   yield.
 * - `TReturn` is generic per call, because the scope resolves with whatever the
 *   callback returned. Tying it to `TResult` would forbid the transformation
 *   shown above — `transform(await server.waitForResult())` may legitimately
 *   produce a token, a session, or anything else built from the payload.
 *
 * ```ts
 * // No timeout of its own: the signal bounds the wait — the consumer's
 * // controller, or `AbortSignal.timeout(ms)` when it wants a bound.
 * const code = await withBrowserCallbackServer(
 *   { port, signal },
 *   async (server) => {
 *     const waiting = server.waitForResult();
 *     launchBrowser(buildAuthUrl(server.redirectUri)).catch((e) => server.fail(e));
 *     return await waiting;
 *   },
 * );
 * // reached only once the port is free — whatever the outcome
 * ```
 */
export type CallbackServerFactory<TResult> = <TReturn>(
  options: ICallbackServerOptions,
  use: (server: ICallbackServerHandle<TResult>) => Promise<TReturn>,
) => Promise<TReturn>;
