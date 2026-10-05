/**
 * Diagnostics: values that help a person and cannot be allowlisted. Only
 * three kinds carry them — `saml-assertion`, `snc`, `configuration` — and
 * which field a variant may carry is decided by the maps below, read both by
 * the types (`SamlDiagnosticOf` and its siblings) and by the runtime
 * admission in `@mcp-abap-adt/auth-errors`, so the two come from one source.
 *
 * A diagnostic value is a string the minting builder admitted by its shape
 * (no control, bidirectional or line-separator character; bounded length);
 * it is never part of `reason` / `hint`. The aliases below name which
 * admission a field passed.
 */

import type { AssertionRule, ConfigCase, SncProblem } from './kinds';

/** A local file path, 1–1 024 code points, never truncated. */
export type LocalPath = string;
/** A value quoted from a SAML document, cut to 64 code points. */
export type DocumentValue = string;
/** An `xsd:dateTime`-shaped value from a SAML document that failed strict parsing. */
export type DocumentTime = string;
/** An XML element's local name. */
export type XmlName = string;
/** An XML `ID` attribute value. */
export type XmlId = string;
/** A configured or reported URI, kept as `origin + pathname` only. */
export type ConfigUri = string;

/** Every `saml-assertion` diagnostic field, with the type of its value. */
export interface SamlDiagnosticValues {
  readonly rootElement: XmlName;
  readonly id: XmlId;
  readonly referenceUri: DocumentValue;
  readonly statusCode: DocumentValue;
  readonly issuer: DocumentValue;
  readonly notBefore: DocumentTime;
  readonly notOnOrAfter: DocumentTime;
  readonly destination: DocumentValue;
}
export type SamlDiagnosticField = keyof SamlDiagnosticValues;

/** Every `snc` diagnostic field, with the type of its value. */
export interface SncDiagnosticValues {
  readonly library: LocalPath;
  /**
   * Each candidate's path, index for index with `facts.candidates`; a path
   * that failed admission is `null`, so the indices stay aligned.
   */
  readonly candidatePaths: readonly (LocalPath | null)[];
}
export type SncDiagnosticField = keyof SncDiagnosticValues;

/** Every `configuration` diagnostic field, with the type of its value. */
export interface ConfigDiagnosticValues {
  readonly configuredUri: ConfigUri;
  readonly strategyUri: ConfigUri;
}
export type ConfigDiagnosticField = keyof ConfigDiagnosticValues;

/** The one diagnostic field each SAML rule may carry, else `null`. */
export const SAML_RULE_DIAGNOSTIC = Object.freeze({
  doctype: null,
  'not-xml': null,
  'root-not-response-or-assertion': 'rootElement',
  'root-not-response': 'rootElement',
  'duplicate-id': 'id',
  'no-signature': null,
  'signature-malformed': null,
  'signature-not-verified': null,
  'no-reference': null,
  'several-references': null,
  'reference-not-same-document': 'referenceUri',
  'reference-not-found': 'referenceUri',
  'signature-not-enveloped': null,
  'no-direct-assertion': null,
  'several-direct-assertions': null,
  'response-not-signed': null,
  'assertion-not-signed': null,
  'assertion-outside-signed': null,
  'assertion-inside-signature': null,
  'no-status': null,
  'several-status': null,
  'no-status-code': null,
  'several-status-codes': null,
  'status-code-no-value': null,
  declined: 'statusCode',
  'no-assertion-id': null,
  'no-issuer': null,
  'several-issuers': null,
  'empty-issuer': null,
  'no-expected-issuer': null,
  'untrusted-issuer': 'issuer',
  'several-response-issuers': null,
  'issuers-differ': null,
  'no-conditions': null,
  'several-conditions': null,
  'not-before-invalid': 'notBefore',
  'not-yet-valid': null,
  'no-not-on-or-after': null,
  'not-on-or-after-invalid': 'notOnOrAfter',
  expired: null,
  'no-audience-restriction': null,
  'audience-restriction-empty': null,
  'audience-not-us': null,
  'no-subject': null,
  'several-subjects': null,
  'no-subject-confirmation': null,
  'no-bearer-qualifies': null,
  'no-destination': null,
  'destination-not-us': 'destination',
  replayed: null,
  'payload-not-base64-xml': null,
  'payload-not-well-formed': null,
  'payload-not-saml': null,
  'only-encrypted-assertion': null,
  'no-assertion': null,
  'several-assertions': null,
} as const satisfies {
  readonly [R in AssertionRule]: SamlDiagnosticField | null;
});

/** The diagnostic fields each SNC problem may carry. */
export const SNC_PROBLEM_DIAGNOSTICS = Object.freeze({
  'no-credential': Object.freeze(['library'] as const),
  'library-init-failed': Object.freeze(['library'] as const),
  'logon-refused': Object.freeze([] as const),
  'library-not-found': Object.freeze(['candidatePaths'] as const),
  'locator-returned-no-path': Object.freeze([] as const),
} as const satisfies {
  readonly [P in SncProblem]: readonly SncDiagnosticField[];
});

/** The diagnostic fields each configuration case may carry. */
export const CONFIG_CASE_DIAGNOSTICS = Object.freeze({
  'required-fields-missing': Object.freeze([] as const),
  'client-secret-beside-client-authentication': Object.freeze([] as const),
  'saml-acs-required-with-authorization-url': Object.freeze([] as const),
  'saml-idp-initiated-with-request-id': Object.freeze([] as const),
  'saml-shipped-validator-without-issuer': Object.freeze([] as const),
  'saml-token-endpoint-missing': Object.freeze([] as const),
  'saml-idp-initiated-without-authorization-url': Object.freeze([] as const),
  'saml-acs-mismatch': Object.freeze(['configuredUri', 'strategyUri'] as const),
  'saml-in-response-to-undeclared': Object.freeze([] as const),
  'client-id-required-with-client-authentication': Object.freeze([] as const),
  'redirect-mismatch': Object.freeze(['configuredUri', 'strategyUri'] as const),
  'oidc-discovery-needs-issuer': Object.freeze([] as const),
  'oidc-endpoint-missing': Object.freeze([] as const),
  'certificate-pem-and-pfx': Object.freeze([] as const),
  'certificate-files-missing': Object.freeze([] as const),
  'basic-encoding-missing': Object.freeze([] as const),
  'snc-partner-name-missing': Object.freeze([] as const),
  'snc-qop-invalid': Object.freeze([] as const),
  'unsupported-sso-flow': Object.freeze([] as const),
  'validator-clock-skew-invalid': Object.freeze([] as const),
  'validator-no-certificates': Object.freeze([] as const),
  'idp-certificate-invalid': Object.freeze([] as const),
  'static-code-without-payload': Object.freeze([] as const),
  'callback-port-invalid': Object.freeze([] as const),
} as const satisfies {
  readonly [C in ConfigCase]: readonly ConfigDiagnosticField[];
});

/** The diagnostic field rule `R` may carry; `never` when none. */
export type SamlDiagnosticOf<R extends AssertionRule> = Exclude<
  (typeof SAML_RULE_DIAGNOSTIC)[R],
  null
>;
/** The diagnostic fields problem `P` may carry; `never` when none. */
export type SncDiagnosticOf<P extends SncProblem> =
  (typeof SNC_PROBLEM_DIAGNOSTICS)[P][number];
/** The diagnostic fields case `C` may carry; `never` when none. */
export type ConfigDiagnosticOf<C extends ConfigCase> =
  (typeof CONFIG_CASE_DIAGNOSTICS)[C][number];
