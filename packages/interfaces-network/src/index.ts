/**
 * @mcp-abap-adt/interfaces-network
 *
 * Transport contracts, generic HTTP and MCP header names and network error codes for MCP ABAP ADT packages.
 */

export type { HttpError } from './connection/IHttpError';
export type {
  IHttpHeaderValue,
  IHttpWireResponse,
} from './connection/IHttpWireResponse';
export type {
  IWebSocketCloseInfo,
  IWebSocketConnectOptions,
  IWebSocketMessageEnvelope,
  IWebSocketMessageHandler,
  IWebSocketTransport,
} from './connection/IWebSocketTransport';
export type { NetworkErrorCode } from './connection/NetworkErrors';
export { NETWORK_ERROR_CODES } from './connection/NetworkErrors';
export {
  HEADER_ACCEPT,
  HEADER_AUTHORIZATION,
  HEADER_BTP_DESTINATION,
  HEADER_CONTENT_TYPE,
  HEADER_MCP_DESTINATION,
  HEADER_MCP_SESSION_ID,
  HEADER_MCP_URL,
  HEADER_SAP_AUTH_TYPE,
  HEADER_SAP_CLIENT,
  HEADER_SAP_DESTINATION,
  HEADER_SAP_DESTINATION_SERVICE,
  HEADER_SAP_JWT_TOKEN,
  HEADER_SAP_LOGIN,
  HEADER_SAP_PASSWORD,
  HEADER_SAP_REFRESH_TOKEN,
  HEADER_SAP_UAA_CLIENT_ID,
  HEADER_SAP_UAA_CLIENT_SECRET,
  HEADER_SAP_UAA_URL,
  HEADER_SAP_URL,
  HEADER_SESSION_ID,
  HEADER_UAA_CLIENT_ID,
  HEADER_UAA_CLIENT_SECRET,
  HEADER_UAA_URL,
  HEADER_X_MCP_SESSION_ID,
  PRESERVED_HEADERS,
  PROXY_MODIFIED_HEADERS,
  PROXY_ROUTING_HEADERS,
  SAP_CONNECTION_HEADERS,
  UAA_HEADERS,
} from './Headers';
