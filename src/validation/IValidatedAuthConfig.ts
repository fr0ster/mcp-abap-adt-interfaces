/**
 * Validated authentication configuration
 */
import type { AuthType } from '../auth/AuthType';

/**
 * Authentication method priority
 * Higher number = higher priority
 */
export enum AuthMethodPriority {
  SAP_DESTINATION = 4,    // x-sap-destination (uses AuthBroker, JWT only)
  MCP_DESTINATION = 3,    // x-mcp-destination + x-sap-auth-type=jwt (uses AuthBroker)
  DIRECT_JWT = 2,         // x-sap-jwt-token + x-sap-auth-type=jwt
  BASIC = 1,              // x-sap-login + x-sap-password + x-sap-auth-type=basic
  NONE = 0                // No valid authentication
}

export interface IValidatedAuthConfig {
  /** Authentication method priority */
  priority: AuthMethodPriority;
  /** Authentication type */
  authType: AuthType;
  /** SAP URL */
  sapUrl: string;
  /** SAP Client (optional) */
  sapClient?: string;
  /** Destination name (for destination-based auth: x-sap-destination or x-mcp-destination) */
  destination?: string;
  /** JWT token (for direct JWT auth) */
  jwtToken?: string;
  /** Refresh token (optional, for JWT auth) */
  refreshToken?: string;
  /** UAA URL (optional, for JWT auth) */
  uaaUrl?: string;
  /** UAA Client ID (optional, for JWT auth) */
  uaaClientId?: string;
  /** UAA Client Secret (optional, for JWT auth) */
  uaaClientSecret?: string;
  /** Username (for basic auth) */
  username?: string;
  /** Password (for basic auth) */
  password?: string;
  /** Validation errors (if any) */
  errors: string[];
  /** Warnings (if any) */
  warnings: string[];
}

