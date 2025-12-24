import type { AxiosResponse as AxiosResponseType } from 'axios';
import type { IAbapRequestOptions } from './IAbapRequestOptions';

/**
 * Axios response type for ADT requests.
 */
export type AxiosResponse = AxiosResponseType;

/**
 * ABAP Connection interface
 *
 * Minimal interface for consumers to interact with SAP ADT.
 * Implementation details (auth, token refresh, CSRF, cookies) are encapsulated.
 *
 * For JWT connections, token refresh is handled internally via ITokenRefresher.
 * For Basic connections, no token refresh is needed.
 */
export interface IAbapConnection {
  /**
   * Get base URL of SAP system
   */
  getBaseUrl(): Promise<string>;

  /**
   * Get current session ID (for stateful connections)
   */
  getSessionId(): string | null;

  /**
   * Set session type for subsequent requests
   * @param type - "stateful" for persistent session, "stateless" for independent requests
   */
  setSessionType(type: 'stateful' | 'stateless'): void;

  /**
   * Make ADT request to SAP system
   *
   * Handles all auth concerns internally:
   * - Adds authorization header (Basic or Bearer)
   * - Manages CSRF token
   * - Retries on 401/403 with token refresh (JWT only)
   *
   * @param options - Request options (url, method, data, etc.)
   * @returns Promise with Axios response
   */
  makeAdtRequest(options: IAbapRequestOptions): Promise<AxiosResponse>;
}
