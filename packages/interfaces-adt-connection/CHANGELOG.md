# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.1] - 2026-10-02

### Changed

- **Built from its own install.** The repository's packages are no longer npm
  workspaces (#116): this package builds and type-checks against its
  `@mcp-abap-adt/*` dependencies as published on the npm registry, never
  against a sibling's source, and carries its own `typescript` and
  `@types/node` as devDependencies. Its contract, its `dependencies` and the
  files it ships are unchanged — nothing to do for a consumer.

## [1.0.0] - 2026-09-26

### Added

- The ABAP connection contract, moved unchanged from
  `@mcp-abap-adt/interfaces-adt` 10.0.0 (`src/connection/`): `IAbapConnection`,
  `IAdtWireResponse`, `IAbapRequestOptions`, `ISessionLifecycleAware`,
  `ICriticalSection`, `IRequestProfiling`, `IDeferredResponseConnection`,
  `ADT_SESSION_ERROR`, `AdtSessionErrorCode`, `ITimeoutConfig`. Same names,
  same shapes; only the package changed. Decision 38.
