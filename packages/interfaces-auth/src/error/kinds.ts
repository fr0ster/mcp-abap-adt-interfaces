/**
 * The error contract's allowlists: every closed set a fact is drawn from, as a
 * frozen `as const` array beside its union (`(typeof ARRAY)[number]`).
 *
 * Each array is frozen at its definition, before any consumer code runs, so
 * no code in the process can widen an allowlist through it. The runtime sets
 * that classification checks against are built from these same arrays in
 * `@mcp-abap-adt/auth-errors`, so the type and the set cannot drift.
 *
 * **What a later release may change.** A new kind, or a new member of a
 * discriminant a consumer is expected to switch on, is a major. A new member
 * of a **code list** — `SystemCode`, `TlsFailureCode`, `OAuthErrorCode`,
 * `RfcKey`, `ConfigField`, `SamlStatusCode` — is a minor: do not assert
 * exhaustiveness over a code list, only over kinds and discriminants.
 */

/** Every kind of error an auth provider, a logon target or a connection reports. */
export const AUTH_PROVIDER_ERROR_KINDS = Object.freeze([
  'configuration',
  'client-certificate',
  'client-authentication',
  'request-failed',
  'tls',
  'interactive-login',
  'saml-assertion',
  'snc',
  'credential-refused',
  'system-refused',
  'renewal-unchanged',
  'renewal-declined',
  'token-binding',
  'not-prepared',
  'logon-target',
  'connection',
  'unknown',
] as const);
export type AuthProviderErrorKind = (typeof AUTH_PROVIDER_ERROR_KINDS)[number];

/** The kinds that carry diagnostics, each narrowed further by its `variant`. */
export type VariantKind = 'saml-assertion' | 'snc' | 'configuration';
/** Every other kind: one object type, no variant, no diagnostics. */
export type PlainKind = Exclude<AuthProviderErrorKind, VariantKind>;

// ---- configuration --------------------------------------------------------

/**
 * Every configuration property name the providers declare
 * (auth-providers' `KNOWN_CONFIG_FIELDS`), plus `port`, `payload` and `read` —
 * field names a configuration error names without their being provider
 * properties (the callback server, the static code strategy, the manual
 * strategies).
 */
export const CONFIG_FIELDS = Object.freeze([
  'accessToken',
  'acsUrl',
  'actorToken',
  'actorTokenType',
  'assertionValidator',
  'audience',
  'authnRequestId',
  'authorization',
  'authorizationEndpoint',
  'authorizationUrl',
  'callbackServer',
  'certKeyPath',
  'certPassphrase',
  'certPath',
  'certPfxPath',
  'clientId',
  'clientSecret',
  'clockSkewMs',
  'cookieProvider',
  'deviceAuthorizationEndpoint',
  'encoding',
  'idpCertificates',
  'idpEntityId',
  'idpInitiated',
  'idpSsoUrl',
  'issuerUrl',
  'locator',
  'logger',
  'myName',
  'onTokens',
  'onWriteFailure',
  'partnerName',
  'password',
  'persistence',
  'presenter',
  'probes',
  'qop',
  'refreshToken',
  'relayState',
  'renewal',
  'replayStore',
  'scope',
  'scopes',
  'sncLib',
  'spEntityId',
  'subjectToken',
  'subjectTokenType',
  'tokenEndpoint',
  'tokenUrl',
  'uaaUrl',
  'username',
  'write',
  'port',
  'payload',
  'read',
] as const);
export type ConfigField = (typeof CONFIG_FIELDS)[number];

/** One per configuration mistake a provider or strategy refuses. */
export const CONFIG_CASES = Object.freeze([
  'required-fields-missing',
  'invalid-value',
  'client-secret-beside-client-authentication',
  'saml-acs-required-with-authorization-url',
  'saml-idp-initiated-with-request-id',
  'saml-shipped-validator-without-issuer',
  'saml-token-endpoint-missing',
  'saml-idp-initiated-without-authorization-url',
  'saml-acs-mismatch',
  'saml-in-response-to-undeclared',
  'client-id-required-with-client-authentication',
  'redirect-mismatch',
  'oidc-discovery-needs-issuer',
  'oidc-endpoint-missing',
  'certificate-pem-and-pfx',
  'certificate-files-missing',
  'basic-encoding-missing',
  'snc-partner-name-missing',
  'snc-qop-invalid',
  'unsupported-sso-flow',
  'validator-clock-skew-invalid',
  'validator-no-certificates',
  'idp-certificate-invalid',
  'static-code-without-payload',
  'callback-port-invalid',
] as const);
export type ConfigCase = (typeof CONFIG_CASES)[number];

