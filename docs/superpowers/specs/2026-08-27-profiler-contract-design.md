# One contract for reading what a run produced

**Status:** design — split and scope approved; contract sketch compiles
**Packages:** this one (breaking, 22.0.0), consumed by `@mcp-abap-adt/adt-clients`
**Evidence:** measured in `@mcp-abap-adt/adt-clients`, the main consumer of `IProfiler`
**Supersedes:** fr0ster/mcp-abap-adt-interfaces#45, which adds two members to the bag this dismantles

## What this changes

`IProfiler` becomes the one contract for **reading the results a run left behind**, with an
implementation per trace family. Everything about *causing* a run to be measured leaves it and
goes to the executors, which is where the run already lives.

The contract stops promising HTTP calls and starts promising results.

## Why — measured, not argued

Every claim below was checked against this repository and, where it says so, against a system.

### The contract has one real consumer

| member | call sites in this repository |
|---|---|
| `list()` | **39** |
| `getParameters()` | one test, one JSDoc example |
| `createParameters`, `getHitList`, `getStatements`, `getDbAccesses`, `listRequests`, `getRequestsByUri`, `listObjectTypes`, `listProcessTypes` | **tests only — no product caller** |
| `getParametersForCallstack()`, `getParametersForAmdp()` | **none, anywhere** |

### Three members are the same call, and it is refused

`getTraceParameters`, `getTraceParametersForCallstack` and `getTraceParametersForAmdp` are
byte-identical: same URL, method, timeout and `Accept`. And the URL they use is POST-only —
recorded in `ProfilerTraces.test.ts`:

```
// Note: GET /parameters returns 405 — only POST is supported
```

Three members of a published contract that cannot succeed.

### Two members are empty by construction

Measured on E19: `listRequests()` and `getRequestsByUri()` answer `200` with a 345-byte empty
feed — including for the very object just traced. A trace *request* schedules a measurement and
is consumed by the run that fulfils it; the finished trace lands in the traces collection. The
names invite the opposite reading, and this repository fell for it: a helper looked for finished
traces in the requests collection.

### Nothing in it returns what three of its members require

`getHitList`, `getStatements` and `getDbAccesses` all take a trace id first. No member produces
one. The consequences are in the code:

- a regex over an Atom feed, written twice here, once against the wrong collection — since fixed
  on the branch (`parseTraceFeedEntries`, `listTraceIds`, `latestTraceId` on the concrete
  `Profiler`), which is the point: the fix had to live **outside** the contract because the
  contract has no room for it;
- `(runtime.getProfiler() as Profiler).extractIdFromResponse(...)` — a cast **through** the
  contract to reach the concrete class, still present at `ProfilerTraces.test.ts:240`. A consumer
  casting past an interface to the implementation is that interface admitting it does not cover
  the job.

Position in that feed is not age either (measured: first entries minutes old, last eight days
older), so "the first id in the document" is a trace chosen at random.

### The typing mechanism exists and is fed "untyped" by every descendant

```ts
IListableRuntimeObject<TResult, TOptions, TKind>
```

`TResult` exists to type the result. All six descendants pass `IAdtResponse`: `IProfiler`,
`ICrossTrace`, `IMemorySnapshots`, `IRuntimeDumps`, `IGatewayErrorLog`, `ISystemMessages`. A generic
that is always instantiated with "no promise" is worse than no generic: it looks like a contract
while promising nothing about content.

### The same shape is already written three times

| family | listing | reading one |
|---|---|---|
| profiler | `list()` | `getHitList` / `getStatements` / `getDbAccesses(traceId)` |
| crossTrace | `list()` | `getById` / `getRecords` / `getRecordContent(traceId)` |
| st05 | `getDirectory()` | — |

Two concepts, three vocabularies — though only the first two are reshaped here; see the accounting
for why ST05 waits. `ISt05Trace.getState()` — "am I recording" — is the odd member,
and it is odd because it belongs to the recording side, which is exactly the split this spec makes.

## Running and reading are separated in time

This is the premise the rest follows from, and it is not a subtlety:

- A run can be started and its result **never read**.
- It can be read **a week later**, when whoever ran it has gone home.
- It can be read **by a different process** than the one that ran it, from a different machine.
- SAP writes the trace **asynchronously**, so it may not exist at the moment the run returns.
- And it may never exist — tracing off, quota full, request unfulfilled — or exist and later be
  deleted.

So "run, then read the result" is not one operation with two halves. It is two acts that may be
separated by days, performed by different parties, and either of which may happen without the
other.

