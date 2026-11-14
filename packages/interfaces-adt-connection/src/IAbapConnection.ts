/**
 * Minimal response type for ADT requests.
 */
import type {
  IHttpHeaderValue,
  IHttpWireResponse,
} from '@mcp-abap-adt/interfaces-network';
import type { IAbapRequestOptions } from './IAbapRequestOptions';
import type { AdtSessionLoss } from './IConnectionCapabilities';

export type IAdtHeaderValue = IHttpHeaderValue;

export interface IAdtWireResponse<T = unknown, D = unknown>
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
  /**
   * Present on the answer of a stateless request whose answer showed the SAP
   * session replaced: the answer is SAP's, as it came, and the connection's
   * session is gone — the instance is spent. Absent on every other answer.
   */
  readonly sessionLost?: AdtSessionLoss | undefined;
}

/**
 * What a connection states of its configuration through
 * {@link IAbapConnection.getConfig}: the transport it goes over, and nothing
 * else.
 *
 * A connector's own configuration type carries far more (the system's URL or
 * RFC address, the client, the credential); this is the part a holder of an
 * `IAbapConnection` reads. Declared here, not borrowed from the configuration
 * contracts, because this package depends on `interfaces-network` alone — so a
 * connector returns its own configuration, which is assignable to this.
 * Since 5.1.0.
 */
export interface IAbapConnectionConfig {
  /** `'rfc'` over RFC; `'http'`, or absent, over HTTP. */
  readonly connectionType?: 'http' | 'rfc' | undefined;
}

/**
 * ABAP Connection interface
 *
 * Minimal interface for consumers to interact with SAP ADT.
 * Implementation details (auth, token refresh, CSRF, cookies) are encapsulated.
 *
 * For JWT connections, token refresh is handled internally via ITokenRefresher.
 * For Basic connections, no token refresh is needed.
 *
 * **The optional members** (since 5.1.0) are what a full connector has beyond
 * the five every connection meets. A connection may lack any of them — an RFC
 * transport, a batch recorder, an embedder's own or a test stub — so a caller
 * calls one with `?.` (`connection.disconnect?.()`) and needs no detection at
 * run time. Each has the signature of the member the connector declares; where
 * a capability atom (`ISessionLifecycleAware`, `ICriticalSection`) declares the
 * same member, the two are identical, and a consumer that needs the member
 * present still narrows to the atom.
 */
export interface IAbapConnection {
  /**
   * Initialize connection: fetch CSRF token and establish session cookies.
   * Must be called before making any ADT requests.
   */
  connect(): Promise<void>;

  /**
   * The SAP system's HTTP origin, or `undefined` for a connection that has
   * none (RFC). A caller narrows before reading it.
   */
  getBaseUrl(): Promise<string | undefined>;

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
   * **It names no type for the answer** (since 5.0.0). `data` is `unknown`,
   * and the caller reads it: a connection answers what came off the wire, so
   * one that records or forwards a request has no `T` of the caller's to give.
   *
   * @param options - Request options (url, method, data, etc.)
   * @returns Promise with the answer as it came off the wire
   */
  makeAdtRequest(options: IAbapRequestOptions): Promise<IAdtWireResponse>;

  /**
   * Tells the server this session is finished: the logoff is written, not
   * awaited for its answer ({@link flushGoodbye} waits for that). The same
   * member as `ISessionLifecycleAware.disconnect`. Optional: a connection with
   * no session of its own to end has none, so a caller uses `?.`.
   */
  disconnect?(): Promise<void>;

  /**
   * Waits for the goodbye {@link disconnect} sent, within a budget, and
   * resolves rather than throws. The same member as
   * `ISessionLifecycleAware.flushGoodbye`. Optional, called with `?.`.
   *
   * @param timeoutMs how long to wait; an implementation chooses its default.
   */
  flushGoodbye?(timeoutMs?: number): Promise<void>;

  /**
   * Whether a caller may start work on this connection: `false` once its
   * session is gone or being torn down. The same member as
   * `ISessionLifecycleAware.isConnected`. Optional, called with `?.`.
   */
  isConnected?(): boolean;

  /**
   * Enters a section in which the ordinary per-request deadline is suspended
   * (a lock → write → unlock chain). Nests; each call needs its own
   * {@link endCriticalSection}. The same member as
   * `ICriticalSection.beginCriticalSection`. Optional, called with `?.`.
   */
  beginCriticalSection?(): void;

  /**
   * Leaves the section {@link beginCriticalSection} entered; ordinary
   * deadlines resume when the outermost one ends. The same member as
   * `ICriticalSection.endCriticalSection`. Optional, called with `?.`.
   */
  endCriticalSection?(): void;

  /**
   * The session mode the connection's next requests are sent in, as
   * {@link setSessionType} set it. A connector's name for it. Optional, called
   * with `?.`.
   */
  getSessionMode?(): 'stateful' | 'stateless';

  /**
   * The same reading as {@link getSessionMode}, under the name a batch
   * recorder gives it. Optional, called with `?.`.
   */
  getSessionType?(): 'stateful' | 'stateless';

  /**
   * The session's cookies as one string, which a later connection can be
   * built on to resume the session; `null` when there are none (no session
   * yet, or a transport without cookies, such as RFC). Optional, called with
   * `?.`.
   */
  sessionCookies?(): string | null;

  /**
   * What the connection states of its configuration: the transport it goes
   * over ({@link IAbapConnectionConfig}). A connector answers its own
   * configuration, which is assignable to it. Optional, called with `?.`.
   */
  getConfig?(): IAbapConnectionConfig;
}
