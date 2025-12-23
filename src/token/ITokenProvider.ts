/**
 * Token Provider interface
 *
 * Stateful providers that manage token lifecycle internally.
 * Supports both old stateless methods (for backward compatibility) and new stateful getTokens() method.
 */

import type { IAuthorizationConfig } from '../auth/IAuthorizationConfig';
import type { ITokenProviderOptions } from './ITokenProviderOptions';
import type { ITokenProviderResult } from './ITokenProviderResult';
import type { ITokenResult } from './ITokenResult';

/**
 * Interface for token providers
 *
 * Supports both:
 * - Old stateless methods (for backward compatibility with existing code)
 * - New stateful getTokens() method (for new implementations)
 */
export interface ITokenProvider {
  /**
   * Get tokens with automatic refresh/relogin logic (NEW - stateful method)
   *
   * Stateful providers cache tokens internally and handle refresh automatically.
   * Checks token expiration, refreshes if needed, or triggers login.
   *
   * @returns Promise that resolves to token result with authorization token, optional refresh token, auth type, and expiration
   */
  getTokens?(): Promise<ITokenResult>;

  /**
   * Get connection configuration with token from authorization configuration (OLD - stateless method)
   * @param authConfig Authorization configuration (UAA credentials, optional refresh token)
   * @param options Optional provider-specific options (e.g., browser type for BTP)
   * @returns Promise that resolves to connection configuration with authorization token and optional refresh token
   */
  getConnectionConfig?(
    authConfig: IAuthorizationConfig,
    options?: ITokenProviderOptions,
  ): Promise<ITokenProviderResult>;

  /**
   * Refresh token using refresh token from session (OLD - stateless method)
   * This method uses the refresh token from the session to get a new access token.
   * Typically uses refresh_token grant type or browser-based re-authentication.
   * @param authConfig Authorization configuration including refreshToken from session
   * @param options Optional provider-specific options (e.g., browser type for BTP)
   * @returns Promise that resolves to connection configuration with new authorization token and optional new refresh token
   */
  refreshTokenFromSession?(
    authConfig: IAuthorizationConfig,
    options?: ITokenProviderOptions,
  ): Promise<ITokenProviderResult>;

  /**
   * Refresh token using UAA credentials from service key (OLD - stateless method)
   * This method uses UAA credentials (uaaUrl, uaaClientId, uaaClientSecret) to get a new token.
   * Typically uses browser-based authorization flow to ensure proper role assignment.
   * @param authConfig Authorization configuration with UAA credentials from service key (no refreshToken)
   * @param options Optional provider-specific options (e.g., browser type for BTP)
   * @returns Promise that resolves to connection configuration with new authorization token and optional refresh token
   */
  refreshTokenFromServiceKey?(
    authConfig: IAuthorizationConfig,
    options?: ITokenProviderOptions,
  ): Promise<ITokenProviderResult>;

  /**
   * Validate JWT token by testing connection to service
   * @param token JWT token to validate
   * @param serviceUrl Service URL (optional, for services that require URL validation)
   * @returns Promise that resolves to true if token is valid, false otherwise
   */
  validateToken?(token: string, serviceUrl?: string): Promise<boolean>;
}
