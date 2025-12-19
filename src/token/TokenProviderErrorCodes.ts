/**
 * Token Provider Error Codes
 * 
 * Constants for error codes that token providers can throw.
 * Used to enable better error handling and categorization.
 */

/**
 * Error codes for token provider operations
 */
export const TOKEN_PROVIDER_ERROR_CODES = {
  /** Authentication configuration validation failed */
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  /** Token refresh operation failed */
  REFRESH_ERROR: 'REFRESH_ERROR',
  /** Session data is invalid or incomplete */
  SESSION_DATA_ERROR: 'SESSION_DATA_ERROR',
  /** Service key data is invalid or incomplete */
  SERVICE_KEY_ERROR: 'SERVICE_KEY_ERROR',
  /** Browser authentication failed or was cancelled */
  BROWSER_AUTH_ERROR: 'BROWSER_AUTH_ERROR',
} as const;

/**
 * Type for token provider error codes
 */
export type TokenProviderErrorCode = typeof TOKEN_PROVIDER_ERROR_CODES[keyof typeof TOKEN_PROVIDER_ERROR_CODES];
