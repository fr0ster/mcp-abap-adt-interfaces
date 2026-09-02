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

## Decisions, and why

[`docs/architecture/DECISIONS.md`](docs/architecture/DECISIONS.md) records the
choices in this contract that could reasonably have gone the other way — what
was decided, what it was decided *against*, and what would change it.

Read it before proposing a shape that looks obviously better: several of the
entries exist because that shape was tried, and the reason it lost is written
down. The contract is measured rather than inferred, states absence by omission
rather than by negative types, and does not validate what SAP sends — each with
the evidence that settled it.

## Installation

```bash
npm install @mcp-abap-adt/interfaces
```

## Overview

This package contains all interfaces organized by domain:

- **`adt/`** - ADT object operations interfaces (IAdtObject, operation options, error codes), plus the abapGit client contract, batch payload shapes, ADT client options, and the content-type/header contract
- **`auth/`** - Core authentication interfaces: configs and auth types, the credential contract a connection authenticates with (`IAuthProvider`), and how an interactive login is conducted (`IAuthorizationStrategy`)
- **`token/`** - Token-related interfaces (token provider, results, options)
- **`session/`** - Session storage interface
- **`serviceKey/`** - Service key storage interface
- **`connection/`** - Connection and realtime transport interfaces (AbapConnection, request options, WebSocket transport contracts, deferred-response detection)
- **`execution/`** - Execution contracts for runnable entities (`IAdtRunnable`, `IExecutor`, class/program executors with profiling)
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
  IAuthProvider,
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

### Writing Your Own Credential

`IAuthProvider` is here, rather than beside any one implementation, so that an
authentication nothing ships can still be used. A credential states all of itself: `kind`,
`prepare()`, `authorizationHeader()`, `cookies()` and `transportMaterial()`, each empty
where there is nothing to say. That is the whole of it — there is nothing further to add
and nothing to declare.

```typescript
import type {
  IAuthProvider,
  ICertificateMaterial,
} from '@mcp-abap-adt/interfaces';

class HeaderTokenProvider implements IAuthProvider {
  readonly kind = 'my-gateway-token';

  constructor(private readonly token: string) {}

  // Empty where there is nothing to say, which is most of a header credential.
  async prepare(): Promise<void> {}
  cookies(): string | null {
    return null;
  }
  transportMaterial(): ICertificateMaterial {
    return {};
  }

  async authorizationHeader(): Promise<string | null> {
    return `Bearer ${this.token}`;
  }
}
```

A credential that authenticates through TLS has no header at all, and says so with
`null` rather than an empty string:

```typescript
import type {
  IAuthProvider,
  ICertificateMaterial,
} from '@mcp-abap-adt/interfaces';

class PfxProvider implements IAuthProvider {
  readonly kind = 'pfx';

  constructor(private readonly pfx: Buffer, private readonly passphrase: string) {}

  async prepare(): Promise<void> {}
  cookies(): string | null {
    return null;
  }

  async authorizationHeader(): Promise<string | null> {
    return null;
  }

  transportMaterial(): ICertificateMaterial {
    return { pfx: this.pfx, passphrase: this.passphrase };
  }
}
```

**A credential that may only be presented once has no home here yet.** SPNEGO is the case —
its token is consumed by the request that carries it — and this package shipped two contracts
for it, `ICredentialOwningItsFetch` and `ICredentialTransport`, which nothing ever
implemented. They were removed in 21.0.0.

They are not replaced by "answer with the token once and `null` afterwards", which looks
right and is not: a wire asks `authorizationHeader()` **per attempt** and retries a failed
establishment, so a credential that marked itself spent when the header was handed out would
send nothing at all on the second attempt — after a timeout, an aborted connection, or a
refusal that never reached the server. It has no way to know whether the request it was asked
for went out, let alone succeeded.

