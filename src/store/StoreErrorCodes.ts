/**
 * Error codes for store operations
 * Used by auth-stores package to provide typed errors to auth-broker
 */

export const STORE_ERROR_CODES = {
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  PARSE_ERROR: 'PARSE_ERROR',
  INVALID_CONFIG: 'INVALID_CONFIG',
  STORAGE_ERROR: 'STORAGE_ERROR',
} as const;

export type StoreErrorCode = typeof STORE_ERROR_CODES[keyof typeof STORE_ERROR_CODES];
