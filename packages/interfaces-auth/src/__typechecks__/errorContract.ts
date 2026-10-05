// Compile-only assertions of the error contract's static rules. If these stop
// compiling, the types regressed. Every `@ts-expect-error` line must fail —
// an unused directive fails `test:check` — so each one is load-bearing by
// construction; the positive line beside it proves the failure is the rule's.

import type {
  CONFIG_CASE_DIAGNOSTICS,
  DocumentValue,
  SAML_RULE_DIAGNOSTIC,
  SNC_PROBLEM_DIAGNOSTICS,
} from '../error/diagnostics';
import type {
  AssertionRuleCheck,
  AuthProviderErrorFacts,
  BearerCandidate,
  SncCandidate,
  SncProblemFacts,
} from '../error/facts';
import type { IAuthProviderError } from '../error/IAuthProviderError';
import type {
  AllowedValueSet,
  AssertionCheck,
  AssertionRule,
  AuthProviderErrorKind,
  BasicEncoding,
  BearerCandidateReason,
  ClientAuthenticationProblem,
  ClientCertificateProblem,
  ConfigCase,
  ConfigField,
  ConnectionMoment,
  ConnectionProblem,
  CredentialKind,
  InteractiveLoginStrategy,
  InteractiveOutcome,
  LogonTargetRefusal,
  LogonTargetWire,
  NotPreparedProvider,
  OAuthErrorCode,
  Operation,
  RejectionMoment,
  RenewalUnchangedSource,
  RequestProblem,
  RfcKey,
  SamlStatusCode,
  SncArch,
  SncCandidateSource,
  SncProblem,
  SncQop,
  SncUnusableReason,
  SystemCode,
  SystemRefusedVerdict,
  TlsFailureCode,
  TokenBindingProblem,
} from '../error/kinds';
import {
  type ALLOWED_VALUE_SETS,
  type ASSERTION_CHECKS,
  type ASSERTION_RULES,
  type AUTH_PROVIDER_ERROR_KINDS,
  type BASIC_ENCODINGS,
  type BEARER_CANDIDATE_REASONS,
  type CLIENT_AUTHENTICATION_PROBLEMS,
  type CLIENT_CERTIFICATE_PROBLEMS,
  type CONFIG_CASES,
  type CONFIG_FIELDS,
  type CONNECTION_MOMENTS,
  type CONNECTION_PROBLEMS,
  type CREDENTIAL_KINDS,
  type INTERACTIVE_LOGIN_STRATEGIES,
  type INTERACTIVE_OUTCOMES,
  type LOGON_TARGET_REFUSALS,
  type LOGON_TARGET_WIRES,
  type NOT_PREPARED_PROVIDERS,
  type OAUTH_ERROR_CODES,
  type OPERATIONS,
  type REJECTION_MOMENTS,
  type RENEWAL_UNCHANGED_SOURCES,
  type REQUEST_PROBLEMS,
  type RFC_KEYS,
  type SAML_STATUS_CODES,
  type SNC_ARCHS,
  type SNC_CANDIDATE_SOURCES,
  type SNC_PROBLEMS,
  type SNC_QOP_VALUES,
  type SNC_UNUSABLE_REASONS,
  SYSTEM_CODES,
  type SYSTEM_REFUSED_VERDICTS,
  type TLS_FAILURE_CODES,
  type TOKEN_BINDING_PROBLEMS,
} from '../error/kinds';
import type { HttpStatus } from '../error/numbers';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
/** Assignable both ways, as well as identical. */
type Same<A, B> =
  Equal<A, B> extends true
    ? [A] extends [B]
      ? [B] extends [A]
        ? true
        : false
      : false
    : false;
type Expect<T extends true> = T;

declare function use(value: unknown): void;

// ---- every allowlist union is its array's element type -------------------

