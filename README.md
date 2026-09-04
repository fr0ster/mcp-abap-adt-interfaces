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

- **`adt/`** - ADT object operations interfaces (capability atoms, operation options, error codes), plus the abapGit client contract, batch payload shapes, ADT client options, and the content-type/header contract
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
  IAdtReadable,
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

**Interface-Only Communication**: This package defines **contracts** — interfaces, types and the constants they refer to. It contains no implementations: no classes, no functions, and no dependencies on other packages beyond type-only imports. It is the single source of truth for the shapes every package here agrees on.

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
- **Contracts, not code**: types and interfaces, plus the constants they name. Since 29.0.0 the package ships **no class and no function** — `AdtOperationError`, `TransportSearchConfigurationMissing`, `isNetworkError()` and `hasDeferredResponses()` were removed, because a contract says what a thing *is* and shipping one way of being it makes "use your own implementation" untrue for that piece. What remains executable is 50 exported constants (`AdtObjectErrorCodes`, the `HEADER_*` names, `NETWORK_ERROR_CODES`, `AUTH_TYPE_*` and so on); every emitted module is otherwise empty

#### What This Package Does NOT Do

- **Does NOT implement anything**: no class and no function is exported. The only executable output is the constants listed above, which are values a contract names rather than behaviour it performs
- **Does NOT have runtime dependencies**: Only devDependencies for TypeScript compilation
- **Does NOT know about implementations**: Interfaces are independent of implementations

## Interface Domains

### ADT Domain (`adt/`)
- **Capability atoms** (`adt/IAdtCapabilities.ts`, since 11.2.0) — one small interface per operation, and **nothing above them**. A handler declares the atoms it honours, so a consumer reading it learns what that object can do and what comes back:
  - Since 29.0.0 these members answer `Promise<IAdtResponse<TValue>>` instead of throwing, and **each atom names what its own member returns** — a create does not answer what a read answers, and one type for all of them said something untrue about ADT. `@throws` remains only on `lock`, `unlock`, `getVersions` and `getVersionSource`: they answer a lock handle, nothing, a version list and a source string, so none has a failure half to put a refusal in
  - `IAdtCreatable<TConfig, TCreated>` — `create`
  - `IAdtReadable<TConfig, TSource, TMetadata>` — `read`, `readMetadata`; two values because it is two endpoints
  - `IAdtUpdatable<TConfig, TUpdated>` — `update` (since 15.0.0)
  - `IAdtDeletable<TConfig, TDeleted>` — `delete` (since 15.0.0)
  - `IAdtValidatable<TConfig, TValidated>` — `validate`
  - `IAdtCheckable<TConfig, TChecked>` — `check`
  - `IAdtActivatable<TConfig, TActivated>` — `activate`
  - `IAdtLockable` — `lock`, `unlock`
  - `IAdtVersionable` — `getVersions`, `getVersionSource`
  - `IAdtTransportAware<TConfig, TTransport>` — `readTransport`
  - `IAdtSearchable` — `search`; not per-object-type, implemented by whatever locates objects
  - `IAdtRequest` (`adt/IAdtTransport.ts`, since 26.1.0) — the transport request handler: the four CRUD atoms with the transport's config, plus `list()` and `listNodes()`, which no other handler has. It exists because `AdtClient.getRequest()` returned a concrete class, and a concrete return is the one a consumer cannot replace, cannot compose their own types into, and cannot check a capability claim against
  - `IAdtRunnable<TTarget, TResult, TOptions>` (`execution/IAdtRunnable.ts`, since 16.0.0) — the capability of being executed, one method. `IExecutor` extends it, and a unit-test handler declares it directly: there is no test-specific runnable, because two differently-shaped contracts for "this can be executed" would be two vocabularies for one idea.
  - `ITestRunInformation` and `ICdsTestDoubleCheckable` (`adt/IAdtUnitTest.ts`, since 16.0.0) — asking about a run by its id, and asking whether a CDS view can be tested with doubles. Both were part of `IAdtTestRunnable` until 16.0.0; neither is running.
  - Since 29.0.0 there is no composite at all. `IAdtObject`, `IAdtCrud`, `IAdtModifiable` and `IAdtSourceObject` were removed: they forced one result type on members that answer different things. `src/__typechecks__/capabilityAtoms.ts` proves what replaces them — each atom is independently satisfiable, one cannot stand in for another, and `IAdtCreatable<Config, string>` is not `IAdtCreatable<Config, void>`.
  - The grain follows ADT, not taste: `lock`/`unlock` and `getVersions`/`getVersionSource` are honoured or refused as pairs, because each is one operation seen from two ends. `update` and `delete` were taken for a third such pair until 15.0.0 and are separate atoms since — nothing in ADT ties changing an object to removing it, and a handler that supports one can now say so without claiming the other.
  - Since 17.0.0 **no interface in this package declares a capability the object does not have**. `IFeatureToggleObject` and `IAdtServiceBinding` were the last two extending the wide composite while their implementations refused version history, and a lock or a transport; each now names the atoms it satisfies. That is asserted rather than believed: a guard in `@mcp-abap-adt/adt-clients` compares all 36 factory return types against the 10 atoms in both directions, and calls every declared method to check it issues the request its capability names.
  - There is no atom for "everything but versions" — a capability vocabulary states what an object supports, never what it lacks. A handler that is the full set minus `IAdtVersionable` lists the atoms it does honour (see the [15.0.0 CHANGELOG entry](CHANGELOG.md) for why the earlier `IAdtNonVersionedObject` composite was removed).
