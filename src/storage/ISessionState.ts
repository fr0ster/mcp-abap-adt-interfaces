/**
 * Session state interface for stateful connections
 * Contains cookies and CSRF token that need to be preserved across requests
 */
export interface ISessionState {
  cookies: string | null;
  csrfToken: string | null;
  cookieStore: Record<string, string>;
}

