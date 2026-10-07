# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [7.1.0] - 2026-10-07

### Added
- `CONFIG_FIELDS` names `renewal` and `persistence`, so a token provider can
  refuse a missing renewal strategy at construction (`configuration`,
  `required-fields-missing`, `fields: ['renewal']`) like any other required
  collaborator. Additive; `onTokens` stays listed until the next major.

## [7.0.0] - 2026-10-07

The renewal strategy and the persistence strategy as contracts, the kind the
renewal strategy's stop needs, and the removal of what they replace.

**Migration.** See "Migrating to 7.0.0" in the README. A consumer handling every
kind or every configuration case adds one branch each; whoever read
`ITokenResult.refreshTokenDisposition` reads the persistence report instead;
`'on-tokens-hook'` and `'browser-launch-failed'` are gone.

### Added

- **`IRenewalStrategy`** and its types (`src/token/renewal.ts`): `RenewalSituation`,
  `RenewalCause`, `RenewalStepOutcome`, `RenewalDecision` (`ifCut` required on
  every `refresh`), `RenewalAbortObservation`, `SentRefreshToken`, with the
  lists `RENEWAL_TRIGGERS`, `RENEWAL_MOMENTS`, `REJECTION_READINGS`,
  `RENEWAL_STEPS` and their unions.
- **`ITokenPersistence`** and its types (`src/token/persistence.ts`):
  `PersistenceReport` (events `credential` and `refresh-token-discarded`, each
  carrying the credential), `ReportedCredential`, `ReportedRefreshToken`.
- **Kind `renewal-declined`**, facts `{ trigger: RenewalTrigger }`: the renewal
  strategy stopped with no step taken and no other refusal that explains it.
- **Configuration case `invalid-value`** (`fields`, no diagnostics): a
  configured value that is present but unusable.
- **`OPERATIONS`**: `'renewal-strategy'`, `'persisting-tokens'`.

### Removed

- `ITokenResult.refreshTokenDisposition`, the type `RefreshTokenDisposition`
  and `REFRESH_TOKEN_DISPOSITIONS`.
- `Operation` `'on-tokens-hook'` (renamed `'persisting-tokens'`).
- `InteractiveOutcome` `'browser-launch-failed'` and its `code` fact: a
  launcher's failure no longer ends a login.

## [6.0.0] - 2026-10-05

Two optional fact fields on `interactive-login`, so the renderer in
`@mcp-abap-adt/auth-errors` keeps two sentences the providers say today
without losing a fact.

**Why it is a major.** 5.0.0's facts and diagnostics are closed types: every
kind and outcome declares the keys of the others as `?: never`. Adding a field
to one outcome therefore changes the shape of every other, and a consumer's
object literal, spread or handler map written against 5.0.0 can stop
compiling. Any change to the shape of facts or diagnostics is a major here, an
optional field added included.

**Migration.** A consumer on 5.x widens its range to include `^6.0.0`; nothing
is removed or renamed, and no kind, outcome or required field changes. Code
that builds or reads `interactive-login` facts needs no edit unless it spreads
facts across outcomes; it may now read the two new optional facts.

### Added

- **`aborted` names its strategy**: `strategy?: 'browser' | 'manual'`
  (`InteractiveLoginStrategy`, as `disposed` carries it), so a manual login
  that was aborted is told apart from a browser one.
- **`failed` carries a registered OAuth error code**: `oauthError?:
  OAuthErrorCode` — a registered code only, as the browser login's words put it
  today.
- Every other outcome and every other kind declares both fields `?: never`,
  through the same closing as 5.0.0's facts, so a spread or a variable carrying
  one does not assign. Type tests pin the kinds, `INTERACTIVE_OUTCOMES` and a
  handler map written against 5.0.0 unchanged.

### Changed

- **The versioning rule** in the README: any change to the shape of facts or
  diagnostics — a field added, removed, made required or narrowed — is a
  major, because the types are closed.

