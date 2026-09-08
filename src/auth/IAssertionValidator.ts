/**
 * Establishing that a SAML assertion may be trusted.
 *
 * Validation is a strategy for the same reason everything else here is: a
 * consumer may have a trust model this package cannot anticipate. The shipped
 * default verifies the signature and refuses anything it cannot place; a
 * consumer replacing it takes on that duty entirely.
 */

import type { ILogger } from '../logging/ILogger';

/** What the provider knows about the login the assertion is answering. */
export interface AssertionContext {
  /** The AuthnRequest ID this response must answer. */
  readonly expectedInResponseTo: string;
  /** Our entity ID, which the AudienceRestriction must name. */
  readonly audience: string;
  /** The ACS the response arrived at; Recipient and Destination must match. */
  readonly acsUrl: string;
  /**
   * Trusted issuer; the assertion's `Issuer` must equal it.
   *
   * Optional on the interface because a custom validator may establish trust
   * without it. The shipped default always receives it.
   */
  readonly expectedIssuer?: string;
  /** For progress messages. Absent means silence — never stdout. */
  readonly logger?: ILogger;
}

/** What a validated assertion yields to the flow. */
export interface ValidatedAssertion {
  /**
   * The earlier of `Conditions/@NotOnOrAfter` and the `NotOnOrAfter` of the
   * bearer confirmation that was accepted — never later than either, so a
   * session cannot outlive a window the assertion itself closed.
   */
  readonly expiresAt: Date;
  readonly assertionId: string;
  readonly issuer: string;
  readonly nameId?: string;
  readonly sessionIndex?: string;
  readonly attributes?: Readonly<Record<string, readonly string[]>>;
  /**
   * The response exactly as it arrived, for a flow that must forward it
   * verbatim.
   *
   * **The wire payload, not a validated artifact.** It is the whole
   * `samlp:Response`, and under `createSignedAssertionValidator` that includes
   * `Status`, `Response/Issuer` and `Destination`, which nothing read and
   * nothing checked. Holding a `ValidatedAssertion` does not make every byte
   * of `raw` trustworthy.
   */
  readonly raw: string;
  /**
   * The signed element, serialised: the `Assertion`, or the `Response` when
   * that is what the signature covered.
   *
   * Everything here is inside the signature that verified. A consumer wanting
   * anything this interface does not surface should parse this rather than
   * `raw` — the difference between them is the difference between "signed"
   * and "arrived".
   */
  readonly signedXml: string;
}

/**
 * Establishes that an assertion is genuine, addressed to us, currently valid,
 * and answers a request we made. Rejects by throwing, with a reason naming the
 * check that failed.
 */
export interface IAssertionValidator {
  validate(
    samlResponse: string,
    context: AssertionContext,
  ): Promise<ValidatedAssertion>;
}

/**
 * What identifies an assertion for replay purposes.
 *
 * An assertion's `ID` is unique only within the identity provider that minted
 * it, so a store shared by two providers would reject a perfectly good second
 * login the moment two issuers happened to mint the same `_id`. The key is the
 * pair, never the ID alone.
 */
export interface AssertionReplayKey {
  readonly issuer: string;
  readonly assertionId: string;
}

/** Remembers assertions so a replay is refused. */
export interface IAssertionReplayStore {
  /**
   * Records this key if it is not already recorded, and reports which
   * happened: `true` when newly recorded, `false` when already present — a
   * replay.
   *
   * **Must be atomic.** Two validations of the same assertion running at once
   * must not both be told `true`; a check followed by a separate write is a
   * race, and it is precisely the race a replay exploits.
   *
   * `retainUntil` is the last instant a validator would still accept the
   * assertion — its expiry plus any clock skew allowed — not its expiry. An
   * entry dropped earlier reopens the window in which a replay is accepted.
   */
  recordIfUnseen(key: AssertionReplayKey, retainUntil: Date): Promise<boolean>;
}
