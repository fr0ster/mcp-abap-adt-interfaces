# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-09-19

### Added

- **`IAssertionValidator`** — establishes that a SAML assertion is genuine,
  addressed to the caller, currently valid, and answers a request that was
  actually made, rejecting by throwing with a reason naming the check that
  failed. Validation is a strategy, like everything else pluggable here: a
  consumer with a trust model this package cannot anticipate can replace it
  wholesale, while the shipped default (arriving in a later `auth-providers`
  release) verifies the signature and refuses anything it cannot place.
- **`AssertionContext`** — what a provider knows about the login an assertion
  is answering: the expected `InResponseTo`, the audience, the ACS URL, and an
  optional trusted issuer for a validator that establishes trust some other way.
- **`ValidatedAssertion`** — what a validated assertion yields: an expiry that
  is never later than either the assertion's own `Conditions` or the bearer
  confirmation that was accepted, identity fields, and both the raw wire
  response and the signed XML that verified — kept distinct because holding the
  former does not make every byte of it trustworthy.
- **`IAssertionReplayStore`** and **`AssertionReplayKey`** — remembers
  assertions so a replay is refused, keyed by issuer and assertion ID together,
  since an assertion ID is unique only within the identity provider that minted
  it.
- **`ASSERTION_ERROR_CODES`** and **`AssertionErrorCode`** — the codes an
  assertion validator refuses with, starting with `ASSERTION_VALIDATION_ERROR`.
  They are their own set rather than additions to `TOKEN_PROVIDER_ERROR_CODES`:
  that set describes what can go wrong with ANY token provider, and SAML is one
  authentication mechanism among several, so it must not widen a contract every
  provider shares. A mechanism brings its own codes, as the store and network
  layers already do. Existing declarations are therefore untouched, and
  `tools/baseline-44.0.0.json` needs no regeneration.

## [1.0.0] - 2026-09-16

### Added

- The package. Its contracts moved unchanged from `@mcp-abap-adt/interfaces`
  44.0.0, which re-exports them, deprecated, from 45.0.0. Why: decision 26 in
  `docs/architecture/DECISIONS.md`.
