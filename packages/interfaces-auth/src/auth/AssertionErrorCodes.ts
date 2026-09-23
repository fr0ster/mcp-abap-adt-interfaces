/**
 * Error codes for assertion validation
 * Used by an IAssertionValidator to say which check refused the assertion
 *
 * Deliberately separate from TOKEN_PROVIDER_ERROR_CODES: that set describes what
 * can go wrong with ANY token provider, so a single authentication mechanism
 * must not widen it. A mechanism brings its own codes, as stores and the
 * network layer already do.
 */

export const ASSERTION_ERROR_CODES = {
  /** A SAML assertion failed validation and was refused */
  VALIDATION_ERROR: 'ASSERTION_VALIDATION_ERROR',
} as const;

export type AssertionErrorCode =
  (typeof ASSERTION_ERROR_CODES)[keyof typeof ASSERTION_ERROR_CODES];
