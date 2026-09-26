# @mcp-abap-adt/interfaces-adt

ADT contracts: object operations, the ABAP connection, runtime analysis, execution, feeds and service bindings.

## TL;DR

- **Only ADT.** The test is who imports this package: `@mcp-abap-adt/adt-clients` and whatever replaces its objects, and nobody else. Measured against every repository in development — the only others reaching in are `gcts-client` and `cloud-llm-hub`, for `IAbapConnection`, `IAbapRequestOptions` and `IAdtResponse`, which is that test met.
- What it holds: ADT object operations for 31 object types, the ABAP connection and its capability atoms, runtime analysis, execution, feeds, service bindings, `IAdtResponse` and the error codes.
- **What left, and where.** Every HTTP header name, the HTTP frame and `HttpError` → [`interfaces-network`](../interfaces-network). Cloud ALM → [`interfaces-calm`](../interfaces-calm). `XmlNode` → [`interfaces-utils`](../interfaces-utils). Authentication in general — credentials, OAuth grants, tokens, interactive login, SAML assertions, `AUTH_TYPE_JWT`/`BASIC` → [`interfaces-auth`](../interfaces-auth). Everything naming SAP or BTP — `ISapConfig`, `SapAuthType`, `SapConnectionType`, `IConfig`, `IConnectionConfig`, `IAuthorizationConfig`, `ICertificateMaterialLoader`, `IServiceKeyStore`, `ISessionStore`, `ITokenProviderResult`, the two validation results and `AUTH_TYPE_XSUAA` with its union → [`interfaces-auth-sap`](../interfaces-auth-sap). `ISessionState` and `ISessionStorage` are deleted, not moved.
- `IAdtWireResponse` extends `IHttpWireResponse` from `-network` and keeps the headers ADT sends (`sap-adt-location`, both spellings of `content-location`). Name and shape unchanged for a consumer.
- Depends on `@mcp-abap-adt/interfaces-network`, and on nothing else. Types and constants; no implementation.

## Install

```bash
npm install @mcp-abap-adt/interfaces-adt
```

## What it holds

| directory | files | what |
|---|---|---|
| `adt/` | 39 | the object contracts: capability atoms, the object types, `IAdtResponse`, `IAdtError`, the error codes, the transport request's object list |
| `connection/` | 4 | `IAbapConnection`, `IAbapRequestOptions`, the connection capability atoms, and `ITimeoutConfig` — here since 9.0.0, because `csrf` names an SAP operation rather than a transport primitive. `IAdtWireResponse` extends `IHttpWireResponse` from `-network` |
| `runtime/` | 11 | runtime analysis: `IProfiler`, the trace contracts (`ITraceListing`/`ITraceReading`, `ICrossTrace`, `ISt05Trace`), `IApplicationLog`, `IAtcLog` and the ATC run (`IAtcRunOptions`, `IAtcFindings`), `IDdicActivation`, `IGatewayErrorLog`, `IRuntimeDumps`, `ISystemMessages` |
| `execution/` | 3 | class and program execution, with profiling |
| `feeds/` | 2 | the ADT feed contracts |
| `service/` | 1 | service definitions and bindings |
| `shared/` | 1 | what more than one object type needs |

Seven directories, all ADT. `sap/`, `auth/`, `token/`, `session/`, `serviceKey/`, `store/`, `validation/` and `Headers.ts` were here until 9.0.0 and are listed above under what left; `__typechecks__/` holds 22 files that compile shapes this contract must and must not accept, and ships in no tarball.

The contract rules — what a member answers, how a strategy is supplied, how a contract is built — are in [`docs/architecture/ARCHITECTURE.md`](../../docs/architecture/ARCHITECTURE.md). Domain-by-domain documentation with examples used to sit in the facade's README; the facade is deleted, and each package documents its own contracts.

**There is no facade to stay compatible with.** It was pinned to its 44.0.0 surface in both directions — nothing from that release could disappear from it and nothing could appear without being written down — and `tools/check-surface.js`, `surface-44.0.0.txt`, `baseline-44.0.0.json` and `surface-added.txt` existed to enforce exactly that. The facade is deleted in its 52.0.0 (decision 34), so the property is gone along with the files that proved it; git holds them. What `check-surface.js` still asks is the half that never depended on it: is each symbol declared in the package `tools/package-map.json` assigns it to.

## The transport request's object list

`IAdtTransportObjectActions` and `IAbapObjectEntry` (`adt/IAdtTransport.ts`, since 1.2.0) declare what can be done to a request's object list and to its tasks: `removeObject`, `addObject`, `createTask`, `readActionLog`, `readObjects`.