/** The value sets a configuration error may name as the allowed ones. */
export const ALLOWED_VALUE_SETS = Object.freeze([
  'snc-qop',
  'basic-encoding',
] as const);
export type AllowedValueSet = (typeof ALLOWED_VALUE_SETS)[number];

/** SAP's SNC_QOP values: 1 authentication, 2 integrity, 3 privacy, 8 default, 9 maximum. */
export const SNC_QOP_VALUES = Object.freeze(['1', '2', '3', '8', '9'] as const);
export type SncQop = (typeof SNC_QOP_VALUES)[number];

/** How `clientSecretBasic` writes the id and the secret. */
export const BASIC_ENCODINGS = Object.freeze(['raw', 'form'] as const);
export type BasicEncoding = (typeof BASIC_ENCODINGS)[number];

// ---- what was being done ---------------------------------------------------

/** What was being done when it failed — replaces every free-text `what`. */
export const OPERATIONS = Object.freeze([
  'token-request',
  'refresh',
  'persisting-tokens',
  'renewal-strategy',
  'presenting-token',
  'presenting-certificate',
  'loading-certificate',
  'writing-authorization-header',
  'offering-logon-parameters',
  'writing-session-cookies',
  'reading-rejection',
  'token-source',
  'resolving-snc-library',
  'handing-over-snc-parameters',
  'authorizing-snc-request',
  'explaining-snc-refusal',
  'probing-snc-product',
  'presenting-device-code',
  'saml-token-exchange',
  'saml-token-refresh',
  'browser-login',
  'opening-browser',
  'passcode-exchange',
  'device-authorization',
  'password-grant',
  'client-credentials',
  'token-refresh',
  'oidc-discovery',
  'code-exchange',
  'device-poll',
  'oidc-token-request',
  'validating-assertion',
  'client-authentication-strategy',
  'unfamiliar-error',
  'preparing',
  'establishing',
  'authorizing',
] as const);
export type Operation = (typeof OPERATIONS)[number];

/**
 * How a request to an authorization server failed: refused (a response with a
 * status), no response (a transport failure), a 2xx without `access_token`, or
 * a response without the fields it must carry.
 */
export const REQUEST_PROBLEMS = Object.freeze([
  'refused',
  'no-response',
  'no-access-token',
  'incomplete-response',
] as const);
export type RequestProblem = (typeof REQUEST_PROBLEMS)[number];

// ---- code lists (a new member is a minor) ---------------------------------

/** The system error codes a fact may carry (auth-providers' `KNOWN_SYSTEM_CODES`). */
export const SYSTEM_CODES = Object.freeze([
  'ENOENT',
  'EACCES',
  'EPERM',
  'ECONNREFUSED',
  'ECONNRESET',
  'ETIMEDOUT',
  'ENOTFOUND',
  'EAI_AGAIN',
  'EPIPE',
  'EADDRINUSE',
  'ECONNABORTED',
  'EPROTO',
  // axios's own, for a request that got no response
  'ERR_NETWORK',
] as const);
export type SystemCode = (typeof SYSTEM_CODES)[number];

/**
 * Node's codes for a TLS failure (the keys of auth-providers' `TLS_CODES`);
 * the words for each stay in the renderer. A server's alert refusing the
 * client certificate is listed in both OpenSSL spellings.
 */
export const TLS_FAILURE_CODES = Object.freeze([
  'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
  'SELF_SIGNED_CERT_IN_CHAIN',
  'DEPTH_ZERO_SELF_SIGNED_CERT',
  'UNABLE_TO_GET_ISSUER_CERT_LOCALLY',
  'CERT_HAS_EXPIRED',
  'ERR_TLS_CERT_ALTNAME_INVALID',
  'ERR_SSL_TLSV13_ALERT_CERTIFICATE_REQUIRED',
  'ERR_SSL_TLSV1_ALERT_UNKNOWN_CA',
  'ERR_SSL_SSL/TLS_ALERT_BAD_CERTIFICATE',
  'ERR_SSL_SSLV3_ALERT_BAD_CERTIFICATE',
  'ERR_SSL_SSL/TLS_ALERT_CERTIFICATE_UNKNOWN',
  'ERR_SSL_SSLV3_ALERT_CERTIFICATE_UNKNOWN',
  'ERR_SSL_SSL/TLS_ALERT_CERTIFICATE_EXPIRED',
  'ERR_SSL_SSLV3_ALERT_CERTIFICATE_EXPIRED',
  'ERR_SSL_SSL/TLS_ALERT_CERTIFICATE_REVOKED',
  'ERR_SSL_SSLV3_ALERT_CERTIFICATE_REVOKED',
  'ERR_SSL_SSL/TLS_ALERT_UNSUPPORTED_CERTIFICATE',
  'ERR_SSL_SSLV3_ALERT_UNSUPPORTED_CERTIFICATE',
] as const);
export type TlsFailureCode = (typeof TLS_FAILURE_CODES)[number];

