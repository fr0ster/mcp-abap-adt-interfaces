/**
 * Connection configuration - values needed for connecting to services
 * Returned by stores with actual values (not file paths)
 */
export interface IConnectionConfig {
  /** Service URL (SAP/ABAP/MCP URL) - undefined for XSUAA if not provided */
  serviceUrl?: string;
  /** Authorization token (JWT token) */
  authorizationToken: string;
  /** SAP client number (optional, for ABAP/BTP) */
  sapClient?: string;
  /** Language (optional, for ABAP/BTP) */
  language?: string;
}

