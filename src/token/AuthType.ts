/**
 * OAuth2 Grant Types
 *
 * Constants for different OAuth2 authentication flows (grant types)
 */

/**
 * Authorization Code grant type
 * Standard OAuth2 flow with browser-based authorization
 */
export const AUTH_TYPE_AUTHORIZATION_CODE = 'authorization_code' as const;

/**
 * Authorization Code with PKCE grant type
 * More secure variant for public clients
 */
export const AUTH_TYPE_AUTHORIZATION_CODE_PKCE =
  'authorization_code_pkce' as const;

/**
 * Implicit grant type
 * Legacy OAuth2 flow (deprecated, not recommended)
 */
export const AUTH_TYPE_IMPLICIT = 'implicit' as const;

/**
 * Password Credentials grant type
 * Direct username/password authentication
 */
export const AUTH_TYPE_PASSWORD = 'password' as const;

/**
 * Client Credentials grant type
 * Service-to-service authentication
 */
export const AUTH_TYPE_CLIENT_CREDENTIALS = 'client_credentials' as const;

/**
 * Union type for all OAuth2 grant types
 */
export type OAuth2GrantType =
  | typeof AUTH_TYPE_AUTHORIZATION_CODE
  | typeof AUTH_TYPE_AUTHORIZATION_CODE_PKCE
  | typeof AUTH_TYPE_IMPLICIT
  | typeof AUTH_TYPE_PASSWORD
  | typeof AUTH_TYPE_CLIENT_CREDENTIALS;
