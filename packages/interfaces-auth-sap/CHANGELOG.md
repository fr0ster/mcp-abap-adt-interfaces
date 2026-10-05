# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.1.0] - 2026-10-05

### Changed

- **Accepts `@mcp-abap-adt/interfaces-auth` `^4.0.0 || ^5.0.0`** (it
  accepted `^4.0.0`). What this package's exported types reach in
  `interfaces-auth` — `ICertificateMaterial`, through
  `ICertificateMaterialLoader.load`, and `AUTH_TYPE_BASIC` / `AUTH_TYPE_JWT`,
  in the `AuthType` union — is unchanged in 5.0.0: their declarations are
  byte-identical in both, and this package's `dist` is byte-identical built
  against either. 5.0.0's breaking changes (the error contract, the removed
  code constants, the removed callback timeout) touch nothing declared here,
  so the range widens in a minor. `__typechecks__/certificateLoaderCompatibility.ts`
  holds it: the loaded material is assigned both ways to its 4.x shape and
  has the same field names, and the union is still `'jwt' | 'basic' | 'xsuaa'`
  — under either major.

### Migrating to 3.1.0

Nothing to do. Install `interfaces-auth` 5.x beside it when the rest of the
chain (`auth-providers` 6.0.0) needs it; 4.x keeps working.

## [3.0.0] - 2026-10-05

### Changed (breaking)

- **Requires `@mcp-abap-adt/interfaces-auth` ^4.0.0** (it accepted
  `^1.2.0 || ^2.0.0 || ^3.0.0`). This package's own declarations are
  byte-identical, but `ICertificateMaterialLoader.load` answers
  `interfaces-auth`'s `ICertificateMaterial`, whose optional fields 4.0.0
  declares `?: T | undefined`. Under `exactOptionalPropertyTypes`, code that
  keeps the loaded material in a shape of its own declaring `cert`, `key`,
  `pfx` or `passphrase` as `?: T` no longer compiles. Accepting 4.x within
  2.x would have handed that to a `^2` consumer on a fresh install, so the
  new range comes with a major: 2.x stays on `interfaces-auth` ≤ 3.
  `__typechecks__/certificateLoaderCompatibility.ts` holds the break (it
  fails against `interfaces-auth` 3.x).

### Migrating from 2.x

- Install `@mcp-abap-adt/interfaces-auth` ^4.0.0 beside this release.
- Without `exactOptionalPropertyTypes`, nothing else to do. With it, where
  `await loader.load(config)` is assigned to a type of your own, declare its
  optional fields `?: T | undefined` (or copy only the fields that are
  present). An `ICertificateMaterialLoader` you implement may now return a
  field set to `undefined`.
- Nothing else changed: same names, same shapes, same constants.

### Changed

- **Built under a stricter compiler and lint**: the repository's base
  `tsconfig` adds `noImplicitReturns`, `noFallthroughCasesInSwitch`,
  `noImplicitOverride`, `noUncheckedIndexedAccess` and
  `exactOptionalPropertyTypes`; lint fails on a warning.

## [2.0.1] - 2026-10-02

### Changed

