/**
 * Generic WebSocket transport contracts.
 *
 * This interface is intentionally domain-agnostic and can be reused by
 * debugger, tracing, and any other realtime ADT flows.
 */

export interface IWebSocketConnectOptions {
  /**
   * Optional subprotocols for the WS handshake.
   */
  protocols?: string[];

  /**
   * Request headers used during connection handshake.
   */
  headers?: Record<string, string>;

  /**
   * Connection timeout in milliseconds.
   */
  connectTimeoutMs?: number;

  /**
   * Optional heartbeat interval in milliseconds.
   */
  heartbeatIntervalMs?: number;
}

export interface IWebSocketCloseInfo {
  code: number;
  reason?: string;
  wasClean?: boolean;
}

export interface IWebSocketMessageEnvelope<T = unknown> {
  /**
   * Message category. Keep generic to support different realtime domains.
   */
  kind: 'request' | 'response' | 'event' | 'error';

  /**
   * Optional correlation id for request/response matching.
   */
  correlationId?: string;

  /**
   * Optional operation name (for example: "debugger.listen", "trace.stream").
   */
  operation?: string;

  /**
   * Message payload.
   */
  payload?: T;

  /**
   * Unix timestamp in milliseconds.
   */
  timestamp?: number;
}

export type IWebSocketMessageHandler<T = unknown> = (
  message: IWebSocketMessageEnvelope<T>,
) => void | Promise<void>;

export interface IWebSocketTransport {
  /**
   * Establish WS connection.
   */
  connect(url: string, options?: IWebSocketConnectOptions): Promise<void>;

  /**
   * Close WS connection.
   */
  disconnect(code?: number, reason?: string): Promise<void>;

  /**
   * Send one message to the connected endpoint.
   */
  send<T = unknown>(message: IWebSocketMessageEnvelope<T>): Promise<void>;

  /**
   * Register message handler.
   */
  onMessage<T = unknown>(handler: IWebSocketMessageHandler<T>): void;

  /**
   * Register one-shot or persistent open callback.
   */
  onOpen(handler: () => void | Promise<void>): void;

  /**
   * Register error callback.
   */
  onError(handler: (error: Error) => void | Promise<void>): void;

  /**
   * Register close callback.
   */
  onClose(handler: (info: IWebSocketCloseInfo) => void | Promise<void>): void;

  /**
   * Transport state indicator.
   */
  isConnected(): boolean;
}