**A published type already violates this.** `IClassExecuteWithProfilingResult` requires a
`traceId: string` — so the class executor cannot return until it has found a trace, for a thing
the server may not have written yet, and the only ways to "find" it are the heuristics this spec
rejects. Its sibling `IProgramExecuteWithProfilingResult` promises no such thing. The two
disagree, and the one that promises more is the one that cannot keep it.

It carries `traceRequestsResponse` as well — the response from the requests collection, which is
empty by construction. A mandatory field whose content is always an empty feed.

## How a run is profiled, and where the two systems differ

A class and a report are profiled **the same way**. The only difference is the first call, the one
that configures the measurement:

- **On-prem** — write the parameters and start.
- **On cloud** — read the parameters that are available, choose among them, set the ones you want,
  then run.

That configuring call answers with the config id **in the `Location` header** — an endpoint with
the id in it. Verified in the consumer: `extractProfilerIdFromResponse` reads `location` /
`content-location` and nothing else. The run is then given that id. So the id that travels from
configuration to run is the *request*, and it is a URI, not an opaque token.

Reading afterwards, on-prem, goes **by user first and then by id**: list the traces belonging to a
user, then read the one you want. That is why `list({ user })` is the primary way in rather than a
filter bolted onto it, and it is the same two steps this contract has — `list()` then
`read(id, view)`.

Two consequences for this design:

- The class and program executors should differ in nothing but their target. Today they do not:
  one promises a `traceId` and the other does not. See *Running and reading are separated in time*.
- "Read the parameters that are available" is a real operation on cloud, and it belongs to
  configuring a run — the executor side — not to reading results.

### Measured: where the cloud reads its parameters

The configuring endpoint is POST-only on cloud too — measured against the trial, all three `Accept`
types:

```
GET /sap/bc/adt/runtime/traces/abaptraces/parameters
→ 405  ExceptionMethodNotSupported: Resource controller does not support method GET
```

So the three `getParameters*` deletions stand for both reasons after all: three names for one
byte-identical call, on a URL that refuses GET.

**But the "read what is available" step is real, and it is two other endpoints.** Discovery
publishes exactly five collections under `runtime/traces`, identical on cloud and on-prem, and two
of them answer:

| endpoint | cloud |
|---|---|
| `objecttypes` | **200**, a `namedItemList` of 7 — `report`/Program, `transaction`/Transaction, … |
| `processtypes` | **200**, a `namedItemList` of 8 — `any`/Any, `dialog`/Dialog, … |
| `parameters` (GET) | 405, as above |
| `requests` | 400 on cloud today; 200 with an empty feed on E19 |

`listObjectTypes()` and `listProcessTypes()` **are** the catalogue the cloud flow chooses from.
An earlier version of this spec deleted them as "catalogue lookups, not results of a run, and with
no caller" — the observation was right and the conclusion was wrong. Having no caller in one
consumer says that consumer never implemented the cloud configuration flow; it does not say the
operation is pointless.

They are therefore **not deleted**. They move to the configuring side with `scheduleTrace`, because
that is what they are for: what you may trace, before you say what to trace. Their payload has a
shape worth typing — a list of `{ name, description }` where the name is itself a URI.

A nuance from the same measurement: `objecttypes` lists `report` on cloud, where reports are not a
thing you can create. The catalogue describes what the profiler can measure, not what the system
lets you author.

### And the chosen values have nowhere to go yet

Reading the catalogues is only half a flow. `IProfilerTraceParameters` — the payload of the
configuring call — has no field for an object type or a process type, and the builder confirms it:
`buildTraceParametersXml` emits `<trc:parameters>` with the booleans and the two numbers, and
nothing else. So `INamedItem.name`, the URI those two endpoints exist to hand you, is currently
unpassable.

Two explanations, and this spec does not choose between them by reasoning:

1. **The parameters payload takes more than we model.** `IProfilerTraceParameters` would then be
   incomplete, and the missing elements are additive to it.
2. **The catalogues feed a different request.** `parameters` says *how* to measure — booleans,
   limits, aggregation. What to measure and whose runs to measure is the sort of thing a trace
   *request* carries, and `requests` is a published collection we have only ever read from.

Both are testable, and the probe joins step 0:

```
POST a parameters resource, then GET the Location it returns
→ does the stored document carry object/process type elements?   (explanation 1)
inspect what an ADT client sends when it schedules from the cloud UI, or
GET /requests on a system where one exists                        (explanation 2)
```

