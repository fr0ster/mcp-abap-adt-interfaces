import type { IAbapRequestOptions } from './IAbapRequestOptions';

/**
 * Minimal response type for ADT requests.
 */
export type IAdtHeaderValue =
  | string
  | string[]
  | number
  | boolean
  | null
  | undefined
  | object;

/**
 * The transport frame: status, headers, body — what HTTP or RFC hands back.
 *
 * Renamed from `IAdtWireResponse`, which now names the **answer** a member gives
 * (`adt/IAdtResponse.ts`). This is the wire, and it belongs exactly here: at the
 * connection boundary, where decision 14 says an envelope is legitimate and
 * everywhere above it is not.
 *
 * The old name was the whole problem in miniature — the same type served as
 * "what came off the wire" and "what a caller gets", so 94 members answered a
 * frame and no member could name its result.
 */
export interface IAdtWireResponse<T = any, D = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, IAdtHeaderValue> & {
    location?: string;
    Location?: string;
    'content-location'?: IAdtHeaderValue;
    'Content-Location'?: IAdtHeaderValue;
    'sap-adt-location'?: IAdtHeaderValue;
  };
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
   * Initialize connection: fetch CSRF token and establish session cookies.
   * Must be called before making any ADT requests.
   */
  connect(): Promise<void>;

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
  ): Promise<IAdtWireResponse<T, D>>;
}
