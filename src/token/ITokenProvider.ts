/**
 * Token Provider interface
 *
 * Stateful providers that manage token lifecycle internally.
 * The provider validates, refreshes, or re-authenticates as needed.
 */

import type { ITokenResult } from './ITokenResult';

/**
 * Interface for token providers (stateful)
 */
export interface ITokenProvider {
  /**
   * Get tokens with automatic refresh/relogin logic
   *
   * Stateful providers cache tokens internally and handle refresh automatically.
   * Checks token expiration, refreshes if needed, or triggers login.
   */
  getTokens(): Promise<ITokenResult>;

  /**
   * Validate JWT token locally (optional)
   * @param token JWT token to validate
   * @param serviceUrl Service URL (optional, for services that require URL validation)
   * @returns Promise that resolves to true if token is valid, false otherwise
   */
  validateToken?(token: string, serviceUrl?: string): Promise<boolean>;
}
