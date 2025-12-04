/**
 * Interface for session stores - stores and retrieves session data
 * 
 * Session stores handle loading, saving, and managing session data (tokens, configuration).
 */
import type { IConfig } from '../auth/IConfig';
import type { IAuthorizationConfig } from '../auth/IAuthorizationConfig';
import type { IConnectionConfig } from '../auth/IConnectionConfig';

export interface ISessionStore {
  /**
   * Load session configuration for destination
   * Returns optional composition of IAuthorizationConfig and IConnectionConfig
   * Can contain either authorization config, or connection config, or both
   * @param destination Destination name (e.g., "TRIAL" or "mcp")
   * @returns IConfig with actual values or null if not found
   */
  loadSession(destination: string): Promise<IConfig | null>;

  /**
   * Save session configuration for destination
   * Accepts IConfig (optional composition) or internal representation (for backward compatibility)
   * @param destination Destination name (e.g., "TRIAL" or "mcp")
   * @param config IConfig or internal session configuration to save
   */
  saveSession(destination: string, config: IConfig | unknown): Promise<void>;

  /**
   * Delete session for destination (optional)
   * @param destination Destination name (e.g., "TRIAL" or "mcp")
   */
  deleteSession?(destination: string): Promise<void>;

  /**
   * Get authorization configuration with actual values (not file paths)
   * Returns values needed for obtaining and refreshing tokens
   * @param destination Destination name (e.g., "TRIAL" or "mcp")
   * @returns IAuthorizationConfig with actual values or null if not found
   */
  getAuthorizationConfig(destination: string): Promise<IAuthorizationConfig | null>;

  /**
   * Get connection configuration with actual values (not file paths)
   * Returns values needed for connecting to services
   * @param destination Destination name (e.g., "TRIAL" or "mcp")
   * @returns IConnectionConfig with actual values or null if not found
   */
  getConnectionConfig(destination: string): Promise<IConnectionConfig | null>;

  /**
   * Set authorization configuration
   * Updates values needed for obtaining and refreshing tokens
   * @param destination Destination name (e.g., "TRIAL" or "mcp")
   * @param config IAuthorizationConfig with values to set
   */
  setAuthorizationConfig(destination: string, config: IAuthorizationConfig): Promise<void>;

  /**
   * Set connection configuration
   * Updates values needed for connecting to services
   * @param destination Destination name (e.g., "TRIAL" or "mcp")
   * @param config IConnectionConfig with values to set
   */
  setConnectionConfig(destination: string, config: IConnectionConfig): Promise<void>;
}

