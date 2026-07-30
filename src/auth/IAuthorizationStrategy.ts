/**
 * How an interactive authorization is conducted.
 *
 * The provider owns what it can compute — the authorization URL and the token
 * exchange. Everything between them (reaching the URL, receiving what comes
 * back, the port, the timeout) belongs to whoever implements this interface,
 * which is why a consumer can replace it wholesale.
 *
 * See `ICallbackServer` for the transport a shipped strategy is composed of.
 */

import type { ILogger } from '../logging/ILogger';

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

  /** For progress messages. Absent means silence — never stdout. */
  readonly logger?: ILogger;
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
