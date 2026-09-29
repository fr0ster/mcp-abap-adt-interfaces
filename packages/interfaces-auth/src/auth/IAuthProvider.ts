/**
 * How a connection proves who it is — injected, and delegated to.
 *
 * The class a consumer takes says which SYSTEM it is dialling; this says how it
 * authenticates there. The two are independent: a communication user against
 * ABAP Cloud and a bearer token against on-prem are both ordinary, and a design
 * where the credential picks the system's session mechanism gets one of them
 * wrong whichever way it guesses.
 *
 * **The process calls the same four moments for every provider** — basic,
 * authorization code, SAML, a certificate, SNC, anything later — and never asks
 * what it was given. Each moment is one the process always goes through:
 * getting ready, logging on, sending a request, being refused. The provider
 * does all the work of its way in, writing into the targets the wire hands it,
 * and answers every moment with an {@link AuthOutcome}: go on, or not
 * authenticated, with why and what to do.
 *
 * A provider with nothing to contribute at a moment writes nothing and answers
 * Ok. That is not a negative answer the process must check — the process does
 * the same thing either way. Decision 40.
 *
 * Distinct from {@link IAuthorizationStrategy}, which is one layer up: that is
 * how an INTERACTIVE login is conducted — a browser, a redirect, a callback
 * server — and a provider that needs one uses it inside `prepare()` or
 * `rejected()`.
 *
 * It lives here rather than beside any implementation because it is what a
 * consumer writes against. Where an authentication has no shipped provider,
 * the honest answer is to say so and let a consumer implement this — which is
 * only possible if the contract is in the contract package.
 */

import type { AuthOutcome } from './AuthOutcome';
import type { IAuthRejection } from './IAuthRejection';
import type { ILogonTarget, IRequestTarget } from './IAuthTargets';

export interface IAuthProvider {
  /** For logs, so which provider ran is never inferred from behaviour. */
  readonly kind: string;

  /**
   * Once per connect, before anything is sent: load key material, obtain a
   * token (from a cache, a refresh or a login), find a library, check that a
   * product runs.
   *
   * Oops fails the connect with the refusal; nothing is sent.
   */
  prepare(): Promise<AuthOutcome>;

  /**
   * At every logon the wire makes — an HTTP session's establishment, each RFC
   * conversation's open (a connection opens more than one). The provider writes
   * what the logon needs into `logon`, and returns what the target answered
   * when it could not use it.
   *
   * Oops fails that logon with the refusal.
   */
  establish(logon: ILogonTarget): Promise<AuthOutcome>;

  /**
   * Before every request attempt, the establishing one included. Per attempt
   * because a provider renews on expiry here: a header asked for once and kept
   * by the process would be the stale one.
   *
   * Oops means the request is not sent.
   */
  authorize(request: IRequestTarget): Promise<AuthOutcome>;

  /**
   * The system refused — a 401, or a logon it would not accept. The only
   * renewal there is: a token provider gets a new token and answers Ok, and the
   * process tries once more; a password has nothing behind it and answers Oops
   * "user or password refused"; an SNC provider answers Oops with the GSS cause
   * and what to do.
   *
   * Every provider answers this. Answering Oops truthfully is not a lie about a
   * capability — it is the verdict only the provider can give.
   */
  rejected(rejection: IAuthRejection): Promise<AuthOutcome>;
}