## [5.0.0] - 2026-10-05

The error contract: what a provider, a logon target and a connection report
when they cannot authenticate is a typed error with a closed set of kinds and
facts drawn from allowlists, not a sentence. Types and constants only, as
always; the builders, the classification and the two exhaustiveness helpers
are the new package `@mcp-abap-adt/auth-errors`.

### Added

- **`IAuthProviderError`** (`src/error/`): a frozen object with `kind`,
  `facts`, `reason`, `hint?` and, for three kinds, `variant` and optional
  `diagnostics`. Sixteen kinds, listed in `AUTH_PROVIDER_ERROR_KINDS`
  (`AuthProviderErrorKind`): `configuration`, `client-certificate`,
  `client-authentication`, `request-failed`, `tls`, `interactive-login`,
  `saml-assertion`, `snc`, `credential-refused`, `system-refused`,
  `renewal-unchanged`, `token-binding`, `not-prepared`, `logon-target`,
  `connection`, `unknown`. `AuthProviderErrorOf<K>` is the error of one kind;
  `SamlAssertionError`, `SncError` and `ConfigurationError` are one object type
  per `variant` (the rule, the problem, the case), so
  `e.kind === 'snc' && e.variant === 'library-not-found'` narrows `facts` and
  `diagnostics` too. A variant declares only the diagnostic fields it may
  carry (`SAML_RULE_DIAGNOSTIC`, `SNC_PROBLEM_DIAGNOSTICS`,
  `CONFIG_CASE_DIAGNOSTICS`); reading another is a compile error.
- **The brand.** An `IAuthProviderError` carries a property keyed by a symbol
  this package declares and does not export: an object literal, a class
  instance or parsed JSON is not one to the compiler. Only
  `@mcp-abap-adt/auth-errors` mints one.
- **`IAuthProviderFailure`** — the `Error` (`name: 'AuthProviderFailure'`)
  that `getTokens()` / `refreshTokens()` reject with, carrying the error as
  `error`. Read a rejection with `readFailure(thrown, operation)` from
  `auth-errors`.
- **The allowlists**, each a frozen `as const` array beside its union:
  `CONFIG_FIELDS`, `CONFIG_CASES`, `ALLOWED_VALUE_SETS` (with `SNC_QOP_VALUES`
  and `BASIC_ENCODINGS`), `OPERATIONS`, `REQUEST_PROBLEMS`, `SYSTEM_CODES`,
  `TLS_FAILURE_CODES`, `OAUTH_ERROR_CODES`, `RFC_KEYS`, `ASSERTION_CHECKS`,
  `ASSERTION_RULES`, `BEARER_CANDIDATE_REASONS`, `SAML_STATUS_CODES`,
  `SNC_PROBLEMS`, `SNC_CANDIDATE_SOURCES`, `SNC_UNUSABLE_REASONS`,
  `SNC_ARCHS`, `INTERACTIVE_OUTCOMES`, `INTERACTIVE_LOGIN_STRATEGIES`,
  `CREDENTIAL_KINDS`, and the per-kind discriminants
  (`CLIENT_CERTIFICATE_PROBLEMS`, `CLIENT_AUTHENTICATION_PROBLEMS`,
  `TOKEN_BINDING_PROBLEMS`, `NOT_PREPARED_PROVIDERS`, `LOGON_TARGET_REFUSALS`,
  `LOGON_TARGET_WIRES`, `CONNECTION_PROBLEMS`, `CONNECTION_MOMENTS`,
  `SYSTEM_REFUSED_VERDICTS`, `RENEWAL_UNCHANGED_SOURCES`,
  `REJECTION_MOMENTS`). A fact holds a member of one of them, a branded
  integer — `HttpStatus`, `Count`, `Port` — or a flag; never free text.
