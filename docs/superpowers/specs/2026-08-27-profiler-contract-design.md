# One contract for reading what a run produced

**Status:** design — split and scope approved; contract sketch compiles; correlation unmeasured
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

Two concepts, three vocabularies. `ISt05Trace.getState()` — "am I recording" — is the odd member,
and it is odd because it belongs to the recording side, which is exactly the split this spec makes.

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

/**
 * `object`, not `Record<string, …>`.
 *
 * A view map is written as an `interface`, and an interface has no implicit
 * index signature, so `Record<string, unknown>` rejects it. This is the
 * constraint that admits both.
 */
export type TraceViews = object;

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

export interface ITraceReading<TViews extends TraceViews> {
  read<K extends keyof TViews>(
    traceId: string,
    view: K,
    ...args: ViewArgs<TViews, K>
  ): Promise<ViewResult<TViews, K>>;
}

export interface IProfiler<
  TKind extends string,
  TEntry extends ITraceEntry = ITraceEntry,
  TViews extends TraceViews = Record<never, never>,
  TOptions = void,
> extends ITraceListing<TEntry, TOptions>,
    ITraceReading<TViews> {
  /** Literal, so it still discriminates — see below. */
  readonly kind: TKind;
}
```

Each family then says what it is:

```ts
export interface IAbapTraceViews {
  hitlist: ITraceView<IAbapTraceHitList, { withSystemEvents?: boolean } | undefined>;
  statements: ITraceView<IAbapTraceStatements, { withDetails?: boolean } | undefined>;
  dbAccesses: ITraceView<IAbapTraceDbAccesses, { withSystemEvents?: boolean } | undefined>;
}
type AbapProfiler = IProfiler<'profiler', ITraceEntry, IAbapTraceViews, { user?: string }>;

export interface ICrossTraceViews {
  records: ITraceView<ICrossTraceRecords>;
  /** Required, and the compiler enforces it. */
  recordContent: ITraceView<ICrossTraceRecordContent, { recordNumber: number }>;
}
type CrossTrace = IProfiler<'crossTrace', ITraceEntry, ICrossTraceViews>;

/** A listing and no views. */
type St05 = IProfiler<'st05Trace'>;
```

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

All three `@ts-expect-error` lines fire, so the types constrain rather than merely compile.

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

But the replacement this spec first offered — snapshot the listing, run, poll for an id that is
new — is only better, not correct. It proves a trace is **new**, not that it is **yours**: a
concurrent run by the same user, or another session of that user, puts a stranger's trace between
the two listings. Rejecting "newest is mine" and then proposing "newest since I looked" is the
same mistake with a smaller window. See *Correlation* below. A caller that needs its own snapshots `list()` before
running and polls for an id that is new. A contract member that looks like the answer and is not
is worse than no member. The convenience may live in an implementation; it does not belong in a
contract.

## Correlation — which trace is mine

**Unsolved, and the contract must not pretend otherwise.**

Three members take a trace id. Something has to produce the *right* one, and neither candidate
does:

- `latestTraceId()` — newest is not mine.
- snapshot-and-poll — new is not mine either, under any concurrency.

What is measured today: a parsed entry carries `id` and the timestamp the feed publishes, and
nothing that points back at the request that scheduled the measurement. So on the reading side
alone, the question cannot be answered.

That places it on the recording side, which is consistent with the split: the executor holds the
`requestId` it scheduled, and scheduling accepts a `description`. **A unique token in that
description, stamped at schedule time and matched in the listing, is the candidate mechanism** —
it makes the link something the caller created rather than something inferred from order or time.

It depends on one fact nobody here has measured: whether a trace entry exposes the description (or
any other field carried over from its request). The probe is small and must run before this part
is implemented:

```
schedule a trace with description "adt-clients-<uuid>"
run the object
list the traces and dump one entry in full
→ does any field carry that token, or the request id?
```

Three outcomes, and the design differs in each:

1. **The token comes through.** `ITraceEntry` gains the field, the executor returns the trace it
   correlated, and correlation is exact.
2. **Only the request id comes through.** Same, keyed on the id instead.
3. **Nothing comes through.** Then the contract says so in as many words: traces can be listed and
   read, and identifying *your own* is not possible through this API. The executor returns
   candidates with their timestamps and the caller decides. A documented gap beats a member that
   looks like an answer.

Until that probe runs, no member of this contract claims to return "your" trace.

## What is deleted

| member | why |
|---|---|
| `getParameters`, `getParametersForCallstack`, `getParametersForAmdp` | byte-identical, and the endpoint refuses GET with 405 |
| `listRequests`, `getRequestsByUri` | empty by construction; the collection is consumed by the run |
| `listObjectTypes`, `listProcessTypes` | catalogue lookups, not results of a run; no caller |
| `createParameters` | moves to the executor with the rest of recording |

`IProfilerTraceParameters` moves with `createParameters`: it says *what to measure*, which is an
argument to a run, not to a read.

## What the executor gains

`ClassExecutor` and `ProgramExecutor` already do this; the change is that they own it openly
instead of importing raw functions past the contract:

```ts
scheduleTrace(options?: ITraceParameters): Promise<string>;   // the request id
runWithProfiling(target, options): Promise<IExecutionResult>;
```

ST05's `getState()` joins them as recording control.

## Scope — decided

In scope: traces a run produces — `abaptraces`, `crosstrace`, `st05`.

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

0. Land this branch first. It already carries the parsing work (`parseTraceFeedEntries`,
   `listTraceIds`, `latestTraceId`) on the concrete `Profiler`, which is what the typed `list()`
   below is built from — the contract change should consume a fix that is already proven against
   a system, not arrive at the same time as it.
1. `@mcp-abap-adt/interfaces` **22.0.0** — breaking: `IProfiler` reshaped, members deleted,
   `ITraceEntry` / `ITraceListing` / `ITraceReading` added. Published first.
2. `@mcp-abap-adt/adt-clients` — consumes it: `Profiler` implements the new shape and returns
   parsed entries; `ClassExecutor`/`ProgramExecutor` take scheduling; the deep imports and the
   `as Profiler` cast go.
3. `#45` closed with a comment: its content is here, its shape is not.

## Consequences worth stating

- **Correlation must be measured before the recording side is implemented.** The split is sound
  without it; the answer to "which trace is mine" is not.
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