/**
 * The registered OAuth / OIDC error codes: RFC 6749 §5.2 and §4.1.2.1,
 * RFC 8628 §3.5, RFC 6750 §3.1, RFC 8693 §2.2.2, OpenID Connect Core 1.0
 * §3.1.2.6 (auth-providers' `REGISTERED_ERROR_CODES`).
 */
export const OAUTH_ERROR_CODES = Object.freeze([
  // RFC 6749 §5.2 — token endpoint
  'invalid_request',
  'invalid_client',
  'invalid_grant',
  'unauthorized_client',
  'unsupported_grant_type',
  'invalid_scope',
  // RFC 6749 §4.1.2.1 — authorization endpoint
  'access_denied',
  'unsupported_response_type',
  'server_error',
  'temporarily_unavailable',
  // RFC 8628 §3.5 — device access token response
  'authorization_pending',
  'slow_down',
  'expired_token',
  // RFC 6750 §3.1 — bearer token usage
  'invalid_token',
  'insufficient_scope',
  // RFC 8693 §2.2.2 — token exchange
  'invalid_target',
  // OpenID Connect Core 1.0 §3.1.2.6 — authentication error response
  'interaction_required',
  'login_required',
  'account_selection_required',
  'consent_required',
  'invalid_request_uri',
  'invalid_request_object',
  'request_not_supported',
  'request_uri_not_supported',
  'registration_not_supported',
] as const);
export type OAuthErrorCode = (typeof OAUTH_ERROR_CODES)[number];

/** The RFC SDK's error keys a fact may carry (auth-providers' `KNOWN_RFC_KEYS`). */
export const RFC_KEYS = Object.freeze([
  'RFC_COMMUNICATION_FAILURE',
  'RFC_LOGON_FAILURE',
  'RFC_ABAP_RUNTIME_FAILURE',
  'RFC_ABAP_MESSAGE',
  'RFC_EXTERNAL_FAILURE',
  'RFC_INVALID_PARAMETER',
  'RFC_CLOSED',
  'RFC_TIMEOUT',
] as const);
export type RfcKey = (typeof RFC_KEYS)[number];

// ---- SAML ------------------------------------------------------------------

/** The checks the shipped SAML validators perform, in the order they perform them. */
export const ASSERTION_CHECKS = Object.freeze([
  'document',
  'duplicateId',
  'signature',
  'signedNode',
  'status',
  'assertionId',
  'issuer',
  'conditions',
  'notBefore',
  'notOnOrAfter',
  'audience',
  'bearerConfirmation',
  'destination',
  'replay',
] as const);
export type AssertionCheck = (typeof ASSERTION_CHECKS)[number];

/**
 * One rule per refusal of the shipped SAML validators (50), then the six of
 * the bearer-payload conversion. Each rule belongs to exactly one check
 * (`AssertionRuleCheck`).
 */
export const ASSERTION_RULES = Object.freeze([
  // document
  'doctype',
  'not-xml',
  'root-not-response-or-assertion',
  'root-not-response',
  // duplicateId
  'duplicate-id',
  // signature
  'no-signature',
  'signature-malformed',
  'signature-not-verified',
  'no-reference',
  'several-references',
  'reference-not-same-document',
  'reference-not-found',
  'signature-not-enveloped',
  // signedNode
  'no-direct-assertion',
  'several-direct-assertions',
  'response-not-signed',
  'assertion-not-signed',
  'assertion-outside-signed',
  'assertion-inside-signature',
  // status
  'no-status',
  'several-status',
  'no-status-code',
  'several-status-codes',
  'status-code-no-value',
  'declined',
  // assertionId
  'no-assertion-id',
  // issuer
  'no-issuer',
  'several-issuers',
  'empty-issuer',
  'no-expected-issuer',
  'untrusted-issuer',
  'several-response-issuers',
  'issuers-differ',
  // conditions
  'no-conditions',
  'several-conditions',
  // notBefore
  'not-before-invalid',
  'not-yet-valid',
  // notOnOrAfter
  'no-not-on-or-after',
  'not-on-or-after-invalid',
  'expired',
  // audience
  'no-audience-restriction',
  'audience-restriction-empty',
  'audience-not-us',
  // bearerConfirmation
  'no-subject',
  'several-subjects',
  'no-subject-confirmation',
  'no-bearer-qualifies',
  // destination
  'no-destination',
  'destination-not-us',
  // replay
  'replayed',
  // document — the bearer payload's conversion to one Assertion
  'payload-not-base64-xml',
  'payload-not-well-formed',
  'payload-not-saml',
  'only-encrypted-assertion',
  'no-assertion',
  'several-assertions',
] as const);
export type AssertionRule = (typeof ASSERTION_RULES)[number];

