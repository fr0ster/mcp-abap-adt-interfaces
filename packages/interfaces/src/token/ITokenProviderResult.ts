/**
 * Result from token provider
 */
import type { IConnectionConfig } from '@mcp-abap-adt/interfaces-adt';

/** @deprecated No package imports this; it is removed in the next major of `@mcp-abap-adt/interfaces`. */
export interface ITokenProviderResult {
  /** Connection configuration with authorization token */
  connectionConfig: IConnectionConfig;
  /** Refresh token (optional, for BTP/ABAP) */
  refreshToken?: string;
}