Until that is answered, `listObjectTypes()` and `listProcessTypes()` are kept and typed, and
`scheduleTrace()` takes `IProfilerTraceParameters` unchanged. **Adding a field for a URI with no
measured destination would be inventing the API**, which is what this spec is against — but so
would deleting the catalogues that clearly exist and answer.

## The split

**Recording is the executor's.** Scheduling a measurement produces a *request id*, and a request
nobody fulfils is litter: `ProfilerTraces.test.ts` schedules one on every run and never runs
anything, leaving an orphan each time. The request's life is bounded by the run, so it belongs to
whoever runs.

**Reading is the profiler's.** What traces exist, and what is inside one.

The two never share a vocabulary: `requestId` stops appearing on the reading surface entirely,
which removes the confusion between it and `traceId` at the source.

## The contract

Two atoms, composed. Parameterised over what each family's entries and views actually are, so a
family names its own types instead of everyone agreeing on `IAdtResponse`.

**Every declaration below compiles under `--strict`, and the refusals below it were proven with
`@ts-expect-error`.** The first draft of this spec did not: it constrained the view map to
`Record<string, unknown>`, which an `interface` cannot satisfy — no index signature — so its own
canonical example failed with `TS2344`.

```ts
/** One trace, as every family can describe it. */
export interface ITraceEntry {
  /** The id the reading members take. */
  id: string;
  /** When the system wrote it. Position in a feed is not age. */
  recordedAt: string;
  user?: string;
  objectName?: string;
  uri?: string;
}

/** What a view yields, and what it must be given. */
export interface ITraceView<TResult, TOptions = void> {
  result: TResult;
  options: TOptions;
}

export type ViewResult<TViews, K extends keyof TViews> =
  TViews[K] extends ITraceView<infer R, infer _O> ? R : never;
export type ViewOptions<TViews, K extends keyof TViews> =
  TViews[K] extends ITraceView<infer _R, infer O> ? O : never;

/** Options are required when the view says so, and absent when it says `void`. */
export type ViewArgs<TViews, K extends keyof TViews> =
  ViewOptions<TViews, K> extends void
    ? [options?: undefined]
    : undefined extends ViewOptions<TViews, K>
      ? [options?: ViewOptions<TViews, K>]
      : [options: ViewOptions<TViews, K>];

export interface ITraceListing<
  TEntry extends ITraceEntry = ITraceEntry,
  TOptions = void,
> {
  list(options?: TOptions): Promise<TEntry[]>;
}

/**
 * What is inside one trace.
 *
 * The constraint is self-mapped — every property of the map must BE a view.
 * `Record<string, unknown>` cannot be used, because an `interface` has no
 * implicit index signature; and a bare `object` would accept anything, so
 * `interface BadViews { hitlist: string }` would compile and only fail later,
 * silently, with a result of `never` at the call. This form needs no index
 * signature and refuses the bad map where it is written.
 */
export interface ITraceReading<
  TViews extends { [K in keyof TViews]: ITraceView<unknown, unknown> },
> {
  read<K extends keyof TViews>(
    traceId: string,
    view: K,
    ...args: ViewArgs<TViews, K>
  ): Promise<ViewResult<TViews, K>>;
}

/**
 * A trace family: what it is called, and what it lists.
 *
 * Reading is NOT extended in here. A family that has views composes
 * `ITraceReading` in; a family that has none says nothing about reading, which
 * is the only way a type can state that truthfully.
 *
 * This is the base, and it is deliberately NOT called `IProfiler` — that name
 * belongs to the family consumers already import. See *The published surface*.
 */
export interface ITraceFamily<
  TKind extends string,
  TEntry extends ITraceEntry = ITraceEntry,
  TOptions = void,
> extends ITraceListing<TEntry, TOptions> {
  /** Literal, so it still discriminates — see below. */
  readonly kind: TKind;
}
```

## The published surface

The names below are what `@mcp-abap-adt/interfaces` exports and what consumers import. An earlier
draft showed the families as local aliases (`AbapProfiler`, `CrossTrace`) and never said what
happens to the exported `IProfiler` and `ICrossTrace` — so it described a design without
describing the API. **`IProfiler` and `ICrossTrace` keep their names**; what changes is what they
mean.

Every declaration in this section compiles under `--strict`, and the refusal at the end was proven
with `@ts-expect-error`.

