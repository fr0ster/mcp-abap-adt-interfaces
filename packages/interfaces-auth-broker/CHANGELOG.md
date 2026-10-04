# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2026-10-05

### Added

- **`IClientCertificate`** — a client certificate a service key carries:
  `uaaUrl`, `clientId`, `certificate` (PEM, possibly a chain), `key` (PEM) and
  `certUrl` (the mTLS host), all readonly strings.
- **`IServiceKeyStore.getClientCertificate?(destination)`** — optional; answers
  the destination's `IClientCertificate`, or `null` when its key carries none.
  Data only: an x509 key is not answered through `getAuthorizationConfig`, and
  which authentication the client uses is the consumer's. A store that never
  holds certificates omits the method, so existing stores keep compiling.

## [1.1.0] - 2026-10-02

### Added

- **`IConnectionConfig.issuedFor` and `issuedBy`** (optional strings) — what a
  stored secret is bound to: the canonical URI of the resource it was obtained
  for (`https://host:443/path?sap-client=100`), and of who issued it to which
  client (`<uaaUrl or issuer>?client_id=<id>`, or the ACS that set SAML
  cookies). A session store keeps both beside the secret, written and cleared
  with it; a key store never answers them. They are what
  `@mcp-abap-adt/auth-broker` 4 compares before it presents a stored secret, so
  a custom `ISessionStore` must persist them — see the README's note for store
  authors. Optional: every 1.0.x implementation still satisfies the type.

## [1.0.1] - 2026-10-02

### Changed

- **Built from its own install.** The repository's packages are no longer npm
  workspaces (#116): this package builds and type-checks against its
  `@mcp-abap-adt/*` dependencies as published on the npm registry, never
  against a sibling's source, and carries its own `typescript` and
  `@types/node` as devDependencies. Its contract, its `dependencies` and the
  files it ships are unchanged — nothing to do for a consumer.

## [1.0.0] - 2026-10-01

### Added

- **The package — the broker's port: the destination and the stores that hold
  it.** Six types, moved from `@mcp-abap-adt/interfaces-auth-sap`:
  `IConnectionConfig`, `DestinationGrant`, `IConfig`, `ISessionStore`,
  `IServiceKeyStore`, `ITokenProviderResult`. Same names; the shapes are those
  of `interfaces-auth-sap` 1.1.0, plus what its 1.2.0 added and never published
  — listed below. Decision 41.

  **Why a package of its own.** `interfaces-auth-sap` held two subjects: the
  SAP system and its UAA client, which providers, the connection and the ADT
  clients take; and the destination with its storage, which only the stores,
  the broker and the servers that build a broker import. The broker states what
  it needs from a destination and the stores implement it; a contract lives in
  the package whose subject its own fields name (decision 35).

- **`DestinationGrant`** (new since `interfaces-auth-sap` 1.1.0) — how a
  destination obtains a new credential: `authorization_code`,
  `client_credentials`, `passcode` (UAA), `oidc_authorization_code`,
  `device_code`, `password`, `token_exchange` (OIDC), `saml2_pure`,
  `saml2_bearer` (SAML), or `none` (handed over, not renewed). Not
  `OAuth2GrantType` from `interfaces-auth`: that lists OAuth grants on the
  wire, this the ways a destination is renewed, which include a UAA passcode,
  SAML session cookies and no renewal. Beside `IConnectionConfig` because it
  has no meaning apart from it (decision 35).
- **On `IConnectionConfig`, all optional** (new since `interfaces-auth-sap`
  1.1.0):
  - `grantType?: DestinationGrant` — so a consumer builds the provider the
    destination states instead of inferring it;
  - `expiresAt?: number` (epoch ms) — when the stored credential stops being
    valid; session cookies carry no expiry of their own;
  - OIDC settings: `oidcIssuerUrl`, `oidcAuthorizationEndpoint`,
    `oidcTokenEndpoint`, `oidcDeviceAuthorizationEndpoint`, `oidcScopes`, and
    for token exchange `oidcSubjectToken`, `oidcSubjectTokenType`,
    `oidcAudience`, `oidcActorToken`, `oidcActorTokenType`;
  - the SAML IdP's trust and endpoints: `samlIdpSsoUrl`, `samlIdpEntityId`,
    `samlIdpCertificates`, `samlSpEntityId`, `samlAcsUrl`, `samlRelayState`,
    `samlIdpInitiated`, `samlClockSkewMs`, `samlTokenUrl`.

  On `IConnectionConfig` rather than `IAuthorizationConfig`, which requires
  `uaaClientSecret`: a public OIDC client, an IdP's trust and a grant exist
  without a client secret. For `@mcp-abap-adt/auth-broker` 4.0.0 (its design
  spec, §1.1).

### Dependencies

- **`@mcp-abap-adt/interfaces-auth-sap` `^2.0.0`, and nothing else**, for
  `IAuthorizationConfig`: `IConfig` composes it, and both stores return it.
  Imported, not re-exported (decision 34). `interfaces-auth` and
  `interfaces-utils` arrive through it.
