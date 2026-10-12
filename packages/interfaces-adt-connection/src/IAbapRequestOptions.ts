export interface IAbapRequestOptions {
  url: string;
  method: string;
  timeout: number;
  data?: unknown;
  params?: unknown;
  headers?: Record<string, string>;
  /**
   * The caller no longer needs this request: nothing more of it is sent.
   *
   * A request the signal aborts before it is sent, or before a resend (a CSRF
   * retry, a reconnect), fails with `ADT_REQUEST_ERROR.ABORTED`. A request
   * already on the wire is not recalled — the server may still act on it.
   */
  signal?: AbortSignal | undefined;
}

/** Error codes a request raises. Match on these, not on messages. */
export const ADT_REQUEST_ERROR = {
  /** The request's signal aborted before it was sent, or before a resend. */
  ABORTED: 'ADT_REQUEST_ABORTED',
} as const;

export type AdtRequestErrorCode =
  (typeof ADT_REQUEST_ERROR)[keyof typeof ADT_REQUEST_ERROR];
