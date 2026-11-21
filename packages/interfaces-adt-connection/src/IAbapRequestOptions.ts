export interface IAbapRequestOptions {
  url: string;
  method: string;
  timeout: number;
  data?: unknown;
  params?: unknown;
  headers?: Record<string, string>;

  /**
   * `true` keeps the request and its answer out of every log: the connection's
   * refusal preview, the RFC status text and body, both wire loggers and the
   * server's wire wrapper. A line, if any, carries the method, the path
   * without its query, the integer status and the byte count. The error the
   * connection throws keeps its fields for the caller.
   */
  noLog?: true | undefined;
  /**
   * `true` makes the first failure the caller's answer: every replay of the
   * request is gated, namely the CSRF recovery, the resend after a credential
   * renewal and the resend on a dead pooled socket. Redirects from SAP's ADT
   * endpoint are returned as they are, not followed. The initial CSRF token
   * fetch before a mutation still happens.
   */
  noResend?: true | undefined;
  /**
   * `true` sends the request stateless on HTTP and RFC whatever the
   * connection's session mode, and wins over a caller's
   * `x-sap-adt-sessiontype: stateful` header in any letter case. On the wire
   * the connector strips that conflicting session header and the session's
   * context cookie from the request.
   */
  stateless?: true | undefined;
}
