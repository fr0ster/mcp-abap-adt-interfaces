/**
 * `@mcp-abap-adt/interfaces-auth` — authentication: credentials, OAuth grants,
 * tokens, interactive login and SAML assertions. **Nothing SAP-specific**; that
 * is `@mcp-abap-adt/interfaces-auth-sap`, which depends on this package.
 *
 * **Most of what is here arrived from `@mcp-abap-adt/interfaces-adt` in its
 * 9.0.0**, and the reason is measured rather than argued. Three repositories —
 * `mcp-abap-adt-auth-broker`, `-auth-stores` and `-auth-providers` — imported
 * 10, 7 and 17 names from that package, and **not one of them was an ADT
 * contract**: they tracked the fastest-moving package in the family in order to
 * describe authentication. They now take zero names from it.
 *
 * Those names did not all land here. Of the 51 authentication symbols that left
 * `interfaces-adt`, 32 are here and **16 are in `interfaces-auth-sap`** —
 * `ISapConfig`, `IConfig`, `IConnectionConfig` (it carries `sapClient`),
 * `IAuthorizationConfig`, `IServiceKeyStore`, `ISessionStore`,
 * `ITokenProviderResult`, the validation results and `AUTH_TYPE_XSUAA` with its
 * union. Two more are deleted: `ISessionState` and `ISessionStorage` describe
 * cookies and a CSRF token, which no package's subject names and no repository
 * imports.
 *
 * **What decides the boundary is a contract's own fields, not its first
 * acceptor** — decision 35. Decision 26 placed these in `interfaces-adt`
 * because "only the ABAP family accepts them", and `mcp-calm-*` — Cloud ALM,
 * not ABAP — imports `ITokenProvider` and `ITokenRefresher` from here, which
 * refuted the premise. `auth-providers` accepts both halves, which is why the
 * accepting side could not answer the question at all.
 *
 * Depends on `@mcp-abap-adt/interfaces-utils`, for `ILogger`.
 */

export type { AssertionErrorCode } from './auth/AssertionErrorCodes';
export { ASSERTION_ERROR_CODES } from './auth/AssertionErrorCodes';
export { AUTH_TYPE_BASIC, AUTH_TYPE_JWT } from './auth/AuthMethod';
export type {
  AssertionContext,
  AssertionReplayKey,
  IAssertionReplayStore,
  IAssertionValidator,
  ValidatedAssertion,
} from './auth/IAssertionValidator';
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
export type {
  IApiKeyCredential,
  IBearerCredential,
  ISecretLoginCredential,
} from './auth/ICredentials';
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
export type { IRefreshableTokenProvider } from './token/IRefreshableTokenProvider';
export type { ITokenProvider } from './token/ITokenProvider';
export type { ITokenProviderOptions } from './token/ITokenProviderOptions';
export type { ITokenRefresher } from './token/ITokenRefresher';
export type { ITokenRefreshResult } from './token/ITokenRefreshResult';
export type { ITokenResult } from './token/ITokenResult';
export type { TokenProviderErrorCode } from './token/TokenProviderErrorCodes';
export { TOKEN_PROVIDER_ERROR_CODES } from './token/TokenProviderErrorCodes';
