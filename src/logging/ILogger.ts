/**
 * Logger interface for MCP ABAP ADT packages
 * Allows packages to be independent of specific logger implementation
 */
export interface ILogger {
  /**
   * Log informational message
   */
  info(message: string, meta?: any): void;

  /**
   * Log error message
   */
  error(message: string, meta?: any): void;

  /**
   * Log warning message
   */
  warn(message: string, meta?: any): void;

  /**
   * Log debug message
   */
  debug(message: string, meta?: any): void;
}

