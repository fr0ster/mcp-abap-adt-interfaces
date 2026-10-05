/**
 * What a wire hands a provider to write into.
 *
 * The provider does the work and the wire applies it: a provider never learns
 * how a header reaches axios or how logon parameters reach an RFC
 * conversation, and the process never learns what the provider wrote. Each
 * wire implements these in its own way.
 */
import type { AuthOutcome } from './AuthOutcome';
import type { ICertificateMaterial } from './ICertificateMaterial';

/**
 * A logon being made — an HTTP session's establishment, an RFC conversation's
 * open. Handed to {@link IAuthProvider.establish} once per logon.
 *
 * Each member answers whether this wire took what it was given: Ok, or Oops
 * naming the wire and what it cannot take. Whether "not taken" is a failure is
 * the provider's call, because only the provider knows whether it has another
 * way: SNC has none and returns the Oops as its own; a password over HTTP is
 * carried by the header `authorize()` writes, and goes on. A credential and a
 * wire are chosen independently, so this is where a real mismatch surfaces —
 * at the first logon, before any request, never as a request sent without
 * its credential.
 *
 * A target's Oops carries an `IAuthProviderError` like any other refusal, so
 * a target builds it through `@mcp-abap-adt/auth-errors` (kind
 * `logon-target`, naming the wire and what it refused); an object literal
 * does not compile. A provider never returns a target's answer unread: it
 * relays it through `auth-errors`' `relayOutcome`, which classifies what the
 * target returned or threw.
 */
export interface ILogonTarget {
  /** TLS client material for the connection being opened. */
  tlsMaterial(material: ICertificateMaterial): AuthOutcome;
  /**
   * Named logon parameters, every value a string. For RFC, what replaces or
   * accompanies `user`/`passwd`: `{ user, passwd }` for a password,
   * `{ snc_mode, snc_partnername, snc_qop, snc_lib }` for SNC.
   */
  logonParameters(parameters: Readonly<Record<string, string>>): AuthOutcome;
}

/**
 * A request about to be sent. Handed to {@link IAuthProvider.authorize} before
 * every attempt, the establishing one included.
 *
 * Nothing here can be refused: every wire this library has carries headers,
 * the RFC one included (they travel to `SADT_REST_RFC_ENDPOINT` as header
 * fields). Cookies merge with the wire's own session cookies.
 */
export interface IRequestTarget {
  header(name: string, value: string): void;
  cookies(value: string): void;
}
