# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