/** Why one SubjectConfirmation does not qualify as bearer, in the order a candidate is tested. */
export const BEARER_CANDIDATE_REASONS = Object.freeze([
  'method-not-bearer',
  'no-confirmation-data',
  'several-confirmation-data',
  'in-response-to-unexpected',
  'in-response-to-mismatch',
  'recipient-not-acs',
  'no-not-on-or-after',
  'not-on-or-after-invalid',
  'not-before-invalid',
  'not-on-or-after-passed',
  'not-before-not-arrived',
] as const);
export type BearerCandidateReason = (typeof BEARER_CANDIDATE_REASONS)[number];

/** SAML 2.0 Core §3.2.2.2: the top-level and second-level status codes. */
export const SAML_STATUS_CODES = Object.freeze([
  // top-level
  'urn:oasis:names:tc:SAML:2.0:status:Success',
  'urn:oasis:names:tc:SAML:2.0:status:Requester',
  'urn:oasis:names:tc:SAML:2.0:status:Responder',
  'urn:oasis:names:tc:SAML:2.0:status:VersionMismatch',
  // second-level
  'urn:oasis:names:tc:SAML:2.0:status:AuthnFailed',
  'urn:oasis:names:tc:SAML:2.0:status:InvalidAttrNameOrValue',
  'urn:oasis:names:tc:SAML:2.0:status:InvalidNameIDPolicy',
  'urn:oasis:names:tc:SAML:2.0:status:NoAuthnContext',
  'urn:oasis:names:tc:SAML:2.0:status:NoAvailableIDP',
  'urn:oasis:names:tc:SAML:2.0:status:NoPassive',
  'urn:oasis:names:tc:SAML:2.0:status:NoSupportedIDP',
  'urn:oasis:names:tc:SAML:2.0:status:PartialLogout',
  'urn:oasis:names:tc:SAML:2.0:status:ProxyCountExceeded',
  'urn:oasis:names:tc:SAML:2.0:status:RequestDenied',
  'urn:oasis:names:tc:SAML:2.0:status:RequestUnsupported',
  'urn:oasis:names:tc:SAML:2.0:status:RequestVersionDeprecated',
  'urn:oasis:names:tc:SAML:2.0:status:RequestVersionTooHigh',
  'urn:oasis:names:tc:SAML:2.0:status:RequestVersionTooLow',
  'urn:oasis:names:tc:SAML:2.0:status:ResourceNotRecognized',
  'urn:oasis:names:tc:SAML:2.0:status:TooManyResponses',
  'urn:oasis:names:tc:SAML:2.0:status:UnknownAttrProfile',
  'urn:oasis:names:tc:SAML:2.0:status:UnknownPrincipal',
  'urn:oasis:names:tc:SAML:2.0:status:UnsupportedBinding',
] as const);
export type SamlStatusCode = (typeof SAML_STATUS_CODES)[number];

// ---- SNC -------------------------------------------------------------------

/**
 * What went wrong with an SNC logon: no credential to present (A2200019), the
 * library failed to initialise (SNCERR_INIT), the logon was refused, no usable
 * library was found, the locator returned no path.
 */
export const SNC_PROBLEMS = Object.freeze([
  'no-credential',
  'library-init-failed',
  'logon-refused',
  'library-not-found',
  'locator-returned-no-path',
] as const);
export type SncProblem = (typeof SNC_PROBLEMS)[number];

/** Where an SNC library candidate came from. */
export const SNC_CANDIDATE_SOURCES = Object.freeze([
  'sncLib',
  'SNC_LIB_64',
  'SNC_LIB',
  'registry',
  'macOS bundle',
] as const);
export type SncCandidateSource = (typeof SNC_CANDIDATE_SOURCES)[number];

/** Why an SNC library candidate is unusable. */
export const SNC_UNUSABLE_REASONS = Object.freeze([
  'missing',
  'not a library',
  'wrong architecture',
] as const);
export type SncUnusableReason = (typeof SNC_UNUSABLE_REASONS)[number];

