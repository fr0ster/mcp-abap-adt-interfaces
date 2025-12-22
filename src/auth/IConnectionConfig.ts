/**
 * Connection configuration - values needed for connecting to services
 * Returned by stores with actual values (not file paths)
 */
export interface IConnectionConfig {
  /** Service URL (SAP/ABAP/MCP URL) - undefined for XSUAA if not provided */
  serviceUrl?: string;
  /** Authorization token (JWT token) - required for JWT auth, optional for basic auth */
  authorizationToken?: string;
  /** Username for basic authentication - required for basic auth, optional for JWT auth */
  username?: string;
  /** Password for basic authentication - required for basic auth, optional for JWT auth */
  password?: string;
  /** Authentication type - 'basic' for on-premise, 'jwt' for cloud */
  authType?: 'basic' | 'jwt';
  /** SAP client number (optional, for ABAP/BTP) */
  sapClient?: string;
  /** Language (optional, for ABAP/BTP) */
  language?: string;
}