```ts
export interface IAbapTraceViews {
  hitlist: ITraceView<IAbapTraceHitList, IProfilerTraceHitListOptions | undefined>;
  statements: ITraceView<IAbapTraceStatements, IProfilerTraceStatementsOptions | undefined>;
  dbAccesses: ITraceView<IAbapTraceDbAccesses, IProfilerTraceDbAccessesOptions | undefined>;
}

export interface ICrossTraceViews {
  /** `getById` — the trace document itself is a view of the trace. */
  trace: ITraceView<ICrossTraceDocument, { includeSensitiveData?: boolean } | undefined>;
  records: ITraceView<ICrossTraceRecords>;
  /** Required, and the compiler enforces it. */
  recordContent: ITraceView<ICrossTraceRecordContent, { recordNumber: number }>;
}

/** Same name consumers import today. */
export type IProfiler = ITraceFamily<'profiler', ITraceEntry, IProfilerListOptions> &
  ITraceReading<IAbapTraceViews>;

/** Same name too — and its listing keeps every option it has today. */
export type ICrossTrace = ITraceFamily<'crossTrace', ITraceEntry, IListCrossTracesOptions> &
  ITraceReading<ICrossTraceViews> & {
    /**
     * Recording by nature, and still here because this spec gives it nowhere to
     * go. Declared explicitly so the contract keeps offering it: leaving it out
     * of the type while calling it "unchanged" would remove it in practice.
     */
    getActivations(): Promise<IAdtResponse>;
  };

/** Unchanged in 22.0.0 — see the accounting. */
export interface ISt05Trace { /* as published in 21.0.0 */ }
```

`IProfilerListOptions`, `IListCrossTracesOptions` and the three view-option types are the published
ones, unchanged. `ICrossTrace.list()` therefore still takes `traceUser`, `actCreateUser` and
`actChangeUser` — an earlier draft instantiated cross-trace without its options at all and would
have dropped all three.

```ts
await p.list({ user: 'SOMEONE' });
await x.list({ traceUser: 'A', actCreateUser: 'B', actChangeUser: 'C' });
await x.getActivations();
await p.read('t1', 'statements', { id: 7, withDetails: true, autoDrillDownThreshold: 20, withSystemEvents: false });
const k: 'profiler' = p.kind;                       // still discriminates

// @ts-expect-error a cross-trace option is not a profiler option
await p.list({ traceUser: 'A' });
```

### Why reading is composed in, not inherited

An earlier draft had `IProfiler` extend `ITraceReading<TViews>` unconditionally and gave ST05
`Record<never, never>`. That makes the views uncallable but leaves the member in the contract:
compiled, an ST05 implementation without `read` fails with *"Property 'read' is missing … but
required"*, so it would have to carry a meaningless `read<K extends never>`. A type must state what
IS supported; a family with no views says nothing about reading.

### What the compiler accepts, and what it refuses

```ts
const hits = await p.read('t1', 'hitlist');            // options optional
const gross: number = hits.entries[0].grossTime;       // result typed, not `any`
await x.read('t2', 'recordContent', { recordNumber: 3 });

// @ts-expect-error a required option may not be omitted
await x.read('t2', 'recordContent');
// @ts-expect-error a view the family does not have
await p.read('t1', 'callGraph');
// @ts-expect-error the result is typed
const wrong: string = (await p.read('t1', 'hitlist')).entries[0].grossTime;
```

Every `@ts-expect-error` fires, so the types constrain rather than merely compile.

The option types are the published ones, **carried over whole and not retyped**. An earlier draft
wrote them out inline and abbreviated them — `statements` lost `id`, `autoDrillDownThreshold` and
`withSystemEvents`, so calls that are valid in 21.0.0 would have stopped compiling while the
accounting still called the mapping direct. Compiled: every option the 21.0.0 signature accepted
still passes, and an option that was never there is still refused.

### Why the options live in the view map

An earlier draft wrote `TraceViewOptions<TViews, K>` and never declared it — and it could not have
been declared, because a map of result types has nowhere to keep options. They cannot be inferred
either: nothing about `IAbapTraceStatements` implies `{ withDetails?: boolean }`, and cross-trace's
`recordContent` needs a `recordNumber` that no result type mentions. So a view is a pair from the
start, and `ViewArgs` turns "this view has required options" into a compiler error rather than a
runtime surprise.

### Why `kind` stays literal

`IRuntimeAnalysisObject<TKind extends string>` exists so `kind` discriminates — `'profiler'`,
`'crossTrace'`, `'st05Trace'`. An earlier draft wrote `readonly kind: string`, which keeps the
field and throws away the reason for it, exactly when several implementations share one contract
and narrowing matters most. `TKind` is a parameter, and each family passes its literal.

### Why `read(id, view)` and not three members

Three members per family multiplies with families and is how the current bag grew. One member
whose return type is chosen by the view keeps the contract small **without** the union-narrowing
that a plain `result()` would force — which would be `IAdtResponse` again under a new name.

