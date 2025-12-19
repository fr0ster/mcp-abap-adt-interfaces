/**
 * Token Provider interface
 * 
 * Converts IAuthorizationConfig to IConnectionConfig by obtaining tokens.
 * Different implementations handle different authentication flows:
 * - XSUAA: client_credentials grant type (no browser)
 * - BTP/ABAP: browser-based OAuth2 or refresh token
 */

import type { IAuthorizationConfig } from '../auth/IAuthorizationConfig';
import type { IConnectionConfig } from '../auth/IConnectionConfig';
import type { ITokenProviderResult } from './ITokenProviderResult';
import type { ITokenProviderOptions } from './ITokenProviderOptions';

/**
 * Interface for token providers
 * 
 * Takes authorization configuration and returns connection configuration with token.
 */
export interface ITokenProvider {
  /**
   * Get connection configuration with token from authorization configuration
   * @param authConfig Authorization configuration (UAA credentials, optional refresh token)
   * @param options Optional provider-specific options (e.g., browser type for BTP)
   * @returns Promise that resolves to connection configuration with authorization token and optional refresh token
   */
  getConnectionConfig(
    authConfig: IAuthorizationConfig,
    options?: ITokenProviderOptions
  ): Promise<ITokenProviderResult>;

  /**
   * Refresh token using refresh token from session (authorization config with refreshToken)
   * This method uses the refresh token from the session to get a new access token.
   * Typically uses refresh_token grant type or browser-based re-authentication.
   * @param authConfig Authorization configuration including refreshToken from session
   * @param options Optional provider-specific options (e.g., browser type for BTP)
   * @returns Promise that resolves to connection configuration with new authorization token and optional new refresh token
   */
  refreshTokenFromSession(
    authConfig: IAuthorizationConfig,
    options?: ITokenProviderOptions
  ): Promise<ITokenProviderResult>;

  /**
   * Refresh token using UAA credentials from service key (authorization config without refreshToken)
   * This method uses UAA credentials (uaaUrl, uaaClientId, uaaClientSecret) to get a new token.
   * Typically uses browser-based authorization flow to ensure proper role assignment.
   * @param authConfig Authorization configuration with UAA credentials from service key (no refreshToken)
   * @param options Optional provider-specific options (e.g., browser type for BTP)
   * @returns Promise that resolves to connection configuration with new authorization token and optional refresh token
   */
  refreshTokenFromServiceKey(
    authConfig: IAuthorizationConfig,
    options?: ITokenProviderOptions
  ): Promise<ITokenProviderResult>;

  /**
   * Validate JWT token by testing connection to service
   * @param token JWT token to validate
   * @param serviceUrl Service URL (optional, for services that require URL validation)
   * @returns Promise that resolves to true if token is valid, false otherwise
   */
  validateToken?(token: string, serviceUrl?: string): Promise<boolean>;
}