export type UnionsAreTheirArrays = [
  Expect<
    Same<AuthProviderErrorKind, (typeof AUTH_PROVIDER_ERROR_KINDS)[number]>
  >,
  Expect<Same<ConfigField, (typeof CONFIG_FIELDS)[number]>>,
  Expect<Same<ConfigCase, (typeof CONFIG_CASES)[number]>>,
  Expect<Same<AllowedValueSet, (typeof ALLOWED_VALUE_SETS)[number]>>,
  Expect<Same<SncQop, (typeof SNC_QOP_VALUES)[number]>>,
  Expect<Same<BasicEncoding, (typeof BASIC_ENCODINGS)[number]>>,
  Expect<Same<Operation, (typeof OPERATIONS)[number]>>,
  Expect<Same<RequestProblem, (typeof REQUEST_PROBLEMS)[number]>>,
  Expect<Same<SystemCode, (typeof SYSTEM_CODES)[number]>>,
  Expect<Same<TlsFailureCode, (typeof TLS_FAILURE_CODES)[number]>>,
  Expect<Same<OAuthErrorCode, (typeof OAUTH_ERROR_CODES)[number]>>,
  Expect<Same<RfcKey, (typeof RFC_KEYS)[number]>>,
  Expect<Same<AssertionCheck, (typeof ASSERTION_CHECKS)[number]>>,
  Expect<Same<AssertionRule, (typeof ASSERTION_RULES)[number]>>,
  Expect<
    Same<BearerCandidateReason, (typeof BEARER_CANDIDATE_REASONS)[number]>
  >,
  Expect<Same<SamlStatusCode, (typeof SAML_STATUS_CODES)[number]>>,
  Expect<Same<SncProblem, (typeof SNC_PROBLEMS)[number]>>,
  Expect<Same<SncCandidateSource, (typeof SNC_CANDIDATE_SOURCES)[number]>>,
  Expect<Same<SncUnusableReason, (typeof SNC_UNUSABLE_REASONS)[number]>>,
  Expect<Same<SncArch, (typeof SNC_ARCHS)[number]>>,
  Expect<Same<InteractiveOutcome, (typeof INTERACTIVE_OUTCOMES)[number]>>,
  Expect<Same<CredentialKind, (typeof CREDENTIAL_KINDS)[number]>>,
  Expect<
    Same<ClientCertificateProblem, (typeof CLIENT_CERTIFICATE_PROBLEMS)[number]>
  >,
  Expect<
    Same<
      ClientAuthenticationProblem,
      (typeof CLIENT_AUTHENTICATION_PROBLEMS)[number]
    >
  >,
  Expect<
    Same<
      InteractiveLoginStrategy,
      (typeof INTERACTIVE_LOGIN_STRATEGIES)[number]
    >
  >,
  Expect<Same<RejectionMoment, (typeof REJECTION_MOMENTS)[number]>>,
  Expect<Same<SystemRefusedVerdict, (typeof SYSTEM_REFUSED_VERDICTS)[number]>>,
  Expect<
    Same<RenewalUnchangedSource, (typeof RENEWAL_UNCHANGED_SOURCES)[number]>
  >,
  Expect<Same<TokenBindingProblem, (typeof TOKEN_BINDING_PROBLEMS)[number]>>,
  Expect<Same<NotPreparedProvider, (typeof NOT_PREPARED_PROVIDERS)[number]>>,
  Expect<Same<LogonTargetWire, (typeof LOGON_TARGET_WIRES)[number]>>,
  Expect<Same<LogonTargetRefusal, (typeof LOGON_TARGET_REFUSALS)[number]>>,
  Expect<Same<ConnectionProblem, (typeof CONNECTION_PROBLEMS)[number]>>,
  Expect<Same<ConnectionMoment, (typeof CONNECTION_MOMENTS)[number]>>,
];

// ---- every kind has facts, and nothing but a kind has facts --------------

export type FactsCoverTheKinds = [
  Expect<Same<keyof AuthProviderErrorFacts, AuthProviderErrorKind>>,
  Expect<Same<keyof AssertionRuleCheck, AssertionRule>>,
  Expect<
    AssertionRuleCheck extends Record<AssertionRule, AssertionCheck>
      ? true
      : false
  >,
  Expect<Same<IAuthProviderError['kind'], AuthProviderErrorKind>>,
  Expect<Same<keyof SncProblemFacts, SncProblem>>,
  Expect<
    Same<
      AuthProviderErrorFacts['interactive-login']['outcome'],
      InteractiveOutcome
    >
  >,
  Expect<
    Same<
      AuthProviderErrorFacts['system-refused']['verdict'],
      SystemRefusedVerdict
    >
  >,
  Expect<Same<AuthProviderErrorFacts['snc']['problem'], SncProblem>>,
  Expect<Same<AuthProviderErrorFacts['configuration']['case'], ConfigCase>>,
  Expect<Same<AuthProviderErrorFacts['saml-assertion']['rule'], AssertionRule>>,
  Expect<Same<keyof typeof SAML_RULE_DIAGNOSTIC, AssertionRule>>,
  Expect<Same<keyof typeof SNC_PROBLEM_DIAGNOSTICS, SncProblem>>,
  Expect<Same<keyof typeof CONFIG_CASE_DIAGNOSTICS, ConfigCase>>,
];

