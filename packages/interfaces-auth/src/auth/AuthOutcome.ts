/**
 * What every call of {@link IAuthProvider} answers: go on, or not authenticated.
 *
 * One shape for all four moments, so the process reads every answer the same
 * way and never has to know which provider gave it. A provider that fails says
 * so here; it does not throw across the contract — an exception out of a
 * provider is a bug in the provider, not an answer.
 */

/** Why a provider could not authenticate, and what to do about it. */
export interface IAuthRefusal {
  /**
   * What went wrong, for a log and for a person reading it: "the user or
   * password was refused", "the SAP Secure Login Client has no certificate".
   */
  readonly reason: string;
  /**
   * What to do about it, when the provider knows — "log on in the Secure Login
   * Client", "renew the service key". Absent when there is nothing to suggest.
   */
  readonly hint?: string;
}

export type AuthOutcome =
  | { readonly ok: true }
  | { readonly ok: false; readonly refusal: IAuthRefusal };