- **Built from its own install.** The repository's packages are no longer npm
  workspaces (#116): this package builds and type-checks against its
  `@mcp-abap-adt/*` dependencies as published on the npm registry, never
  against a sibling's source, and carries its own `typescript` and
  `@types/node` as devDependencies. Its contract, its `dependencies` and the
  files it ships are unchanged — nothing to do for a consumer.

## [2.0.0] - 2026-10-01

### Removed

Moved, unchanged, to the new package `@mcp-abap-adt/interfaces-auth-broker`
1.0.0, and not re-exported (decision 34):

- `IConnectionConfig` → `@mcp-abap-adt/interfaces-auth-broker`
- `DestinationGrant` → `@mcp-abap-adt/interfaces-auth-broker`
- `IConfig` → `@mcp-abap-adt/interfaces-auth-broker`
- `ISessionStore` → `@mcp-abap-adt/interfaces-auth-broker`
- `IServiceKeyStore` → `@mcp-abap-adt/interfaces-auth-broker`
- `ITokenProviderResult` → `@mcp-abap-adt/interfaces-auth-broker`

This package held two subjects. What stays is the SAP system and its UAA
client — `ISapConfig`, `SapAuthType`, `SapConnectionType`, `IAuthorizationConfig`,
`ICertificateMaterialLoader`, `AUTH_TYPE_XSUAA` with `AuthType`/`AUTH_TYPES`,
and the validation results — which a token provider, the ABAP connection and
the ADT clients take. What left is the destination and its storage: the
broker's port, imported only by the stores, the broker and the servers that
build a broker. Decision 41.

`DestinationGrant` and the `grantType`, `expiresAt`, `oidc*` and `saml*` fields
of `IConnectionConfig` were prepared here as 1.2.0, which was never published;
they ship in `interfaces-auth-broker` 1.0.0, whose CHANGELOG describes them.

### Migration

Change the import path of the six names; nothing else changes — same names,
same shapes:

```ts
- import type { IConnectionConfig, ISessionStore } from '@mcp-abap-adt/interfaces-auth-sap';
+ import type { IConnectionConfig, ISessionStore } from '@mcp-abap-adt/interfaces-auth-broker';
```

A consumer that implements a store, or builds a broker, adds
`@mcp-abap-adt/interfaces-auth-broker@^1.0.0` and keeps
`interfaces-auth-sap@^2.0.0` for `IAuthorizationConfig` and `ISapConfig`. A
consumer that imports none of the six — a provider, a connection, a client —
only raises its range to `^2.0.0`.

### Changed

- The README states the `interfaces-auth` range the package accepts since
  1.1.0 (`^1.2.0 || ^2.0.0 || ^3.0.0`); it still named the 1.0.1 range.

## [1.1.0] - 2026-09-29

### Added

- **`'snc'`** in `SapAuthType` and in `IConnectionConfig.authType`. A consumer
  that switches exhaustively on either union gets a new case to handle.
- **`sncPartnerName`, `sncQop`, `sncLib`, `sncMyName`** (optional strings) on
  `ISapConfig` and `IConnectionConfig`. On `IConnectionConfig` because that is
  what the stores hand the broker: an SNC-only destination needs no
  authorization config, no username and no password. `sncQop` is one of `1`,
  `2`, `3`, `8`, `9`.

### Changed

- `@mcp-abap-adt/interfaces-auth` accepted as `^1.2.0 || ^2.0.0 || ^3.0.0`:
  this package uses `ICertificateMaterial` and the auth-type constants, which
  3.0.0 does not change.

## [1.0.1] - 2026-09-25

### Changed

- **`@mcp-abap-adt/interfaces-auth` accepted as `^1.2.0 || ^2.0.0`.** This
  package uses `AUTH_TYPE_BASIC`, `AUTH_TYPE_JWT` and `ICertificateMaterial`,
  none of which 2.0.0 changes (it made `AssertionContext.expectedInResponseTo`
  optional). With `^1.2.0` alone, a consumer on `interfaces-auth` 2.0.0 got a
  second, private copy of 1.x installed under this package. Nothing in this
  package's own declarations changes.

## [1.0.0] - 2026-09-23

### Added

- **The package — the SAP and BTP half of authentication**, 13 symbols from
  `@mcp-abap-adt/interfaces-adt` 8.0.0 and one new: `ISapConfig`,
  `SapAuthType`, `SapConnectionType`, `IConfig`, `IConnectionConfig`,
  `IAuthorizationConfig`, `ICertificateMaterialLoader`, `IServiceKeyStore`,
  `ISessionStore`, `ITokenProviderResult`, `IValidatedAuthConfig`,
  `AuthMethodPriority`, `IHeaderValidationResult`, and `AUTH_TYPE_XSUAA` with
  the `AuthType`/`AUTH_TYPES` union over all three authentication types.

  **Why a second authentication package rather than one.** Everything here left
  `interfaces-adt` because none of it is ADT — but half of what left is not SAP
  either. `AUTH_TYPE_JWT` is a bearer token and `AUTH_TYPE_BASIC` is a user with
  a password; a token provider, an OAuth grant and a credential mean the same
  thing off SAP entirely. Those are `@mcp-abap-adt/interfaces-auth` 1.2.0. What
  is here names something SAP or BTP owns: an `sap-client`, a service key, a
  destination, a UAA client, an RFC connection type, or **XSUAA — which is a BTP
  service, not a way of authenticating in general**, and therefore takes the
  union with it, because a set including it describes what a *BTP* connection
  accepts.

  The boundary was computed, not judged: the files naming XSUAA, UAA or
  `sap-client` in their **code** — a comment mentioning ABAP proves nothing —
  closed transitively over imports. That is why `ITokenProviderResult` is here
  and `ITokenProvider` is not: the result carries an `IConnectionConfig`.

- **`AUTH_TYPE_JWT` and `AUTH_TYPE_BASIC` are imported and deliberately not
  re-exported.** They are needed to build the union and a consumer takes them
  from the package that declares them. Forwarding is what decision 34 removed
  from this family; re-adding it one package down would be the same defect at a
  smaller scale.

### Dependencies

- **`@mcp-abap-adt/interfaces-auth` `^1.2.0`, and nothing else.**
  `interfaces-utils` was declared here at first and no file imports it: `auth`
  takes it for `ILogger`, which makes it that package's business and a
  transitive detail here. No cycle: `auth-sap` → `auth` → `utils`, checked by
  `tools/check-graph.js`, which now also rejects a dependency nothing imports.
