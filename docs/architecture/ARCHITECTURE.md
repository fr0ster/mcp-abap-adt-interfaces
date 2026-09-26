# Architecture

What this package is, how its surface is shaped, and where the line to an
implementation runs.

Its companion is [`DECISIONS.md`](DECISIONS.md), which holds the *why* — every
choice that could reasonably have gone the other way, what it was decided
against, and what would change it. This file holds the *what*. The README holds
the inventory: which symbol lives where.

Measured against the tree at 30.0.0. Numbers here are counted from the emitted
`dist/index.d.ts`, not from memory.

---

## 1. What this package is

This repository is **the contract, and nothing else** — six packages, no
facade over them since decision 34. **311 exported symbols**, of which 53 carry
runtime values: 36 string constants (24 `HEADER_*`, 10 `AUTH_TYPE_*`,
`ADT_NO_FAILURE`, `TRANSPORT_SEARCH_CONFIGURATIONS_URL`), 8 maps of codes or
letters (`AdtObjectErrorCodes`, `ADT_SESSION_ERROR`, `ADT_TASK_TYPE`,
`SERVICE_BINDING_VARIANT_MAP`, `NETWORK_ERROR_CODES`, `ASSERTION_ERROR_CODES`,
`STORE_ERROR_CODES`, `TOKEN_PROVIDER_ERROR_CODES`), 7 groups over other
constants (the five header groups, `AUTH_TYPES`, `CALM_SERVICES`) and 2 enums
(`AuthMethodPriority`, `LogLevel`). Everything else is a type. It emits **no
class and no function** — every other module compiles to an empty JavaScript
file.

That is a design constraint, not an accident of scope. A contract says what a
thing *is*; shipping one way of being it makes "use your own implementation"
untrue for that piece.

**The same line runs through the types.** This package carries what a consumer
needs to *use* one of these contracts or to *replace* it — member signatures,
request parameters, `IAdtResponse`, `IAdtError`, `IResultStrategy`, and the
constants they name. What a reading builds out of a document is the
implementation's: `adt-clients` ships strategies and the shapes they return are
its own, and a replacement declares its own. Declaring every result shape here,
with every field required, is how a contract package becomes a schema catalogue —
decision 24 — and 31.0.0 acted on it: sixty-three exported symbols left, all of
them result shapes or their parts, and their
type-parameter defaults left with them, because a default is a claim about what a
reading produces. So `AdtOperationError`, `isNetworkError()` and
`hasDeferredResponses()` were removed in 29.0.0, and the classes that *are* these
shapes live in `@mcp-abap-adt/adt-clients`, where a consumer takes them from if
they want `instanceof` as a convenience.

**It depends on no implementation and no runtime package.** Since 45.0.0 the
contract is split by who accepts it (decision 26), and since 52.0.0 the
`interfaces` facade that forwarded them all is deleted (decision 34) — a
consumer names the package that declares what they use. A contract package may
depend on a sibling contract package, and on nothing else:

```
interfaces-utils          interfaces-network
       ▲                        ▲            ▲
interfaces-auth   interfaces-adt-connection   interfaces-calm
       ▲                        ▲
interfaces-auth-sap       interfaces-adt
```

Five edges, and each one is the only dependency its package has.
`interfaces-adt-connection` reaches `interfaces-network` for the HTTP frame and
nothing else; `interfaces-adt` reaches the connection, because its strategies
are handed an `IAdtWireResponse`, and gets the frame through it — since 11.0.0
it has no edge to `interfaces-network` of its own (decision 38).
`interfaces-calm` reaches `interfaces-network` for the same frame, Cloud ALM
having no ABAP in it; `interfaces-auth` reaches `interfaces-utils` for
`ILogger`, and `interfaces-auth-sap` reaches `interfaces-auth` — `utils` arrives
through it, which makes it that package's dependency rather than its own.

**A dependency nothing imports is a defect, not a spare edge**, and
`npm run check:graph` fails on one: two of these were declared after the last
import of them left, one of them in a `tsconfig` project reference alone.

The arrow to implementations still runs one way:

