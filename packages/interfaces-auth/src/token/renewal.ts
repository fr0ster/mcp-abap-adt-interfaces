/**
 * The renewal strategy: how a provider's renewal proceeds — whether to try
 * the refresh token, whether to log in, when to stop, and what becomes of a
 * refresh token that was sent. Types and constants only.
 *
 * A renewal strategy receives minted errors and allowlisted facts: never a
 * token, a refresh token's value, or the message, cause or body of a thrown
 * value.
 */

import type { IAuthProviderError } from '../error/IAuthProviderError';
import type { RejectionMoment, RfcKey } from '../error/kinds';
import type { HttpStatus } from '../error/numbers';

/** Why a renewal started. */
export const RENEWAL_TRIGGERS = Object.freeze([
  'no-token',
  'expired',
  'bound-elsewhere',
  'explicit',
  'rejected',
] as const);
export type RenewalTrigger = (typeof RENEWAL_TRIGGERS)[number];

/** The moment of the contract in which a renewal ran. */
export const RENEWAL_MOMENTS = Object.freeze([
  'prepare',
  'get-tokens',
  'refresh-tokens',
  'authorize',
  'rejected',
] as const);
export type RenewalMoment = (typeof RENEWAL_MOMENTS)[number];

/** What a rejection says about the credential, by rule 5. */
export const REJECTION_READINGS = Object.freeze([
  'credential',
  'not-credential',
  'unknown',
] as const);
export type RejectionReading = (typeof REJECTION_READINGS)[number];

export const RENEWAL_STEPS = Object.freeze(['refresh', 'login'] as const);
export type RenewalStep = (typeof RENEWAL_STEPS)[number];

/** Why a renewal started. */
export type RenewalCause =
  | { readonly trigger: 'no-token' | 'expired' | 'explicit' }
  | {
      readonly trigger: 'bound-elsewhere';
      /** The last renewal of this held token, when one ran and did not make it usable. */
      readonly lastRenewal?: IAuthProviderError | undefined;
    }
  | {
      readonly trigger: 'rejected';
      readonly reading: RejectionReading;
      /** Rule 5's refusal for a `not-credential` reading — what a stop answers. */
      readonly refusal?: IAuthProviderError | undefined;
      readonly at: RejectionMoment;
      readonly status?: HttpStatus | undefined;
      readonly rfcKey?: RfcKey | undefined;
    };

/** How a step ended, when it did not end the renewal with a usable credential. */
export type RenewalStepOutcome =
  | {
      readonly step: RenewalStep;
      readonly outcome: 'failed';
      /** False: nothing reached the server (discovery, a strategy, a loader failed first). */
      readonly sent: boolean;
      readonly error: IAuthProviderError;
    }
  | {
      readonly step: RenewalStep;
      /** A credential was obtained and committed, and is not the one wanted. */
      readonly outcome: 'unchanged' | 'bound-elsewhere';
    };

export interface RenewalSituation {
  readonly cause: RenewalCause;
  readonly moment: RenewalMoment;
  /** A refresh is possible now: a refresh grant, and a refresh token held and not discarded. */
  readonly canRefresh: boolean;
  /** The steps this renewal already took, in order; empty before the first. */
  readonly steps: readonly RenewalStepOutcome[];
}

/** What becomes of a refresh token that was sent. */
export type SentRefreshToken = 'keep' | 'discard';

export type RenewalDecision =
  | {
      readonly next: 'refresh';
      /** What becomes of the refresh token sent if this renewal is cut after dispatch. */
      readonly ifCut: SentRefreshToken;
      /** Only after a refresh that failed after it was sent. */
      readonly sentRefreshToken?: SentRefreshToken | undefined;
    }
  | {
      readonly next: 'login';
      readonly sentRefreshToken?: SentRefreshToken | undefined;
    }
  | {
      readonly next: 'stop';
      readonly sentRefreshToken?: SentRefreshToken | undefined;
    };

/** A step of this provider's renewal that ended by the consumer's abort. */
export interface RenewalAbortObservation {
  readonly cause: RenewalCause;
  readonly moment: RenewalMoment;
  readonly step: RenewalStep;
  /** True: the request reached the wire before the abort. */
  readonly sent: boolean;
  /** For a refresh sent: what `ifCut` did to the refresh token it sent. */
  readonly refreshToken?: 'kept' | 'discarded' | undefined;
}

export interface IRenewalStrategy {
  next(situation: RenewalSituation): RenewalDecision | Promise<RenewalDecision>;
  /** Told of an aborted step; optional; its answer is never awaited. */
  aborted?(observation: RenewalAbortObservation): void;
}
