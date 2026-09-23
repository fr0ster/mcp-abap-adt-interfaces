# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

- `@mcp-abap-adt/interfaces-auth` `^1.2.0`, `@mcp-abap-adt/interfaces-utils`
  `^1.1.0`. No cycle: `auth-sap` → `auth` → `utils`, checked by
  `tools/check-graph.js`.
