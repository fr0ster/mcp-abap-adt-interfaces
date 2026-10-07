/**
 * Facts: what an error says, per kind. Every fact is a member of an
 * allowlist (`./kinds`) or a branded integer (`./numbers`); an optional fact
 * is present only when known — an error carries no `undefined`-valued key.
 */

import type { OAuth2GrantType } from '../token/AuthType';
import type { RenewalTrigger } from '../token/renewal';
import type {
  AllowedValueSet,
  AssertionRule,
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
  SncUnusableReason,
  SystemCode,
  SystemRefusedVerdict,
  TlsFailureCode,
  TokenBindingProblem,
} from './kinds';
import type { Count, HttpStatus, Port } from './numbers';

// ---- saml-assertion --------------------------------------------------------

/**
 * The check each SAML rule belongs to — fixed by the rule. The runtime table
 * (`ASSERTION_RULE_CHECK` in `@mcp-abap-adt/auth-errors`) satisfies this type.
 */
export interface AssertionRuleCheck {
  readonly doctype: 'document';
  readonly 'not-xml': 'document';
  readonly 'root-not-response-or-assertion': 'document';
  readonly 'root-not-response': 'document';
  readonly 'duplicate-id': 'duplicateId';
  readonly 'no-signature': 'signature';
  readonly 'signature-malformed': 'signature';
  readonly 'signature-not-verified': 'signature';
  readonly 'no-reference': 'signature';
  readonly 'several-references': 'signature';
  readonly 'reference-not-same-document': 'signature';
  readonly 'reference-not-found': 'signature';
  readonly 'signature-not-enveloped': 'signature';
  readonly 'no-direct-assertion': 'signedNode';
  readonly 'several-direct-assertions': 'signedNode';
  readonly 'response-not-signed': 'signedNode';
  readonly 'assertion-not-signed': 'signedNode';
  readonly 'assertion-outside-signed': 'signedNode';
  readonly 'assertion-inside-signature': 'signedNode';
  readonly 'no-status': 'status';
  readonly 'several-status': 'status';
  readonly 'no-status-code': 'status';
  readonly 'several-status-codes': 'status';
  readonly 'status-code-no-value': 'status';
  readonly declined: 'status';
  readonly 'no-assertion-id': 'assertionId';
  readonly 'no-issuer': 'issuer';
  readonly 'several-issuers': 'issuer';
  readonly 'empty-issuer': 'issuer';
  readonly 'no-expected-issuer': 'issuer';
  readonly 'untrusted-issuer': 'issuer';
  readonly 'several-response-issuers': 'issuer';
  readonly 'issuers-differ': 'issuer';
  readonly 'no-conditions': 'conditions';
  readonly 'several-conditions': 'conditions';
  readonly 'not-before-invalid': 'notBefore';
  readonly 'not-yet-valid': 'notBefore';
  readonly 'no-not-on-or-after': 'notOnOrAfter';
  readonly 'not-on-or-after-invalid': 'notOnOrAfter';
  readonly expired: 'notOnOrAfter';
  readonly 'no-audience-restriction': 'audience';
  readonly 'audience-restriction-empty': 'audience';
  readonly 'audience-not-us': 'audience';
  readonly 'no-subject': 'bearerConfirmation';
  readonly 'several-subjects': 'bearerConfirmation';
  readonly 'no-subject-confirmation': 'bearerConfirmation';
  readonly 'no-bearer-qualifies': 'bearerConfirmation';
  readonly 'no-destination': 'destination';
  readonly 'destination-not-us': 'destination';
  readonly replayed: 'replay';
  readonly 'payload-not-base64-xml': 'document';
  readonly 'payload-not-well-formed': 'document';
  readonly 'payload-not-saml': 'document';
  readonly 'only-encrypted-assertion': 'document';
  readonly 'no-assertion': 'document';
  readonly 'several-assertions': 'document';
}

/**
 * Names members of union `U`: a name that is not one fails to compile, so a
 * misspelled member is refused rather than silently dropped (as `Extract`
 * would drop it).
 */
type Member<U, T extends U> = T;

/** Every key of any member of union `U`. */
type KeysOfUnion<U> = U extends unknown ? keyof U : never;

/**
 * `T`, with every key in `All` that `T` does not declare present as
 * `?: never`. An object type alone omits a field another variant carries,
 * and a non-literal object (a spread, a variable) carrying that field still
 * assigns — excess-property checks see literals only. Closing the shape
 * refuses it whatever the object's origin.
 */
type Closed<T, All extends PropertyKey> = T & {
  readonly [K in Exclude<All, keyof T>]?: never;
};

/** Each member of union `U` closed against the keys of every member. */
type ClosedUnion<U, All = U> = U extends unknown
  ? Closed<U, KeysOfUnion<All>>
  : never;

/** The rules whose words say "carries N": they carry `count`. */
export type CountedAssertionRule = Member<
  AssertionRule,
  | 'several-references'
  | 'several-direct-assertions'
  | 'several-status'
  | 'several-status-codes'
  | 'several-issuers'
  | 'several-conditions'
  | 'several-subjects'
  | 'several-assertions'
>;