They exist because deleting an ABAP object does not free its name. The CTS object-directory entry stays on the request that carried it, and until it is detached a create of the same name is refused with `CTS_WBO_API 019` — **even when that same request is passed as `corrNr`**. Without a way to detach one, the ways out are releasing the whole request, shipping everything else in it, or SE09 by hand.

Two of the signatures say things a capture cannot. 1.2.0 was declared from captures of Eclipse ADT, and Eclipse sends every attribute on every call, so nothing in a capture could show which of them the server needs. The first run against an on-premise system, 2026-09-21, found two that it does:

| call | what the server does |
|---|---|
| `createTask` without `tm:targetuser` | refused — `400 SCTS_ADT_MSG 009`, *"User&nbsp;&nbsp;does not exist in the system (or locked)"*: two spaces, because the owner resolved to an empty name |
| `removeObject` without `tm:position` | `200` with the usual echo document and **nothing removed** — 22 entries asked for by `pgmid`/`type`/`name` alone, 22 still on the task afterwards |

So `createTask` requires `targetUser` and `removeObject` requires `position`, and `readObjects` was added because otherwise the second would require a value this package offers no way to obtain — leaving a caller to parse a transport document themselves for a `tm:position`. It is its own member because it answers its own thing: entries, each with its position as a value, rather than a document. What an implementation sends to get them is its own business; the contract says what must come back.

`addObject` still takes an entry without a position — one that does not exist yet has none.

## Migrating to 10.0.0

Every member that answers an `IAdtResponse` takes the error strategy with the
call now — `options` carrying `analyse`. A **caller** changes nothing: the new
parameter is optional, and a call without it compiles as before. What changes is
that a caller *can* pass one everywhere:

```ts
const answer = await utils.deleteObjectsGroup(objects, transport, {
  analyse: analyseDeletion,   // reads del:isDeleted and every del:message
});
```

An **implementation** changes each member it offers from the list in the
changelog: accept the options, and hand `analyse` to whatever turns the answer
into an `IAdtResponse`.

```ts
// before
lock(config: Partial<TConfig>): Promise<IAdtResponse<string>>;
// after — the pair every atom has
lock<E extends IAdtError>(
  config: Partial<TConfig>,
  options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
): Promise<IAdtResponse<string, E>>;
lock(config: Partial<TConfig>, options?: IAdtAnalyseOptions): Promise<IAdtResponse<string>>;
```

An implementation that keeps the old one-parameter signature still type-checks —
TypeScript accepts a function with fewer parameters — and silently drops the
caller's strategy. Test that it is honoured; the contract cannot.

Three signatures changed shape rather than growing a parameter:

- `IAdtRunnable.run` always has a second parameter; a flavour without options
  gets `options?: IAdtAnalyseOptions`.
- `ViewArgs` always yields one, so `ITraceReading.read` on a view without
  options takes `options?: IAdtAnalyseOptions`.
- `ITraceListing<TEntry, TOptions, TList = TEntry[]>` — `list` answers `TList`.
  Existing instantiations keep their meaning.

An implementation also stops interpreting on its own: with no `analyse`, it
answers what the transport saw, and a refusal SAP wrote inside a 200 is a
document until a strategy reads it. Decision 36 in the repository's
`docs/architecture/DECISIONS.md` says why the error strategy travels with the
call while the result strategy is given at construction.

## Migrating to 9.0.0

Nothing changed shape. Every break is an import moving to the package that
declares the name now, so `tsc` finds all of them and none of them silently.

```ts
// Authentication in general — 32 names, among them:
- import type { IAuthProvider, ITokenProvider, ITokenRefresher } from '@mcp-abap-adt/interfaces-adt';
+ import type { IAuthProvider, ITokenProvider, ITokenRefresher } from '@mcp-abap-adt/interfaces-auth';

// Authentication that names SAP or BTP — 16 names, among them:
- import type { ISapConfig, IConnectionConfig, ISessionStore } from '@mcp-abap-adt/interfaces-adt';
+ import type { ISapConfig, IConnectionConfig, ISessionStore } from '@mcp-abap-adt/interfaces-auth-sap';
- import { AUTH_TYPE_XSUAA, AUTH_TYPES } from '@mcp-abap-adt/interfaces-adt';
+ import { AUTH_TYPE_XSUAA, AUTH_TYPES } from '@mcp-abap-adt/interfaces-auth-sap';
+ import { AUTH_TYPE_JWT, AUTH_TYPE_BASIC } from '@mcp-abap-adt/interfaces-auth';   // not re-exported

// An HTTP failure, and a parsed node:
- import type { HttpError, XmlNode } from '@mcp-abap-adt/interfaces-adt';
+ import type { HttpError } from '@mcp-abap-adt/interfaces-network';
+ import type { XmlNode } from '@mcp-abap-adt/interfaces-utils';

// And one arriving here, from interfaces-network:
- import type { ITimeoutConfig } from '@mcp-abap-adt/interfaces-network';
+ import type { ITimeoutConfig } from '@mcp-abap-adt/interfaces-adt';
```