### Why no `latestTraceId()`

Proposed in #45 — and already implemented on the concrete `Profiler` here, which is where it
should stay. It is a trap the measurements already sprang: SAP writes traces asynchronously, so
*newest* is not *mine*.

And the replacement an earlier draft offered — snapshot, run, poll for a new id — is not a safer
version of the same idea: it has a smaller window and the identical defect. Both invent a link
between a run and a trace that the system does not maintain. See *There is no link* below. A contract member that looks like the answer and is not is worse than no member. The convenience
may live in an implementation; it does not belong in a contract.

## There is no link between a run and a trace, and that is the point

A run and a trace are **separate things with separate lifetimes**. A run can happen and leave no
trace at all — tracing was off, the quota was full, the request expired unfulfilled. A trace can
outlive everything that knows about it, or be deleted while its run is still being talked about.
Neither owns the other.

So "which trace belongs to this run" is not a missing feature. It is a question the domain does not
answer, and asking a contract to answer it is asking it to invent a relationship the system does
not maintain. That is precisely why these are separate entities with separate contracts: a
`list()` that reports what exists, and a run that reports what it did, and no promised arrow
between them.

This settles two things the earlier drafts got wrong in opposite directions:

- `latestTraceId()` is not merely unreliable. It answers a question that has no answer — it dresses
  "the newest one I can see" as "the one you caused".
- Snapshot-and-poll is not a safer version of it. It has a smaller window and the same defect, and
  proposing it as the replacement was inventing the same arrow with more steps.

**The contract therefore promises neither.** `list()` says what traces exist; `read()` says what is
in one. Whoever wants a particular trace identifies it the way anything else is identified — by
what the listing tells them, with their own knowledge on top. If a server ever hands a run a trace
reference of its own accord, an executor is free to pass that along as part of *its* result; the
reading contract does not require it, and does not degrade when it is absent.

The first version of this section called this "unsolved" and specified a probe to fix it. That was
the wrong frame: it treated the absence of a relationship as a gap in our knowledge rather than as
a fact about the two entities — the same fact that justifies the split in the first place.

## Every member of the three contracts, accounted for

A breaking change is only specified when nothing is left implicit. All **19** operations of
`IProfiler`, `ICrossTrace` and `ISt05Trace` as published in 21.0.0 — 12, 5 and 2, counted from the
`.d.ts` rather than by eye, `list()` included where it is inherited:

### `IProfiler`

| today | becomes |
|---|---|
| `list(options)` | `list(options)` — typed entries |
| `getHitList(id, o)` | `read(id, 'hitlist', o)` |
| `getStatements(id, o)` | `read(id, 'statements', o)` |
| `getDbAccesses(id, o)` | `read(id, 'dbAccesses', o)` |
| `createParameters(o)` | moves to the executor (recording) |
| `getParameters()` | **deleted.** Measured: `GET` on that URL answers 405 on cloud as elsewhere, so no operation reads through it. Reading what is available is `listObjectTypes` / `listProcessTypes`, which move rather than die |
| `getParametersForCallstack()` | **deleted** — byte-identical to `getParameters` |
| `getParametersForAmdp()` | **deleted** — byte-identical to `getParameters` |
| `listRequests()` | **deleted** — empty by construction |
| `getRequestsByUri(uri)` | **deleted** — empty by construction |
| `listObjectTypes()` | **moves to the configuring side** — measured `200` with 7 entries; this is what the cloud flow chooses from |
| `listProcessTypes()` | **moves to the configuring side** — measured `200` with 8 entries |

### `ICrossTrace`

| today | becomes |
|---|---|
| `list(options)` | `list(options)` — typed entries |
| `getById(id, includeSensitiveData?)` | `read(id, 'trace', { includeSensitiveData })` — the trace document is a view of the trace |
| `getRecords(id)` | `read(id, 'records')` |
| `getRecordContent(id, recordNumber)` | `read(id, 'recordContent', { recordNumber })` — required, enforced |
| `getActivations()` | **unchanged for now.** It reports what is currently being traced, which is recording rather than a result — but this spec designs no home for it, and moving a member without a destination is not a migration. It goes when the recording contract is written. |

### `ISt05Trace` — left alone, on purpose

| today | becomes |
|---|---|
| `getDirectory()` | unchanged |
| `getState()` | unchanged |

An earlier version of this spec folded ST05 in: `getDirectory()` → `list()`, `getState()` → the
recording side. That was a claim about ST05's payload, and it was not measured. **Nothing in the
consumer has ever read ST05 content** — `st05.ts` is two raw GETs with no parser, and the only
tests assert that the factory returns an instance. Saying `list(): Promise<ITraceEntry[]>` asserts
that its directory yields things with an identity and a timestamp, which nobody here has seen.

