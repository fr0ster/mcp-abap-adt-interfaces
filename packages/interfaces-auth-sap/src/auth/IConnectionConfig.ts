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
  /** Authentication type - 'basic' for on-premise, 'jwt' for cloud, 'snc' for SNC over RFC */
  authType?: 'basic' | 'jwt' | 'saml' | 'snc';
  /** SAP client number (optional, for ABAP/BTP) */
  sapClient?: string;
  /** Language (optional, for ABAP/BTP) */
  language?: string;
  /** Session cookies for SAML authentication (raw Cookie header value) */
  sessionCookies?: string;
  // SNC settings for a destination whose `authType` is `'snc'` — how to reach
  // the system, not a secret. Such a destination needs no authorization
  // config, no username and no password.
  /** The system's SNC name, e.g. "p:CN=SID, O=ACME" */
  sncPartnerName?: string;
  /** Quality of protection: "1" auth, "2" integrity, "3" privacy, "8" default, "9" maximum available */
  sncQop?: string;
  /** The SNC (GSS) library; discovered when absent */
  sncLib?: string;
  /** The user's SNC name; taken from the credential when absent */
  sncMyName?: string;
}