- **Cancellation.** `ITokenRequestOptions { signal? }`, taken by
  `ITokenProvider.getTokens(options?)` and
  `IRefreshableTokenProvider.refreshTokens(options?)`: an abort releases that
  caller only (`interactive-login`, outcome `aborted`), and the shared login is
  aborted once every caller waiting on it has aborted.
  `AuthorizationRequest.signal` is the provider's signal for one login, which a
  strategy must honour as it honours its own. Optional parameters and fields:
  an implementation written for 4.x still satisfies the types.
- **`ITokenResult.refreshTokenDisposition`** (optional): `'keep'`,
  `'replace'` or `'clear'` (`REFRESH_TOKEN_DISPOSITIONS`) — what the result
  means for a stored refresh token. Absent, read it as 4.x did: a
  `refreshToken` present replaces, none keeps.

### Changed (breaking)

- **`IAuthRefusal` is `IAuthProviderError`.** `AuthOutcome`'s Oops carries a
  minted error, so `{ ok: false, refusal: { reason, hint } }` no longer
  compiles — a provider, a logon target or a test double builds its refusal
  through an `auth-errors` builder. Reading `refusal.reason` / `refusal.hint`
  compiles unchanged. `IAuthProvider`'s four methods are unchanged in shape;
  their JSDoc now says a method never throws.
- **A consumer that decides on an error handles every kind, checked by the
  compiler:** `matchKind(error, handlers)` or a `switch (error.kind)` whose
  `default` calls `unreachableKind(error)`, both from `auth-errors`. A new kind
  or a new member of a discriminant a consumer switches on is a major of this
  package; a new member of a code list (`SystemCode`, `TlsFailureCode`,
  `OAuthErrorCode`, `RfcKey`, `ConfigField`, `SamlStatusCode`) is a minor, so
  do not assert exhaustiveness over a code list.

### Removed

- **`TOKEN_PROVIDER_ERROR_CODES` / `TokenProviderErrorCode` and
  `ASSERTION_ERROR_CODES` / `AssertionErrorCode`.** They named thrown classes
  that `auth-providers` 6.0.0 no longer throws; a failure is an
  `IAuthProviderFailure` whose `error.kind` says what went wrong.
  `STORE_ERROR_CODES` stays.
- **`ICallbackServerOptions.timeoutMs`.** A login has no built-in bound: a
  callback scope ends on a result, the identity provider's explicit error,
  `fail`, or an abort of `signal`. A consumer that wants a bound passes
  `AbortSignal.timeout(ms)`. `IAuthorizationStrategy` no longer names a
  timeout among what a strategy owns.

### Migrating to 5.0.0

| On 4.x a consumer… | On 5.0.0 |
|---|---|
| reads `refusal.reason` / `refusal.hint` | compiles unchanged |
| builds `{ ok: false, refusal: { reason, hint } }` (a provider, a target, a test double) | does not compile (the brand); build it with an `@mcp-abap-adt/auth-errors` builder |
| copies or spreads a refusal into a new object | compiles (the spread keeps the brand), but the producers' shape check refuses it; relay the error object itself |
| matches words to decide (`reason.includes('expired')`) | switches on `refusal.kind` and `facts`, through `matchKind` or `unreachableKind` |
| catches `instanceof TokenProviderError` / `ValidationError` / `CertificateMaterialError` / … from `getTokens()` | `readFailure(thrown, operation)` from `auth-errors`, then switches on `error.kind` |
| calls `refusalWords(error, what)` (auth-providers) | `classify(error, operation)` from `auth-errors`; `.reason` / `.hint` |
| imports `TOKEN_PROVIDER_ERROR_CODES` or `ASSERTION_ERROR_CODES` | switches on `error.kind` (`saml-assertion` for a refused assertion) |
| passes `timeoutMs` to a callback server | passes `signal: AbortSignal.timeout(ms)`; without a signal the scope waits for a result |
| implements `ITokenProvider` / `IRefreshableTokenProvider` | nothing to do; take `options?: ITokenRequestOptions` to honour cancellation, and set `refreshTokenDisposition` on each result |
| implements `IAuthorizationStrategy` | honour `request.signal`: end the login, release what it holds, then reject |

