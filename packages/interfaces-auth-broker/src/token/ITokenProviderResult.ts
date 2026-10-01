/**
 * Result from token provider
 */
import type { IConnectionConfig } from '../auth/IConnectionConfig';

/** Nothing imports this yet; it sits with the session and token contracts it belongs to. */
export interface ITokenProviderResult {
  /** Connection configuration with authorization token */
  connectionConfig: IConnectionConfig;
  /** Refresh token (optional, for BTP/ABAP) */
  refreshToken?: string;
}
