/**
 * Interface for storing and retrieving service keys
 *
 * Service keys contain UAA credentials and connection URLs.
 */

import type { IAuthorizationConfig } from '@mcp-abap-adt/interfaces-auth-sap';
import type { IConfig } from '../auth/IConfig';
import type { IConnectionConfig } from '../auth/IConnectionConfig';
import type { IClientCertificate } from './IClientCertificate';

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

  /**
   * The destination's client certificate, when its key carries one; `null`
   * when it does not. Optional: a store that never holds certificates omits it.
   * Answers data only — which authentication the client uses is the consumer's.
   */
  getClientCertificate?(
    destination: string,
  ): Promise<IClientCertificate | null>;
}
