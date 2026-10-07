/**
 * `@mcp-abap-adt/interfaces-auth` — authentication: credentials, OAuth grants,
 * tokens, interactive login and SAML assertions. **Nothing SAP-specific**; that
 * is `@mcp-abap-adt/interfaces-auth-sap`, which depends on this package.
 *
 * **Most of what is here arrived from `@mcp-abap-adt/interfaces-adt` in its
 * 9.0.0**, and the reason is measured rather than argued. Three repositories —
 * `mcp-abap-adt-auth-broker`, `-auth-stores` and `-auth-providers` — imported
 * 10, 7 and 17 names from that package, and **not one of them was an ADT
 * contract**: they tracked the fastest-moving package in the family in order to
 * describe authentication. They now take zero names from it.
 *
 * Those names did not all land here. Of the 51 authentication symbols that left
 * `interfaces-adt`, 32 are here and **16 are in `interfaces-auth-sap`** —
 * `ISapConfig`, `IConfig`, `IConnectionConfig` (it carries `sapClient`),
 * `IAuthorizationConfig`, `IServiceKeyStore`, `ISessionStore`,
 * `ITokenProviderResult`, the validation results and `AUTH_TYPE_XSUAA` with its
 * union. Two more are deleted: `ISessionState` and `ISessionStorage` describe
 * cookies and a CSRF token, which no package's subject names and no repository
 * imports.
 *
 * **What decides the boundary is a contract's own fields, not its first
 * acceptor** — decision 35. Decision 26 placed these in `interfaces-adt`
 * because "only the ABAP family accepts them", and `mcp-calm-*` — Cloud ALM,
 * not ABAP — imports `ITokenProvider` and `ITokenRefresher` from here, which
 * refuted the premise. `auth-providers` accepts both halves, which is why the
 * accepting side could not answer the question at all.
 *
 * Depends on `@mcp-abap-adt/interfaces-utils`, for `ILogger`.
 */

