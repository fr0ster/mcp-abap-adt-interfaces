/**
 * Token result interface
 *
 * Result returned by ITokenProvider.getTokens() method
 */

import type { OAuth2GrantType } from './AuthType';

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
}
