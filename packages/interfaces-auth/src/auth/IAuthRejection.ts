/**
 * The system said no. Handed to {@link IAuthProvider.rejected}.
 *
 * One event whatever the wire: a 401 over HTTP and a refused RFC logon are the
 * same question to a provider — can you fix this? The error travels whole, so
 * a provider reads what it recognises (a status, a GSS code) and nothing is
 * pre-digested for it.
 */
export interface IAuthRejection {
  /** Where the system refused: a logon, or a request on an established session. */
  readonly at: 'logon' | 'request';
  /** The HTTP status, when the wire has one. */
  readonly status?: number;
  /** The wire's error, as it arrived. */
  readonly error: unknown;
}