- `IAdtOperationOptions` - Unified options for create and update operations
  - Fields: `analyse`, `activateOnCreate`, `activateOnUpdate`, `deleteOnFailure`, `sourceCode`, `xmlContent`, `lockHandle`, `timeout`
  - `analyse` (since 29.0.0) is the caller's own reading of what counts as a failure: `(verdict: IAdtError | undefined, answer?: IAdtWireResponse) => IAdtError | undefined`. It is handed the default's verdict **and** the answer it was reached from, so it can overrule in either direction. It exists because no single reading serves every caller — ADT answers a request for a missing object with **200 and an empty body**, and those same bytes are a failure to a read-modify-write, since writing back what it read erases the object, and an empty list to a listing
- `AdtObjectErrorCodes` - Error code constants for ADT object operations
  - Constants: `OBJECT_NOT_FOUND`, `OBJECT_NOT_READY`, `VALIDATION_FAILED`, `CREATE_FAILED`, `UPDATE_FAILED`, `DELETE_FAILED`, `ACTIVATE_FAILED`, `CHECK_FAILED`, `LOCK_FAILED`, `UNLOCK_FAILED`
- **No state types.** `IAdtObjectState` and the 31 per-object `I<Object>State` interfaces were removed in 29.0.0. They were ten optional `IAdtWireResponse` fields, nine `undefined` on any given call, from which a caller could type nothing out. A member now answers what its own endpoint produced, and `IAdtError.request` names the step that refused — which is what the bags were nominally for. A state is a shape an *implementation* builds: `@mcp-abap-adt/adt-clients` declares its own

- `IAdtObjectConfig` - Base configuration interface for ADT objects
  - Common fields: `packageName`, `description`, `transportRequest`
- **Per-object-type contract types** (`IAdt<Object>.ts`, one file per ADT object type — class, program, interface, table, domain, dataElement, ddl, structure, package, functionGroup/Module/Include, behaviorDefinition/Implementation, metadataExtension, enhancement, accessControl, serviceDefinition/Binding, transformation, scalarFunction(Implementation), tableType, appendStructure, authorizationField, featureToggle, messageClass, transport, unitTest):
  - Low-level operation params — `ICreate/IRead/IUpdate/IDelete<Object>Params` (snake_case where the object uses it; some fields are camelCase, e.g. `masterSystem`/`masterLanguage`, matching the client)
  - High-level `I<Object>Config` — the `TConfig` of every atom. The matching `I<Object>State` types are gone; what a member answers is named per atom
  - Object-specific enums/option/result helpers (e.g. `EnhancementType`, `ServiceBindingVariant`, `IFixedValue`, behaviorDefinition `ICheckRunResult`/`IValidationResult`, CDS/class-includes configs)
  - This package is the **single definition site** for these; `@mcp-abap-adt/adt-clients` imports and re-exports them (its public API is unchanged).