So the problem is open, and it is a real one: such a credential needs either an exchange it
owns end to end, or a signal that the establishing request succeeded. Whoever adds SPNEGO
decides which — from that requirement, rather than from a contract written before anything
needed it.

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
  - `IAdtUpdatable` — `update` (since 15.0.0)
  - `IAdtDeletable` — `delete` (since 15.0.0)
  - `IAdtModifiable` — the composite of `IAdtUpdatable` and `IAdtDeletable`. Before 15.0.0 it declared both methods itself; the split gives a handler that honours one without the other (there is none yet in `adt-clients`, but the shape now allows it) a way to say so, while `IAdtModifiable` keeps its old shape for a consumer that already implements both
  - `IAdtCrud` — the composite of create/read/readMetadata/update/delete, retained for consumers that genuinely do all five; unchanged in shape by the `IAdtModifiable` split
  - `IAdtValidatable` — `validate`
  - `IAdtCheckable` — `check`
  - `IAdtActivatable` — `activate`
  - `IAdtLockable` — `lock`, `unlock`
  - `IAdtVersionable` — `getVersions`, `getVersionSource`
  - `IAdtTransportAware` — `readTransport`
  - `IAdtSearchable` — `search`; not per-object-type, implemented by whatever locates objects
  - `IAdtRequest` (`adt/IAdtTransport.ts`, since 26.1.0) — the transport request handler: `IAdtCrud` with the transport's config and state, plus `list()` and `listNodes()`, which no other handler has. It exists because `AdtClient.getRequest()` returned a concrete class, and a concrete return is the one a consumer cannot replace, cannot compose their own types into, and cannot check a capability claim against
  - `IAdtRunnable<TTarget, TResult, TOptions>` (`execution/IAdtRunnable.ts`, since 16.0.0) — the capability of being executed, one method. `IExecutor` extends it, and a unit-test handler declares it directly: there is no test-specific runnable, because two differently-shaped contracts for "this can be executed" would be two vocabularies for one idea.
  - `ITestRunInformation` and `ICdsTestDoubleCheckable` (`adt/IAdtUnitTest.ts`, since 16.0.0) — asking about a run by its id, and asking whether a CDS view can be tested with doubles. Both were part of `IAdtTestRunnable` until 16.0.0; neither is running.
  - Since 13.0.0 `IAdtObject` is *assembled* from these atoms rather than declaring the methods itself, so the atoms are the definitions and the composite cannot drift from them. The shape is unchanged — a compile-time proof in the same file still asserts both directions of the equivalence, which now also catches a method added to `IAdtObject` directly instead of to an atom.
  - The grain follows ADT, not taste: `lock`/`unlock` and `getVersions`/`getVersionSource` are honoured or refused as pairs, because each is one operation seen from two ends. `update` and `delete` were taken for a third such pair until 15.0.0 and are separate atoms since — nothing in ADT ties changing an object to removing it, and a handler that supports one can now say so without claiming the other.
  - Since 17.0.0 **no interface in this package declares a capability the object does not have**. `IFeatureToggleObject` and `IAdtServiceBinding` were the last two extending `IAdtObject` while their handlers refused version history, and a lock or a transport; each now extends the atoms it satisfies. That is asserted rather than believed: a guard in `@mcp-abap-adt/adt-clients` compares all 36 factory return types against the 10 atoms in both directions, and calls every declared method to check it issues the request its capability names.
  - There is no atom or composite for "everything but versions" — a capability vocabulary states what an object supports, never what it lacks. A handler that is the full set minus `IAdtVersionable` declares `IAdtCrud & IAdtValidatable & IAdtCheckable & IAdtActivatable & IAdtLockable & IAdtTransportAware` directly (see the [15.0.0 CHANGELOG entry](CHANGELOG.md) for why the earlier `IAdtNonVersionedObject` composite was removed).
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
- **Cross-cutting operations** (`adt/IAdtUtilities.ts`, since 26.2.0) — seven atoms for the operations that are not per-object CRUD, split by the resource families ADT itself has: `IAdtInformationSystem` (`/repository/informationsystem/*` — search, where-used, virtual folders, the type catalogue), `IAdtRepositoryStructure` (`/repository/nodestructure`, `/objectstructure`), `IAdtPackageBrowsing` (`/packages/*`), `IAdtGroupLifecycle` (`/activation`, `/deletion`), `IAdtDataPreview` (`/datapreview/*`), `IAdtDiscovery` (`/discovery`) and `IAdtObjectAccess` (the per-type resources reached generically, by type and name — what a caller uses when the type is a value rather than a decision). Plus `IRepositoryObjectNode`, `IRepositoryNodeContents` and `IRepositoryNodeChild` — the result shapes for the tree walk, lifted from parsers already reading those documents against real systems. `childNodes` pairs each object type with the node id holding it: 26.2.0 carried the ids alone, which cannot answer "which node holds the includes", and 27.0.0 is that correction.
  - Packages are their own atom rather than part of the tree: a package is a container ADT gives its own resource, and asking what is in one is a question about that container, not about the tree it happens to be walked with.
  - The split is architectural, not observational, and the removal of six uncalled members turned that from reasoning into evidence. The one legacy implementation now refuses two members — `getSqlQuery` and `getTableContents` — and **both are `IAdtDataPreview`**: a whole family, refused whole. When the split was chosen it refused three, `getTransaction` among them, so a split drawn along refusals would have given three atoms and a bag of twenty-eight, and one of those atoms would have evaporated when its member did. Refusals fall *inside* these families rather than defining them; a contract split by who refuses what changes shape with the next system.
  - **13 of the 25 members state a result; 12 still answer `Promise<IAdtResponse>`.** The gap is named in the file header rather than papered over: closing one means naming what its endpoint sends, and nothing but a capture can name it (decision 1). They close one at a time, on evidence.
  - Six members were removed before shipping because nothing anywhere called them, and three more as envelope leaks whose contract-shaped sibling was already beside them — see the [26.2.0 CHANGELOG entry](CHANGELOG.md).
  - **`search` takes an optional parser** (since 26.3.0) — `search(criteria)` gives `ISearchResult[]`, `search(criteria, parse)` gives whatever the parser returns. One endpoint is one member (decision 16): `searchObjects` and `search` issued the same request, and keeping both made "how far the answer was parsed" a property of which method a caller used rather than of the contract. A consumer who needs the document — `mcp-abap-adt` hands the search XML to a language model — passes a parser, which is a choice about behaviour the implementation still performs. Not a pattern to copy onto every member: see decision 5 for when a strategy is warranted.
  - `AdtClient.getUtils()` in `@mcp-abap-adt/adt-clients` still returns the concrete `AdtUtils`; these atoms are what it will return once that package consumes them.
