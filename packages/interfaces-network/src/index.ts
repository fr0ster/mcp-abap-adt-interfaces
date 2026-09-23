/**
 * @mcp-abap-adt/interfaces-network
 *
 * Transport contracts, generic HTTP and MCP header names and network error codes for MCP ABAP ADT packages.
 */

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
  HEADER_SESSION_ID,
  HEADER_X_MCP_SESSION_ID,
  PROXY_ROUTING_HEADERS,
} from './Headers';
export type { ITimeoutConfig } from './utils/ITimeoutConfig';
