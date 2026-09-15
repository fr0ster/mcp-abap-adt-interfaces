/**
 * Interface for storing and retrieving service keys
 *
 * Service keys contain UAA credentials and connection URLs.
 */

import type { IAuthorizationConfig } from '../auth/IAuthorizationConfig';
import type { IConfig } from '../auth/IConfig';
import type { IConnectionConfig } from '../auth/IConnectionConfig';

export interface IServiceKeyStore {
  /**
   * Get raw service key for destination
   * @param destination Destination name (e.g., "TRIAL")
   * @returns Service key object (implementation-specific) or null if not found
   */
  getServiceKey(destination: string): Promise<IConfig | null>;

  /**
   * Get authorization configuration from service key
   * Returns values needed for obtaining and refreshing tokens
   * @param destination Destination name (e.g., "TRIAL")
   * @returns IAuthorizationConfig with actual values or null if not found
   */
  getAuthorizationConfig(
    destination: string,
  ): Promise<IAuthorizationConfig | null>;

  /**
   * Get connection configuration from service key
   * Returns values needed for connecting to services
   * @param destination Destination name (e.g., "TRIAL")
   * @returns IConnectionConfig with actual values or null if not found
   */
  getConnectionConfig(destination: string): Promise<IConnectionConfig | null>;
}
