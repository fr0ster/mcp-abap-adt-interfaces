/**
 * Session state interface for stateful connections
 * Contains cookies and CSRF token that need to be preserved across requests
 */
/** @deprecated No package imports this; it is removed in the next major of `@mcp-abap-adt/interfaces`. */
export interface ISessionState {
  cookies: string | null;
  csrfToken: string | null;
  cookieStore: Record<string, string>;
}
