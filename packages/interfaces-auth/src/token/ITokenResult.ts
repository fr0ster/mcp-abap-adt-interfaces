/**
 * Token result interface
 *
 * Result returned by ITokenProvider.getTokens() method
 */

import type { OAuth2GrantType } from './AuthType';
import type { RefreshTokenDisposition } from './RefreshTokenDisposition';

export interface ITokenResult {
  /**
   * Authorization token (access token)
   */
  authorizationToken: string;

  /**
   * Refresh token (optional, not all grant types provide it)
   */
  refreshToken?: string | undefined;

  /**
   * Authentication type (OAuth2 grant type used)
   */
  authType: OAuth2GrantType;

  /**
   * Token expiration time in seconds
   * If not provided, token expiration is determined from JWT exp claim
   */
  expiresIn?: number | undefined;

  /**
   * Token expiration time as absolute timestamp (milliseconds since epoch)
   * Useful for non-JWT tokens (e.g. SAML assertions).
   */
  expiresAt?: number | undefined;

  /**
   * Token format/type (helps consumers decide how to validate or parse).
   * If omitted, defaults to JWT assumptions.
   */
  tokenType?: 'jwt' | 'saml' | 'opaque' | undefined;

  /**
   * What this result means for a stored refresh token: `'replace'` it with
   * `refreshToken`, `'keep'` the stored one, or `'clear'` it — the provider cut
   * the one it held, and a stored copy must not be submitted again.
   *
   * Optional so a 4.x-shaped result still compiles. A reader that finds it
   * absent infers the 4.x meaning: a `refreshToken` present is `'replace'`,
   * none is `'keep'`.
   */
  readonly refreshTokenDisposition?: RefreshTokenDisposition | undefined;
}
