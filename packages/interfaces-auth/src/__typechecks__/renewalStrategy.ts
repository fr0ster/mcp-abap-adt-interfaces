// Compile-only assertions of 7.0.0's renewal and persistence strategies, the
// new kind and the removals. If these stop compiling, the types regressed.
// Every `@ts-expect-error` line must fail — an unused directive fails
// `test:check` — and the positive line beside it proves the failure is the
// rule's.

import type { AuthProviderErrorFacts } from '../error/facts';
import type { IAuthProviderError } from '../error/IAuthProviderError';
import type { AuthProviderErrorKind, Operation } from '../error/kinds';
import * as surface from '../index';
import type { ITokenResult } from '../token/ITokenResult';
import type {
  ITokenPersistence,
  PersistenceReport,
  ReportedCredential,
} from '../token/persistence';
import type {
  IRenewalStrategy,
  RenewalAbortObservation,
  RenewalCause,
  RenewalDecision,
  RenewalSituation,
  RenewalStepOutcome,
  RenewalTrigger,
} from '../token/renewal';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
type Expect<T extends true> = T;

declare const error: IAuthProviderError;

// ---- the decision ------------------------------------------------------------

const _refresh: RenewalDecision = { next: 'refresh', ifCut: 'keep' };
const _refreshAfterSent: RenewalDecision = {
  next: 'refresh',
  ifCut: 'discard',
  sentRefreshToken: 'keep',
};
const _login: RenewalDecision = { next: 'login' };
const _stop: RenewalDecision = { next: 'stop', sentRefreshToken: 'discard' };
// @ts-expect-error a refresh decision carries ifCut
const _noIfCut: RenewalDecision = { next: 'refresh' };
// @ts-expect-error ifCut is keep or discard
const _badIfCut: RenewalDecision = { next: 'refresh', ifCut: 'clear' };
// @ts-expect-error a login has no ifCut: no refresh token is sent by it
const _loginIfCut: RenewalDecision = { next: 'login', ifCut: 'keep' };

// ---- the cause ---------------------------------------------------------------

// @ts-expect-error invalid-value names the fields; none is not a configuration fact
const _invalidNoFields: AuthProviderErrorFacts['configuration'] = {
  case: 'invalid-value',
};
const _invalidOk: AuthProviderErrorFacts['configuration'] = {
  case: 'invalid-value',
  fields: ['authorizationUrl'],
};
void _invalidNoFields;
void _invalidOk;

const _noToken: RenewalCause = { trigger: 'no-token' };
const _bound: RenewalCause = { trigger: 'bound-elsewhere', lastRenewal: error };
const _rejected: RenewalCause = {
  trigger: 'rejected',
  reading: 'credential',
  at: 'request',
};
// @ts-expect-error a rejected cause carries the reading
const _noReading: RenewalCause = { trigger: 'rejected', at: 'request' };
// @ts-expect-error a rejected cause carries the moment
const _noAt: RenewalCause = { trigger: 'rejected', reading: 'unknown' };
const _badReading: RenewalCause = {
  trigger: 'rejected',
  // @ts-expect-error a reading is credential, not-credential or unknown
  reading: 'maybe',
  at: 'request',
};
const _readingOnExpired: RenewalCause = {
  trigger: 'expired',
  // @ts-expect-error only a rejected cause carries a reading
  reading: 'unknown',
};

// ---- the step outcome and the situation ----------------------------------------

const _failed: RenewalStepOutcome = {
  step: 'refresh',
  outcome: 'failed',
  sent: true,
  error,
};
const _unchanged: RenewalStepOutcome = { step: 'login', outcome: 'unchanged' };
// @ts-expect-error a failed step says whether it was sent
const _failedNoSent: RenewalStepOutcome = {
  step: 'refresh',
  outcome: 'failed',
  error,
};

const _situation: RenewalSituation = {
  cause: _noToken,
  moment: 'get-tokens',
  canRefresh: false,
  steps: [_failed, _unchanged],
};

const _observation: RenewalAbortObservation = {
  cause: _noToken,
  moment: 'prepare',
  step: 'refresh',
  sent: true,
  refreshToken: 'kept',
};

class Strategy implements IRenewalStrategy {
  next(): RenewalDecision {
    return _login;
  }
  aborted(_o: RenewalAbortObservation): void {}
}
class AsyncStrategy implements IRenewalStrategy {
  async next(): Promise<RenewalDecision> {
    return _stop;
  }
}

// ---- the persistence report ----------------------------------------------------

