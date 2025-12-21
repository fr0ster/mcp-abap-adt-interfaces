import type { IAbapRequestOptions } from './IAbapRequestOptions';

/**
 * Axios response type - using any to avoid dependency on axios package
 * Consumers should use proper AxiosResponse type from axios
 */
export type AxiosResponse = any;

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
  setSessionType(type: "stateful" | "stateless"): void;

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

/**
 * @deprecated Use IAbapConnection instead. Extended interface kept for backward compatibility.
 * Will be removed in next major version.
 */
export interface IAbapConnectionExtended extends IAbapConnection {
  getConfig(): any;
  getAuthHeaders(): Promise<Record<string, string>>;
  connect(): Promise<void>;
  reset(): void;
}

