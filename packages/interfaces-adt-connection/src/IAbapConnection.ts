/**
 * Minimal response type for ADT requests.
 */
import type {
  IHttpHeaderValue,
  IHttpWireResponse,
} from '@mcp-abap-adt/interfaces-network';
import type { IAbapRequestOptions } from './IAbapRequestOptions';

export type IAdtHeaderValue = IHttpHeaderValue;

export interface IAdtWireResponse<T = any, D = any>
  extends Omit<IHttpWireResponse<T, D>, 'headers'> {
  /**
   * **The generic shape, narrowed by the headers ADT actually sends.** The
   * frame itself — `data`, `status`, `statusText`, `config`, `request` — is
   * `IHttpWireResponse` in `@mcp-abap-adt/interfaces-network`, because nothing
   * about it is ABAP. What stays here is this list: `sap-adt-location` and the
   * two spellings of `content-location` are where ADT puts the URI of what it
   * just created, and a caller reads them by name.
   */
  headers: Record<string, IAdtHeaderValue> & {
    location?: string;
    Location?: string;
    'content-location'?: IAdtHeaderValue;
    'Content-Location'?: IAdtHeaderValue;
    'sap-adt-location'?: IAdtHeaderValue;
  };
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