**Three names are not anywhere.** `ISessionState` and `ISessionStorage` are
deleted — cookies, a CSRF token and a cookie store are HTTP session state, which
no package's subject names and which no repository under development imports; a
consumer that wants them declares them, since what a cookie jar holds is an
implementation's business. `AuthTypeEnum` was an alias of `AuthType`, and one
contract with two names is something a consumer has to guess between: take
`AuthType` from `interfaces-auth-sap`.

**Ranges, so an install resolves one copy of each package.** A range one major
behind is what npm answers by silently nesting a second copy, so a consumer on
this release takes `interfaces-network@^2.0.0` and the current major of whichever
of `interfaces-auth`, `interfaces-auth-sap` and `interfaces-utils` it imports
from — at the time of writing `interfaces-auth@^2.0.0`, `interfaces-auth-sap@^1.0.1`
and `interfaces-utils@^1.1.0`.

Decision 35 in the repository's `docs/architecture/DECISIONS.md` says why each
name went where it did, and why the accepting package stopped deciding it.

## Migrating to 7.0.0

Two changes.

```ts
// 1. The write's body goes in the options, and only there. Six configs —
//    domain, data element, package, table type, function group, transport
//    request — no longer declare `source`.
- await domain.updateMetadata({ domainName, source: edited }, { lockHandle });
+ await domain.updateMetadata({ domainName }, { source: edited, lockHandle });

// 2. The task types are a constant, so nobody repeats the letters.
- await actions.changeTaskType(task, 'S');
+ await actions.changeTaskType(task, ADT_TASK_TYPE.developmentCorrection);
```

A `check` or `validate` keeps taking its source in the config: it compiles
text the server does not hold yet and has no options channel to take it from,
which is the one job a `source` on a config still has. The six types above
have no such member, so nothing read theirs but the write.

`'S'` still compiles, and so does a declaration that spells the union out:
`AdtTaskType` is an alias for those three values, and TypeScript compares
types structurally, so the two are mutually assignable. **The second change
breaks nothing at the type level** — it is here because the letters now have
one home, not because a caller must react to it. The break in 7.0.0 is the
first change, the six configs. `ADT_TASK_TYPE` and `AdtTaskType` are exported from this package and
**not** from the `@mcp-abap-adt/interfaces` facade: everything the facade
forwards is deprecated in favour of importing from the package that declares
it, so a new symbol there would be born deprecated.

Decision 33 in the repository's `docs/architecture/DECISIONS.md` says why the
body has one channel, and what measurement decided which configs keep the
field.

## Migrating to 2.0.0

Three changes, all of them in `IAdtTransportObjectActions`. An implementation or a caller on 1.2.0 does this:

```ts
// 1. Name the fifth type parameter: what readObjects answers.
type Actions = IAdtTransportObjectActions<
  string, string, { number: string }, string[],
  MyEntry[]                      // ← new
>;

// 2. Read the position rather than leaving it out.
const listed = await actions.readObjects(task);      // ← new member
const entry = listed.ok
  ? listed.getResult().value.find((o) => o.name === 'ZCL_X')
  : undefined;
if (entry) await actions.removeObject(task, { ...entry });

// 3. Name the user the task is for.
await actions.createTask(request, { targetUser: 'DEVELOPER' });
```

Both old call shapes compile against 1.2.0 and cannot work: `createTask(n)` throws where an implementation reads `options.targetUser`, and `removeObject(n, { name, type })` answers a success while removing nothing. That is why this is a major rather than a deprecation — there is no window in which the old shape does something useful.

`src/__typechecks__/transportObjectActions.ts` holds both wrong shapes as `@ts-expect-error`, so a future loosening stops compiling instead of shipping.

## Coming from `@mcp-abap-adt/interfaces`

Replace the package name in the import. The facade is **deleted** as of its 52.0.0, which was never published — npm still serves 51.0.0, with every symbol re-exported and deprecated, to anyone pinned to it. There is nothing further to move to: take the package that declares the name.

## Licence

`LGPL-3.0-only`.
