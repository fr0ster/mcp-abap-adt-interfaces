/**
 * @mcp-abap-adt/interfaces-auth-broker
 *
 * The broker's port: what `@mcp-abap-adt/auth-broker` needs from a destination,
 * and the stores that hold one.
 *
 * **What makes a contract belong here is that its own fields name the
 * destination or its storage** — the connection settings a store hands the
 * broker (`IConnectionConfig`), how that destination renews its credential
 * (`DestinationGrant`), the composition a store saves (`IConfig`), the stores
 * themselves (`ISessionStore`, `IServiceKeyStore`), and the result of
 * authenticating a destination (`ITokenProviderResult`). That is decision 35
 * applied to the second subject `interfaces-auth-sap` 1.x held; decision 41
 * records the split.
 *
 * **Who imports it**: the stores (`@mcp-abap-adt/auth-stores`), the broker,
 * and the servers that build a broker. A token provider, the ABAP connection
 * and the ADT clients take nothing from here — what they take, `ISapConfig` and
 * the UAA client, stayed in `interfaces-auth-sap`.
 *
 * **Depends on `interfaces-auth-sap`, and on nothing else**, for
 * `IAuthorizationConfig` — the UAA client a store returns beside the
 * connection settings. It is imported, not re-exported (decision 34).
 */
export type { DestinationGrant } from './auth/DestinationGrant';
export type { IConfig } from './auth/IConfig';
export type { IConnectionConfig } from './auth/IConnectionConfig';
export type { IServiceKeyStore } from './serviceKey/IServiceKeyStore';
export type { ISessionStore } from './session/ISessionStore';
export type { ITokenProviderResult } from './token/ITokenProviderResult';
