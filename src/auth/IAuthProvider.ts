/**
 * How a connection proves who it is — passed in, not inherited.
 *
 * The class a consumer takes says which SYSTEM it is dialling; this says how it
 * authenticates there. The two are independent: a communication user against
 * ABAP Cloud and a bearer token against on-prem are both ordinary, and a design
 * where the credential picks the system's session mechanism gets one of them
 * wrong whichever way it guesses.
 *
 * Deliberately not "give me a token". Four of the five ways in are not tokens:
 * basic is a header built from a username, a certificate is TLS material and no
 * header at all, and SPNEGO is a negotiation with the server. What every one of
 * them has in common is small, and it is this.
 *
 * Distinct from {@link IAuthorizationStrategy}, which is one layer up: that is
 * how an INTERACTIVE login is conducted — a browser, a redirect, a callback
 * server — and its output eventually becomes a token some implementation of
 * this hands out. This interface is asked on every request; that one is asked
 * once, by a human.
 *
 * It lives here rather than beside any implementation because it is what a
 * consumer writes against. Where an authentication has no shipped provider,
 * the honest answer is to say so and let a consumer implement this — which is
 * only possible if the contract is in the contract package.
 */

import type { ICertificateMaterial } from './ICertificateMaterialLoader';

export interface IAuthProvider {
  /** For logs, so which credential ran is never inferred from behaviour. */
  readonly kind: string;

  /**
   * Get ready before anything is sent: load key material, unlock a store.
   * Called once per establishment, before the first request.
   *
   * Not for tokens. A stateful token provider caches and renews on its own, so
   * asking it IS the preparation — and holding what it returned would hide the
   * renewal it exists to do.
   *
   * **Required, and empty where there is nothing to do** — which is true of
   * most credentials, since they are ready as constructed. Empty is a fact
   * about a credential; optional made the connection ask `prepare?.()`, a
   * runtime question about a collaborator it was handed, which is what a
   * contract exists to answer instead.
   *
   * A credential that throws here fails the connect, which is correct — it has
   * nothing to authenticate with.
   */
  prepare(): Promise<void>;

  /**
   * The `Authorization` header value, or `null` when this credential is not a
   * header — a certificate authenticates through TLS and has none, and a
   * SPNEGO token is spent once the session cookie carries the session.
   *
   * **`null`, not `''`.** The empty string is a legal header value, so using it
   * to mean "there is no header" gives one type two meanings and leaves every
   * caller checking truthiness — which silently treats a legitimately empty
   * header as an absent one.
   *
   * **Asked per request, and asynchronous, because the answer can change.** A
   * token provider checks expiry and renews behind this call; anything cached
   * on the caller's side would serve the stale token and defeat it. Cheap in
   * the ordinary case for the same reason: the provider holds the token and
   * only goes to the network when it has expired.
   */
  authorizationHeader(): Promise<string | null>;

  /**
   * Cookies this credential authenticates with, for the ways in where the
   * session was negotiated elsewhere and handed over — SAML is one.
   *
   * Part of the contract rather than a method a provider happens to have: an
   * earlier version left it off, a SAML provider held the cookies, nothing ever
   * asked for them, and the connection authenticated with nothing at all.
   *
   * `null` where this credential is not cookies, which most are not. `null`
   * rather than `''` for the reason the header uses it: an empty string is a
   * legal cookie header, so it cannot also mean "there is none".
   */
  cookies(): string | null;

  /**
   * TLS material for credentials that live in the transport rather than in a
   * header. Omitted by everything else.
   *
   * {@link ICertificateMaterial} rather than Node's `AgentOptions`: this is a
   * contract package with no runtime and no `node:` imports, and the shape a
   * client needs is exactly what the loader already produces.
   *
   * An empty object where this credential lives in a header instead, which is
   * most of them — "I contribute no TLS material" is a fact, and a wire that
   * merges it merges nothing.
   */
  transportMaterial(): ICertificateMaterial;
}

/**
 * A credential that can be told to get a new one.
 *
 * ADDITIVE to {@link IAuthProvider}, and separate from it for the reason the
 * connection capability atoms are separate: only some credentials have this. A
 * password is a password — there is nothing behind it to ask again — and a
 * SAML session was negotiated elsewhere and handed over. Making the member
 * mandatory would force those to implement a lie.
 *
 * **Nothing in the request path calls this.** Renewal on an expiry the provider
 * can see happens inside `authorizationHeader()`, which is asked per request;
 * this is the other case — a credential the provider still believes in and the
 * server refuses. That is a judgement about what a 401 MEANT, and it is the
 * caller's to make with what the caller knows, which is why a refusal surfaces
 * rather than being answered underneath them.
 *
 * So this exists to be narrowed to. A consumer holding an `IAuthProvider` and a
 * refusal asks whether there is anything to try, instead of casting and hoping:
 *
 * ```ts
 * if (isRenewable(credential)) {
 *   await credential.renew();
 *   // ... and decide for yourself whether to try again
 * }
 * ```
 *
 * It declares `renew` and nothing else. A provider that can be renewed is
 * `IAuthProvider & IRenewableCredential`, spelled where it is meant — the
 * narrowing above works the same, and a consumer implementing renewal alone is
 * not made to reimplement the provider to say so.
 */
export interface IRenewableCredential {
  /**
   * The server refused what this last handed out; get a new one.
   *
   * Distinct from asking for a header again, and the token contract says why:
   * `getToken()` may return a cached token while it believes it is valid, which
   * after a refusal is precisely what it wrongly believes. This is the contract's
   * answer for that.
   */
  renew(): Promise<void>;
}
