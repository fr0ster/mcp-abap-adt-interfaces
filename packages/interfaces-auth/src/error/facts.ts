/**
 * Facts: what an error says, per kind. Every fact is a member of an
 * allowlist (`./kinds`) or a branded integer (`./numbers`); an optional fact
 * is present only when known — an error carries no `undefined`-valued key.
 */

import type { OAuth2GrantType } from '../token/AuthType';
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

/** The rules whose words say "carries N": they carry `count`. */
export type CountedAssertionRule = Extract<
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

/** One SubjectConfirmation that did not qualify as bearer, and why. */
export interface BearerCandidate {
  readonly reason: BearerCandidateReason;
  /** Only with reason `several-confirmation-data`. */
  readonly count?: Count;
}

/** The facts of one SAML rule: `rule`, its fixed `check`, and what the rule carries. */
export type SamlFactsOf<R extends AssertionRule> = R extends unknown
  ? {
      readonly rule: R;
      readonly check: AssertionRuleCheck[R];
    } & (R extends CountedAssertionRule
      ? { readonly count?: Count }
      : R extends 'declined'
        ? { readonly statusCode?: SamlStatusCode }
        : R extends 'no-bearer-qualifies'
          ? {
              /** At most five. */
              readonly candidates?: readonly BearerCandidate[];
              readonly moreCandidates?: Count;
            }
          : unknown)
  : never;

// ---- snc --------------------------------------------------------------------

/** One SNC library candidate that could not be used. */
export interface SncCandidate {
  readonly source: SncCandidateSource;
  readonly reason: SncUnusableReason;
  /** Only with reason `wrong architecture`. */
  readonly archs?: readonly SncArch[];
}

/** The facts of one SNC problem. */
export type SncFactsOf<P extends SncProblem> = P extends unknown
  ? {
      readonly problem: P;
      readonly rfcKey?: RfcKey;
      readonly secureLoginClient?: boolean;
      readonly libraryArchs?: readonly SncArch[];
      /** At most eight. */
      readonly candidates?: readonly SncCandidate[];
      readonly searched?: boolean;
      readonly processArch?: SncArch;
    }
  : never;

// ---- configuration --------------------------------------------------------

/** The facts of one configuration case. */
export type ConfigFactsOf<C extends ConfigCase> = C extends unknown
  ? {
      readonly case: C;
      /** At most eight, deduplicated, in the order given. */
      readonly fields: readonly ConfigField[];
      readonly allowed?: AllowedValueSet;
    }
  : never;

// ---- the kinds with discriminated facts -----------------------------------

/** `interactive-login`: discriminated by `outcome`. */
export type InteractiveLoginFacts =
  | { readonly outcome: 'port-in-use'; readonly port: Port }
  | { readonly outcome: 'aborted'; readonly ignoredCallbacks?: Count }
  | {
      readonly outcome: 'disposed';
      readonly strategy: InteractiveLoginStrategy;
    }
  | {
      readonly outcome: 'identity-provider-refused';
      readonly oauthError?: OAuthErrorCode;
    }
  | { readonly outcome: 'browser-launch-failed'; readonly code?: SystemCode }
  | {
      readonly outcome: 'failed';
      readonly code?: SystemCode;
      readonly status?: HttpStatus;
    }
  | {
      readonly outcome:
        | 'busy'
        | 'callback-closed'
        | 'input-abandoned'
        | 'no-input'
        | 'unreadable-input'
        | 'no-terminal'
        | 'device-code-not-shown';
    };

/** `system-refused`: discriminated by `verdict`. */
export type SystemRefusedFacts =
  | {
      readonly verdict:
        | 'not-authorized'
        | 'redirected'
        | 'system-failed'
        | 'other-status';
      readonly status: HttpStatus;
      readonly at: RejectionMoment;
    }
  | {
      readonly verdict: 'rfc-failure';
      readonly rfcKey: RfcKey;
      readonly at: RejectionMoment;
    }
  | { readonly verdict: 'unknown'; readonly at: RejectionMoment };

// ---- every kind ------------------------------------------------------------

/** The facts of every kind. Its keys are exactly `AuthProviderErrorKind`. */
export interface AuthProviderErrorFacts {
  readonly configuration: ConfigFactsOf<ConfigCase>;
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
  readonly 'interactive-login': InteractiveLoginFacts;
  readonly 'saml-assertion': SamlFactsOf<AssertionRule>;
  readonly snc: SncFactsOf<SncProblem>;
  readonly 'credential-refused': {
    readonly credential: CredentialKind;
    readonly at?: RejectionMoment;
  };
  readonly 'system-refused': SystemRefusedFacts;
  readonly 'renewal-unchanged': { readonly source: RenewalUnchangedSource };
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