/** The architectures a shared library's header may name. */
export const SNC_ARCHS = Object.freeze(['ia32', 'x64', 'arm64'] as const);
export type SncArch = (typeof SNC_ARCHS)[number];

// ---- interactive login and credentials ------------------------------------

/**
 * How an interactive login ended without a result. There is no timeout
 * outcome: a login the consumer bounds with `AbortSignal.timeout(ms)` ends
 * `aborted`.
 */
export const INTERACTIVE_OUTCOMES = Object.freeze([
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
] as const);
export type InteractiveOutcome = (typeof INTERACTIVE_OUTCOMES)[number];

/**
 * Which strategy was disposed or aborted (`interactive-login`, outcome
 * `disposed`; outcome `aborted` since 6.0.0).
 */
export const INTERACTIVE_LOGIN_STRATEGIES = Object.freeze([
  'browser',
  'manual',
] as const);
export type InteractiveLoginStrategy =
  (typeof INTERACTIVE_LOGIN_STRATEGIES)[number];

/** The credential the system refused (`credential-refused`). */
export const CREDENTIAL_KINDS = Object.freeze([
  'user-password',
  'client-certificate',
  'saml-session',
  'token',
  'refresh-token',
] as const);
export type CredentialKind = (typeof CREDENTIAL_KINDS)[number];

// ---- the small sets one kind uses ----------------------------------------

/** `client-certificate`'s `problem`. */
export const CLIENT_CERTIFICATE_PROBLEMS = Object.freeze([
  'incomplete',
  'unusable',
  'expired',
] as const);
export type ClientCertificateProblem =
  (typeof CLIENT_CERTIFICATE_PROBLEMS)[number];

/** `client-authentication`'s `problem`. */
export const CLIENT_AUTHENTICATION_PROBLEMS = Object.freeze([
  'signing-key-unusable',
  'result-unsendable',
  'basic-client-id-colon',
] as const);
export type ClientAuthenticationProblem =
  (typeof CLIENT_AUTHENTICATION_PROBLEMS)[number];

/** The moment a rejection was read at (`credential-refused`, `system-refused`). */
export const REJECTION_MOMENTS = Object.freeze(['logon', 'request'] as const);
export type RejectionMoment = (typeof REJECTION_MOMENTS)[number];

/** `system-refused`'s `verdict`. */
export const SYSTEM_REFUSED_VERDICTS = Object.freeze([
  'not-authorized',
  'redirected',
  'system-failed',
  'other-status',
  'rfc-failure',
  'unknown',
] as const);
export type SystemRefusedVerdict = (typeof SYSTEM_REFUSED_VERDICTS)[number];

/** `renewal-unchanged`'s `source`. */
export const RENEWAL_UNCHANGED_SOURCES = Object.freeze([
  'token-source',
  'token-provider',
] as const);
export type RenewalUnchangedSource = (typeof RENEWAL_UNCHANGED_SOURCES)[number];

/** `token-binding`'s `problem`. */
export const TOKEN_BINDING_PROBLEMS = Object.freeze([
  'bound-to-unpinned',
  'renewed-bound-elsewhere',
] as const);
export type TokenBindingProblem = (typeof TOKEN_BINDING_PROBLEMS)[number];

/** `not-prepared`'s `provider`. */
export const NOT_PREPARED_PROVIDERS = Object.freeze([
  'certificate',
  'snc',
] as const);
export type NotPreparedProvider = (typeof NOT_PREPARED_PROVIDERS)[number];

/** `logon-target`'s `wire`. */
export const LOGON_TARGET_WIRES = Object.freeze([
  'http',
  'rfc',
  'unknown',
] as const);
export type LogonTargetWire = (typeof LOGON_TARGET_WIRES)[number];

/** `logon-target`'s `refused`: what the target did not take. */
export const LOGON_TARGET_REFUSALS = Object.freeze([
  'tls-material',
  'logon-parameters',
] as const);
export type LogonTargetRefusal = (typeof LOGON_TARGET_REFUSALS)[number];

/** `connection`'s `problem`. */
export const CONNECTION_PROBLEMS = Object.freeze([
  'provider-threw',
  'refused-after-renewal',
  'no-credential',
] as const);
export type ConnectionProblem = (typeof CONNECTION_PROBLEMS)[number];

/** `connection`'s `at`. */
export const CONNECTION_MOMENTS = Object.freeze([
  'prepare',
  'logon',
  'request',
] as const);
export type ConnectionMoment = (typeof CONNECTION_MOMENTS)[number];
