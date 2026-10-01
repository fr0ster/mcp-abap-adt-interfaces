/**
 * `@mcp-abap-adt/interfaces-auth-sap` — the SAP and BTP half of authentication.
 *
 * **What makes a contract belong here is naming something SAP or BTP owns**: an
 * SAP system's configuration, a UAA client, an `sap-client`, an RFC connection,
 * or XSUAA — which is a BTP service, not a way of authenticating in general.
 *
 * `jwt` and `basic` are not SAP's, and are in
 * `@mcp-abap-adt/interfaces-auth` with the tokens, OAuth grants, credentials and
 * the store error codes.
 *
 * **The destination and its storage are not here since 2.0.0** —
 * `IConnectionConfig`, `DestinationGrant`, `IConfig`, `ISessionStore`,
 * `IServiceKeyStore` and `ITokenProviderResult` are
 * `@mcp-abap-adt/interfaces-auth-broker`, and are not re-exported (decision 34).
 * They are the broker's port: what the broker needs from a destination, which
 * the stores implement, and which only the broker, the stores and the servers
 * that build a broker import. What stays is what a provider, a connection or a
 * client takes — `ISapConfig`, the UAA client `IAuthorizationConfig`, the
 * certificate loader — and that package stands on this one for the UAA client
 * (decision 41).
 *
 * **Depends on `interfaces-auth`, and on nothing else.** `interfaces-utils`
 * reaches this package through it, for `ILogger`, which makes it that package's
 * dependency rather than this one's. No cycle: `auth-sap` → `auth` → `utils`.
 */

export type { AuthType } from './auth/AuthType';
export { AUTH_TYPE_XSUAA, AUTH_TYPES } from './auth/AuthType';
export type { IAuthorizationConfig } from './auth/IAuthorizationConfig';
export type { ICertificateMaterialLoader } from './auth/ICertificateMaterialLoader';
export type { ISapConfig } from './sap/ISapConfig';
export type { SapAuthType, SapConnectionType } from './sap/SapAuthType';
export type { IHeaderValidationResult } from './validation/IHeaderValidationResult';
export type { IValidatedAuthConfig } from './validation/IValidatedAuthConfig';
export { AuthMethodPriority } from './validation/IValidatedAuthConfig';
