/**
 * What a caller passes to `ITokenProvider.getTokens()` and
 * `IRefreshableTokenProvider.refreshTokens()`.
 */
export interface ITokenRequestOptions {
  /**
   * This caller no longer needs the token — an MCP request cancelled, a
   * session closed. An abort releases this caller only: its call rejects with
   * an `IAuthProviderFailure` of kind `interactive-login`, outcome `aborted`,
   * while a login other callers still wait on runs on for them; the login
   * itself is aborted once every caller waiting on it has aborted. Absent, the
   * call waits until the login ends — there is no built-in bound; a caller
   * that wants one passes `AbortSignal.timeout(ms)`.
   */
  readonly signal?: AbortSignal | undefined;
}