// ---- the arrays are frozen, and readonly to the compiler ------------------

// @ts-expect-error an allowlist cannot be widened
SYSTEM_CODES.push('EWHATEVER');
use(SYSTEM_CODES.includes('ENOENT'));

// ---- the brand: an object literal is not an error ------------------------

const literal = {
  kind: 'client-certificate',
  facts: { problem: 'expired' },
  reason: 'the client certificate has expired',
} as const;
// @ts-expect-error no literal carries the brand
const _l1: IAuthProviderError = literal;
// @ts-expect-error nor written in place
const _l2: IAuthProviderError = {
  kind: 'client-certificate',
  facts: { problem: 'expired' },
  reason: 'the client certificate has expired',
};
declare const minted: Extract<
  IAuthProviderError,
  { kind: 'client-certificate' }
>;
const _l3: IAuthProviderError = minted;

// ---- branded integers ----------------------------------------------------

declare const status: HttpStatus;
const _rf1: AuthProviderErrorFacts['request-failed'] = {
  operation: 'token-request',
  problem: 'refused',
  status,
};
const _rf2: AuthProviderErrorFacts['request-failed'] = {
  operation: 'token-request',
  problem: 'refused',
  // @ts-expect-error a bare number is not an HttpStatus
  status: 500,
};
const _rf3: AuthProviderErrorFacts['request-failed'] = {
  operation: 'token-request',
  problem: 'refused',
  // @ts-expect-error a code off the allowlist
  code: 'EWHATEVER',
};
// @ts-expect-error a literal is not an HttpStatus either
const _s: HttpStatus = 500;

// ---- facts are typed per rule --------------------------------------------

const _r1: AuthProviderErrorFacts['saml-assertion'] = {
  rule: 'audience-not-us',
  check: 'audience',
};
// @ts-expect-error the rule's check is fixed
const _r2: AuthProviderErrorFacts['saml-assertion'] = {
  rule: 'audience-not-us',
  check: 'issuer',
};
declare const candidate: BearerCandidate;
const _r3: AuthProviderErrorFacts['saml-assertion'] = {
  rule: 'no-bearer-qualifies',
  check: 'bearerConfirmation',
  candidates: [candidate],
};
const _r4: AuthProviderErrorFacts['saml-assertion'] = {
  rule: 'duplicate-id',
  check: 'duplicateId',
  // @ts-expect-error candidates belong to no-bearer-qualifies
  candidates: [candidate],
};

// ---- SNC facts per problem, configuration facts per case ------------------

declare const sncCandidate: SncCandidate;
const _n1: AuthProviderErrorFacts['snc'] = {
  problem: 'library-not-found',
  searched: true,
  candidates: [sncCandidate],
};
const _n2: AuthProviderErrorFacts['snc'] = {
  problem: 'logon-refused',
  rfcKey: 'RFC_LOGON_FAILURE',
};
const _n3: AuthProviderErrorFacts['snc'] = {
  problem: 'no-credential',
  secureLoginClient: true,
  libraryArchs: ['x64'],
};
const _n4: AuthProviderErrorFacts['snc'] = {
  problem: 'logon-refused',
  // @ts-expect-error candidates belong to library-not-found
  candidates: [sncCandidate],
};
const _n5: AuthProviderErrorFacts['snc'] = {
  problem: 'no-credential',
  // @ts-expect-error an RFC key belongs to logon-refused
  rfcKey: 'RFC_LOGON_FAILURE',
};
const _n6: AuthProviderErrorFacts['snc'] = {
  problem: 'locator-returned-no-path',
  // @ts-expect-error locator-returned-no-path carries nothing more
  searched: true,
};
const _c1: AuthProviderErrorFacts['configuration'] = {
  case: 'snc-qop-invalid',
  fields: ['qop'],
  allowed: 'snc-qop',
};
const _c2: AuthProviderErrorFacts['configuration'] = {
  case: 'basic-encoding-missing',
  fields: ['encoding'],
  allowed: 'basic-encoding',
};
const _c3: AuthProviderErrorFacts['configuration'] = {
  case: 'required-fields-missing',
  fields: ['clientId'],
  // @ts-expect-error no allowed-value set for this case
  allowed: 'snc-qop',
};
const _c4: AuthProviderErrorFacts['configuration'] = {
  case: 'snc-qop-invalid',
  fields: ['qop'],
  // @ts-expect-error the qop case names the qop values, not the encodings
  allowed: 'basic-encoding',
};