`@mcp-abap-adt/interfaces-auth-sap` 3.1.0 accepts `^4.0.0 || ^5.0.0`, so a
consumer moving to 5.0.0 keeps one copy of this package.

### Changed

- `tools/check-graph.js`: outside `src/error/`, this package takes only
  `IAuthProviderError` and `IAuthProviderFailure` from there — the
  normal-course contracts do not name a kind.
- Type tests: `__typechecks__/errorContract.ts` and
  `__typechecks__/outcomeAndCancellation.ts`; the existing ones no longer
  build literal refusals, pass `timeoutMs` or import the removed codes.

## [4.0.0] - 2026-10-05

### Changed (breaking)

- **Optional fields of the objects a provider hands out accept an explicit
  `undefined`** — declared `?: T | undefined` instead of `?: T`. A provider
  builds these objects with an optional field present and `undefined`
  (`refreshToken: undefined`), and a consumer merges them
  (`{ ...stored, ...result }`); under `exactOptionalPropertyTypes` the old
  declaration forbade that and forced a cast. Widening only: no field is
  renamed, added or removed, and every value the old declaration accepted is
  still accepted. Without `exactOptionalPropertyTypes` nothing changes, and
  reading a field is unchanged with it (an optional field was already
  `T | undefined` to read). **One case breaks**, and only under
  `exactOptionalPropertyTypes`: assigning one of these objects to a
  consumer's own type that declares the same field `?: T` (without
  `| undefined`) no longer compiles. A consumer on `^3.x` would have received
  that through a minor, so this is a major
  (`__typechecks__/majorCompatibility.ts` assigns each widened contract to its
  3.x shape and fails against 3.x). The fields:
  - `ITokenResult`: `refreshToken`, `expiresIn`, `expiresAt`, `tokenType`
  - `AuthorizationRequest`: `logger`
  - `ICallbackServerOptions`: `signal`, `logger`
  - `AssertionContext`: `expectedInResponseTo`, `expectedIssuer`, `logger`
  - `ValidatedAssertion`: `nameId`, `sessionIndex`, `attributes`
  - `ICertificateMaterial`: `cert`, `key`, `pfx`, `passphrase`

### Migrating from 3.x

Nothing to do without `exactOptionalPropertyTypes`, or when the code only
reads these fields or builds these objects. With the flag, where a value of
one of these types is assigned (or spread) into a type of your own that
declares the same field `?: T`, the compiler now reports `undefined` is not
assignable. Either widen your field to `?: T | undefined` — the shape the
contract now has — or do not enable `exactOptionalPropertyTypes`. Copying
only the fields that are present (`...(r.refreshToken === undefined ? {} :
{ refreshToken: r.refreshToken })`) also works where your type must stay
`?: T`.
- **Built under a stricter compiler and lint.** The repository's base
  `tsconfig` adds `noImplicitReturns`, `noFallthroughCasesInSwitch`,
  `noImplicitOverride`, `noUncheckedIndexedAccess` and
  `exactOptionalPropertyTypes`, and lint fails on a warning. Two compile-only
  checks leave an optional field out instead of setting it to `undefined`
  (`IAuthRefusal.hint`, `ITokenRequestAuthentication.endpoint`, neither of them
  widened); a new one sets every widened field to `undefined`.

## [3.2.0] - 2026-10-04

### Added

- **`ITokenRequestDraft.tokenEndpoint`** (optional): the authorization server's
  token endpoint, also for a request that goes elsewhere (the device
  authorization). A client assertion names it as its audience (RFC 7523);
  Keycloak refuses an assertion whose `aud` is the device endpoint. Additive:
  nothing existing changes.

## [3.1.0] - 2026-10-04

### Added

- **`IClientAuthentication`**, with `ITokenRequestDraft` and `ITokenRequestAuthentication`:
  how a token provider's client authenticates to the authorization server.
  `authenticate(draft)` returns the endpoint, form parameters and headers to
  add to one token request; optional `tlsMaterial()` returns the
  `ICertificateMaterial` the client presents in the handshake. Types only;
  nothing existing changes.
