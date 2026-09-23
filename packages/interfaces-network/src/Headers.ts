/**
 * Session ID Headers
 * Used for session identification in proxy requests
 */
export const HEADER_SESSION_ID = 'x-session-id';
export const HEADER_MCP_SESSION_ID = 'mcp-session-id';
export const HEADER_X_MCP_SESSION_ID = 'x-mcp-session-id';
/**
 * Standard HTTP Headers
 */
export const HEADER_AUTHORIZATION = 'Authorization';
export const HEADER_CONTENT_TYPE = 'Content-Type';
export const HEADER_ACCEPT = 'Accept';

/**
 * Proxy routing headers — what a proxy reads to decide where a request goes.
 *
 * They were in `@mcp-abap-adt/interfaces-adt` until 8.0.0 of that package,
 * which coupled anyone reading a routing header to the ADT contract's release
 * rate. Nothing about them is ABAP.
 */
export const HEADER_BTP_DESTINATION = 'x-btp-destination';
export const HEADER_MCP_DESTINATION = 'x-mcp-destination';
export const HEADER_MCP_URL = 'x-mcp-url';

/** All proxy routing headers, for iterating over the related ones. */
export const PROXY_ROUTING_HEADERS = [
  HEADER_BTP_DESTINATION,
  HEADER_MCP_DESTINATION,
  HEADER_MCP_URL,
] as const;

/**
 * SAP connection headers — HTTP header names, whatever system they address.
 *
 * They were in `@mcp-abap-adt/interfaces-adt` until its 8.0.0, on the reading
 * that an `x-sap-*` name is an SAP concern. It is a **transport** concern: a
 * header name says how a value travels, not what the value means, and nothing
 * in the ADT contract ever used one — only its index re-exported them. Keeping
 * them there bound `mcp-abap-adt-header-validator`, which imports fifteen of
 * them and nothing else from that package, to the release rate of the ADT
 * contract.
 */
export const HEADER_SAP_DESTINATION = 'x-sap-destination';
/**
 * The same name again, for the Cloud ABAP connection through SAP's destination
 * service, where the URL is derived from the destination's service key. A
 * separate constant because the purpose is separate, not the value.
 */
export const HEADER_SAP_DESTINATION_SERVICE = 'x-sap-destination';
export const HEADER_SAP_URL = 'x-sap-url';
export const HEADER_SAP_JWT_TOKEN = 'x-sap-jwt-token';
export const HEADER_SAP_AUTH_TYPE = 'x-sap-auth-type';
export const HEADER_SAP_CLIENT = 'x-sap-client';
export const HEADER_SAP_LOGIN = 'x-sap-login';
export const HEADER_SAP_PASSWORD = 'x-sap-password';
export const HEADER_SAP_REFRESH_TOKEN = 'x-sap-refresh-token';

/** UAA/XSUAA headers, in both spellings SAP uses. */
export const HEADER_SAP_UAA_URL = 'x-sap-uaa-url';
export const HEADER_UAA_URL = 'uaa-url';
export const HEADER_SAP_UAA_CLIENT_ID = 'x-sap-uaa-client-id';
export const HEADER_UAA_CLIENT_ID = 'uaa-client-id';
export const HEADER_SAP_UAA_CLIENT_SECRET = 'x-sap-uaa-client-secret';
export const HEADER_UAA_CLIENT_SECRET = 'uaa-client-secret';

/** Every header that carries part of an SAP ABAP connection. */
export const SAP_CONNECTION_HEADERS = [
  HEADER_SAP_DESTINATION,
  HEADER_SAP_URL,
  HEADER_SAP_JWT_TOKEN,
  HEADER_SAP_AUTH_TYPE,
  HEADER_SAP_CLIENT,
  HEADER_SAP_LOGIN,
  HEADER_SAP_PASSWORD,
  HEADER_SAP_REFRESH_TOKEN,
] as const;

/** Every UAA/XSUAA header, in both spellings. */
export const UAA_HEADERS = [
  HEADER_SAP_UAA_URL,
  HEADER_UAA_URL,
  HEADER_SAP_UAA_CLIENT_ID,
  HEADER_UAA_CLIENT_ID,
  HEADER_SAP_UAA_CLIENT_SECRET,
  HEADER_UAA_CLIENT_SECRET,
] as const;

/** Headers a proxy passes through untouched. */
export const PRESERVED_HEADERS = [
  HEADER_SAP_DESTINATION,
  HEADER_SAP_CLIENT,
] as const;

/**
 * Headers a proxy adds or rewrites when a destination is present.
 *
 * **This one had no home until the header names had one.** It groups
 * `HEADER_AUTHORIZATION`, declared here, with three SAP names that were in the
 * ADT contract, and neither package may import the other — so the facade's
 * removal deleted it for a release. It is a proxy's vocabulary, the proxy is
 * this package's subject, and now everything it groups is declared beside it.
 */
export const PROXY_MODIFIED_HEADERS = [
  HEADER_AUTHORIZATION,
  HEADER_SAP_JWT_TOKEN,
  HEADER_SAP_URL,
  HEADER_SAP_AUTH_TYPE,
] as const;