/**
 * One SubjectConfirmation that did not qualify as bearer, and why; `count`
 * only with reason `several-confirmation-data`, `?: never` otherwise.
 */
export type BearerCandidate = ClosedUnion<
  | {
      readonly reason: Member<
        BearerCandidateReason,
        'several-confirmation-data'
      >;
      readonly count?: Count;
    }
  | {
      readonly reason: Exclude<
        BearerCandidateReason,
        Member<BearerCandidateReason, 'several-confirmation-data'>
      >;
    }
>;

/** The facts of one SAML rule: `rule`, its fixed `check`, and what the rule carries. */
type OpenSamlFactsOf<R extends AssertionRule> = R extends unknown
  ? {
      readonly rule: R;
      readonly check: AssertionRuleCheck[R];
    } & (R extends CountedAssertionRule
      ? { readonly count?: Count }
      : R extends Member<AssertionRule, 'declined'>
        ? { readonly statusCode?: SamlStatusCode }
        : R extends Member<AssertionRule, 'no-bearer-qualifies'>
          ? {
              /** At most five. */
              readonly candidates?: readonly BearerCandidate[];
              readonly moreCandidates?: Count;
            }
          : unknown)
  : never;

/**
 * The facts of one SAML rule: `rule`, its fixed `check`, and what the rule
 * carries; every fact another rule or kind carries is `?: never`.
 */
export type SamlFactsOf<R extends AssertionRule> = R extends unknown
  ? Closed<OpenSamlFactsOf<R>, AnyFactKey>
  : never;

// ---- snc --------------------------------------------------------------------

/**
 * One SNC library candidate that could not be used; `archs` only with reason
 * `wrong architecture`, `?: never` otherwise.
 */
export type SncCandidate = ClosedUnion<
  | {
      readonly source: SncCandidateSource;
      readonly reason: Member<SncUnusableReason, 'wrong architecture'>;
      readonly archs?: readonly SncArch[];
    }
  | {
      readonly source: SncCandidateSource;
      readonly reason: Exclude<
        SncUnusableReason,
        Member<SncUnusableReason, 'wrong architecture'>
      >;
    }
>;

/**
 * What each SNC problem carries beyond `problem`. Its keys are exactly
 * `SncProblem` (a type test asserts it).
 */
export interface SncProblemFacts {
  /** A2200019. */
  readonly 'no-credential': {
    readonly secureLoginClient?: boolean;
    readonly libraryArchs?: readonly SncArch[];
  };
  /** SNCERR_INIT. */
  readonly 'library-init-failed': {
    readonly libraryArchs?: readonly SncArch[];
  };
  readonly 'logon-refused': { readonly rfcKey?: RfcKey };
  readonly 'library-not-found': {
    /** Present only when the shipped locator searched; never `false`. */
    readonly searched?: true;
    /** At most eight. */
    readonly candidates?: readonly SncCandidate[];
    readonly processArch?: SncArch;
  };
  readonly 'locator-returned-no-path': unknown;
}

/** The facts of one SNC problem. */
type OpenSncFactsOf<P extends SncProblem> = P extends unknown
  ? { readonly problem: P } & SncProblemFacts[P]
  : never;

/** The facts of one SNC problem; every fact another problem or kind carries is `?: never`. */
export type SncFactsOf<P extends SncProblem> = P extends unknown
  ? Closed<OpenSncFactsOf<P>, AnyFactKey>
  : never;

// ---- configuration --------------------------------------------------------

/** The facts of one configuration case; `allowed` only where a value set applies. */
type OpenConfigFactsOf<C extends ConfigCase> = C extends unknown
  ? {
      readonly case: C;
      /** At most eight, deduplicated, in the order given. */
      readonly fields: readonly ConfigField[];
    } & (C extends Member<ConfigCase, 'snc-qop-invalid'>
      ? { readonly allowed?: Member<AllowedValueSet, 'snc-qop'> }
      : C extends Member<ConfigCase, 'basic-encoding-missing'>
        ? { readonly allowed?: Member<AllowedValueSet, 'basic-encoding'> }
        : unknown)
  : never;

/** The facts of one configuration case; `allowed` is `?: never` where no value set applies, and every other kind's fact everywhere. */
export type ConfigFactsOf<C extends ConfigCase> = C extends unknown
  ? Closed<OpenConfigFactsOf<C>, AnyFactKey>
  : never;

// ---- the kinds with discriminated facts -----------------------------------

/** The interactive-login outcomes that carry facts beyond `outcome`. */
type OutcomeWithFacts = Member<
  InteractiveOutcome,
  | 'port-in-use'
  | 'aborted'
  | 'disposed'
  | 'identity-provider-refused'
  | 'failed'
>;

/**
 * `interactive-login`: discriminated by `outcome`, every member of
 * `InteractiveOutcome` and nothing else — an outcome without facts of its own
 * is in the last branch, by `Exclude`.
 */