```
@mcp-abap-adt/interfaces-*        ← contracts, no code
        ▲                    ▲
        │                    │
@mcp-abap-adt/adt-clients    a consumer's own implementation
        ▲
        │
mcp-abap-adt (MCP server), backup tools, scripts, human-facing tooling
```

A consumer writes against the contract and can replace the implementation
wholesale, or one family of it, without touching their own code. That is the
entire point of the package existing; every rule below serves it.

---

## 2. What an answer is

Every ADT member answers one shape. There are 97 such members, and **no member
in the ADT families answers anything else** — no bare value, no transport
envelope, no throw.

```typescript
type IAdtResponse<TValue, TError extends IAdtError = IAdtError> =
  | IAdtSuccess<TValue>   // ok: true,  getResult(): IAdtResult<TValue>
  | IAdtFailure<TError>;  // ok: false, getError(): TError
```

A discriminated union, so a caller cannot reach `getResult()` without the
compiler having made them ask `ok` first. A forgotten check does not compile.

**No member of this contract throws.** There is no `@throws` tag in the package.
A thrown error is invisible to the compiler, so a consumer never learns from the
type that a failure path exists — decision 20.

That is a statement about **what the server's answer becomes**, not a ban on
exceptions inside an implementation. The two are different failures: what SAP
said, or did not say, is described here and comes back as `IAdtError`; what goes
wrong *inside* a library while it reads that answer is that library's own, and it
may throw. `'parse'` left `AdtFailureOrigin` in 31.0.0 for exactly this reason —
a strategy is free to read an answer any way it likes, or not to parse at all.

### The two axes

The library obtains the answer; the consumer decides what it *means*, on two
independent axes:

```
wire response
  → error strategy    decides whether this is a failure at all → IAdtError
  → result strategy   decides what a non-failure becomes       → IAdtResult<T>
```

The order is fixed: the failure question is answered first, because a result
strategy must not be asked to make a value out of a refusal.

The axes are genuinely independent, and a missing object shows it better than an
argument: ADT answers a read for one with **200 and an empty body**. A
read-modify-write must call that a failure, since writing back what it read
erases the object. A listing must call it an empty list. Same bytes, opposite
readings, and neither is the library's to impose.

| axis | shape | supplied |
|---|---|---|
| error | `(verdict, answer?) => IAdtError \| AdtNoFailure` | **with every call**, through `analyse` in the member's options (decision 36) |
| result | `IResultStrategy<T>` = `(answer: IAdtWireResponse) => T` | to the implementation at construction; the member's result type follows it |

Both are handed the whole answer — status, headers, body — because a reading may
need any of it.

**Each axis has one place, and every member offers it.** The result strategy is
given when the implementation is constructed, and a member's result type is a type
parameter of its interface, so what an implementation answers is written in its
type. The error strategy is given with the call: every member that answers an
`IAdtResponse` takes `options` carrying `analyse` (`IAdtAnalyseOptions`), and the
failure type it names flows into the answer — `IAdtResponse<TValue, E>`, inferred
from the strategy passed.

An implementation given no `analyse` interprets nothing. It answers what the
transport saw — a status that was not 2xx, a host that did not answer — and a
refusal SAP wrote inside a 200 stays a document until a strategy reads it. The
readings that find those refusals are not the implementation's to ship; they are
strategies a consumer passes, from their own code or from a package of them.

