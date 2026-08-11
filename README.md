# @mcp-abap-adt/interfaces

[![Stand With Ukraine](https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/badges/StandWithUkraine.svg)](https://stand-with-ukraine.pp.ua)

Shared interfaces for MCP ABAP ADT packages.

This package provides all TypeScript interfaces used across the MCP ABAP ADT ecosystem, ensuring consistency and type safety across all packages.

This package exists to be the **one import point** for the contract: object
configs/states, client options, abapGit, batch payloads, executors, and
debugger session parameters all live here rather than in
`@mcp-abap-adt/adt-clients`, so a consumer imports one package and has exactly
one seam to override at — a custom `IAdtContentTypes`, a connection that
implements `IDeferredResponseConnection`, and so on — without reaching into
the implementation package to do it. Concrete implementations (parsers,
request builders, the shipped `IAdtContentTypes` classes) stay in
`adt-clients`; this package never depends on it.

## Installation

```bash
npm install @mcp-abap-adt/interfaces
```

## Overview

This package contains all interfaces organized by domain:

- **`adt/`** - ADT object operations interfaces (IAdtObject, operation options, error codes), plus the abapGit client contract, batch payload shapes, ADT client options, and the content-type/header contract
- **`auth/`** - Core authentication interfaces (configs, auth types)
- **`token/`** - Token-related interfaces (token provider, results, options)
- **`session/`** - Session storage interface
- **`serviceKey/`** - Service key storage interface
- **`connection/`** - Connection and realtime transport interfaces (AbapConnection, request options, WebSocket transport contracts, deferred-response detection)
- **`execution/`** - Execution contracts for runnable entities (`IExecutor`, class/program executors with profiling)
- **`feeds/`** - Feed access interfaces (IFeedRepository, feed entries, system messages, gateway errors)
- **`runtime/`** - Runtime analysis domain interfaces (debugger, profiler, traces, dumps, logs, memory snapshots, etc.)
- **`sap/`** - SAP-specific configuration (SapConfig, SapAuthType)
- **`service/`** - Business service lifecycle contracts (`IAdtService`, service binding params)
- **`storage/`** - Storage interfaces (session storage, state)
- **`logging/`** - Logging interfaces (ILogger, LogLevel enum)
- **`validation/`** - Validation interfaces
- **`utils/`** - Utility types and interfaces

## Interface Naming Convention

**All interfaces start with `I` prefix** (e.g., `IAbapConnection`, `ISapConfig`, `ITokenProvider`).

This ensures consistency across all packages and follows TypeScript naming conventions for interfaces.

## Usage

### Basic Imports

```typescript
import {
  IAuthorizationConfig,
  IConnectionConfig,
  ISessionStore,
  IServiceKeyStore,
  ITokenProvider,
  IAbapConnection,
  IExecutor,
  IWebSocketTransport,
  IWebSocketMessageEnvelope,
  ISapConfig,
  ILogger,
  TOKEN_PROVIDER_ERROR_CODES,
  STORE_ERROR_CODES
} from '@mcp-abap-adt/interfaces';
```

### ADT Object Operations

```typescript
import {
  IAdtObject,
  IAdtOperationOptions,
  AdtObjectErrorCodes,
  LogLevel
} from '@mcp-abap-adt/interfaces';

// Example: Read with long polling
const domain = await adtDomain.read(
  { domainName: 'Z_TEST' },
  'active',
  { withLongPolling: true } // Wait until object is available
);

// Example: Read metadata with long polling and version selection
const metadata = await adtDomain.readMetadata(
  { domainName: 'Z_TEST' },
  { withLongPolling: true, version: 'active' }
);
```

### Error Handling

```typescript
import {
  TOKEN_PROVIDER_ERROR_CODES,
  STORE_ERROR_CODES
} from '@mcp-abap-adt/interfaces';

// Token Provider Error Codes
try {
  await tokenProvider.getTokens(authConfig);
} catch (error: any) {
  if (error.code === TOKEN_PROVIDER_ERROR_CODES.VALIDATION_ERROR) {
    console.error('Invalid auth config:', error.missingFields);
  } else if (error.code === TOKEN_PROVIDER_ERROR_CODES.REFRESH_ERROR) {
    console.error('Token refresh failed:', error.cause);
  }
}

// Store Error Codes
try {
  const authConfig = await serviceKeyStore.getAuthorizationConfig('TRIAL');
} catch (error: any) {
  if (error.code === STORE_ERROR_CODES.FILE_NOT_FOUND) {
    console.error('Service key not found:', error.filePath);
  } else if (error.code === STORE_ERROR_CODES.PARSE_ERROR) {
    console.error('Invalid JSON:', error.filePath, error.cause);
  } else if (error.code === STORE_ERROR_CODES.INVALID_CONFIG) {
    console.error('Missing fields:', error.missingFields);
  }
}
```

## Responsibilities and Design Principles

### Core Development Principle

**Interface-Only Communication**: This package defines **interfaces only**. It contains no implementations, no dependencies on other packages (except type-only imports), and serves as the single source of truth for all interface definitions.

### Package Responsibilities

This package is responsible for:

1. **Defining interfaces**: Provides all TypeScript interfaces used across MCP ABAP ADT packages
2. **Type safety**: Ensures consistent type definitions across all packages
3. **Version management**: Single version for all interfaces
4. **Documentation**: Centralized documentation for all interfaces

#### What This Package Does

- **Defines interfaces**: All interfaces used across MCP ABAP ADT packages
- **Organizes by domain**: Interfaces grouped by functional domain
- **Follows naming convention**: All interfaces start with `I` prefix
- **Type-only exports**: No runtime code, only type definitions

#### What This Package Does NOT Do

- **Does NOT implement anything**: This is a type-only package
- **Does NOT have runtime dependencies**: Only devDependencies for TypeScript compilation
- **Does NOT know about implementations**: Interfaces are independent of implementations

## Interface Domains

### ADT Domain (`adt/`)
- `IAdtObject<TConfig, TReadResult>` - High-level ADT object operations interface
  - Provides simplified CRUD operations with automatic operation chains, error handling, and resource cleanup
  - Methods: `validate()`, `create()`, `read()`, `readMetadata()`, `readTransport()`, `update()`, `delete()`, `activate()`, `check()`
  - All read methods support optional `withLongPolling` parameter for waiting until object becomes available
  - Supports full operation chains:
    - Create: validate → create → check → lock → check(inactive) → update → unlock → check → activate
    - Update: lock → check(inactive) → update → unlock → check → activate
    - Delete: check(deletion) → delete
- **Capability atoms** (`adt/IAdtCapabilities.ts`, since 11.2.0) — small interfaces that partition the 13 methods of `IAdtObject`, each method belonging to exactly one, so a consumer can depend on just the capability it needs instead of the whole contract:
  - `IAdtCreatable` — `create`
  - `IAdtReadable` — `read`, `readMetadata`
  - `IAdtModifiable` — `update`, `delete`
  - `IAdtCrud` — the composite of the three above, retained for consumers that genuinely do all five
  - `IAdtValidatable` — `validate`
  - `IAdtCheckable` — `check`
  - `IAdtActivatable` — `activate`
  - `IAdtLockable` — `lock`, `unlock`
  - `IAdtVersionable` — `getVersions`, `getVersionSource`
  - `IAdtTransportAware` — `readTransport`
  - `IAdtSearchable` — `search`; not per-object-type, implemented by whatever locates objects
  - `IAdtTestRunnable` / `IAdtCdsTestRunnable` (`adt/IAdtUnitTest.ts`, since 13.1.0) — running ABAP Unit and collecting the outcome. Kept with the unit-test types rather than in `IAdtCapabilities.ts`, because unlike the atoms above it is not generic over an object type.
  - Since 13.0.0 `IAdtObject` is *assembled* from these atoms rather than declaring the methods itself, so the atoms are the definitions and the composite cannot drift from them. The shape is unchanged — a compile-time proof in the same file still asserts both directions of the equivalence, which now also catches a method added to `IAdtObject` directly instead of to an atom.
  - The grain follows ADT, not taste: `lock`/`unlock` and `getVersions`/`getVersionSource` are honoured or refused as pairs, and `update`+`delete` split from `create`/`read`/`readMetadata` because objects that record an event (unit-test runs, transport requests) are never edited afterwards.
- `IAdtOperationOptions` - Unified options for create and update operations
  - Fields: `activateOnCreate`, `activateOnUpdate`, `deleteOnFailure`, `sourceCode`, `xmlContent`, `timeout`
- `AdtObjectErrorCodes` - Error code constants for ADT object operations
  - Constants: `OBJECT_NOT_FOUND`, `OBJECT_NOT_READY`, `VALIDATION_FAILED`, `CREATE_FAILED`, `UPDATE_FAILED`, `DELETE_FAILED`, `ACTIVATE_FAILED`, `CHECK_FAILED`, `LOCK_FAILED`, `UNLOCK_FAILED`
- `IAdtObjectState` - Base state interface for ADT object operations
  - Fields: `validationResponse`, `createResult`, `lockHandle`, `updateResult`, `checkResult`, `unlockResult`, `activateResult`, `deleteResult`, `readResult`, `metadataResult`, `transportResult`, `errors`
- `IAdtObjectConfig` - Base configuration interface for ADT objects
  - Common fields: `packageName`, `description`, `transportRequest`
- **Per-object-type contract types** (`IAdt<Object>.ts`, one file per ADT object type — class, program, interface, table, domain, dataElement, ddl, structure, package, functionGroup/Module/Include, behaviorDefinition/Implementation, metadataExtension, enhancement, accessControl, serviceDefinition/Binding, transformation, scalarFunction(Implementation), tableType, appendStructure, authorizationField, featureToggle, messageClass, transport, unitTest):
  - Low-level operation params — `ICreate/IRead/IUpdate/IDelete<Object>Params` (snake_case where the object uses it; some fields are camelCase, e.g. `masterSystem`/`masterLanguage`, matching the client)
  - High-level `I<Object>Config` / `I<Object>State` (the `IAdtObject<Config, State>` type arguments)
  - Object-specific enums/option/result helpers (e.g. `EnhancementType`, `ServiceBindingVariant`, `IFixedValue`, behaviorDefinition `ICheckRunResult`/`IValidationResult`, CDS/class-includes configs)
  - This package is the **single definition site** for these; `@mcp-abap-adt/adt-clients` imports and re-exports them (its public API is unchanged).
- **Cross-cutting shared types** (`adt/IAdtShared.ts`) — `AdtObjectType`(+lower/source variants), `IObjectReference`, search (`ISearchObjectsParams`/`ISearchResult`), where-used (`IGetWhereUsed*Params`/`IWhereUsedListResult`), package hierarchy (`IPackageHierarchyNode`/`IGetPackageHierarchyOptions`/…), virtual folders, SQL/table-contents/discovery params, `IInactiveObjectsResponse`. (`IReadOptions` lives in `shared/IReadOptions.ts`.)
  - `IAdtObjectHit` (since 13.0.0) is the common base of everything the repository hands back as a located object: `ISearchResult`, `IWhereUsedReference`, `IObjectReference`, `IPackageContentItem`, `IPackageHierarchyNode`. A hit is a `name` plus an ADT `type` code; the rest is per-source detail. Before it, the code lived under `type` in three of those shapes and under `adtType` in the other two — where `type` meant an unrelated enum — so a consumer had to know which producer made a hit in order to read it.
- **abapGit client contract** (`adt/IAdtAbapGit.ts`, since 14.0.0) — `IAdtAbapGitClient` (link, pull, unlink, listRepos, getRepo, getErrorLog, checkExternalRepo) plus its argument/result types (`IAbapGitLinkArgs`, `IAbapGitPullArgs`, `IAbapGitPullResult`, `IAbapGitUnlinkArgs`, `IAbapGitRepoStatus`, `IAbapGitErrorLogEntry`, `IAbapGitExternalRepoCredentials`/`IAbapGitExternalRepoBranch`/`IAbapGitExternalRepoInfo`, `IAdtAbapGitClientOptions`, `AbapGitStatus`). Moved verbatim from `@mcp-abap-adt/adt-clients`' `AdtAbapGitClient`, which still owns the implementation.
- **Batch payload shapes** (`adt/IAdtBatch.ts`, since 14.0.0) — `IBatchRequestPart`, `IBatchPayload`, `IBatchResponsePart`, the wire shapes a `multipart/mixed` ADT batch is built from and parsed back into. The recording/building logic stays in `adt-clients`.
- **ADT client options** (`adt/IAdtClientOptions.ts`, since 14.0.0) — `IAdtClientOptions` (`enableAcceptCorrection`, `masterSystem`, `responsible`, `masterLanguage`, `contentTypes`, `unicode`) and `IAdtSystemContext`, so configuring a client does not require importing `adt-clients` to describe the options.
- **Content-type contract** (`adt/IAdtContentTypes.ts`, since 14.0.0) — `IAdtHeaders` (`accept`, `contentType`) and `IAdtContentTypes`, the per-operation Accept/Content-Type provider a consumer overrides for a system that needs different headers. The two shipped implementations (`AdtContentTypesBase`/`AdtContentTypesModern`, 354 lines/38 methods) and `resolveContentTypes()` stay in `adt-clients` — that is behaviour, not contract.
- **Transport search configuration** (`adt/IAdtTransport.ts`) — `IListTransportsParams.configUri` is **required** (since 14.0.0, breaking): the five filter fields it replaces (`user`, `status`, `date_range`, `target_system`, `request_type`) were never read by the server — `/sap/bc/adt/cts/transportrequests` is a saved-configuration search, not a filtered query. `IListTransportsOptions` (`configUri` optional) is the high-level surface that opts into resolving a default configuration. `ITransportSearchConfiguration` describes one saved configuration (`uri`, `etag`, `attributes`); `TRANSPORT_SEARCH_CONFIGURATIONS_URL` is where they live; `TransportSearchConfigurationMissing` is thrown when none exists. See the [14.0.0 CHANGELOG entry](CHANGELOG.md) for the migration and the probe evidence.

### Authentication Domain (`auth/`)
- `IAuthorizationConfig` - Authorization values (UAA credentials, refresh token)
- `IConnectionConfig` - Connection values (service URL, token, client, language)
- `IConfig` - Composition of authorization and connection config
- `AuthType` - Auth type: `'jwt' | 'xsuaa' | 'basic'`
- `ICallbackServerOptions` / `ICallbackServerHandle` / `CallbackServerFactory` - Lifetime
  contract for the local listener that receives an interactive login's redirect. The handle
  is borrowed inside a factory callback and the port is released on the first terminal
  outcome — the callback returning or throwing, an explicit failure, the timeout, or an
  abort — so releasing the socket is never a consequence of a wait settling. `timeoutMs` is
  mandatory and cancellation is available through an `AbortSignal`. `port` accepts `0` to bind
  an ephemeral port (since 11.6.0), in which case the authorization URL must be built from
  `handle.redirectUri`; a flow that assembles its URL before binding, or one whose redirect is
  registered with the identity provider such as a SAML ACS, cannot use it. `logger` is where
  the transport reports an ignored request.
- `IAuthorizationStrategy<TResult>` / `AuthorizationRequest` / `AuthorizationOutcome<TResult>`
  (since 11.6.0) - How an interactive authorization is conducted, so a consumer can supply
  its own instead of the shipped one. `AuthorizationRequest.buildAuthorizationUrl(redirectUri)`
  is async and is called once the strategy has settled on its redirect URI — which is what
  makes an ephemeral port possible, since the URL cannot be assembled before the socket is
  bound. `authorize()` resolves with an `AuthorizationOutcome` that carries the redirect URI
  alongside the payload, because the token exchange must send that same URI and, with an
  ephemeral port, has no other way to learn it.

### Token Domain (`token/`)
- `ITokenProvider` - Token provider interface (stateful token lifecycle)
- `ITokenProviderOptions` - Options for token providers
- `ITokenResult` - Token result payload (supports `expiresAt` and `tokenType` for non-JWT tokens)
- `IConnectionConfig` / `ISapConfig` - now support `authType: 'saml'` and `sessionCookies`
- `ITokenRefresher` - Token refresher interface for DI into connections
  - Created by `AuthBroker.createTokenRefresher(destination)`
  - Injected into `JwtAbapConnection` to enable automatic token refresh
  - Methods: `getTokens()`

### Session Domain (`session/`)
- `ISessionStore` - Session storage interface

### Service Key Domain (`serviceKey/`)
- `IServiceKeyStore` - Service key storage interface

### Connection Domain (`connection/`)
- `IAbapConnection` - Minimal connection interface for ADT operations
  - Consumer-facing methods: `connect()`, `getBaseUrl()`, `getSessionId()`, `setSessionType()`, `makeAdtRequest()`
  - `connect()` initializes the session (CSRF token + cookies) before any ADT requests
  - Implementation details (auth, CSRF, cookies, token refresh) are encapsulated
  - For JWT: token refresh handled internally via `ITokenRefresher`
  - For Basic: no token refresh needed
- `IAdtResponse` - Minimal response shape returned by `makeAdtRequest()`
- **Connection capability atom** (`connection/IConnectionCapabilities.ts`) — the same split as the ADT atoms above, for the same reason: `IAbapConnection` is the minimum every transport can honour, and this is a thing only some can.
  - `ISessionLifecycleAware` — `disconnect()`, `isConnected()`, `getSessionIdentity()`
    - `disconnect(options?)` resolves to `void` and **always settles**. Whatever it could not finish — a transport release that did not complete, a cleanup skipped at the deadline — is the connection's own state, and a repeat call performs what is still owed. `options.deadlineMs` bounds the wait for the transport release, measured from the call
    - `getSessionIdentity()` names which **server session** the connection is on. A stable client-side conversation id says nothing about whether the server replaced the session underneath it — compare two readings across an operation to detect a replacement
    - `null` is not a verdict on the connection: it means no identity is known, which happens both when no session exists *and* when the connection is live over a server that issues no session cookie. Use `isConnected()` for connection state. It follows that `null` → non-null is not a replacement, only a *changed* value is
  - `ADT_SESSION_ERROR` / `AdtSessionErrorCode` — `ADT_NOT_CONNECTED`, `ADT_SESSION_REPLACED`, `ADT_RELEASE_PENDING`. Match on the code, not on the message
  - Additive to `IAbapConnection`, which is unchanged. An RFC connection, a batch recorder and a test stub are all legitimate connections that own no HTTP session; making these methods mandatory would force each of them to implement a lie. A compile-time proof in `__typechecks__/connectionCapabilities.ts` asserts a session-less connection still satisfies `IAbapConnection`
  - `IDeferredResponseConnection` / `hasDeferredResponses()` (since 14.0.0) — marks a connection (typically a batch recorder) whose responses resolve only after a later flush, so awaiting one mid-recording would deadlock. `hasDeferredResponses()` is a type guard, generic over whatever the caller already holds, so the atom carries no dependency on `IAbapConnection`.
- `IWebSocketTransport` - Generic realtime transport contract for WS-based flows
  - Methods: `connect()`, `disconnect()`, `send()`, `onMessage()`, `onOpen()`, `onError()`, `onClose()`, `isConnected()`
- `IWebSocketConnectOptions` - WS connect options (`protocols`, `headers`, timeouts, heartbeat)
- `IWebSocketMessageEnvelope` - Generic request/response/event/error message shape with correlation id
- `IWebSocketCloseInfo` / `IWebSocketMessageHandler` - Close payload and message callback contracts
- `IAbapConnectionExtended` - Deprecated, for backward compatibility
  - Extends `IAbapConnection` with: `getConfig()`, `getAuthHeaders()`, `reset()`
  - Will be removed in next major version
- `IAbapRequestOptions` - Request options for ADT operations

### Feeds Domain (`feeds/`)
- `IAbapTimestamp` - ABAP timestamp string type alias (format `YYYYMMDDHHMMSS`)
- `IFeedRepository` - Domain-facing interface for feed access
  - Methods: `list()`, `variants()`, `dumps()`, `systemMessages()`, `gatewayErrors()`, `gatewayErrorDetail()`
  - All methods return domain types (no raw transport responses)
- `IFeedQueryOptions` - Query parameters for feed methods (`user`, `maxResults`, `from`, `to`)
- `IFeedEntry` - Generic feed entry (`id`, `title`, `updated`, `link`, `content`)
- `IFeedDescriptor` - Feed metadata (`id`, `title`, `url`, `category`)
- `IFeedVariant` - Feed variant metadata (`id`, `title`, `url`)
- `ISystemMessageEntry` - System message with severity and validity period
- `IGatewayErrorEntry` - Basic gateway error log entry
- `IGatewayErrorDetail` - Extended error with service info, error context, source code, and call stack
- `IGatewayException`, `ICallStackEntry`, `ISourceCodeLine` - Supporting types for error details

### Execution Domain (`execution/`)
- `IExecutor<TTarget, TResult, TRunWithProfilerOptions, TRunWithProfilingOptions, TRunWithProfilingResult>`
  - Generic contract for entities that support:
    - `run(target)`
    - `runWithProfiler(target, options)`
    - `runWithProfiling(target, options?)`
- **Executors** (`execution/IAdtExecutors.ts`, since 14.0.0) — `IClassExecutor`/`IProgramExecutor`, each an `IExecutor` instantiated for its target (`IClassExecutionTarget`/`IProgramExecutionTarget`) with its profiler options and profiling result (`IClassExecuteWithProfiler/ProfilingOptions`, `IClassExecuteWithProfilingResult`, and the program equivalents — program profiling has no `traceId`, since program execution is fire-and-forget and the trace is written asynchronously). Moved verbatim from `adt-clients`' `AdtExecutor`, which still owns the implementation.

### Runtime Domain (`runtime/`)
- `IRuntimeAnalysisObject<TKind>` — Base interface with typed `readonly kind: TKind` discriminator for type narrowing
- `IListableRuntimeObject<TResult, TOptions, TKind>` — Extends `IRuntimeAnalysisObject<TKind>` with `list()` method
- **Debugger**: `IDebugger` (composite), `IAbapDebugger` (session, breakpoints, variables, watchpoints, batch), `IAmdpDebugger` (AMDP-specific debug)
  - **Debugger session parameters** (`runtime/IAdtDebuggerSession.ts`, since 14.0.0) — `IDebuggerListenParams`, `IDebuggerAttachParams`, `IDebuggerStepParams` (+ `DebuggerStepAction`), `IDebuggerGetVariablesParams`, backing the WebSocket debugger-session facade (`AdtClientsWS`, which stays in `adt-clients`: `debugger.listen`/`attach`/`detach`/`step`/`getStack`/`getVariables`)
- **Memory**: `IMemorySnapshots` (snapshots with delta analysis)
- **Profiler**: `IProfiler` (traces, hit lists, statements, DB accesses)
- **Traces**: `ICrossTrace` (cross-layer traces), `ISt05Trace` (SQL trace)
- **Logs**: `IApplicationLog`, `IAtcLog` (ATC check logs)
- **DDIC**: `IDdicActivation` (activation graphs)
- **Dumps**: `IRuntimeDumps` (runtime dumps with views)
- **Feeds**: `ISystemMessages`, `IGatewayErrorLog` (reuse `IFeedQueryOptions`)
- All runtime interfaces use literal `kind` discriminators (e.g., `'profiler'`, `'debugger'`) for type-safe narrowing

### SAP Domain (`sap/`)
- `ISapConfig` - SAP connection configuration
- `SapAuthType` - Authentication type: `"basic" | "jwt"`

### Service Domain (`service/`)
- `IAdtService` - Service binding lifecycle contract for non-CRUD service operations
  - Methods for binding discovery/validation, transport checks, create/read/update, activate/check, and generation
  - `updateServiceBinding()` uses explicit `desiredPublicationState` and validates allowed state transition
- Parameter/enum types:
  - `ServiceBindingVariant` — `'ODATA_V2_UI' | 'ODATA_V2_WEB_API' | 'ODATA_V4_UI' | 'ODATA_V4_WEB_API'`
  - `SERVICE_BINDING_VARIANT_MAP` — maps variant to `{ bindingType, bindingVersion, bindingCategory, serviceType }`
  - `ServiceBindingType`, `ServiceBindingVersion`, `GeneratedServiceType`, `DesiredPublicationState`
  - `ICreateServiceBindingParams` (uses `binding_variant: ServiceBindingVariant`), `IUpdateServiceBindingParams`, `IReadServiceBindingParams`
  - `ITransportCheckServiceBindingParams`, `ICheckServiceBindingParams`, `IActivateServiceBindingParams`
  - `IGenerateServiceBindingParams`, `ICreateAndGenerateServiceBindingParams`

### Storage Domain (`storage/`)
- `ISessionStorage` - Session storage interface
- `ISessionState` - Session state structure

### Logging Domain (`logging/`)
- `ILogger` - Logger interface
- `LogLevel` - Log level enum (`ERROR = 0`, `WARN = 1`, `INFO = 2`, `DEBUG = 3`)
  - Exported from package root: `import { LogLevel } from '@mcp-abap-adt/interfaces'`

### Validation Domain (`validation/`)
- `IValidatedAuthConfig` - Validated authentication configuration
- `IHeaderValidationResult` - Header validation result
- `AuthMethodPriority` - Authentication method priority enum

### Utilities Domain (`utils/`)
- `ITokenRefreshResult` - Token refresh result
- `ITimeoutConfig` - Timeout configuration

## Dependencies

This package has **no runtime dependencies**. It only has devDependencies for TypeScript compilation:
- `typescript` - TypeScript compiler
- `@types/node` - Node.js type definitions

## License

MIT
