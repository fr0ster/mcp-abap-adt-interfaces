/**
 * How an interactive authorization is conducted.
 *
 * The provider owns what it can compute — the authorization URL and the token
 * exchange. Everything between them (reaching the URL, receiving what comes
 * back, the port) belongs to whoever implements this interface, which is why a
 * consumer can replace it wholesale.
 *
 * A login has no built-in bound: it ends on a result, the identity provider's
 * explicit refusal, or an abort — the request's `signal`, or the strategy's
 * own option signal. A consumer that wants a bound composes one
 * (`AbortSignal.timeout(ms)`).
 *
 * See `IAuthorizationParts` for what a shipped strategy is composed of: a
 * presentation, a transport and a protocol (since 7.4.0; `ICallbackServer`,
 * the transport it was composed of before, is deprecated).
 */

import type { ILogger } from '@mcp-abap-adt/interfaces-utils';

/** What the provider tells a strategy about the login to conduct. */
export interface AuthorizationRequest {
  /**
   * Build the authorization URL for a redirect URI the strategy has settled on.
   *
   * Called once the strategy knows its redirect URI — which is what makes an
   * ephemeral port possible, since the URL cannot be assembled before the
   * socket is bound. May not be called at all: a strategy that already holds a
   * payload needs no URL.
   *
   * Asynchronous because building may require OIDC discovery. Rejects when the
   * redirect URI cannot be honoured — a pre-built authorization URL carries its
   * own redirect, and a mismatch must fail here, before a browser is opened,
   * rather than as a callback that never arrives.
   */
  buildAuthorizationUrl(redirectUri: string): Promise<string>;

  /**
   * The provider's signal for this login: aborted once no caller needs the
   * login any more. A strategy **must** honour it as it honours its own option
   * signal — end the login, release what it holds (a socket, a stdin reader),
   * and only then reject. A strategy that ignores it never settles an
   * abandoned login, and the provider's next login waits for it.
   */
  readonly signal?: AbortSignal | undefined;

  /** For progress messages. Absent means silence — never stdout. */
  readonly logger?: ILogger | undefined;
}

/** How the login ended. */
export interface AuthorizationOutcome<TResult> {
  /** What the redirect carried: a code, `{code, state}`, a SAMLResponse. */
  readonly payload: TResult;

  /**
   * The redirect URI that actually took part. The token exchange must send this
   * one — with an ephemeral port the provider has no other way to learn it.
   */
  readonly redirectUri: string;
}

/**
 * A way of conducting an interactive authorization.
 *
 * `authorize` may be called again sequentially; an implementation that holds a
 * fixed port should reject overlapping calls rather than queue them.
 *
 * `dispose` carries four obligations:
 * - idempotent — every call after the first resolves as a no-op;
 * - legal during an active `authorize`, which it ends with a rejection, since
 *   releasing resources while a socket is still bound would be untrue;
 * - resolves only once the resources are actually free;
 * - never masks a failure from `authorize` — a caller invoking it from
 *   `finally` propagates the original error and logs the cleanup one.
 */
export interface IAuthorizationStrategy<TResult> {
  authorize(
    request: AuthorizationRequest,
  ): Promise<AuthorizationOutcome<TResult>>;
  dispose?(): Promise<void>;
}
