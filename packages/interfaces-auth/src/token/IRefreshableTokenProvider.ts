/**
 * A token provider that can be told to obtain a new token.
 */

import type { ITokenProvider } from './ITokenProvider';
import type { ITokenRequestOptions } from './ITokenRequestOptions';
import type { ITokenResult } from './ITokenResult';

/**
 * `getTokens()` answers from the cache while the cached token looks valid, so
 * it cannot answer "the server just refused this token": a caller holding a
 * 401 asks it again and gets the same token back. `refreshTokens()` is that
 * question. A caller that needs it — anything implementing
 * `ITokenRefresher.refreshToken()` on top of a provider — requires this
 * interface rather than probing for the member.
 */
export interface IRefreshableTokenProvider extends ITokenProvider {
  /**
   * A new token, never the cached one.
   *
   * The provider uses its refresh token when it holds one and falls back to
   * its login flow when it does not or when the refresh is refused. What it
   * obtains replaces its cache, so a later `getTokens()` answers it.
   *
   * **Rejects with an `IAuthProviderFailure`**, as `getTokens()` does: read it
   * with `readFailure(thrown, operation)` from `@mcp-abap-adt/auth-errors`.
   *
   * @param options `signal` releases this caller when it no longer needs the
   *   token (see {@link ITokenRequestOptions}). Optional, so an implementation
   *   that takes no parameter still satisfies the contract.
   */
  refreshTokens(options?: ITokenRequestOptions): Promise<ITokenResult>;
}
