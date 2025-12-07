/**
 * HTTP Header Constants for MCP ABAP ADT
 *
 * This file contains all HTTP header names used across MCP ABAP ADT packages.
 * These constants should be used instead of hardcoded string values to ensure
 * consistency and prevent typos.
 *
 * Priority: Values from mcp-abap-adt-interfaces package take precedence.
 */

/**
 * Proxy Routing Headers
 * Used by the proxy to determine routing and authentication
 */
export const HEADER_BTP_DESTINATION = 'x-btp-destination';
export const HEADER_MCP_DESTINATION = 'x-mcp-destination';
export const HEADER_MCP_URL = 'x-mcp-url';

/**
 * SAP ABAP Connection Headers
 * Used for SAP ABAP system connection
 */
export const HEADER_SAP_DESTINATION = 'x-sap-destination';
/**
 * SAP Destination Header (for Cloud ABAP connection via SAP destination service)
 * This header is used to specify the SAP destination name for connecting to ABAP systems on SAP Cloud.
 * The URL is automatically derived from the destination service key.
 * This is a separate constant to emphasize its specific purpose for SAP destination service.
 */
export const HEADER_SAP_DESTINATION_SERVICE = 'x-sap-destination';
export const HEADER_SAP_URL = 'x-sap-url';
export const HEADER_SAP_JWT_TOKEN = 'x-sap-jwt-token';
export const HEADER_SAP_AUTH_TYPE = 'x-sap-auth-type';
export const HEADER_SAP_CLIENT = 'x-sap-client';
export const HEADER_SAP_LOGIN = 'x-sap-login';
export const HEADER_SAP_PASSWORD = 'x-sap-password';
export const HEADER_SAP_REFRESH_TOKEN = 'x-sap-refresh-token';

/**
 * UAA/XSUAA Headers
 * Used for UAA/XSUAA authentication
 */
export const HEADER_SAP_UAA_URL = 'x-sap-uaa-url';
export const HEADER_UAA_URL = 'uaa-url'; // Alternative name
export const HEADER_SAP_UAA_CLIENT_ID = 'x-sap-uaa-client-id';
export const HEADER_UAA_CLIENT_ID = 'uaa-client-id'; // Alternative name
export const HEADER_SAP_UAA_CLIENT_SECRET = 'x-sap-uaa-client-secret';
export const HEADER_UAA_CLIENT_SECRET = 'uaa-client-secret'; // Alternative name

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
 * Header Groups
 * Useful for iterating over related headers
 */

/**
 * All proxy routing headers
 */
export const PROXY_ROUTING_HEADERS = [
  HEADER_BTP_DESTINATION,
  HEADER_MCP_DESTINATION,
  HEADER_MCP_URL,
] as const;

/**
 * All SAP ABAP connection headers
 */
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

/**
 * All UAA/XSUAA headers
 */
export const UAA_HEADERS = [
  HEADER_SAP_UAA_URL,
  HEADER_UAA_URL,
  HEADER_SAP_UAA_CLIENT_ID,
  HEADER_UAA_CLIENT_ID,
  HEADER_SAP_UAA_CLIENT_SECRET,
  HEADER_UAA_CLIENT_SECRET,
] as const;

/**
 * Headers that should be preserved from original request (not modified by proxy)
 */
export const PRESERVED_HEADERS = [
  HEADER_SAP_DESTINATION,
  HEADER_SAP_CLIENT,
] as const;

/**
 * Headers that are modified/added by proxy when destinations are present
 */
export const PROXY_MODIFIED_HEADERS = [
  HEADER_AUTHORIZATION, // Added when BTP destination is present
  HEADER_SAP_JWT_TOKEN, // Added when ABAP destination is present
  HEADER_SAP_URL, // Added when ABAP destination is present
  HEADER_SAP_AUTH_TYPE, // Added when ABAP destination is present (set to 'jwt')
] as const;

/**
 * Authentication type values
 */
export const AUTH_TYPE_JWT = 'jwt';
export const AUTH_TYPE_BASIC = 'basic';
export const AUTH_TYPE_XSUAA = 'xsuaa';

/**
 * Valid authentication types
 */
export const AUTH_TYPES = [
  AUTH_TYPE_JWT,
  AUTH_TYPE_BASIC,
  AUTH_TYPE_XSUAA,
] as const;

export type AuthType = typeof AUTH_TYPES[number];