type OpenInteractiveLoginFacts =
  | {
      readonly outcome: Member<InteractiveOutcome, 'port-in-use'>;
      readonly port: Port;
    }
  | {
      readonly outcome: Member<InteractiveOutcome, 'aborted'>;
      /** Which strategy's login was aborted (since 6.0.0). */
      readonly strategy?: InteractiveLoginStrategy;
      readonly ignoredCallbacks?: Count;
    }
  | {
      readonly outcome: Member<InteractiveOutcome, 'disposed'>;
      readonly strategy: InteractiveLoginStrategy;
    }
  | {
      readonly outcome: Member<InteractiveOutcome, 'identity-provider-refused'>;
      readonly oauthError?: OAuthErrorCode;
    }
  | {
      readonly outcome: Member<InteractiveOutcome, 'failed'>;
      readonly code?: SystemCode;
      readonly status?: HttpStatus;
      /** A registered OAuth/OIDC error code only (since 6.0.0). */
      readonly oauthError?: OAuthErrorCode;
    }
  | { readonly outcome: Exclude<InteractiveOutcome, OutcomeWithFacts> };

/**
 * `interactive-login`, discriminated by `outcome`; each outcome's shape is
 * closed — a fact another outcome carries is `?: never`.
 */
export type InteractiveLoginFacts = ClosedFacts<OpenInteractiveLoginFacts>;

/** The system-refused verdicts that carry an HTTP status. */
type StatusVerdict = Member<
  SystemRefusedVerdict,
  'not-authorized' | 'redirected' | 'system-failed' | 'other-status'
>;
type RfcVerdict = Member<SystemRefusedVerdict, 'rfc-failure'>;

/**
 * `system-refused`: discriminated by `verdict`, every member of
 * `SystemRefusedVerdict` and nothing else.
 */
type OpenSystemRefusedFacts =
  | {
      readonly verdict: StatusVerdict;
      readonly status: HttpStatus;
      readonly at: RejectionMoment;
    }
  | {
      readonly verdict: RfcVerdict;
      readonly rfcKey: RfcKey;
      readonly at: RejectionMoment;
    }
  | {
      readonly verdict: Exclude<
        SystemRefusedVerdict,
        StatusVerdict | RfcVerdict
      >;
      readonly at: RejectionMoment;
    };

/** `system-refused`, discriminated by `verdict`; each verdict's shape is closed. */
export type SystemRefusedFacts = ClosedFacts<OpenSystemRefusedFacts>;

// ---- every kind ------------------------------------------------------------

/** The facts of every kind. Its keys are exactly `AuthProviderErrorKind`. */
interface OpenAuthProviderErrorFacts {
  readonly configuration: OpenConfigFactsOf<ConfigCase>;
  readonly 'client-certificate': { readonly problem: ClientCertificateProblem };
  readonly 'client-authentication': {
    readonly problem: ClientAuthenticationProblem;
  };
  readonly 'request-failed': {
    readonly operation: Operation;
    readonly grant?: OAuth2GrantType;
    readonly problem: RequestProblem;
    readonly status?: HttpStatus;
    readonly oauthError?: OAuthErrorCode;
    readonly code?: SystemCode;
  };
  readonly tls: {
    readonly operation: Operation;
    readonly grant?: OAuth2GrantType;
    readonly code: TlsFailureCode;
  };
  readonly 'interactive-login': OpenInteractiveLoginFacts;
  readonly 'saml-assertion': OpenSamlFactsOf<AssertionRule>;
  readonly snc: OpenSncFactsOf<SncProblem>;
  readonly 'credential-refused': {
    readonly credential: CredentialKind;
    readonly at?: RejectionMoment;
  };
  readonly 'system-refused': OpenSystemRefusedFacts;
  readonly 'renewal-unchanged': { readonly source: RenewalUnchangedSource };
  readonly 'renewal-declined': { readonly trigger: RenewalTrigger };
  readonly 'token-binding': { readonly problem: TokenBindingProblem };
  readonly 'not-prepared': { readonly provider: NotPreparedProvider };
  readonly 'logon-target': {
    readonly wire: LogonTargetWire;
    readonly refused: LogonTargetRefusal;
  };
  readonly connection: {
    readonly problem: ConnectionProblem;
    readonly at?: ConnectionMoment;
  };
  readonly unknown: {
    readonly operation: Operation;
    readonly grant?: OAuth2GrantType;
    readonly status?: HttpStatus;
    readonly oauthError?: OAuthErrorCode;
    readonly code?: SystemCode;
  };
}

/** Every fact key of every kind. */
type AnyFactKey = KeysOfUnion<
  OpenAuthProviderErrorFacts[keyof OpenAuthProviderErrorFacts]
>;

/**
 * Each member of `U` closed against every fact key of every kind: a fact of
 * another variant, or of another kind, is `?: never`.
 */
type ClosedFacts<U> = U extends unknown ? Closed<U, AnyFactKey> : never;

/**
 * The facts of every kind. Its keys are exactly `AuthProviderErrorKind`; each
 * kind's facts declare its own fields and every other kind's or variant's
 * field as `?: never`, so a non-literal object carrying one does not assign.
 */
export type AuthProviderErrorFacts = {
  readonly [K in keyof OpenAuthProviderErrorFacts]: ClosedFacts<
    OpenAuthProviderErrorFacts[K]
  >;
};
