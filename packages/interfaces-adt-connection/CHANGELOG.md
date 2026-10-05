# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0] - 2026-10-05

### Changed (breaking)

- **An answer whose types the caller did not name is `unknown`, not `any`.**
  `IAdtWireResponse<T = unknown, D = unknown>` and
  `IAbapConnection.makeAdtRequest<T = unknown, D = unknown>` — both were
  `= any`. Code that reads `answer.data.someField` without naming the type
  compiled against anything, a typo included; now it does not compile until
  the type is named or checked. The same holds for every type that names
  `IAdtWireResponse` without type arguments, in this package and in
  `@mcp-abap-adt/interfaces-adt` (13.0.0). Names, fields and runtime are
  unchanged.

### Migrating from 1.x

A consumer on 1.x does one of these where the compiler now reports an error:

- **Name the type** the request answers, when it is known:
  `connection.makeAdtRequest<string>(options)`, or
  `IAdtWireResponse<string>` for a stored answer.
- **Narrow `unknown`** where the shape is checked at run time anyway:
  `typeof answer.data === 'string'`, or a type guard for an object, before
  reading a field. `data && typeof data === 'object'` narrows to `object`,
  which has no fields: use `'systemID' in data` or a guard.
- **A stub or mock of `makeAdtRequest`** that returns a fixed shape is no
  longer assignable to the generic signature (with `any` it was): declare it
  generic, `async <T = unknown, D = unknown>(options) => ({ … data: body as T … })`,
  or annotate its return as `Promise<IAdtWireResponse<any, any>>` in the test.

Measured before release, with this package's 2.0.0 declarations overlaid on a
copy of each consumer (`tsc --noEmit`, nothing changed in those repositories):
`@mcp-abap-adt/connection` 0 new errors; `adt-clients` 8 — 5 in
`src/utils/systemInfo.ts` (fields read off an `object`), 3 in unit-test stubs
of `makeAdtRequest`; `mcp-abap-adt` 1, a test helper's `makeAdtRequest` stub.

### Changed

- **Built under a stricter compiler and lint**: the repository's base
  `tsconfig` adds `noImplicitReturns`, `noFallthroughCasesInSwitch`,
  `noImplicitOverride`, `noUncheckedIndexedAccess` and
  `exactOptionalPropertyTypes`; lint fails on a warning and on any `any`.
  A new compile-only check (`__typechecks__/wireDefaults.ts`) holds the
  `unknown` defaults.

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
