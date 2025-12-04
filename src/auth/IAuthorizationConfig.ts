/**
 * Authorization configuration - values needed for obtaining and refreshing tokens
 * Returned by stores with actual values (not file paths)
 */
export interface IAuthorizationConfig {
  /** UAA URL for token refresh */
  uaaUrl: string;
  /** UAA client ID */
  uaaClientId: string;
  /** UAA client secret */
  uaaClientSecret: string;
  /** Refresh token for token renewal (optional) */
  refreshToken?: string;
}