- **Cross-cutting shared types** (`adt/IAdtShared.ts`) — `AdtObjectType`(+lower/source variants), `IObjectReference`, search (`ISearchObjectsParams`/`ISearchResult`), where-used (`IGetWhereUsed*Params`/`IWhereUsedListResult`), package hierarchy (`IPackageHierarchyNode`/`IGetPackageHierarchyOptions`/…), virtual folders, SQL/table-contents/discovery params, `IInactiveObjectsResponse`. (`IReadOptions` lives in `shared/IReadOptions.ts`.)
  - `IAdtObjectHit` (since 13.0.0) is the common base of everything the repository hands back as a located object: `ISearchResult`, `IWhereUsedReference`, `IObjectReference`, `IPackageContentItem`, `IPackageHierarchyNode`. A hit is a `name` plus an ADT `type` code; the rest is per-source detail. Before it, the code lived under `type` in three of those shapes and under `adtType` in the other two — where `type` meant an unrelated enum — so a consumer had to know which producer made a hit in order to read it.
- **Cross-cutting operations** (`adt/IAdtUtilities.ts`, since 26.2.0) — seven atoms for the operations that are not per-object CRUD, split by the resource families ADT itself has: `IAdtInformationSystem` (`/repository/informationsystem/*` — search, where-used, virtual folders, the type catalogue), `IAdtRepositoryStructure` (`/repository/nodestructure`, `/objectstructure`), `IAdtPackageBrowsing` (`/packages/*`), `IAdtGroupLifecycle` (`/activation`, `/deletion`), `IAdtDataPreview` (`/datapreview/*`), `IAdtDiscovery` (`/discovery`) and `IAdtObjectAccess` (the per-type resources reached generically, by type and name — what a caller uses when the type is a value rather than a decision). Plus `IRepositoryObjectNode`, `IRepositoryNodeContents` and `IRepositoryNodeChild` — the result shapes for the tree walk, lifted from parsers already reading those documents against real systems. `childNodes` pairs each object type with the node id holding it: 26.2.0 carried the ids alone, which cannot answer "which node holds the includes", and 27.0.0 is that correction.
  - Packages are their own atom rather than part of the tree: a package is a container ADT gives its own resource, and asking what is in one is a question about that container, not about the tree it happens to be walked with.
  - The split is architectural, not observational, and the removal of six uncalled members turned that from reasoning into evidence. The one legacy implementation now refuses two members — `getSqlQuery` and `getTableContents` — and **both are `IAdtDataPreview`**: a whole family, refused whole. When the split was chosen it refused three, `getTransaction` among them, so a split drawn along refusals would have given three atoms and a bag of twenty-eight, and one of those atoms would have evaporated when its member did. Refusals fall *inside* these families rather than defining them; a contract split by who refuses what changes shape with the next system.
  - **13 of the 25 members state a result; 12 still answer `Promise<IAdtWireResponse>`.** The gap is named in the file header rather than papered over: closing one means naming what its endpoint sends, and nothing but a capture can name it (decision 1). They close one at a time, on evidence.
  - Six members were removed before shipping because nothing anywhere called them, and three more as envelope leaks whose contract-shaped sibling was already beside them — see the [26.2.0 CHANGELOG entry](CHANGELOG.md).
  - **`search` takes an optional parser** (since 26.3.0) — `search(criteria)` gives `ISearchResult[]`, `search(criteria, parse)` gives whatever the parser returns. One endpoint is one member (decision 16): `searchObjects` and `search` issued the same request, and keeping both made "how far the answer was parsed" a property of which method a caller used rather than of the contract. A consumer who needs the document — `mcp-abap-adt` hands the search XML to a language model — passes a parser, which is a choice about behaviour the implementation still performs. Not a pattern to copy onto every member: see decision 5 for when a strategy is warranted.
  - `AdtClient.getUtils()` in `@mcp-abap-adt/adt-clients` still returns the concrete `AdtUtils`; these atoms are what it will return once that package consumes them.