const _cred: ReportedCredential = {
  authorizationToken: '',
  tokenType: 'opaque',
  authType: 'client_credentials',
  expiresAt: undefined,
};
const _credentialReport: PersistenceReport = {
  event: 'credential',
  credential: _cred,
  refreshToken: { change: 'new', value: 'r' },
  awaited: true,
};
const _discardedReport: PersistenceReport = {
  event: 'refresh-token-discarded',
  credential: _cred,
  awaited: false,
};
// @ts-expect-error a credential report carries the credential
const _noCredential: PersistenceReport = {
  event: 'credential',
  refreshToken: { change: 'none' },
  awaited: true,
};
// @ts-expect-error a discard report carries the credential held
const _noCredentialDiscard: PersistenceReport = {
  event: 'refresh-token-discarded',
  awaited: true,
};
const _newWithoutValue: PersistenceReport = {
  event: 'credential',
  credential: _cred,
  // @ts-expect-error a new refresh token carries its value
  refreshToken: { change: 'new' },
  awaited: true,
};

class Persistence implements ITokenPersistence {
  report(_r: PersistenceReport): void {}
}

// ---- the kind, the operations, the removals ----------------------------------------

export type DeclinedFacts = Expect<
  Equal<AuthProviderErrorFacts['renewal-declined']['trigger'], RenewalTrigger>
>;
export type DeclinedIsAKind = Expect<
  Equal<Extract<AuthProviderErrorKind, 'renewal-declined'>, 'renewal-declined'>
>;
export type Operations = Expect<
  Equal<
    Extract<Operation, 'renewal-strategy' | 'persisting-tokens'>,
    'renewal-strategy' | 'persisting-tokens'
  >
>;
export type OldHookIsGone = Expect<
  Equal<Extract<Operation, 'on-tokens-hook'>, never>
>;
export type LaunchOutcomeIsGone = Expect<
  Equal<Extract<surface.InteractiveOutcome, 'browser-launch-failed'>, never>
>;
export type ResultLostTheDisposition = Expect<
  Equal<'refreshTokenDisposition' extends keyof ITokenResult ? 1 : 0, 0>
>;

// @ts-expect-error RefreshTokenDisposition is removed in 7.0.0
type _Disposition = surface.RefreshTokenDisposition;
// @ts-expect-error REFRESH_TOKEN_DISPOSITIONS is removed in 7.0.0
const _dispositions: unknown = surface.REFRESH_TOKEN_DISPOSITIONS;
const _withDisposition: ITokenResult = {
  authorizationToken: 'x',
  authType: 'client_credentials',
  // @ts-expect-error the result no longer carries a disposition
  refreshTokenDisposition: 'keep',
};

// the exhaustiveness check over the kinds fails until the new kind is handled
type Handlers = {
  readonly [K in AuthProviderErrorKind]: (
    facts: AuthProviderErrorFacts[K],
  ) => string;
};
// a handler map without renewal-declined is not a Handlers
export type MissingKindFails = Expect<
  Equal<
    Omit<Handlers, 'renewal-declined'> extends Handlers ? true : false,
    false
  >
>;

// the lists are the unions
export type Lists = [
  Expect<Equal<RenewalTrigger, (typeof surface.RENEWAL_TRIGGERS)[number]>>,
  Expect<
    Equal<
      typeof surface.RENEWAL_TRIGGERS,
      readonly [
        'no-token',
        'expired',
        'bound-elsewhere',
        'explicit',
        'rejected',
      ]
    >
  >,
  Expect<
    Equal<
      surface.RenewalMoment,
      'prepare' | 'get-tokens' | 'refresh-tokens' | 'authorize' | 'rejected'
    >
  >,
  Expect<Equal<surface.RenewalStep, 'refresh' | 'login'>>,
  Expect<
    Equal<surface.RejectionReading, 'credential' | 'not-credential' | 'unknown'>
  >,
  Expect<Equal<surface.SentRefreshToken, 'keep' | 'discard'>>,
];
// @ts-expect-error the allowlist is frozen
surface.RENEWAL_TRIGGERS.push('explicit');

void _refresh;
void _refreshAfterSent;
void _login;
void _stop;
void _noIfCut;
void _badIfCut;
void _loginIfCut;
void _bound;
void _rejected;
void _noReading;
void _noAt;
void _badReading;
void _readingOnExpired;
void _failedNoSent;
void _situation;
void _observation;
void Strategy;
void AsyncStrategy;
void _credentialReport;
void _discardedReport;
void _noCredential;
void _noCredentialDiscard;
void _newWithoutValue;
void Persistence;
void _dispositions;
void _withDisposition;
export type { _Disposition };
