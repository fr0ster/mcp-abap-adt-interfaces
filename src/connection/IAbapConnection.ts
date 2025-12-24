import type { IAbapRequestOptions } from './IAbapRequestOptions';

/**
 * Minimal response type for ADT requests.
 */
export interface IAdtResponse<T = any, D = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config?: D;
  request?: unknown;
}

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
  makeAdtRequest<T = any, D = any>(
    options: IAbapRequestOptions,
  ): Promise<IAdtResponse<T, D>>;
}
