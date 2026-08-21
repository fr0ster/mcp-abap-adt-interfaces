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

/**
 * What a credential needs from the connection to talk to the server itself.
 *
 * Only credentials whose way in IS a round trip use this — see
 * {@link IAuthProvider.fetchCsrfToken}. Deliberately the connection's own
 * transport rather than an HTTP client of the credential's: the cookies the
 * exchange produces have to land where every later request will look for them,
 * and a credential holding its own client would put them somewhere else.
 */
export interface ICredentialTransport {
  /** Absolute base URL of the system. */
  baseUrl: string;

  /** Issue a raw request and hand back status, headers and body. */
  send(request: {
    method: 'GET' | 'DELETE';
    url: string;
    headers: Record<string, string>;
    timeoutMs?: number;
    /**
     * Whether the cookies this answers with become the connection's.
     *
     * True for an exchange that establishes the session — its `SAP_SESSIONID`
     * IS the session, and every later request authenticates with it.
     */
    adoptCookies?: boolean;
  }): Promise<{ status: number; headers: unknown; data: unknown }>;
}

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
   * Optional because most credentials are ready as constructed. A credential
   * that throws here fails the connect, which is correct — it has nothing to
   * authenticate with.
   */
  prepare?(): Promise<void>;

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
   * The server refused what this last handed out; get a new one.
   *
   * Separate from {@link authorizationHeader} because the two questions are
   * different, and the token contract says so: `getToken()` may return a cached
   * token while it is still valid, while `refreshToken()` is the one to call
   * when a token has been rejected. Asking the first again after a 401 gets the
   * same rejected token back, and the renewal never happens.
   *
   * Omitted by credentials that cannot be renewed — a password is a password.
   */
  renew?(): Promise<void>;

  /**
   * Cookies this credential authenticates with, for the ways in where the
   * session was negotiated elsewhere and handed over — SAML is one.
   *
   * Part of the contract rather than a method a provider happens to have: an
   * earlier version left it off, a SAML provider held the cookies, nothing ever
   * asked for them, and the connection authenticated with nothing at all.
   */
  cookies?(): string;

  /**
   * TLS material for credentials that live in the transport rather than in a
   * header. Omitted by everything else.
   *
   * {@link ICertificateMaterial} rather than Node's `AgentOptions`: this is a
   * contract package with no runtime and no `node:` imports, and the shape a
   * client needs is exactly what the loader already produces.
   */
  transportMaterial?(): ICertificateMaterial;

  /**
   * Fetch the CSRF token this credential's own way.
   *
   * Only SPNEGO needs it: its token is consumed by one request, so the exchange
   * IS the fetch. Everything else omits it and gets the connection's shared
   * path.
   *
   * Given a transport rather than a URL, because a credential that owns the
   * fetch owns what the fetch produces. The SPNEGO round trip is the request
   * the server answers with the session cookie, and that cookie has to reach
   * the connection — every later request authenticates with it, and the
   * `Negotiate` token is spent by then. An earlier signature passed a URL and
   * took back a string, which left the cookie with nowhere to go; it was
   * declared, wired at the call site, and implemented by nobody, because it
   * could not be implemented.
   */
  fetchCsrfToken?(transport: ICredentialTransport): Promise<string>;
}