- **abapGit client contract** (`adt/IAdtAbapGit.ts`, since 14.0.0) — `IAdtAbapGitClient` (link, pull, unlink, listRepos, getRepo, getErrorLog, checkExternalRepo) plus its argument/result types (`IAbapGitLinkArgs`, `IAbapGitPullArgs`, `IAbapGitPullResult`, `IAbapGitUnlinkArgs`, `IAbapGitRepoStatus`, `IAbapGitErrorLogEntry`, `IAbapGitExternalRepoCredentials`/`IAbapGitExternalRepoBranch`/`IAbapGitExternalRepoInfo`, `IAdtAbapGitClientOptions`, `AbapGitStatus`). Moved verbatim from `@mcp-abap-adt/adt-clients`' `AdtAbapGitClient`, which still owns the implementation.
- **Batch payload shapes** (`adt/IAdtBatch.ts`, since 14.0.0) — `IBatchRequestPart`, `IBatchPayload`, `IBatchResponsePart`, the wire shapes a `multipart/mixed` ADT batch is built from and parsed back into. The recording/building logic stays in `adt-clients`.
- **ADT client options** (`adt/IAdtClientOptions.ts`, since 14.0.0) — `IAdtClientOptions` (`enableAcceptCorrection`, `masterSystem`, `responsible`, `masterLanguage`, `contentTypes`, `unicode`) and `IAdtSystemContext`, so configuring a client does not require importing `adt-clients` to describe the options.
- **Content-type contract** (`adt/IAdtContentTypes.ts`, since 14.0.0) — `IAdtHeaders` (`accept`, `contentType`) and `IAdtContentTypes`, the per-operation Accept/Content-Type provider a consumer overrides for a system that needs different headers. The two shipped implementations (`AdtContentTypesBase`/`AdtContentTypesModern`, 354 lines/38 methods) and `resolveContentTypes()` stay in `adt-clients` — that is behaviour, not contract.
- **Standalone `PROG/I` includes** (`adt/IAdtInclude.ts`, since 22.0.0) — `IIncludeConfig`, `IIncludeState`, `ICreateIncludeParams`, `IUpdateIncludeSourceParams`, `IDeleteIncludeParams`, plus `IAdtContentTypes.includeCreate()`. An include is a different resource from a program, measured: it answers with `include:abapInclude`, its own namespace, `adtcore:type="PROG/I"` and `include:contextRefCount`, against a program's `program:abapProgram`, `program:programType` and `PROG/P` — and the two collections advertise different accepted content types, so modelling one as a flavour of the other builds the wrong document and posts it to the wrong place. There is no `IValidateIncludeParams`: `/includes/validation` takes the same three parameters `/programs/validation` does. Creation is a modern on-prem capability — only there does discovery give the includes collection an `app:accept`, and a collection without one is not a POST target.
- **Transport search configuration** (`adt/IAdtTransport.ts`) — `IListTransportsParams.configUri` is **required** (since 14.0.0, breaking): the five filter fields it replaces (`user`, `status`, `date_range`, `target_system`, `request_type`) were never read by the server — `/sap/bc/adt/cts/transportrequests` is a saved-configuration search, not a filtered query. `IListTransportsOptions` (`configUri` optional) is the high-level surface that opts into resolving a default configuration. `ITransportSearchConfiguration` describes one saved configuration (`uri`, `etag`, `attributes`); `TRANSPORT_SEARCH_CONFIGURATIONS_URL` is where they live; `TransportSearchConfigurationMissing` is thrown when none exists. See the [14.0.0 CHANGELOG entry](CHANGELOG.md) for the migration and the probe evidence.
- **Parsed transport tree** (`adt/IAdtTransport.ts`, since 14.1.0) — `ITransportTree` (root `attributes` plus `requests`), `ITransportTreeRequest` (`attributes`, `containers`, `links`, `longDesc`, `tasks`), `ITransportTreeTask` (`attributes`, `links`, `longDesc`), `ITransportTreeNode` (one container a request was nested under — `element` plus `attributes`) and `ITransportTreeLink` (one `atom:link`'s `attributes`). `containers` is an ordered list, not named fields, because the chain a request is nested under is not fixed: `?configUri=` alone returns `tm:workbench > tm:modifiable > tm:request`, while `?targets=true&configUri=` inserts a `tm:target` level. Every attribute is verbatim (`tm:number`, never `number`) and typed `Record<string, string | undefined>`, since this repo does not set `noUncheckedIndexedAccess`. `longDesc` is `undefined` when `tm:long_desc` is absent and `''` when present and empty — the two are not the same thing. There is deliberately no parser type here: the parser is a call-site generic in the consuming package. See the [14.1.0 CHANGELOG entry](CHANGELOG.md) for the two captured request chains.

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
- `ICertificateMaterial` / `ICertificateMaterialLoader` - Loaded TLS client-certificate
  material (`cert` / `key` / `pfx` / `passphrase`) and the loader that produces it from a
  config. Structural on purpose: it is the shape an HTTPS client needs, named without
  importing one, because this package has no runtime.
- `IAuthProvider` (since 17.2.0) - **How a connection proves who it
  is on each request**, as opposed to which system it is dialling. Deliberately not "give me a
  token": four of the five ways in are not tokens — basic is a header built from a username, a
  certificate is TLS material and no header at all, SPNEGO is a negotiation with the server.
  Since 20.0.0 a credential states ALL of itself: `kind`, `prepare()`,
  `authorizationHeader()`, `cookies()` and `transportMaterial()` are required, and each is
  empty where there is nothing to say — "nothing to prepare", "I am not cookies", "I
  contribute no TLS material". Those are facts, and a fact is stated rather than left for a
  caller to discover by checking whether a method exists.

  `IRenewableCredential` (since 19.0.0) is the atom for the one that used to sit among them:
  `renew()`, "the server refused what you last handed out, get a new one". Only some credentials
  have it — a password is a password, and a SAML session was negotiated elsewhere — so it is
  narrowed to rather than carried by all. Nothing in a request path should call it: renewal on an
  expiry the provider can see happens inside `authorizationHeader()`, which is asked per request,
  and this is the other case, where deciding what a refusal MEANT belongs to the caller.

  `authorizationHeader()` answers `string | null` — `null`, not `''`, because the empty string
  is a legal header value and a credential that authenticates through TLS genuinely has no
  header. `transportMaterial()` returns `ICertificateMaterial` for those.

  A credential that may only be presented ONCE — SPNEGO, whose token is consumed by the
  request that carries it — has no home here yet. `ICredentialOwningItsFetch` and
  `ICredentialTransport` existed for it and were removed in 21.0.0, having never been
  implemented; and they are not replaced by answering once and `null` afterwards, because
  `authorizationHeader()` is asked per ATTEMPT and a failed establishment is retried, so a
  credential that marked itself spent when the header was handed out would send nothing on the
  next attempt. Such a credential needs either an exchange it owns end to end, or a signal
  that the establishing request succeeded. See
  [Writing Your Own Credential](#writing-your-own-credential).

  Distinct from `IAuthorizationStrategy` above, which is one layer up: that is how an
  *interactive* login is conducted, asked once by a human, and its output eventually becomes a
  token some implementation of this hands out. This one is asked on every request.

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
    - `disconnect()` takes no arguments (since 18.0.0). It **notifies**: it tells the server the session is finished, and whether and when the session is actually freed is the server's affair — nothing checks afterwards. That is why there is no deadline to pass; waiting for the answer to a message nobody acts on buys a caller nothing, while being the one thing that could make a teardown unbounded, since a goodbye carries no request timeout by design
    - It resolves to `void` and **always settles**. Whatever it could not finish is the connection's own state, and a repeat call performs what is still owed
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
  - Methods: `list()`, `variants(category)`, `dumps()`, `systemMessages()`, `gatewayErrors()`, `gatewayErrorDetail()`
  - `variants` takes a **required** `category` since 26.0.0 — the endpoint answers `400 "Parameter category could not be found."` without one, so the parameterless call the previous signature allowed could not work
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
- `IAdtRunnable<TTarget, TResult, TOptions>` (since 16.0.0)
  - `run(target, options?)` — the whole of being executable. Everything else an executing handler offers is a different capability with its own interface.
- `IExecutor<TTarget, TResult, TRunWithProfilerOptions, TRunWithProfilingOptions, TRunWithProfilingResult>` **extends `IAdtRunnable`**
  - `run(target)` — inherited; the shape is unchanged by the extraction, asserted in both directions by a compile-time proof
  - `runWithProfiler(target, options)`
  - `runWithProfiling(target, options?)`
- **Executors** (`execution/IAdtExecutors.ts`, since 14.0.0) — `IClassExecutor`/`IProgramExecutor`, each an `IExecutor` instantiated for its target (`IClassExecutionTarget`/`IProgramExecutionTarget`) with its profiler options and profiling result (`IClassExecuteWithProfiler/ProfilingOptions`, `IClassExecuteWithProfilingResult`, and the program equivalents). Since 22.0.0 **neither** result carries a `traceId`: the trace is written asynchronously, so at the moment a run returns there may be no trace, there may never be one, and the caller may read it a week later. Find it afterwards with `IProfiler.list()`. Moved verbatim from `adt-clients`' `AdtExecutor`, which still owns the implementation.
- **Trace scheduling** (`execution/ITraceScheduling.ts`, since 22.0.0) — `listObjectTypes()`, `listProcessTypes()`, `listRequests()`, `getRequestsByUri()`, `scheduleTrace()`, composed into the two executors. There is deliberately **no** operation that submits a trace request: the stored entry is measured, the submitted document is not, and a published method would tell a consumer its argument is the wire shape on the strength of having read the response. Additive in a minor once a capture exists. Deliberately **not** on `IExecutor` or `IAdtRunnable`: ATC and unit-test runners implement those and have no business answering for trace parameters.

### Runtime Domain (`runtime/`)
- `IRuntimeAnalysisObject<TKind>` — Base interface with typed `readonly kind: TKind` discriminator for type narrowing
- `IListableRuntimeObject<TResult, TOptions, TKind>` — Extends `IRuntimeAnalysisObject<TKind>` with `list()` method
- **Debugger**: `IDebugger` (composite), `IAbapDebugger` (session, breakpoints, variables, watchpoints, batch), `IAmdpDebugger` (AMDP-specific debug)
  - **Debugger session parameters** (`runtime/IAdtDebuggerSession.ts`, since 14.0.0) — `IDebuggerListenParams`, `IDebuggerAttachParams`, `IDebuggerStepParams` (+ `DebuggerStepAction`), `IDebuggerGetVariablesParams`, backing the WebSocket debugger-session facade (`AdtClientsWS`, which stays in `adt-clients`: `debugger.listen`/`attach`/`detach`/`step`/`getStack`/`getVariables`)
- **Memory**: `IMemorySnapshots` (snapshots with delta analysis)
- **Profiler**: `IProfiler` — what a run left behind, not how it is configured. `list()` for what traces exist, `read(traceId, view)` for what is inside one, where `view` is `'hitlist'`, `'statements'` or `'dbAccesses'` and the result is that view's own type; `readWith(parse, traceId, view)` (since 23.0.0) for a consumer's own reader, which keeps its own return type; `delete(traceId)` (since 25.0.0) for taking one back out, since a profiled run was otherwise permanent. Reading-only from 22.0.0 until 25.0.0. Everything about *configuring* a measurement moved to `ITraceScheduling` above. Built from `ITraceEntry` / `ITraceView` / `ITraceListing` / `ITraceReading` / `ITraceReadingWithParser` / `ITraceDeletion` / `ITraceFamily` (`runtime/ITrace.ts`), which any trace family composes — an implementer of `IProfiler` owes every one of those members
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
