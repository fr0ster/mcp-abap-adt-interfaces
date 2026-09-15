import type { ILogger } from '../logging/ILogger';

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
   * How long to wait for the callback. Mandatory: there is no such thing as
   * waiting forever, and the absence of this bound is a known way to strand a
   * port.
   *
   * Must satisfy `Number.isFinite(timeoutMs) && timeoutMs > 0 && timeoutMs <=
   * 2_147_483_647`. The upper bound is Node's rather than this contract's:
   * `setTimeout` takes a 32-bit signed delay, and a larger value fires after
   * 1 ms with a `TimeoutOverflowWarning` — so a generous-looking timeout would
   * end the login almost instantly. Implementations reject such a value rather
   * than clamping it, because clamping hides the mistake.
   */
  readonly timeoutMs: number;

  /**
   * External cancellation — "this login is no longer needed". Honoured whether
   * it fires before the bind, during it, or while waiting for the callback.
   */
  readonly signal?: AbortSignal;

  /**
   * Where the transport reports what it did — an ignored request that was not
   * our redirect, for instance. Absent means silence; never stdout.
   */
  readonly logger?: ILogger;
}

/**
 * Borrowed handle on a listening callback server.
 *
 * Valid until the scope reaches its first terminal outcome, which may be before
 * the factory's callback has finished: a timeout or an abort ends the scope
 * without stopping an already-running callback. Members behave differently once
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
   * Rejects on timeout, on cancellation, on `fail`, and when the scope ends
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
   * A launcher that rejects after the login has already timed out must not turn
   * that into a fresh unhandled rejection.
   */
  fail(error: Error): void;
}

/**
 * The only way to obtain a callback server.
 *
 * There is deliberately no `close` on the handle: closing belongs to the
 * factory, so it cannot be forgotten.
 *
 * The factory settles on the first terminal outcome — the callback returning or
 * throwing, `fail`, the timeout, or an abort — and only once the listening
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
 * const code = await withBrowserCallbackServer(
 *   { port, timeoutMs, signal },
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
