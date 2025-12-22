/**
 * Result from token provider
 */
import type { IConnectionConfig } from '../auth/IConnectionConfig';

export interface ITokenProviderResult {
  /** Connection configuration with authorization token */
  connectionConfig: IConnectionConfig;
  /** Refresh token (optional, for BTP/ABAP) */
  refreshToken?: string;
}