The resource itself is not in doubt — that was checked separately. ADT publishes it as its own
workspace, on an on-prem system (E19) and on a cloud tenant alike:

```xml
<app:workspace><atom:title>Performance Trace</atom:title>
  <app:collection href="/sap/bc/adt/st05/trace/state">
    <atom:title>Performance Trace State</atom:title>
  <app:collection href="/sap/bc/adt/st05/trace/directory">
    <atom:title>Performance Trace Drirectory</atom:title>
```

Only E77 lacks it — BASIS < 7.50, which lacks `crosstrace` too. So the two endpoints implemented
here are exactly the two the system advertises. What discovery does **not** say is what either
returns: both collections declare no `<app:accept>`, where neighbouring collections in the same
document declare theirs. Existence is not shape, and it is the shape that is missing.

(The title's misspelling — `Drirectory` — is SAP's, and matters only if anything ever matches on
it.)

So ST05 keeps its own small contract until someone parses that directory and can show the entries
have an id and a time. Folding it in then is additive and costs nothing; folding it in now would
put an unverified shape into a published type — the same defect this spec exists to remove.

Note also that once ST05 *is* folded in, it needs no contract of its own: it becomes
`ITraceFamily<'st05Trace'>`, one instantiation with no views — `ITraceFamily`, not `IProfiler`,
which after this change is the ABAP family itself and takes no parameters. A published name that
is exactly an instantiation of another type earns nothing.

### Executor types (`@mcp-abap-adt/interfaces`, same release)

| today | becomes | why |
|---|---|---|
| `IClassExecuteWithProfilingResult.traceId: string` | **removed** | a run cannot promise a trace that may not exist yet, may never exist, and may be read a week later |
| `IClassExecuteWithProfilingResult.traceRequestsResponse` | **removed** | always the empty feed |
| `IClassExecuteWithProfilingOptions.traceLookupUris` | **removed** | asks where to look for a trace the run no longer waits for |
| `IClassExecuteWithProfilingOptions.maxTraceAttempts` | **removed** | how many times to poll for it |
| `IClassExecuteWithProfilingOptions.traceRetryDelayMs` | **removed** | how long to wait between polls |
| `IClassExecutor`, `IProgramExecutor` | `& ITraceScheduling` | scheduling gets a home without obliging every `IExecutor` |

## What is deleted

Five members, listed with their reasons in the accounting above: three `getParameters*` (three
names for one byte-identical call, on a URL measured to refuse GET), `listRequests` and `getRequestsByUri` (empty by
construction — the requests collection is consumed by the run), . `listObjectTypes` and `listProcessTypes` are NOT among
them — they move to the configuring side, measured and working.

`IProfilerTraceParameters` moves with `createParameters`: it says *what to measure*, which is an
argument to a run, not to a read.

## What the executor gains

This spec moves three members out of `IProfiler`, all of them about configuring a measurement
rather than reading one: `createParameters`, `listObjectTypes` and `listProcessTypes`. `IExecutor` already carries `runWithProfiler` and
`runWithProfiling`, both parameterised, so scheduling joins an existing surface rather than
inventing one.

It joins as a **capability composed in**, not as a member of `IExecutor` or `IAdtRunnable`. That
is not an aesthetic preference — the runnable atom already has implementations for which trace
scheduling would be nonsense:

| runnable | target | traces? |
|---|---|---|
| `AdtAtc` | `IAdtRunnable<IAtcRunTarget, IAtcRunResult, IAtcRunOptions>` | no |
| `AdtUnitTest` | `IAdtRunnable<IClassUnitTestDefinition[], string, …>` | no |
| `ClassExecutor` | `IExecutor<IClassExecutionTarget, …>` | yes |
| `ProgramExecutor` | `IExecutor<IProgramExecutionTarget, …>` | yes |

Put `scheduleTrace` on `IAdtRunnable` and an ATC run has to answer for trace parameters. Put it on
`IExecutor` and it is only two implementations away from the same problem. Composed in, it is
stated exactly where it is true.

`IExecutor` also shows why a class and a report need nothing else to tell them apart: they are the
same specialisation with a different target, which is the domain fact from the section above,
already expressed in the type.

