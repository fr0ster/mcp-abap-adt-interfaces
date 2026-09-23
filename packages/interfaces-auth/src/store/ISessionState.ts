/**
 * Session state interface for stateful connections
 * Contains cookies and CSRF token that need to be preserved across requests
 */
/** Nothing imports this yet; it sits with the session and token contracts it belongs to. */
export interface ISessionState {
  cookies: string | null;
  csrfToken: string | null;
  cookieStore: Record<string, string>;
}
