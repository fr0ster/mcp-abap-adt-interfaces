/**
 * `@mcp-abap-adt/interfaces-auth-sap` — the SAP and BTP half of authentication.
 *
 * **What makes a contract belong here is naming something SAP or BTP owns**: an
 * SAP system's configuration, a UAA client, a BTP destination, a service key, an
 * `sap-client`, an RFC connection, or XSUAA — which is a BTP service, not a way
 * of authenticating in general.
 *
 * `jwt` and `basic` are not SAP's, and are in
 * `@mcp-abap-adt/interfaces-auth` with the tokens, OAuth grants, credentials and
 * stores. The split was computed rather than judged: the files naming XSUAA or
 * UAA in their **code** — comments mentioning ABAP prove nothing — closed
 * transitively over imports, so a file taking one of those types came with it.
 *
 * Depends on `interfaces-auth` and `interfaces-utils`, and nothing else. No
 * cycle: `auth-sap` → `auth` → `utils`.
 */

export type { AuthType } from './auth/AuthType';
export { AUTH_TYPE_XSUAA, AUTH_TYPES } from './auth/AuthType';
export type { IAuthorizationConfig } from './auth/IAuthorizationConfig';
export type { ICertificateMaterialLoader } from './auth/ICertificateMaterialLoader';
export type { IConfig } from './auth/IConfig';
export type { IConnectionConfig } from './auth/IConnectionConfig';
export type { ISapConfig } from './sap/ISapConfig';
export type { SapAuthType, SapConnectionType } from './sap/SapAuthType';
export type { IServiceKeyStore } from './serviceKey/IServiceKeyStore';
export type { ISessionStore } from './session/ISessionStore';
export type { ITokenProviderResult } from './token/ITokenProviderResult';
export type { IHeaderValidationResult } from './validation/IHeaderValidationResult';
export type { IValidatedAuthConfig } from './validation/IValidatedAuthConfig';
export { AuthMethodPriority } from './validation/IValidatedAuthConfig';
