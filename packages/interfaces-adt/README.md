# @mcp-abap-adt/interfaces-adt

ADT contracts, the ABAP connection, and SAP/BTP configuration and authentication contracts.

## TL;DR

- Everything a package on the SAP side accepts: ADT object operations, runtime analysis, execution, feeds, services, the ABAP connection, SAP/BTP configuration, token providers, SAML assertion validation, session and service-key stores, and header validation.
- **Two things left in 8.0.0.** Every HTTP header name, and the groups over them, are in [`@mcp-abap-adt/interfaces-network`](../interfaces-network) — a header name says how a value travels, not what it means, and nothing here ever used one. The Cloud ALM contracts are [`@mcp-abap-adt/interfaces-calm`](../interfaces-calm) — Cloud ALM is not ABAP. `AUTH_TYPE_JWT` and its siblings stay: those are values a header carries.
- `IAdtWireResponse` now extends `IHttpWireResponse` from `-network` and keeps the headers ADT sends (`sap-adt-location`, both spellings of `content-location`). The name and shape are unchanged for a consumer.
- Depends on `@mcp-abap-adt/interfaces-auth`, `@mcp-abap-adt/interfaces-network` and `@mcp-abap-adt/interfaces-utils`. Types and constants; no implementation.
- Moved unchanged from `@mcp-abap-adt/interfaces` 44.0.0. Most majors of that package came from these contracts; this package now carries them alone.

## Install

```bash
npm install @mcp-abap-adt/interfaces-adt
```

## What it holds

| directory | what |
|---|---|
| `adt/`, `runtime/`, `execution/`, `feeds/`, `service/`, `shared/` | the ADT contracts: capability atoms, object types, `IAdtResponse`, runtime analysis, execution |
| `connection/` | `IAbapConnection`, `IAbapRequestOptions`, the connection capability atoms, `ICalmConnection`, `CalmService` |
| `sap/`, `auth/` | `ISapConfig`, `IConnectionConfig`, `IAuthorizationConfig`, `IConfig`, `IAuthorizationStrategy`, the callback-server contracts, `ICertificateMaterialLoader`, `AuthTypeEnum`; `IAssertionValidator` with `AssertionContext`, `ValidatedAssertion`, `IAssertionReplayStore` and `ASSERTION_ERROR_CODES` |
| `token/`, `session/`, `serviceKey/`, `store/` | token providers and refreshers, stores and their error codes |
| `validation/`, `Headers.ts` | header validation; `HEADER_SAP_*`, `HEADER_UAA_*`, `HEADER_BTP_DESTINATION`, `HEADER_MCP_DESTINATION`, `HEADER_MCP_URL`, `AUTH_TYPES`, `AuthType` |

The contract rules — what a member answers, how a strategy is supplied, how a contract is built — are in [`docs/architecture/ARCHITECTURE.md`](../../docs/architecture/ARCHITECTURE.md). Domain-by-domain documentation with examples stays in the [`@mcp-abap-adt/interfaces` README](../interfaces/README.md); the contracts it describes are these.

**The facade is pinned to its 44.0.0 surface, not frozen against additions.** This said the opposite until 2.0.0, and 45.1.0 had already disproved it: `IAbapObjectEntry` and `IAdtTransportObjectActions` were added here and re-exported there. `tools/check-surface.js` compares the built facade against `surface-44.0.0.txt` in both directions — nothing from 44.0.0 may disappear and nothing may appear — and an addition is made deliberate rather than impossible by being written into `tools/surface-added.txt`, one `<name> <kind>` per line. A symbol added here and not written there fails the check; a line written there for a symbol the facade does not export fails too.

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
