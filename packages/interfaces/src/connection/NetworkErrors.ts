/**
 * Network error codes that indicate infrastructure-level connection issues
 * These errors should not trigger retry logic (CSRF, auth) as they indicate
 * problems with network connectivity, VPN, DNS, or server availability.
 */

/**
 * Network error codes
 */
export const NETWORK_ERROR_CODES = {
  /** Connection refused - server not accepting connections */
  ECONNREFUSED: 'ECONNREFUSED',
  /** Connection timeout - server not responding */
  ETIMEDOUT: 'ETIMEDOUT',
  /** DNS resolution failed - hostname not found */
  ENOTFOUND: 'ENOTFOUND',
  /** Connection reset by peer */
  ECONNRESET: 'ECONNRESET',
  /** Network is unreachable */
  ENETUNREACH: 'ENETUNREACH',
  /** Host is unreachable */
  EHOSTUNREACH: 'EHOSTUNREACH',
} as const;

/**
 * Type for network error codes
 */
export type NetworkErrorCode =
  (typeof NETWORK_ERROR_CODES)[keyof typeof NETWORK_ERROR_CODES];