```ts
> **Provisional until step 0a.** The two catalogue readers are certain — measured, they answer.
> What `scheduleTrace` takes is not: the URIs they return have no destination in today's
> parameters payload, and which of the two explanations holds decides whether this signature
> changes. See *And the chosen values have nowhere to go yet*.

```ts
export interface INamedItem {
  /** A URI, as the server writes it. */
  name: string;
  description: string;
}

export interface ITraceScheduling {
  /** What may be traced. The cloud flow reads these before choosing. */
  listObjectTypes(): Promise<INamedItem[]>;
  listProcessTypes(): Promise<INamedItem[]>;
  /**
   * The request id, taken from the `Location` header of the configuring call.
   * What the run is GIVEN, not what it produces.
   */
  scheduleTrace(options?: IProfilerTraceParameters): Promise<string>;
}

export type IClassExecutor = IExecutor<
  IClassExecutionTarget, IAdtResponse, IClassExecuteWithProfilerOptions,
  IClassExecuteWithProfilingOptions, IClassExecuteWithProfilingResult
> & ITraceScheduling;

export type IProgramExecutor = IExecutor<
  IProgramExecutionTarget, IAdtResponse, IProgramExecuteWithProfilerOptions,
  IProgramExecuteWithProfilingOptions, IProgramExecuteWithProfilingResult
