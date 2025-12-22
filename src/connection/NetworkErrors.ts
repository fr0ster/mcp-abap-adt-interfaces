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

/**
 * Check if an error is a network error
 * @param error Error object to check
 * @returns true if error is a network-level error
 */
export function isNetworkError(error: unknown): boolean {
  if (!error) {
    return false;
  }

  if (typeof error !== 'object') {
    return false;
  }

  const errorObj = error as Record<string, unknown>;
  const errorCode = errorObj.code;
  const errorMessage = (errorObj.message as string) || '';

  // Check error code
  if (
    errorCode &&
    Object.values(NETWORK_ERROR_CODES).includes(errorCode as NetworkErrorCode)
  ) {
    return true;
  }

  // Check error message (fallback for wrapped errors)
  return Object.values(NETWORK_ERROR_CODES).some((code) =>
    errorMessage.includes(code),
  );
}