- **`CERTIFICATE_MATERIAL_ERROR` and `CLIENT_AUTHENTICATION_ERROR`** in
  `TOKEN_PROVIDER_ERROR_CODES` (and so in `TokenProviderErrorCode`): client
  certificate material that is incomplete or unusable, and a client-authentication
  strategy that cannot authenticate the token request.

## [3.0.1] - 2026-10-02

### Changed

- **Built from its own install.** The repository's packages are no longer npm
  workspaces (#116): this package builds and type-checks against its
  `@mcp-abap-adt/*` dependencies as published on the npm registry, never
  against a sibling's source, and carries its own `typescript` and
  `@types/node` as devDependencies. Its contract, its `dependencies` and the
  files it ships are unchanged — nothing to do for a consumer.

## [3.0.0] - 2026-09-29

### Changed

- **Breaking: `IAuthProvider` is the process's lifecycle, and every provider
  answers all of it.** `prepare()`, `establish(logon)`, `authorize(request)`
  and `rejected(rejection)`, each returning an `AuthOutcome` — Ok, or Oops
  with an `IAuthRefusal { reason, hint? }`. The wire hands the provider an
  `ILogonTarget` (`tlsMaterial`, `logonParameters`) and an `IRequestTarget`
  (`header`, `cookies`); the provider writes into them. A process calls the
  same sequence for every provider — basic, token, SAML, certificate, SNC — and
  never asks what it holds. Decision 40.

### Added

- `AuthOutcome`, `IAuthRefusal`, `ILogonTarget`, `IRequestTarget`,
  `IAuthRejection`.

### Removed

- **Breaking:** `IAuthProvider.authorizationHeader()`, `cookies()` and
  `transportMaterial()` — `authorize()` and `establish()` write into the
  wire's targets instead.
- **Breaking:** `IRenewableCredential` — renewal is `rejected()`, which every
  provider answers (a token renews and says Ok; a password says Oops "user or
  password refused"). No narrowing on `renew` remains.

### Migrating an implementation

| Was | Now |
|---|---|
| `prepare(): Promise<void>` | `prepare(): Promise<AuthOutcome>` — return Oops instead of throwing |
| `authorizationHeader()` → value | `authorize(r)`: `r.header('Authorization', value)` |
| `cookies()` → value | `authorize(r)`: `r.cookies(value)` |
| `transportMaterial()` → material | `establish(l)`: `return l.tlsMaterial(material)` |
| `renew()` (`IRenewableCredential`) | `rejected(x)`: renew, then Ok; or Oops |
| — (RFC read user/password from config) | `establish(l)`: `l.logonParameters({ user, passwd })` |

## [2.1.0] - 2026-09-26

### Added

- **`IRefreshableTokenProvider`** — `ITokenProvider` plus `refreshTokens()`,
  which obtains a new token and never answers from the cache. `getTokens()`
  answers from the cache while the token looks valid, so a caller holding a
  401 had no way to ask for another: `@mcp-abap-adt/auth-broker`'s
  `refreshToken()` called `getToken()` and got the refused token back, which
  broke the "always a new token" promise of `ITokenRefresher.refreshToken()`.
  A separate interface rather than an option on `getTokens()`, so a caller
  that needs the refresh requires it in its type instead of trusting that a
  provider honours a flag. Decision 39.

## [2.0.1] - 2026-09-26

### Changed

- `IAssertionReplayStore.recordIfUnseen`: `retainUntil` was documented as the
  assertion's "expiry plus any clock skew". It is the last instant a
  validator would still accept the assertion, which can be later than the
  expiry it reports — `@mcp-abap-adt/auth-providers` 4.0.0 retains until the
  latest bearer confirmation that still admits it. Documentation only.

## [2.0.0] - 2026-09-25

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
