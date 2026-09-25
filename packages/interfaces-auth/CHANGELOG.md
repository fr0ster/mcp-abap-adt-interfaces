# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- **Breaking: `AssertionContext.expectedInResponseTo` is optional.** Absent
  means the login was declared IdP-initiated — no AuthnRequest was sent — and
  a validator must then refuse an assertion carrying `InResponseTo` at all,
  not skip the check. The reason is measured: UAA and XSUAA refuse, on the
  saml2-bearer grant, any assertion carrying `InResponseTo`, so an
  IdP-initiated assertion is the only kind a bearer flow can use.

  **An implementer of `IAssertionValidator` must now handle `undefined`**:
  compare `InResponseTo` when the field is present, require it absent when
  the field is absent. A caller building an `AssertionContext` is unaffected.

- `ValidatedAssertion.raw` is documented as the validator's unchanged input —
  a Response, or a bare Assertion where the validator accepts one — and no
  longer promises that a flow forwards it verbatim. `validate`'s parameter is
  documented to match. Documentation only.

## [1.2.0] - 2026-09-23

### Added

- **Authentication itself, from `@mcp-abap-adt/interfaces-adt` 8.0.0** — 25
  symbols in 17 files: `IAuthProvider`, `ICallbackServer`,
  `IAuthorizationStrategy`, `IAssertionValidator` with
  `ASSERTION_ERROR_CODES`, the token contracts (`ITokenProvider`,
  `ITokenRefresher`, `ITokenResult`, `ITokenRefreshResult`,
  `ITokenProviderOptions`, `TOKEN_PROVIDER_ERROR_CODES`), the OAuth2 grant
  constants with `OAuth2GrantType`, and `STORE_ERROR_CODES`.

  **The criterion is who imports a package.** `interfaces-adt` should be
  imported by `@mcp-abap-adt/adt-clients` and by whatever replaces its objects.
  It was not: `auth-broker`, `auth-stores` and `auth-providers` imported 10, 7
  and 17 names from it and **not one was an ADT contract**. Three repositories
  tracked the release rate of the ADT contract in order to describe
  authentication.

- **`AUTH_TYPE_JWT` and `AUTH_TYPE_BASIC`** — a bearer token and a user with a
  password, which mean the same thing off SAP entirely.

  `AUTH_TYPE_XSUAA` is **not** here, and neither is the `AuthType`/`AUTH_TYPES`
  union over all three: XSUAA is a BTP service, so a set that includes it
  describes what a *BTP* connection accepts. Both are
  `@mcp-abap-adt/interfaces-auth-sap` 1.0.0, which imports these two to build
  the union and does not re-export them.

### Not here, and why — two shapes that passed through unpublished

Both arrived from `interfaces-adt` 8.0.0 in this same release cycle and left
again before it shipped, so **nothing a consumer holds is removed**: this is a
minor. They are recorded because the reasoning is the placement rule, not
because a surface changed.

- **`ISessionState` and `ISessionStorage` are deleted, not placed.** They
  describe cookies, a CSRF token and a cookie store — HTTP session state, which
  is neither a credential nor an SAP contract, so no package's subject names
  them. Each carried *"No package imports this; it is removed in the next
  major"* since `interfaces` 45.0.0, and that premise was re-measured across
  every repository under development: the only occurrences are worktrees of the
  deleted facade. Decision 30 — a shape nothing accepts leaves at a major, and
  it leaves from `interfaces-adt` 9.0.0.

  A consumer that wants them declares them; what a cookie jar holds is an
  implementation's business, and `@mcp-abap-adt/connection` keeps its own.

- **Nothing SAP or BTP is here.** `ISapConfig`, `SapAuthType`,
  `SapConnectionType`, `IConfig`, `IConnectionConfig`, `IAuthorizationConfig`,
  `ICertificateMaterialLoader`, `IServiceKeyStore`, `ISessionStore`,
  `ITokenProviderResult`, `IValidatedAuthConfig`, `AuthMethodPriority` and
  `IHeaderValidationResult` went to `@mcp-abap-adt/interfaces-auth-sap` 1.0.0.

  `IConnectionConfig` is the one worth naming: it carries `sapClient`, a
  `serviceUrl` and an ABAP language, and reads `authType` as on-premise or
  cloud. It was briefly here on the reading that a connection configuration is
  generic; its fields say otherwise, and `ITokenProviderResult` followed it
  because it is the result of authenticating one.

### Dependencies

- `@mcp-abap-adt/interfaces-utils` is `^1.1.0`, for `ILogger`. This package had
  no dependency before 1.2.0.

## [1.1.0] - 2026-09-20

### Added

- **`IApiKeyCredential`**, **`IBearerCredential`** and **`ISecretLoginCredential`**
  — what an accepting side must be handed to authenticate, named by the protocol
  it speaks rather than by what the holder keeps or where the secret travels. A
  secret; a bearer token; an identity and a secret.

  Each carries a string-literal `kind`. Not because the members always differ —
  an api key and a bearer token do — but because a secret login has everything
  an api key asks for, so without the literal it would satisfy that contract
  outright; and because narrowing a union by the literal is how an acceptor
  reaches the members of one protocol. A literal rather than a `unique symbol`,
  so one object satisfies the same shape declared in two packages.

  Secrets and tokens are functions, asked on every use, so rotation and expiry
  stay with the implementation; an acceptor that held the string would present a
  stale one. `ISecretLoginCredential` keeps `principal` beside its secret,
  because a provider given the name and the secret separately can pair one
  principal's secret with another principal's name.

  No implementation ships with them, and no `{ kind: 'none' }` member: whether
  a site may run unauthenticated is that site’s decision, declared where it
  accepts credentials.

## [1.0.0] - 2026-09-16

### Added

- The package. Its contracts moved unchanged from `@mcp-abap-adt/interfaces`
  44.0.0, which re-exports them, deprecated, from 45.0.0. Why: decision 26 in
  `docs/architecture/DECISIONS.md`.
