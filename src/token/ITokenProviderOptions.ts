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
   * Supported values: "chrome", "edge", "firefox", "system" (default), "none", "headless"
   * - "system": Uses system default browser (default)
   * - "headless": Does not open browser, logs URL and waits for manual callback (for SSH/remote sessions)
   * - "none": Does not open browser, immediately rejects with error (for automated tests)
   */
  browser?: string;
  
  /** 
   * Logger instance for logging token provider operations
   * Uses ILogger interface to allow any logger implementation
   */
  logger?: ILogger;
}