// ---- consumers: narrowing by kind + variant ------------------------------

declare const e: IAuthProviderError;
if (e.kind === 'saml-assertion' && e.variant === 'untrusted-issuer') {
  use(e.diagnostics?.issuer); // ok
  const r: 'untrusted-issuer' = e.facts.rule; // ok: facts narrowed too
  const i: DocumentValue | undefined = e.diagnostics?.issuer;
  use([r, i]);
  // @ts-expect-error id is not a field of this variant
  use(e.diagnostics?.id);
}
if (e.kind === 'saml-assertion' && e.variant === 'duplicate-id') {
  use(e.diagnostics?.id); // ok
}
if (e.kind === 'saml-assertion' && e.variant === 'expired') {
  // @ts-expect-error this variant has no diagnostics
  use(e.diagnostics?.issuer);
}
if (e.kind === 'snc' && e.variant === 'no-credential') {
  use(e.diagnostics?.library); // ok
  // @ts-expect-error candidatePaths belongs to library-not-found
  use(e.diagnostics?.candidatePaths);
}
if (e.kind === 'snc' && e.variant === 'library-not-found') {
  use(e.diagnostics?.candidatePaths); // ok
}
if (e.kind === 'configuration' && e.variant === 'saml-acs-mismatch') {
  use([e.diagnostics?.configuredUri, e.diagnostics?.strategyUri]); // ok
}
if (e.kind === 'configuration' && e.variant === 'required-fields-missing') {
  // @ts-expect-error no diagnostics for this case
  use(e.diagnostics?.configuredUri);
}
if (e.kind === 'client-certificate') {
  use(e.facts.problem); // ok
  // @ts-expect-error no diagnostics on this kind
  use(e.diagnostics?.library);
}
// facts.rule alone does not narrow the union (why `variant` is top-level):
if (e.kind === 'saml-assertion' && e.facts.rule === 'untrusted-issuer') {
  // @ts-expect-error issuer is not known to be permitted here
  use(e.diagnostics?.issuer);
}
// a plain kind's facts narrow on their own discriminant
if (e.kind === 'interactive-login') {
  const facts = e.facts;
  if (facts.outcome === 'port-in-use') use(facts.port); // ok
  if (facts.outcome === 'disposed') use(facts.strategy); // ok
  if (facts.outcome === 'busy') {
    // @ts-expect-error busy carries no port
    use(facts.port);
  }
}
if (e.kind === 'system-refused') {
  const facts = e.facts;
  if (facts.verdict === 'rfc-failure') use(facts.rfcKey); // ok
  if (facts.verdict === 'unknown') {
    // @ts-expect-error unknown carries no status
    use(facts.status);
  }
}

// ---- a mismatched pairing — with the brand missing, and set aside ---------

const forged = {
  kind: 'saml-assertion',
  variant: 'duplicate-id',
  facts: { rule: 'duplicate-id', check: 'duplicateId' },
  diagnostics: { issuer: 'x' },
  reason: '',
} as const;
// @ts-expect-error brand missing, and the pairing matches no variant
const _f2: IAuthProviderError = forged;
type Unbranded<T> = T extends unknown
  ? { [K in keyof T as K extends string ? K : never]: T[K] }
  : never;
// @ts-expect-error duplicate-id with an issuer matches no variant
const _f3: Unbranded<IAuthProviderError> = forged;
const paired = {
  kind: 'saml-assertion',
  variant: 'duplicate-id',
  facts: { rule: 'duplicate-id', check: 'duplicateId' },
  diagnostics: { id: 'x' },
  reason: '',
} as const;
const _f4: Unbranded<IAuthProviderError> = paired; // the right pairing is one