> & ITraceScheduling;
```

**And the profiling results say only what the run produced:**

```ts
export interface IClassExecuteWithProfilingResult {
  response: IAdtResponse;
  profilerId: string;      // the request the run was given
}                          // no traceId, and no traceRequestsResponse
```

`traceId` goes because a run cannot honestly promise one — see *Running and reading are separated
in time* — and `traceRequestsResponse` goes because it is always the empty feed.

**The three polling options go with it.** `traceLookupUris`, `maxTraceAttempts` and
`traceRetryDelayMs` exist only to hunt for that `traceId` after the run; they are read in exactly
one place, `ClassExecutor`'s polling loop, and they are absent from the program executor's options
— the same asymmetry as the result. Leaving them would publish a contract that accepts instructions
no implementation may carry out.

With them gone, `IClassExecuteWithProfilingOptions` and `IProgramExecuteWithProfilingOptions` are
both `{ profilerParameters?: IProfilerTraceParameters }` — which is the domain fact from above
arriving in the types: a class and a report are profiled the same way. Whether to collapse them
into one name is a judgement for the implementation; this spec only removes what cannot be
honoured. Both executors
then describe the same thing, which they do not today. An earlier draft of this section invented an
`IExecutionResult` that does not exist; the real per-executor result types are the ones above.

**Nothing else moves.** `ICrossTrace.getActivations()` and `ISt05Trace.getState()` are
recording by nature, and an earlier draft said they "join them" — but naming a member's nature is
not the same as giving it a destination, and this spec designs one only for scheduling. They stay
where they are until a recording contract exists to receive them. ST05 in particular is untouched,
as the scope says.

## Scope — decided

In scope: `abaptraces` and `crosstrace` — the two whose payloads have been read.

`st05` is named in this spec only to say it is **not** being changed: its content has never been
parsed here, so any statement about the shape of its listing would be invented. See the accounting
below.

Not merged in, and not "for now": `IRuntimeDumps`, `IApplicationLog`, `IGatewayErrorLog`,
`ISystemMessages`, `IMemorySnapshots`. "Out of scope" would be the wrong words — dumps are not
unhandled, they have their own contract and keep it. This spec does not touch them.

`IRuntimeDumps` is worth looking at, because it is already the shape proposed here and it is not
a bag:

```ts
list(options?: IRuntimeDumpsListOptions): Promise<IAdtResponse>;
getById(dumpId: string, options?: { view?: 'default' | 'summary' | 'formatted' }): Promise<IAdtResponse>;
```

A listing and a read-by-id whose view is a named union — two members, no duplicates, nothing that
cannot succeed. It is evidence that the design works and that keeping the entities apart costs
nothing: each contract stays small on its own terms. Its one remaining defect is the shared one —
`TResult` is `IAdtResponse`, so the *view* is typed while the *result* is not. That is additive to
fix, later, and on its own schedule.

The tempting reason to merge them is that they all list and all read by id. That is a shape, not a
meaning, and the meanings are different in a way that decides who the result belongs to:

- **A profile is asked for.** A user requests the measurement and the same user gets the result.
  It exists because someone wanted it, and it is theirs.
- **A dump is not asked for by anyone.** It exists because something went wrong. Nobody scheduled
  it and nobody owns it in the sense a profile is owned.
- **A log arises because somebody ran a program or a class** — not necessarily the reader, and not
  as the point of the run. It is a by-product with a different audience.

Three different entities, so three different contracts, however similar their listings look. A
contract that covered all three would have to describe "a thing that happened somewhere, to
someone" — which is a shape with no meaning left in it, and the shape is the part that was never
the problem.

This also explains why ownership matters so much on the profiler side specifically, and why
`latestTraceId()` is a trap there: the whole point of a profile is that it is **yours**, so
"newest" is not good enough. A dump listing has no such requirement, because a dump was never
yours to begin with.

## Versioning and order

0. **Measure the payloads first, then publish.** `ITraceEntry`, `ICrossTraceDocument`,
   `ICrossTraceRecords` and `ICrossTraceRecordContent` are types for documents this repository has
   partly never read: the profiler's feed is parsed on the consumer branch, cross-trace's is not
   parsed at all. Publishing them before reading them would be the exact mistake ST05 was excluded
   for, made deliberately. So a probe branch in the consumer parses both first, and the field lists
   below are whatever it finds.

0a. **Apply what step 0 found, before anything is published.** Two of its answers can move the
   contract, not just fill in field lists:

   - if the parameters payload turns out to carry object and process types, `IProfilerTraceParameters`
     gains them and `scheduleTrace` keeps its shape;
   - if the catalogues feed a trace *request* instead, `ITraceScheduling` gains that operation and
     the request becomes the thing `scheduleTrace` returns from.

   Either way the sketch in *What the executor gains* is provisional until this step closes.
   The gate is: **probe → update the scheduling types to match the evidence → typecheck under
   `--strict` → publish.** Publishing the sketch as written, before the probe, would be inventing
   the API — the thing this spec exists to stop.

0b. Land this branch. It already carries the parsing work (`parseTraceFeedEntries`,
   `listTraceIds`, `latestTraceId`) on the concrete `Profiler`, which is what the typed `list()`
   below is built from — the contract change should consume a fix that is already proven against
   a system, not arrive at the same time as it.
1. `@mcp-abap-adt/interfaces` **22.0.0** — breaking. `IProfiler` and `ICrossTrace` keep their
   names and change meaning: each becomes a composition of `ITraceFamily` with `ITraceReading`,
   as spelled out in *The published surface*. Added: `ITraceEntry`, `ITraceView`, `ITraceListing`,
   `ITraceReading`, `ITraceFamily`, `IAbapTraceViews`, `ICrossTraceViews` and the result types.
   Deleted: the five members listed above, plus `traceId`, `traceRequestsResponse` and the three
   trace-polling options on the class executor. Moved to the configuring side:
   `createParameters`, `listObjectTypes`, `listProcessTypes`. Unchanged: `ISt05Trace`, and the
   reading option types — `IProfilerListOptions`, `IListCrossTracesOptions` and the three view
   option types.
   Published first.
2. `@mcp-abap-adt/adt-clients` — consumes it. **Both concrete classes change, not one:**
   - `Profiler` — `list()` returns parsed `ITraceEntry[]` (the branch already has
     `parseTraceFeedEntries` for this); the three getters become `read(id, view)`.
   - `CrossTrace` — the same work, and none of it exists yet: its `list()` returns a raw
     `IAdtResponse` and it has no `read()`. It needs a feed parser of its own and the three
     members folded into `read()`. Its payload is measured in step 0, before any of these types
     are published.
   - `ClassExecutor` / `ProgramExecutor` — take scheduling; the deep imports and the
     `as Profiler` cast go.

   Skipping the cross-trace half would leave a published contract with no implementation behind
   it, which is the defect this spec is named after.
3. `#45` closed with a comment: its content is here, its shape is not.

## Consequences worth stating

- **Nothing here promises to tell you which trace your run produced.** A run may leave no trace,
  and a trace may outlive or predecease anything that knows of it. That is not a gap to close
  later; it is the reason the two are separate contracts.
- **Typing the results is the bulk of the work**, not the split. Parsing `hitlist`, `statements`
  and `dbAccesses` into real types is where the effort is; without it these atoms are three tidy
  bags instead of one untidy one. First pass types `list()` and `hitlist` — what consumers
  actually read — and leaves the other two views typed as their parsed document until someone
  needs them.
- **The schedule-without-running test must go** or become an executor test. It is the only
  producer of orphaned trace requests.
- **The scope boundary is settled, not deferred.** Dumps and logs are not waiting to be folded in
  later: they are different entities, and the listing shape they share with traces is not a reason
  to give them one contract.
- **ADT can schedule a trace for another session.** Nothing here uses it. If the need appears it
  belongs to whoever owns the running, so it does not change this design — but the contract must
  not be widened for it in advance.
