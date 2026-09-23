/**
 * The authentication methods that are not SAP's.
 *
 * `jwt` is a bearer token and `basic` is a user and a password. Neither means
 * anything SAP-specific, which is why they are here and `xsuaa` is not: XSUAA
 * is a **BTP service**, so it and the union over all three are in
 * `@mcp-abap-adt/interfaces-auth-sap`.
 */
export const AUTH_TYPE_JWT = 'jwt';
export const AUTH_TYPE_BASIC = 'basic';
