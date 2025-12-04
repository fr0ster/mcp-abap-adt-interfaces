/**
 * Options for token providers
 */
import type { ILogger } from '../logging/ILogger';

export interface ITokenProviderOptions {
  /** Browser type for browser-based authentication (chrome, edge, firefox, system, none) */
  browser?: string;
  /** Logger instance for logging */
  logger?: ILogger;
}

