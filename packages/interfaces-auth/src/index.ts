/**
 * `@mcp-abap-adt/interfaces-auth` — credential, token, store and connection
 * configuration contracts, shared across the MCP ABAP ADT package families.
 *
 * **Most of what is here arrived from `@mcp-abap-adt/interfaces-adt` in its
 * 9.0.0**, and the reason is measured rather than argued. Three repositories —
 * `mcp-abap-adt-auth-broker`, `-auth-stores` and `-auth-providers` — imported 10,
 * 7 and 17 names from that package, and **every one of them landed in this
 * cluster**: nothing they took was an ADT contract. They tracked the
 * fastest-moving package in the family to describe authentication.
 *
 * The move needed no untangling: not one of the 23 files reaches `adt/`,
 * `connection/`, `runtime/`, `execution/`, `feeds/`, `service/` or `shared/`,
 * by relative path or by package. Their only outside dependency was, and is,
 * `@mcp-abap-adt/interfaces-utils`.
 *
 * Decision 26 put them in `interfaces-adt` because "only the ABAP family
 * accepts them". `mcp-calm-*` — Cloud ALM, not ABAP — imports `ITokenProvider`,
 * `ITokenRefresher` and `ISessionStore`, which is what refuted the premise.
 */

export type { AssertionErrorCode } from './auth/AssertionErrorCodes';
export { ASSERTION_ERROR_CODES } from './auth/AssertionErrorCodes';
export type { AuthType } from './auth/AuthType';
export {
  AUTH_TYPE_BASIC,
  AUTH_TYPE_JWT,
  AUTH_TYPE_XSUAA,
  AUTH_TYPES,
} from './auth/AuthType';
export type {
  AssertionContext,
  AssertionReplayKey,
  IAssertionReplayStore,
  IAssertionValidator,
  ValidatedAssertion,
} from './auth/IAssertionValidator';
export type { IAuthorizationConfig } from './auth/IAuthorizationConfig';
export type {
  AuthorizationOutcome,
  AuthorizationRequest,
  IAuthorizationStrategy,
} from './auth/IAuthorizationStrategy';
export type { IAuthProvider, IRenewableCredential } from './auth/IAuthProvider';
export type {
  CallbackServerFactory,
  ICallbackServerHandle,
  ICallbackServerOptions,
} from './auth/ICallbackServer';
export type { ICertificateMaterial } from './auth/ICertificateMaterial';
export type { ICertificateMaterialLoader } from './auth/ICertificateMaterialLoader';
export type { IConfig } from './auth/IConfig';
export type { IConnectionConfig } from './auth/IConnectionConfig';
export type {
  IApiKeyCredential,
  IBearerCredential,
  ISecretLoginCredential,
} from './auth/ICredentials';
export type { ISapConfig } from './sap/ISapConfig';
export type {
  SapAuthType,
  SapConnectionType,
} from './sap/SapAuthType';
export type { IServiceKeyStore } from './serviceKey/IServiceKeyStore';
export type { ISessionStore } from './session/ISessionStore';
export type { ISessionState } from './store/ISessionState';
export type { ISessionStorage } from './store/ISessionStorage';
export type { StoreErrorCode } from './store/StoreErrorCodes';
export { STORE_ERROR_CODES } from './store/StoreErrorCodes';
export type { OAuth2GrantType } from './token/AuthType';
export {
  AUTH_TYPE_AUTHORIZATION_CODE,
  AUTH_TYPE_AUTHORIZATION_CODE_PKCE,
  AUTH_TYPE_CLIENT_CREDENTIALS,
  AUTH_TYPE_CLIENT_X509,
  AUTH_TYPE_PASSWORD,
  AUTH_TYPE_SAML2_BEARER,
  AUTH_TYPE_USER_TOKEN,
} from './token/AuthType';
export type { ITokenProvider } from './token/ITokenProvider';
export type { ITokenProviderOptions } from './token/ITokenProviderOptions';
export type { ITokenProviderResult } from './token/ITokenProviderResult';
export type { ITokenRefresher } from './token/ITokenRefresher';
export type { ITokenRefreshResult } from './token/ITokenRefreshResult';
export type { ITokenResult } from './token/ITokenResult';
export type { TokenProviderErrorCode } from './token/TokenProviderErrorCodes';
export { TOKEN_PROVIDER_ERROR_CODES } from './token/TokenProviderErrorCodes';
export type { IHeaderValidationResult } from './validation/IHeaderValidationResult';
export type { IValidatedAuthConfig } from './validation/IValidatedAuthConfig';
export { AuthMethodPriority } from './validation/IValidatedAuthConfig';
