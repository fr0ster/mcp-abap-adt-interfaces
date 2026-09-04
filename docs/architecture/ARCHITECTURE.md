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

`@mcp-abap-adt/interfaces` is **the contract, and nothing else**. 346 exported
symbols, of which 51 carry runtime values: 43 string constants (`HEADER_*`,
`AUTH_TYPE_*`, `ADT_NO_FAILURE`), 6 maps of codes (`AdtObjectErrorCodes`,
`NETWORK_ERROR_CODES`, `SERVICE_BINDING_VARIANT_MAP` and three more) and 2 enums
(`AuthMethodPriority`, `LogLevel`). Everything else is a type. It emits **no class and no function** —
every other module compiles to an empty JavaScript file.

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

**It depends on nothing.** No runtime dependencies, and no dependency on the
implementation package. The arrow runs one way:

```
@mcp-abap-adt/interfaces          ← contracts, no code
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
| error | `(verdict, answer?) => IAdtError \| AdtNoFailure` | to the implementation at construction, and — on the nine members that take `IAdtOperationOptions` — overruled per call through `analyse` |
| result | `IResultStrategy<T>` = `(answer: IAdtWireResponse) => T` | to the implementation at construction; the member's result type follows it |

Both are handed the whole answer — status, headers, body — because a reading may
need any of it.

**The two axes are not equally visible in the contract, and that is worth saying
plainly.** The result axis is: a member's result type is a type parameter of its
interface, so what a given implementation answers is written in its type. The
error axis is not. `IAdtOperationOptions.analyse` reaches exactly nine members —
`create`, `read`, `readMetadata`, `update`, `delete`, `validate`, `check`,
`activate` and `readTransport`, all on the capability atoms. The other 88 take no
options at all; `ITraceDeletion.delete(traceId)` is the plain case, one argument
and no seam.

For those, the reading is the implementation's, chosen when it is constructed,
and this package does not name that constructor — `@mcp-abap-adt/adt-clients`
does, because a contract that described how a default is composed would have
stopped being a contract (decision 20). What the contract does carry is the
*shape* every strategy must answer, `IAdtError`, and the room to say a fuller one
comes back: `IAdtResponse<TValue, TError extends IAdtError>`. No interface
instantiates that second parameter today, so a consumer whose failures carry more
than `IAdtError` states it at their own boundary rather than in ours. Named here
rather than left to be discovered; whether it should change is a question for a
later release, not a gap this one hides.

### Where a strategy is supplied

**Into the implementation, once** (decision 22). A member's result type is a type
parameter of its interface, defaulting to the shape it answered before:

```typescript
interface IAdtPackageBrowsing<TContents> {
  getPackageContents(name: string): Promise<IAdtResponse<TContents>>;
}

// one implementation's reading            // another's
const items: IAdtPackageBrowsing<PackageItem[]>
const raw: IAdtPackageBrowsing<string>
await items.getPackageContents('Z1');      await raw.getPackageContents('Z1');
//   → PackageItem[], declared there       //   → the document, untouched
```

**No default, and no shape named here.** 31.0.0 took both out: the shapes went to
the implementations that read them, and the defaults went with them, because a
default is a claim about what a reading produces.

No member takes a parser argument. That was tried across 23 members and
reverted: it is a second signature every implementer owes whether or not their
callers use it, and it moves the result's meaning from the contract to the call
site.

Where an interface has more than three distinct answers the parameters travel
together as a record — `IAdtServiceBinding<R extends IServiceBindingResults>` —
because `IAdtService<A, B, C, D, E>` is a signature nobody can call.

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

### ADT contracts — 97 members, all answering `IAdtResponse`

| directory | what it holds |
|---|---|
| `adt/` (40 files) | the capability atoms (`IAdtCreatable`, `IAdtReadable`, …), one file per ADT object type with its config and low-level params, the cross-cutting utilities (`IAdtInformationSystem`, `IAdtRepositoryStructure`, `IAdtPackageBrowsing`, `IAdtGroupLifecycle`, `IAdtDataPreview`, `IAdtDiscovery`, `IAdtObjectAccess`), transport, abapGit, client options, content types |
| `runtime/` (12) | what a system says about itself after the fact — profiler and traces, dumps, ATC, application log, DDIC activation, gateway errors, system messages |
| `service/` (1) | the service binding: what it has that the atoms do not cover |
| `feeds/` (2) | the ADT feed repository |
| `execution/` (3) | being run: `IAdtRunnable`, the two profiler atoms, trace scheduling, and the two executors composed from them |

An object type is **not** a wide interface. A handler declares the atoms it
honours, and a type states what is supported, never what is lacking (decision 2)
— there is no atom for "everything but versions".

### Infrastructure — not ADT contracts

`auth/`, `connection/`, `session/`, `serviceKey/`, `storage/`, `store/`,
`token/`, `logging/`, `sap/`, `validation/`, `shared/`, `utils/`.

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
| what counts as a failure, everywhere | the error strategy the implementation is constructed with |
| what counts as a failure, for one call | `analyse`, on the nine capability members that take `IAdtOperationOptions` |
| the headers a request carries | your own `IAdtContentTypes` |
| how a request is made at all | your own `IAbapConnection` |
| a whole family | your own implementation of those atoms |

The last row is the test the package is built to pass, and it is asserted rather
than assumed: `src/__typechecks__/` contains 22 files whose job is to prove that
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
   over `src/`, which includes the typechecks).
2. **The typechecks** — 22 files of compile-only assertions, including the ones
   that must *fail* (`@ts-expect-error`). They are the tests of a package that
   has nothing to run.
3. **Enumerate, edit, count** — a removal is verified by listing the targets,
   editing, then grepping every touched symbol across `src`, `README.md` and
   `docs/`, and comparing counts. Six review rounds on #63 found zero defects in
   the types and every one of them in prose.
4. **The docs against the emitted `.d.ts`** — every symbol the CHANGELOG claims
   removed must be absent from the export clauses of `dist/index.d.ts`, and every
   name the release promises must be present. This check exists because it was
   needed: 30.0.0 announced three aliases as removed while they were still
   exported.
