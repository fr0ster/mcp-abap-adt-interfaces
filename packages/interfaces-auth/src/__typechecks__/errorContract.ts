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
import type { Count, HttpStatus, Port } from '../error/numbers';

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
// @ts-expect-error candidates belong to no-bearer-qualifies
const _r4: AuthProviderErrorFacts['saml-assertion'] = {
  rule: 'duplicate-id',
  check: 'duplicateId',
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
// @ts-expect-error candidates belong to library-not-found
const _n4: AuthProviderErrorFacts['snc'] = {
  problem: 'logon-refused',
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
const _n7: AuthProviderErrorFacts['snc'] = {
  problem: 'library-not-found',
  // @ts-expect-error searched is present only as true
  searched: false,
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
// @ts-expect-error the qop case names the qop values, not the encodings
const _c4: AuthProviderErrorFacts['configuration'] = {
  case: 'snc-qop-invalid',
  fields: ['qop'],
  allowed: 'basic-encoding',
};

// ---- consumers: narrowing by kind + variant ------------------------------

declare const e: IAuthProviderError;
if (e.kind === 'saml-assertion' && e.variant === 'untrusted-issuer') {
  use(e.diagnostics?.issuer); // ok
  const r: 'untrusted-issuer' = e.facts.rule; // ok: facts narrowed too
  const i: DocumentValue | undefined = e.diagnostics?.issuer;
  use([r, i]);
  // a field of another variant is excluded: it reads as undefined only
  const _id: undefined = e.diagnostics?.id;
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
  // candidatePaths belongs to library-not-found: excluded here
  const _paths: undefined = e.diagnostics?.candidatePaths;
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
  // @ts-expect-error the variant is not narrowed by facts.rule
  const _v: 'untrusted-issuer' = e.variant;
}
// a plain kind's facts narrow on their own discriminant
if (e.kind === 'interactive-login') {
  const facts = e.facts;
  if (facts.outcome === 'port-in-use') use(facts.port); // ok
  if (facts.outcome === 'disposed') use(facts.strategy); // ok
  if (facts.outcome === 'busy') {
    // busy carries no port: excluded
    const _port: undefined = facts.port;
  }
}
if (e.kind === 'system-refused') {
  const facts = e.facts;
  if (facts.verdict === 'rfc-failure') use(facts.rfcKey); // ok
  if (facts.verdict === 'unknown') {
    // unknown carries no status: excluded
    const _status: undefined = facts.status;
  }
}

// ---- non-literal objects: a forbidden field is refused whatever its origin --
// (an excess-property check sees literals only; these are spreads of a
// minted error with a variable holding an allowed and a forbidden field)

type MintedOf<K extends IAuthProviderError['kind'], V = unknown> = Extract<
  IAuthProviderError,
  { kind: K } & (V extends string ? { variant: V } : unknown)
>;
declare const samlIssuer: MintedOf<'saml-assertion', 'untrusted-issuer'>;
declare const sncCredential: MintedOf<'snc', 'no-credential'>;
declare const configMissing: MintedOf<
  'configuration',
  'required-fields-missing'
>;
declare const configMismatch: MintedOf<'configuration', 'saml-acs-mismatch'>;
declare const busy: MintedOf<'interactive-login'>;
declare const refusedUnknown: MintedOf<'system-refused'>;
declare const certificate: MintedOf<'client-certificate'>;
declare const count3: Count;
declare const status503: HttpStatus;
declare const port0: Port;

const samlDiagOk = { issuer: 'idp' };
const samlDiagBad = { issuer: 'idp', destination: 'elsewhere' };
const _nl1: IAuthProviderError = { ...samlIssuer, diagnostics: samlDiagOk };
// @ts-expect-error destination is excluded from untrusted-issuer's diagnostics
const _nl2: IAuthProviderError = { ...samlIssuer, diagnostics: samlDiagBad };

const samlFactsOk = { rule: 'untrusted-issuer', check: 'issuer' } as const;
const samlFactsBad = { ...samlFactsOk, count: count3 };
const _nl3: IAuthProviderError = { ...samlIssuer, facts: samlFactsOk };
// @ts-expect-error count is excluded from untrusted-issuer's facts
const _nl4: IAuthProviderError = { ...samlIssuer, facts: samlFactsBad };

const sncDiagOk = { library: '/opt/sapcrypto.so' };
const sncDiagBad = { library: '/opt/sapcrypto.so', candidatePaths: [] };
const _nl5: IAuthProviderError = { ...sncCredential, diagnostics: sncDiagOk };
// @ts-expect-error candidatePaths is excluded from no-credential's diagnostics
const _nl6: IAuthProviderError = { ...sncCredential, diagnostics: sncDiagBad };

const sncFactsOk = {
  problem: 'no-credential',
  secureLoginClient: true,
} as const;
const sncFactsBad = { ...sncFactsOk, rfcKey: 'RFC_LOGON_FAILURE' } as const;
const _nl7: IAuthProviderError = { ...sncCredential, facts: sncFactsOk };
// @ts-expect-error rfcKey is excluded from no-credential's facts
const _nl8: IAuthProviderError = { ...sncCredential, facts: sncFactsBad };

const configFactsOk = {
  case: 'required-fields-missing',
  fields: ['clientId'],
} as const;
const configFactsBad = { ...configFactsOk, allowed: 'snc-qop' } as const;
const _nl9: IAuthProviderError = { ...configMissing, facts: configFactsOk };
// @ts-expect-error allowed is excluded from required-fields-missing's facts
const _nl10: IAuthProviderError = { ...configMissing, facts: configFactsBad };
const cfgDiag = {
  configuredUri: 'https://a/acs',
  strategyUri: 'https://b/acs',
};
const _nl11: IAuthProviderError = { ...configMismatch, diagnostics: cfgDiag };
// @ts-expect-error a case without diagnostics takes none
const _nl12: IAuthProviderError = { ...configMissing, diagnostics: cfgDiag };

const busyFactsOk = { outcome: 'busy' } as const;
const busyFactsBad = { outcome: 'busy', port: port0 } as const;
const _nl13: IAuthProviderError = { ...busy, facts: busyFactsOk };
// @ts-expect-error port is excluded from busy's facts
const _nl14: IAuthProviderError = { ...busy, facts: busyFactsBad };

const unknownFactsOk = { verdict: 'unknown', at: 'request' } as const;
const unknownFactsBad = { ...unknownFactsOk, status: status503 };
const _nl15: IAuthProviderError = { ...refusedUnknown, facts: unknownFactsOk };
// @ts-expect-error status is excluded from the unknown verdict's facts
const _nl16: IAuthProviderError = { ...refusedUnknown, facts: unknownFactsBad };

declare const archsX64: readonly SncArch[];
const bearerOk = {
  reason: 'several-confirmation-data',
  count: count3,
} as const;
const bearerBad = { reason: 'recipient-not-acs', count: count3 } as const;
const _bc1: BearerCandidate = bearerOk;
// @ts-expect-error count belongs to several-confirmation-data only
const _bc2: BearerCandidate = bearerBad;
const _bc3: AuthProviderErrorFacts['saml-assertion'] = {
  rule: 'no-bearer-qualifies',
  check: 'bearerConfirmation',
  candidates: [bearerOk],
};
const bearerFactsBad = {
  rule: 'no-bearer-qualifies',
  check: 'bearerConfirmation',
  candidates: [bearerBad],
} as const;
// @ts-expect-error a candidate with count under another reason, in the facts
const _bc4: AuthProviderErrorFacts['saml-assertion'] = bearerFactsBad;
const sncCandOk = {
  source: 'SNC_LIB',
  reason: 'wrong architecture',
  archs: archsX64,
} as const;
const sncCandBad = {
  source: 'SNC_LIB',
  reason: 'missing',
  archs: archsX64,
} as const;
const _sc1: SncCandidate = sncCandOk;
// @ts-expect-error archs belong to wrong architecture only
const _sc2: SncCandidate = sncCandBad;
const _sc3: AuthProviderErrorFacts['snc'] = {
  problem: 'library-not-found',
  candidates: [sncCandOk],
};
const sncFactsCandBad = {
  problem: 'library-not-found',
  candidates: [sncCandBad],
} as const;
// @ts-expect-error a candidate with archs under another reason, in the facts
const _sc4: AuthProviderErrorFacts['snc'] = sncFactsCandBad;

// ---- across kinds: another kind's diagnostic or fact is refused too ------

declare const tlsExpired: MintedOf<'tls'>;
const xDiagSnc = { issuer: 'idp', library: '/secret/path' };
const xDiagCfg = { issuer: 'idp', configuredUri: 'https://wrong/' };
const xDiagSaml = { configuredUri: 'https://a/', issuer: 'idp' };
// @ts-expect-error snc's library on a saml-assertion error
const _x1: IAuthProviderError = { ...samlIssuer, diagnostics: xDiagSnc };
// @ts-expect-error configuration's configuredUri on a saml-assertion error
const _x2: IAuthProviderError = { ...samlIssuer, diagnostics: xDiagCfg };
const cfgDiagOk = { configuredUri: 'https://a/' };
const _x3: IAuthProviderError = { ...configMismatch, diagnostics: cfgDiagOk };
// @ts-expect-error saml's issuer on a configuration error
const _x4: IAuthProviderError = { ...configMismatch, diagnostics: xDiagSaml };

const tlsFactsOk = {
  operation: 'token-request',
  code: 'CERT_HAS_EXPIRED',
} as const;
const tlsFactsBad = { ...tlsFactsOk, fields: ['clientId'] } as const;
const _x5: IAuthProviderError = { ...tlsExpired, facts: tlsFactsOk };
// @ts-expect-error configuration's fields on a tls error
const _x6: IAuthProviderError = { ...tlsExpired, facts: tlsFactsBad };
const samlFactsXBad = { ...samlFactsOk, problem: 'expired' } as const;
// @ts-expect-error a problem (another kind's fact) on saml-assertion facts
const _x7: IAuthProviderError = { ...samlIssuer, facts: samlFactsXBad };
const sncFactsXBad = { ...sncFactsOk, rule: 'expired' } as const;
// @ts-expect-error a rule (saml's fact) on snc facts
const _x8: IAuthProviderError = { ...sncCredential, facts: sncFactsXBad };
const certFactsXBad = { problem: 'expired', port: port0 } as const;
const certFactsOk = { problem: 'expired' } as const;
const _x9: IAuthProviderError = { ...certificate, facts: certFactsOk };
// @ts-expect-error interactive-login's port on client-certificate facts
const _x10: IAuthProviderError = { ...certificate, facts: certFactsXBad };
const certDiagX = { library: '/secret/path' };
// @ts-expect-error a plain kind takes no diagnostics at all
const _x11: IAuthProviderError = { ...certificate, diagnostics: certDiagX };

const strayVariant = { variant: 'expired' } as const;
// @ts-expect-error a plain kind has no variant
const _nl17: IAuthProviderError = { ...certificate, ...strayVariant };

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

// ---- 6.0.0: aborted names its strategy, failed a registered OAuth code ----
// Two optional fact fields, a major (the types are closed): the kinds, the outcomes and every other
// outcome's and kind's shape are what 5.0.0 declared, apart from the two new optional facts.

const _ia1: AuthProviderErrorFacts['interactive-login'] = {
  outcome: 'aborted',
  strategy: 'manual',
};
const _ia2: AuthProviderErrorFacts['interactive-login'] = {
  outcome: 'aborted',
  strategy: 'browser',
  ignoredCallbacks: count3,
};
const _ia3: AuthProviderErrorFacts['interactive-login'] = {
  outcome: 'aborted',
};
const _ia4: AuthProviderErrorFacts['interactive-login'] = {
  outcome: 'aborted',
  // @ts-expect-error a strategy off the list
  strategy: 'device',
};
const _ia5: AuthProviderErrorFacts['interactive-login'] = {
  outcome: 'aborted',
  // @ts-expect-error oauthError belongs to failed and identity-provider-refused
  oauthError: 'access_denied',
};
const _if1: AuthProviderErrorFacts['interactive-login'] = {
  outcome: 'failed',
  oauthError: 'access_denied',
};
const _if2: AuthProviderErrorFacts['interactive-login'] = {
  outcome: 'failed',
  code: 'ECONNRESET',
  status,
  oauthError: 'invalid_grant',
};
const _if3: AuthProviderErrorFacts['interactive-login'] = {
  outcome: 'failed',
  // @ts-expect-error an unregistered OAuth error code
  oauthError: 'made_up_error',
};
const _if4: AuthProviderErrorFacts['interactive-login'] = {
  outcome: 'failed',
  // @ts-expect-error strategy belongs to aborted and disposed
  strategy: 'browser',
};
const _ib1: AuthProviderErrorFacts['interactive-login'] = {
  outcome: 'busy',
  // @ts-expect-error busy carries no strategy
  strategy: 'manual',
};

// narrowing reads the new fields where they are declared, and only there
if (e.kind === 'interactive-login') {
  const facts = e.facts;
  if (facts.outcome === 'aborted') {
    const s: InteractiveLoginStrategy | undefined = facts.strategy; // ok
    const _o: undefined = facts.oauthError;
    use(s);
  }
  if (facts.outcome === 'failed') {
    const o: OAuthErrorCode | undefined = facts.oauthError; // ok
    const _s: undefined = facts.strategy;
    use(o);
  }
}

// non-literal objects: spreads and variables
const abortedManual = { outcome: 'aborted', strategy: 'manual' } as const;
const _nl18: IAuthProviderError = { ...busy, facts: abortedManual };
const abortedWithOauth = {
  ...abortedManual,
  oauthError: 'access_denied',
} as const;
// @ts-expect-error oauthError is excluded from aborted's facts
const _nl19: IAuthProviderError = { ...busy, facts: abortedWithOauth };
const abortedDevice = { outcome: 'aborted', strategy: 'device' } as const;
// @ts-expect-error a strategy off the list, in a variable
const _nl20: IAuthProviderError = { ...busy, facts: abortedDevice };
const failedOauth = { outcome: 'failed', oauthError: 'access_denied' } as const;
const _nl21: IAuthProviderError = { ...busy, facts: failedOauth };
const failedWithStrategy = { ...failedOauth, strategy: 'browser' } as const;
// @ts-expect-error strategy is excluded from failed's facts
const _nl22: IAuthProviderError = { ...busy, facts: failedWithStrategy };
const failedUnregistered = {
  outcome: 'failed',
  oauthError: 'made_up',
} as const;
// @ts-expect-error an unregistered OAuth error code, in a variable
const _nl23: IAuthProviderError = { ...busy, facts: failedUnregistered };
const busyWithStrategy = { ...busyFactsOk, strategy: 'manual' } as const;
// @ts-expect-error strategy is excluded from busy's facts
const _nl24: IAuthProviderError = { ...busy, facts: busyWithStrategy };
const tlsWithStrategy = { ...tlsFactsOk, strategy: 'browser' } as const;
// @ts-expect-error interactive-login's strategy on a tls error
const _x12: IAuthProviderError = { ...tlsExpired, facts: tlsWithStrategy };
const certWithOauth = { ...certFactsOk, oauthError: 'access_denied' } as const;
// @ts-expect-error an oauthError on client-certificate facts
const _x13: IAuthProviderError = { ...certificate, facts: certWithOauth };

// 7.0.0 adds the kind renewal-declined and removes the outcome browser-launch-failed
export type KindsAndOutcomesAt7 = [
  Expect<
    Same<
      AuthProviderErrorKind,
      | 'configuration'
      | 'client-certificate'
      | 'client-authentication'
      | 'request-failed'
      | 'tls'
      | 'interactive-login'
      | 'saml-assertion'
      | 'snc'
      | 'credential-refused'
      | 'system-refused'
      | 'renewal-unchanged'
      | 'renewal-declined'
      | 'token-binding'
      | 'not-prepared'
      | 'logon-target'
      | 'connection'
      | 'unknown'
    >
  >,
  Expect<Same<keyof AuthProviderErrorFacts, AuthProviderErrorKind>>,
  Expect<
    Equal<
      typeof INTERACTIVE_OUTCOMES,
      readonly [
        'port-in-use',
        'aborted',
        'disposed',
        'busy',
        'callback-closed',
        'identity-provider-refused',
        'input-abandoned',
        'no-input',
        'unreadable-input',
        'no-terminal',
        'device-code-not-shown',
        'failed',
      ]
    >
  >,
  Expect<Same<InteractiveLoginStrategy, 'browser' | 'manual'>>,
];

// a handler map and a switch over every outcome, written against 7.0.0
type Handlers = {
  readonly [K in AuthProviderErrorKind]: (
    facts: AuthProviderErrorFacts[K],
  ) => string;
};
const handlersAt7: Handlers = {
  configuration: (f) => f.case,
  'client-certificate': (f) => f.problem,
  'client-authentication': (f) => f.problem,
  'request-failed': (f) => f.problem,
  tls: (f) => f.code,
  'interactive-login': (f) => {
    switch (f.outcome) {
      case 'port-in-use':
      case 'aborted':
      case 'disposed':
      case 'busy':
      case 'callback-closed':
      case 'identity-provider-refused':
      case 'input-abandoned':
      case 'no-input':
      case 'unreadable-input':
      case 'no-terminal':
      case 'device-code-not-shown':
      case 'failed':
        return f.outcome;
      default: {
        const unhandled: never = f;
        return unhandled;
      }
    }
  },
  'saml-assertion': (f) => f.rule,
  snc: (f) => f.problem,
  'credential-refused': (f) => f.credential,
  'system-refused': (f) => f.verdict,
  'renewal-unchanged': (f) => f.source,
  'renewal-declined': (f) => f.trigger,
  'token-binding': (f) => f.problem,
  'not-prepared': (f) => f.provider,
  'logon-target': (f) => f.refused,
  connection: (f) => f.problem,
  unknown: (f) => f.operation,
};
use(handlersAt7);