Until 10.0.0 this was lopsided, and this section said so: of the 96 members
that answer an `IAdtResponse`, `analyse` reached 17 — eleven on the capability
atoms and six on the transport request's object actions — and the other 79 took
no options at all, so for them the reading was whatever the implementation had
been built with and the caller had no say. (This section used to count "eleven
and 88"; the count above is the compiler's, over every exported interface.) A lock, a version listing, a dump, a trace and a group deletion
all had that gap. `__typechecks__/errorStrategyOnEveryMember.ts` now fails to
compile if a member answering an `IAdtResponse` stops taking `analyse`.

### Where a strategy is supplied

**Into the implementation, once** (decision 22). A member's result type is a type
parameter of its interface, and the interface names no shape for it:

```typescript
interface IAdtObjectSearch<TSearch> {
  search(criteria: ISearchObjectsParams): Promise<IAdtResponse<TSearch>>;
}

// one implementation's reading            // another's
const hits: IAdtObjectSearch<SearchHit[]>
const raw: IAdtObjectSearch<string>
await hits.search({ query: 'Z*' });        await raw.search({ query: 'Z*' });
//   → SearchHit[], declared there         //   → the document, untouched
```

**No default, and no shape named here.** 31.0.0 took both out: the shapes went to
the implementations that read them, and the defaults went with them, because a
default is a claim about what a reading produces.

No member takes a parser argument. That was tried across 23 members and
reverted: it is a second signature every implementer owes whether or not their
callers use it, and it moves the result's meaning from the contract to the call
site.

Where an interface has more than three distinct answers the parameters travel
together as a record — `ICrossTrace<R extends ICrossTraceResults>` — because
`ICrossTrace<A, B, C, D, E>` is a signature nobody can call: the fourth is
unnameable without spelling the first three, and a consumer overriding one
reading would be counting positions.

The example used to be `IAdtServiceBinding`, which is gone: it was the only
interface in this package tied to one object type, and a binding is the
capability atoms composed, like every other object.

**What a strategy is not given** is anything the implementation did on the way.
Preliminary requests — fetching a node id, a scope document, a token — are its
own business and reach the consumer only as failures. A contract states what is
asked, never which requests were issued to answer it.

---

## 3. How a contract is built

**One endpoint is one member** (decision 16). Two members whose implementations
issue the same request, differing only in how far the answer was parsed, are one
member and a strategy. A chain over several resources is an operation, not a
second reading, and stays one member — `getWhereUsedList` reads a scope document
and then the references, and that is one thing a caller asks for.

**Minimal contracts, composed — never inherited** (decision 23). No contract
extends another. Each declares what is its own, and the consumer spells the
composition where they need it:

```typescript
type Requests = IAdtRequest & IAdtCreatable<ITransportConfig, string>;

type ClassExecutor =
  IAdtRunnable<IClassExecutionTarget, string> &
  IRunnableWithProfiler<IClassExecutionTarget, string, IClassExecuteWithProfilerOptions> &
  ITraceScheduling;
```

Inheritance decides for the composer what belongs together: a consumer who wants
the listing without the CRUD, or renewal without the whole auth provider, has no
way to say so, and every implementation of the narrow thing is forced to provide
the wide one. It also hides a second name for one idea — `IExecutor` read as a
contract looked like a thing, and read as its members was `IAdtRunnable` twice
over with different options.

**A contract takes what the endpoint takes** (decision 17). Parameters that exist
to *derive* what the request carries belong to the implementation that derives
them. A boolean that changes what the result *is* — `includeRawXml` — is a
strategy wearing a parameter's clothes, and is not a parameter at all.

**Every returned shape has a name** (decision 6), and the name is measured
(decision 1). A field appears because a captured response carried it, not because
it seemed likely.

---

## 4. The families

`src/` is organised by what a family *is*, not by layer. Two groups, and the
distinction decides which rules above apply.

**Which package holds them** (decision 26 for whether a contract belongs here at
all, decision 35 for which package). A contract lives where its **own fields**
put it, not with its first acceptor:

- `@mcp-abap-adt/interfaces-adt` — the ADT contracts and the ABAP connection,
  and nothing else. `ITimeoutConfig` is here rather than in `-network` because
  `csrf` names an SAP operation.
- `@mcp-abap-adt/interfaces-network` — the HTTP frame `IHttpWireResponse`,
  `HttpError`, the WebSocket transport, the network error codes, and **every**
  header name with the five groups over them: a header name says how a value
  travels, not what it means.
- `@mcp-abap-adt/interfaces-auth` — authentication anywhere: credentials, OAuth
  grants, tokens, interactive login, SAML assertions, `AUTH_TYPE_JWT`,
  `AUTH_TYPE_BASIC`.
- `@mcp-abap-adt/interfaces-auth-sap` — authentication that names something SAP
  or BTP owns: `ISapConfig`, `IConnectionConfig` (it carries `sapClient`),
  service keys, destinations, UAA, and `AUTH_TYPE_XSUAA` with the union over all
  three, XSUAA being a BTP service.
- `@mcp-abap-adt/interfaces-calm` — Cloud ALM, which is not ABAP.
- `@mcp-abap-adt/interfaces-utils` — `ILogger`, `LogLevel`, `XmlNode`: what
  belongs to no one system.

`storage/` is gone rather than placed: `ISessionState` and `ISessionStorage`
described cookies and a CSRF token, which no package's subject names and no
consumer imports, so they were deleted in `interfaces-adt` 9.0.0.

### ADT contracts — every member answering `IAdtResponse`

Over 110 of them, counted as method signatures declared in the directories
below; the exact figure moves with every object type, which is why the interest
is in the shape rather than the number.

| directory | what it holds |
|---|---|
| `adt/` (39 files) | the capability atoms (`IAdtCreatable`, `IAdtReadable`, …), one file per ADT object type with its config and low-level params, the cross-cutting utilities (`IAdtInformationSystem` and the four atoms it composes, `IAdtRepositoryStructure`, `IAdtGroupLifecycle`, `IAdtDataPreview`, `IAdtDiscovery`, `IAdtObjectAccess`), transport, abapGit, client options, content types |
| `runtime/` (11) | what a system says about itself after the fact — the profiler, the ABAP and SQL traces, dumps, ATC (log and run), application log, DDIC activation, gateway errors, system messages |
| `service/` (1) | the service binding: what it has that the atoms do not cover |
| `feeds/` (2) | the ADT feed repository |
| `execution/` (3) | being run: `IAdtRunnable`, the two profiler atoms, trace scheduling, and the two executors composed from them |
| `shared/` (1) | what more than one object type needs |

An object type is **not** a wide interface. A handler declares the atoms it
honours, and a type states what is supported, never what is lacking (decision 2)
— there is no atom for "everything but versions".

### Infrastructure — not ADT contracts

They are not in `interfaces-adt` any more, which is the point of 9.0.0:
`auth/`, `token/`, `store/` and the assertion contracts are `interfaces-auth`;
`sap/`, `session/`, `serviceKey/` and `validation/` are `interfaces-auth-sap`;
the header names, the HTTP frame and the WebSocket transport are
`interfaces-network`; `logging/` and `XmlNode` are `interfaces-utils`. The ABAP
connection itself — `IAbapConnection`, its capability atoms, `IAdtWireResponse`,
`ITimeoutConfig` — is an ADT contract, and since 11.0.0 it is its own package,
`interfaces-adt-connection`, which `interfaces-adt` stands on (decision 38).

These describe how a connection is made and kept, not what ADT answered. The
two-axis model does not apply to them: there is no server answer to shape and no
ADT failure to classify. `IAbapConnection.makeAdtRequest` answering
`IAdtWireResponse` is the transport itself — which is exactly what an
`IResultStrategy` is handed.

Some of them do reject rather than answer, and that is correct: a credential that
cannot be built fails the connect.

---

## 5. The seam

A consumer overrides at whichever seam they need, without reaching into the
implementation package:

| to change | supply |
|---|---|
| what an answer becomes | an `IResultStrategy`, at construction |
| what counts as a failure | `analyse`, with the call — every member takes it |
| the headers a request carries | your own `IAdtContentTypes` |
| how a request is made at all | your own `IAbapConnection` |
| a whole family | your own implementation of those atoms |

The last row is the test the package is built to pass, and it is asserted rather
than assumed: `interfaces-adt/src/__typechecks__/` contains 22 files whose job is to prove that
something written **outside** this package can satisfy each contract — one family
alone, composed families, a consumer's own readings, and the shapes that must
*not* compile.

---

## 6. What is deliberately absent

- **Validation.** The server judges its own documents; the library does not
  pre-empt it (decision 4).
- **Parsers.** A big document is the consumer's to read, and they keep a type
  while doing it (decision 5).
- **Anything unmeasured.** A member is added because someone needs it, not
  because a sibling has one (decision 11), and a shape is named from a capture,
  not from a guess (decision 1).
- **Contracts nobody can yet state.** The debugger, memory snapshots and batch
  left in 30.0.0 for a research branch of `adt-clients` and come back measured —
  39 of `IDebugger`'s 42 members answered the transport envelope, which is what a
  contract looks like before anyone knows what its endpoints return. Publishing
  one migrates every consumer twice.

---

## 7. How this is kept true

There is no CI on this repository. What holds instead:

1. **The compiler** — `npm run build` and `npm run test:check` (`tsc --noEmit`
   over every package's `src/`, which includes its typechecks).
2. **The typechecks** — 25 files of compile-only assertions (21 in
   `interfaces-adt`, 3 in `interfaces-auth`, 1 in `interfaces-auth-sap`),
   including the ones that must *fail* (`@ts-expect-error`). They are the tests
   of a package that has nothing to run.
3. **Enumerate, edit, count** — a removal is verified by listing the targets,
   editing, then grepping every touched symbol across `src`, `README.md` and
   `docs/`, and comparing counts. Six review rounds on #63 found zero defects in
   the types and every one of them in prose.
4. **The docs against the emitted `.d.ts`** — every symbol the CHANGELOG claims
   removed must be absent from the export clauses of `dist/index.d.ts`, and every
   name the release promises must be present. This check exists because it was
   needed: 30.0.0 announced three aliases as removed while they were still
   exported.
5. **Placement** — `npm run check:surface` checks each symbol against the
   package `tools/package-map.json` assigns it to. It used to do more: it proved
   the `@mcp-abap-adt/interfaces` facade exported exactly the 44.0.0 contract,
   against `tools/surface-44.0.0.txt` and `tools/baseline-44.0.0.json`, with
   every addition, removal and change since the split written down one by one.
   The facade is deleted (decision 34), so that half is gone with its baseline
   files and `generate-baseline.js`; git holds what they proved. Placement is
   the half that never depended on the facade, and it is the question the split
   exists to keep answerable.
6. **The package graph** — `npm run check:graph`: every import is one the graph
   in §1 allows and is declared in that package's `package.json`, **and every
   declared dependency is imported**. The second half was added after a review
   found `interfaces-utils` declared by two packages that import nothing from it,
   and a `tsconfig` project reference outliving the import that justified it by a
   release: checking one direction only says a dependency is permitted, never
   that it is used.
7. **What npm installs** — `npm run check:packed` packs every package, installs
   the tarballs into a clean project with Node's types and no workspace links,
   type-checks the published `.d.ts` files without `skipLibCheck`, and requires
   each package to load on its own. It used to compare every declaration and
   constant against the 44.0.0 baseline on both the facade's path and the
   package's; there is no facade path any more. `check:deprecated` was the
   eighth guard — every forwarded symbol had to report TS6385 — and went with
   the facade it interrogated.
8. **The release tool** — `npm run check:publish` runs `tools/publish-changed.js`
   against throwaway git repositories with a fake `npm` first on `PATH`, and
   checks what it does with the publish it cannot otherwise be given: the
   arguments, the order, that a failure stops the run before the next package,
   that a failing check publishes nothing, and that a version the registry never
   serves is reported rather than assumed. The guards that run before a publish
   are exercised against the real repository; this covers the half that only a
   release would reach. Each fixture's `semver` is a proxy that records being
   loaded and delegates to this repository's copy, so the marker is written by
   the module the script itself required; and a separate case checks that the
   installed copy satisfies the range in `package.json` and equals the version in
   `package-lock.json`. Both exist because weaker versions of this passed:
   symlinking the whole `node_modules` let node walk past a missing dependency to
   a stray copy in an ancestor of the temporary directory, so the suite was green
   with the declared dependency uninstalled; and comparing the installed copy
   with itself, or asking a probe file rather than the script, asserted nothing.
   Why the release works this way, and why a check that has never failed is an
   assumption: decision 28.
   `npm run check` runs 1 and 5–8, and every package's `prepublishOnly` runs
   `npm run check`.
