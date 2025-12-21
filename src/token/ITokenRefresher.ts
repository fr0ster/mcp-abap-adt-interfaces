/**
 * Token Refresher interface
 * 
 * Provides token management with automatic refresh capability.
 * Implementations are created by AuthBroker and injected into connections.
 * 
 * This enables dependency injection of token refresh logic into connections,
 * allowing connections to focus on making requests while the refresher
 * handles all auth/token lifecycle concerns.
 */

/**
 * Interface for token refresher
 * 
 * Created by AuthBroker for a specific destination.
 * Injected into JwtAbapConnection to enable automatic token refresh.
 */
export interface ITokenRefresher {
  /**
   * Get current valid token.
   * 
   * May return cached token if still valid, or refresh if expired.
   * Implementation decides when to refresh based on token expiration.
   * 
   * @returns Promise that resolves to valid JWT token
   */
  getToken(): Promise<string>;

  /**
   * Force refresh token.
   * 
   * Always obtains new token from provider, regardless of current token validity.
   * Saves new token to session store (cache).
   * 
   * Use this when getToken() returned a token that was rejected by server (401/403).
   * 
   * @returns Promise that resolves to new JWT token
   */
  refreshToken(): Promise<string>;
}
