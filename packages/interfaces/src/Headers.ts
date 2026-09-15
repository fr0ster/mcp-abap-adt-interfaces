import {
  HEADER_BTP_DESTINATION,
  HEADER_MCP_DESTINATION,
  HEADER_MCP_URL,
  HEADER_SAP_AUTH_TYPE,
  HEADER_SAP_CLIENT,
  HEADER_SAP_DESTINATION,
  HEADER_SAP_JWT_TOKEN,
  HEADER_SAP_LOGIN,
  HEADER_SAP_PASSWORD,
  HEADER_SAP_REFRESH_TOKEN,
  HEADER_SAP_UAA_CLIENT_ID,
  HEADER_SAP_UAA_CLIENT_SECRET,
  HEADER_SAP_UAA_URL,
  HEADER_SAP_URL,
  HEADER_UAA_CLIENT_ID,
  HEADER_UAA_CLIENT_SECRET,
  HEADER_UAA_URL,
} from '@mcp-abap-adt/interfaces-adt';

import { HEADER_AUTHORIZATION } from '@mcp-abap-adt/interfaces-network';
/**
 * Header Groups
 * Useful for iterating over related headers
 */

/**
 * All proxy routing headers
 *
 * @deprecated No package imports this; it is removed in the next major of `@mcp-abap-adt/interfaces`.
 */
export const PROXY_ROUTING_HEADERS = [
  HEADER_BTP_DESTINATION,
  HEADER_MCP_DESTINATION,
  HEADER_MCP_URL,
] as const;
/**
 * All SAP ABAP connection headers
 *
 * @deprecated No package imports this; it is removed in the next major of `@mcp-abap-adt/interfaces`.
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
 *
 * @deprecated No package imports this; it is removed in the next major of `@mcp-abap-adt/interfaces`.
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
 *
 * @deprecated No package imports this; it is removed in the next major of `@mcp-abap-adt/interfaces`.
 */
export const PRESERVED_HEADERS = [
  HEADER_SAP_DESTINATION,
  HEADER_SAP_CLIENT,
] as const;
/**
 * Headers that are modified/added by proxy when destinations are present
 *
 * @deprecated No package imports this; it is removed in the next major of `@mcp-abap-adt/interfaces`.
 */
export const PROXY_MODIFIED_HEADERS = [
  HEADER_AUTHORIZATION, // Added when BTP destination is present
  HEADER_SAP_JWT_TOKEN, // Added when ABAP destination is present
  HEADER_SAP_URL, // Added when ABAP destination is present
  HEADER_SAP_AUTH_TYPE, // Added when ABAP destination is present (set to 'jwt')
] as const;