- **abapGit client contract** (`adt/IAdtAbapGit.ts`, since 14.0.0) — `IAdtAbapGitClient` (link, pull, unlink, listRepos, getRepo, getErrorLog, checkExternalRepo) plus its argument/result types (`IAbapGitLinkArgs`, `IAbapGitPullArgs`, `IAbapGitPullResult`, `IAbapGitUnlinkArgs`, `IAbapGitRepoStatus`, `IAbapGitErrorLogEntry`, `IAbapGitExternalRepoCredentials`/`IAbapGitExternalRepoBranch`/`IAbapGitExternalRepoInfo`, `IAdtAbapGitClientOptions`, `AbapGitStatus`). Moved verbatim from `@mcp-abap-adt/adt-clients`' `AdtAbapGitClient`, which still owns the implementation.
- **Batch payload shapes** (`adt/IAdtBatch.ts`, since 14.0.0) — `IBatchRequestPart`, `IBatchPayload`, `IBatchResponsePart`, the wire shapes a `multipart/mixed` ADT batch is built from and parsed back into. The recording/building logic stays in `adt-clients`.
- **ADT client options** (`adt/IAdtClientOptions.ts`, since 14.0.0) — `IAdtClientOptions` (`enableAcceptCorrection`, `masterSystem`, `responsible`, `masterLanguage`, `contentTypes`, `unicode`) and `IAdtSystemContext`, so configuring a client does not require importing `adt-clients` to describe the options.
- **Content-type contract** (`adt/IAdtContentTypes.ts`, since 14.0.0) — `IAdtHeaders` (`accept`, `contentType`) and `IAdtContentTypes`, the per-operation Accept/Content-Type provider a consumer overrides for a system that needs different headers. The two shipped implementations (`AdtContentTypesBase`/`AdtContentTypesModern`, 354 lines/38 methods) and `resolveContentTypes()` stay in `adt-clients` — that is behaviour, not contract.
- **Standalone `PROG/I` includes** (`adt/IAdtInclude.ts`, since 22.0.0) — `IIncludeConfig`, `ICreateIncludeParams`, `IUpdateIncludeSourceParams`, `IDeleteIncludeParams`, plus `IAdtContentTypes.includeCreate()`. An include is a different resource from a program, measured: it answers with `include:abapInclude`, its own namespace, `adtcore:type="PROG/I"` and `include:contextRefCount`, against a program's `program:abapProgram`, `program:programType` and `PROG/P` — and the two collections advertise different accepted content types, so modelling one as a flavour of the other builds the wrong document and posts it to the wrong place. There is no `IValidateIncludeParams`: `/includes/validation` takes the same three parameters `/programs/validation` does. Creation is a modern on-prem capability — only there does discovery give the includes collection an `app:accept`, and a collection without one is not a POST target.
- **Transport search configuration** (`adt/IAdtTransport.ts`) — `IListTransportsParams.configUri` is **required** (since 14.0.0, breaking): the five filter fields it replaces (`user`, `status`, `date_range`, `target_system`, `request_type`) were never read by the server — `/sap/bc/adt/cts/transportrequests` is a saved-configuration search, not a filtered query. `IListTransportsOptions` (`configUri` optional) is the high-level surface that opts into resolving a default configuration. `ITransportSearchConfiguration` describes one saved configuration (`uri`, `etag`, `attributes`); `TRANSPORT_SEARCH_CONFIGURATIONS_URL` is where they live. The error raised when none exists belongs to the implementation — `@mcp-abap-adt/adt-clients` exports it — because this package ships contracts, not classes. See the [14.0.0 CHANGELOG entry](CHANGELOG.md) for the migration and the probe evidence.
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
  importing one — this package depends on no HTTPS implementation and ships no code
  that would use one.
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
- `IAdtWireResponse` - the transport frame returned by `makeAdtRequest()`: `data`, `status`, `statusText`, `headers`. Named `IAdtResponse` until 28.0.0, which is where the trouble was — one type meant both "what came off the wire" and "what a caller gets"
- `IAdtResponse<TValue, TError>` (`adt/IAdtResponse.ts`, since 28.0.0; reshaped in 29.0.0) - what a **member** answers with, and a **discriminated union**: `IAdtSuccess<TValue>` (`ok: true`, `getResult(): IAdtResult<TValue>`) or `IAdtFailure<TError>` (`ok: false`, `getError(): TError`). It takes the **value**, not a wrapper around it: 28.0.0 constrained the first parameter to `IAdtResult<unknown>`, so every member wrote `IAdtResponse<IAdtResult<X>>` — two wrappers where one was meant — and the contract displayed `unknown` to anyone reading it. `TError` defaults to `IAdtError` and stays constrained to it, so an implementation answering `IAdtError & { retryAfter: number }` can say so while a caller written against `IAdtError` reads it unchanged. Checking `answer.ok` narrows, so neither method is `| undefined` once you have asked
- `IAdtResult<T>` (since 28.0.0) - the result half, and a contract like the error half: `value` is what the member promised. The two halves vary differently, and that is not a slip — an error strategy varies the fullness of `IAdtError`, which has two required fields and five optional; a result strategy varies `T` itself, through the strategy overload, because `ISearchResult` requires `description` and cannot be returned half-filled. What `IAdtResult` must never hold is the transport frame — `IAdtError` keeps a `response` because diagnosing a failure needs the status it arrived with, and reading a result does not
- `IAdtError` (since 28.0.0) - the contract every error strategy returns. A strategy chooses **how much** to fill in, never what it is: `brief`, `medium` and `full` are three amounts of one contract, so a caller writes against it once. `origin` (`'connection' | 'refusal' | 'parse'` — three failures, three different remedies) and `message` are required; `adtType`, `namespace`, `response`, `request` and `cause` are what a fuller strategy adds. An implementation may fill it in however it likes and a consumer's code does not change, because the methods are the same
- **Connection capability atom** (`connection/IConnectionCapabilities.ts`) — the same split as the ADT atoms above, for the same reason: `IAbapConnection` is the minimum every transport can honour, and this is a thing only some can.
  - `ISessionLifecycleAware` — `disconnect()`, `isConnected()`, `getSessionIdentity()`
    - `disconnect()` takes no arguments (since 18.0.0). It **notifies**: it tells the server the session is finished, and whether and when the session is actually freed is the server's affair — nothing checks afterwards. That is why there is no deadline to pass; waiting for the answer to a message nobody acts on buys a caller nothing, while being the one thing that could make a teardown unbounded, since a goodbye carries no request timeout by design
    - It resolves to `void` and **always settles**. Whatever it could not finish is the connection's own state, and a repeat call performs what is still owed
    - `getSessionIdentity()` names which **server session** the connection is on. A stable client-side conversation id says nothing about whether the server replaced the session underneath it — compare two readings across an operation to detect a replacement
    - `null` is not a verdict on the connection: it means no identity is known, which happens both when no session exists *and* when the connection is live over a server that issues no session cookie. Use `isConnected()` for connection state. It follows that `null` → non-null is not a replacement, only a *changed* value is
  - `ADT_SESSION_ERROR` / `AdtSessionErrorCode` — `ADT_NOT_CONNECTED`, `ADT_SESSION_REPLACED`, `ADT_RELEASE_PENDING`. Match on the code, not on the message
  - Additive to `IAbapConnection`, which is unchanged. An RFC connection, a batch recorder and a test stub are all legitimate connections that own no HTTP session; making these methods mandatory would force each of them to implement a lie. A compile-time proof in `__typechecks__/connectionCapabilities.ts` asserts a session-less connection still satisfies `IAbapConnection`
  - `IDeferredResponseConnection` (since 14.0.0) — marks a connection (typically a batch recorder) whose responses resolve only after a later flush, so awaiting one mid-recording would deadlock. The atom carries no dependency on `IAbapConnection`, so a caller narrows whatever they already hold with a guard of their own:

    ```typescript
    function hasDeferredResponses<T extends object>(
      connection: T,
    ): connection is T & IDeferredResponseConnection {
      return (
        (connection as Partial<IDeferredResponseConnection>)
          .responsesAreDeferred === true
      );
    }
    ```
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

**GNU Lesser General Public License v3.0 only** (`LGPL-3.0-only`).
Earlier published versions were MIT and stay MIT — a licence change is not
retroactive.

Copyright © 2025–2026 Oleksii Kyslytsia

This library is free software: you can redistribute it and/or modify it under the
terms of the GNU Lesser General Public License as published by the Free Software
Foundation, version 3.

It is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
PURPOSE. See the GNU Lesser General Public License for more details.

Both texts ship with the package and both are needed: [`LICENSE`](LICENSE) is the
LGPL, [`COPYING`](COPYING) is the GPL it is written on top of, since the LGPL is a
set of additional permissions over the GPL and cannot be read alone.

**What this means if you depend on this package.** Linking it into your own
program — importing it, as every consumer of an npm package does — does not put
your program under the LGPL. What the licence asks is that changes *to this
library* stay free, and that your users can replace it with their own build.

