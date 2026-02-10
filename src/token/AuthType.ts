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
 * User token passthrough (external token)
 */
export const AUTH_TYPE_USER_TOKEN = 'user_token' as const;

/**
 * Client X509 (mTLS) authentication
 */
export const AUTH_TYPE_CLIENT_X509 = 'client_x509' as const;

/**
 * SAML 2.0 Bearer Assertion grant type
 * Used to exchange SAML assertions for OAuth2 access tokens
 */
export const AUTH_TYPE_SAML2_BEARER = 'saml2_bearer' as const;

/**
 * Union type for all OAuth2 grant types
 */
export type OAuth2GrantType =
  | typeof AUTH_TYPE_AUTHORIZATION_CODE
  | typeof AUTH_TYPE_AUTHORIZATION_CODE_PKCE
  | typeof AUTH_TYPE_PASSWORD
  | typeof AUTH_TYPE_CLIENT_CREDENTIALS
  | typeof AUTH_TYPE_USER_TOKEN
  | typeof AUTH_TYPE_CLIENT_X509
  | typeof AUTH_TYPE_SAML2_BEARER;
