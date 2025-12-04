/**
 * Options for token providers
 * 
 * Used by ITokenProvider implementations to configure token acquisition behavior.
 * All options are optional, allowing providers to use sensible defaults.
 */
import type { ILogger } from '../logging/ILogger';

export interface ITokenProviderOptions {
  /** 
   * Browser type for browser-based authentication
   * Supported values: "chrome", "edge", "firefox", "system" (default), "none"
   * - "system": Uses system default browser
   * - "none": Does not open browser automatically (user must open URL manually)
   */
  browser?: string;
  
  /** 
   * Logger instance for logging token provider operations
   * Uses ILogger interface to allow any logger implementation
   */
  logger?: ILogger;
}