export { AUTH_TYPE_BASIC, AUTH_TYPE_JWT } from './auth/AuthMethod';
export type { AuthOutcome, IAuthRefusal } from './auth/AuthOutcome';
export type {
  AssertionContext,
  AssertionReplayKey,
  IAssertionReplayStore,
  IAssertionValidator,
  ValidatedAssertion,
} from './auth/IAssertionValidator';
export type {
  AuthorizationOutcome,
  AuthorizationRequest,
  IAuthorizationStrategy,
} from './auth/IAuthorizationStrategy';
export type { IAuthProvider } from './auth/IAuthProvider';
export type { IAuthRejection } from './auth/IAuthRejection';
export type { ILogonTarget, IRequestTarget } from './auth/IAuthTargets';
export type {
  CallbackServerFactory,
  ICallbackServerHandle,
  ICallbackServerOptions,
} from './auth/ICallbackServer';
export type { ICertificateMaterial } from './auth/ICertificateMaterial';
export type {
  IClientAuthentication,
  ITokenRequestAuthentication,
  ITokenRequestDraft,
} from './auth/IClientAuthentication';
export type {
  IApiKeyCredential,
  IBearerCredential,
  ISecretLoginCredential,
} from './auth/ICredentials';
export type {
  ConfigDiagnosticField,
  ConfigDiagnosticOf,
  ConfigDiagnosticValues,
  ConfigUri,
  DocumentTime,
  DocumentValue,
  LocalPath,
  SamlDiagnosticField,
  SamlDiagnosticOf,
  SamlDiagnosticValues,
  SncDiagnosticField,
  SncDiagnosticOf,
  SncDiagnosticValues,
  XmlId,
  XmlName,
} from './error/diagnostics';
export {
  CONFIG_CASE_DIAGNOSTICS,
  SAML_RULE_DIAGNOSTIC,
  SNC_PROBLEM_DIAGNOSTICS,
} from './error/diagnostics';
export type {
  AssertionRuleCheck,
  AuthProviderErrorFacts,
  BearerCandidate,
  ConfigFactsOf,
  CountedAssertionRule,
  InteractiveLoginFacts,
  SamlFactsOf,
  SncCandidate,
  SncFactsOf,
  SncProblemFacts,
  SystemRefusedFacts,
} from './error/facts';
export type {
  AuthProviderErrorOf,
  ConfigurationError,
  IAuthProviderError,
  SamlAssertionError,
  SncError,
} from './error/IAuthProviderError';
export type { IAuthProviderFailure } from './error/IAuthProviderFailure';
export type {
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
  PlainKind,
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
  VariantKind,
} from './error/kinds';
export {
  ALLOWED_VALUE_SETS,
  ASSERTION_CHECKS,
  ASSERTION_RULES,
  AUTH_PROVIDER_ERROR_KINDS,
  BASIC_ENCODINGS,
  BEARER_CANDIDATE_REASONS,
  CLIENT_AUTHENTICATION_PROBLEMS,
  CLIENT_CERTIFICATE_PROBLEMS,
  CONFIG_CASES,
  CONFIG_FIELDS,
  CONNECTION_MOMENTS,
  CONNECTION_PROBLEMS,
  CREDENTIAL_KINDS,
  INTERACTIVE_LOGIN_STRATEGIES,
  INTERACTIVE_OUTCOMES,
  LOGON_TARGET_REFUSALS,
  LOGON_TARGET_WIRES,
  NOT_PREPARED_PROVIDERS,
  OAUTH_ERROR_CODES,
  OPERATIONS,
  REJECTION_MOMENTS,
  RENEWAL_UNCHANGED_SOURCES,
  REQUEST_PROBLEMS,
  RFC_KEYS,
  SAML_STATUS_CODES,
  SNC_ARCHS,
  SNC_CANDIDATE_SOURCES,
  SNC_PROBLEMS,
  SNC_QOP_VALUES,
  SNC_UNUSABLE_REASONS,
  SYSTEM_CODES,
  SYSTEM_REFUSED_VERDICTS,
  TLS_FAILURE_CODES,
  TOKEN_BINDING_PROBLEMS,
} from './error/kinds';
export type {
  Count,
  HttpStatus,
  Port,
} from './error/numbers';
export type { StoreErrorCode } from './store/StoreErrorCodes';
export { STORE_ERROR_CODES } from './store/StoreErrorCodes';
export type { OAuth2GrantType } from './token/AuthType';
export {
  AUTH_TYPE_AUTHORIZATION_CODE,
  AUTH_TYPE_AUTHORIZATION_CODE_PKCE,
  AUTH_TYPE_CLIENT_CREDENTIALS,
  AUTH_TYPE_CLIENT_X509,
  AUTH_TYPE_PASSWORD,
  AUTH_TYPE_SAML2_BEARER,
  AUTH_TYPE_USER_TOKEN,
} from './token/AuthType';
export type { IRefreshableTokenProvider } from './token/IRefreshableTokenProvider';
export type { ITokenProvider } from './token/ITokenProvider';
export type { ITokenProviderOptions } from './token/ITokenProviderOptions';
export type { ITokenRefresher } from './token/ITokenRefresher';
export type { ITokenRefreshResult } from './token/ITokenRefreshResult';
export type { ITokenRequestOptions } from './token/ITokenRequestOptions';
export type { ITokenResult } from './token/ITokenResult';
export type {
  ITokenPersistence,
  PersistenceReport,
  ReportedCredential,
  ReportedRefreshToken,
} from './token/persistence';
export type {
  IRenewalStrategy,
  RejectionReading,
  RenewalAbortObservation,
  RenewalCause,
  RenewalDecision,
  RenewalMoment,
  RenewalSituation,
  RenewalStep,
  RenewalStepOutcome,
  RenewalTrigger,
  SentRefreshToken,
} from './token/renewal';
export {
  REJECTION_READINGS,
  RENEWAL_MOMENTS,
  RENEWAL_STEPS,
  RENEWAL_TRIGGERS,
} from './token/renewal';
