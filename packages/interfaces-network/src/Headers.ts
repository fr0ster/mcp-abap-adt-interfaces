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
