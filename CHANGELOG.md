# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [24.0.0] - 2026-08-29

Everything here comes from one raw capture taken on an on-prem system — the
trace feed and all three views, whole files rather than logged excerpts. The
capture is not kept in a tree: what it established is stated below and pinned by
the consumer's parser tests, which are transcribed from it.

### Changed

- **BREAKING** — `ITraceTiming` is a type instead of `unknown`.

  ```ts
  interface ITraceTiming { time: number; percentage: number }
  ```

  `trc:grossTime` and `trc:traceEventNetTime` carry exactly those two, in both
  the hit list and the statements, with no variant anywhere in the documents
  read. They were `unknown` in 22.0.0 and 23.0.0 because the elements had been
  seen while their attributes never had — the earlier reads were summarised into
  a table and the bodies discarded.

  The **unit of `time` is deliberately not asserted.** The wire says `time="243"`
  and nothing about what 243 is. `percentage` is of the trace total, which is
  what makes a row comparable without knowing the unit; calling the other one
  `timeMicros` would add the single fact the measurement does not contain.

  **Migration.** Readers stop narrowing: `entry.grossTime?.time` is a number.
  Implementations must produce the shape, which is why this is major rather than
  minor — additive for callers is not additive for implementers, and this
  package exists to be implemented.

- **BREAKING** — `IProfiler` lists `IAbapTraceEntry`, not `ITraceEntry`.

  `ITraceEntry` is what *every* trace family can say. `IAbapTraceEntry` is what
  the `abaptraces` feed actually sends, and all of it is transcribed: sixty
  entries, every field present in every one, none of it outside
  `trc:extendedData`.

  It adds `system`, `client`, `host`, `size`, `runtime`, `runtimeABAP`,
  `runtimeSystem`, `runtimeDatabase`, `isAggregated` and `amdpFileSize`, and
  narrows `user`, `objectName`, `state` and `expiresAt` from optional to
  required — optional on the atom because another family may not have them, and
  present here because this one always did.

  Units are again not asserted: `runtime` reads `554` and `size` reads `8`, and
  the document says no more.

  **Migration.** Readers gain fields and lose four optionality checks.
  Implementations must supply them; the `__typechecks__` stub now builds a real
  entry rather than returning `[]`, because an empty array satisfies any element
  type and proves nothing about whether the shape can be built.

### Added

- `ITraceState` and `ITraceExecutions` — the two shapes that were written inline
  as `{ value; text }` and `{ maximal; completed }`.

  Structurally identical, so nothing breaks. The point is that a consumer
  implementing the contract has to *return* these, and an anonymous type cannot
  be named: it would re-declare the same fields in its own code, which is the
  duplication this package exists to remove. There are now no anonymous object
  types left in the trace contract.

## [23.0.0] - 2026-08-29

### Added

- `ITraceReadingWithParser` — reading a trace with a parser the caller supplies,
  and `readWith(parse, traceId, view, …)` on it.

  A library that speaks ADT should not also be the place where somebody else's
  XML gets filtered and reshaped. `read()` stays deliberately plain: it maps the
  document onto the view's type and does nothing more. A consumer that needs it
  read differently — or that runs against a system answering in a shape the
  default does not fit — passes its own reader **and keeps a type**. Falling back
  on a raw response would mean going untyped, which is what this package exists
  to prevent.

  Searching and filtering are not what this is for. Those belong to the server,
  which has endpoints for them.

  It is a **separate atom** rather than a member of `ITraceReading`, because it
  is a separate capability: a family may offer the plain read and not this one.
  An optional method would have said "perhaps", which this contract does not do.

  It is a **method** rather than an overload on `read`. The transport tree's
  `listNodes()` is an overload, but that sits on a concrete class nobody else
  implements; this is implemented by consumers, and an overloaded method cannot
  be satisfied by an object literal — the `__typechecks__` file failed the moment
  it was tried.

### Changed

- **BREAKING** — `IProfiler` now composes `ITraceReadingWithParser`, so an
  implementation must provide `readWith`.

  This was first proposed as `22.1.0` and called additive — caught in review
  before it was merged or published, so no consumer ever saw the wrong version.
  The claim was wrong, and the entry making it said so without noticing:
  "implementations gain a member to write" is a description of a breaking
  change. Additive for *callers* is not additive for *implementers*, and this
  package exists to be implemented.

  **Migration.** An implementation of `IProfiler` adds one method:

  ```ts
  async readWith<K extends keyof IAbapTraceViews, T>(
    parse: (data: unknown) => T,
    traceId: string,
    view: K,
    ...args: ViewArgs<IAbapTraceViews, K>
  ): Promise<T> {
    return parse(await this.rawResponseFor(traceId, view, ...args));
  }
  ```

  Callers are untouched — `read()` is unchanged in name, signature and result.

## [22.0.0] - 2026-08-28

### Changed

- **BREAKING** — `IProfiler` is now reading only, and everything about
  configuring a measurement moved to the executors.

  It keeps its name, and what it means changed. A profiler answers two
  questions: what traces exist (`list()`), and what is inside one
  (`read(traceId, view)`). The read returns the view's own type — the three
  views are typed, so `hitlist` yields a hit list and `statements` yields
  statements, instead of an `IAdtResponse` every caller re-parsed by hand.

  `getHitList()`, `getStatements()` and `getDbAccesses()` are gone as separate
  members. They were one operation under three names, differing only in a path
  segment and an options type, and the feed itself confirms the three: every
  trace entry carries one link per view.

  **Migration.** `p.getHitList(id)` becomes `p.read(id, 'hitlist')`;
  `p.getStatements(id, o)` becomes `p.read(id, 'statements', o)`;
  `p.getDbAccesses(id, o)` becomes `p.read(id, 'dbAccesses', o)`. The option
  types are unchanged, and an unknown view name is now a compile error rather
  than a 404.

- **BREAKING** — `IClassExecuteWithProfilingResult` no longer carries `traceId`
  or `traceRequestsResponse`.

  A run cannot promise a trace. SAP writes it asynchronously, so at the moment
  a run returns there may be no trace, there may never be one, and the caller
  may legitimately read it a week later — the feed carries an expiration about
  four weeks out. `traceId` invited callers to build polling around a promise
  the contract could not keep, and `traceRequestsResponse` was measured to be
  the empty feed every time.

  **Migration.** After running, use `IProfiler.list()` to find the trace when
  you want it, and `read()` to open it. With this removal the class and program
  profiling results say the same thing — the program one had been honest about
  exactly this all along, in a comment.

- **BREAKING** — `IClassExecuteWithProfilingOptions` loses `traceLookupUris`,
  `maxTraceAttempts` and `traceRetryDelayMs`. They configured a search for the
  trace that the run no longer performs. The class and program profiling
  options are now literally the same shape.

- **BREAKING** — `IClassExecutor` and `IProgramExecutor` now compose
  `ITraceScheduling`, so an implementation must provide it.

  Scheduling is composed into the two executors rather than added to
  `IExecutor` or `IAdtRunnable`. Both of those are implemented by ATC and
  unit-test runners as well, and neither has any business answering for trace
  parameters. A typecheck pins this: an ATC-shaped runnable compiles with no
  scheduling member, and stops compiling if scheduling ever migrates upward.

### Added

- `ITraceEntry`, `ITraceView`, `ITraceListing`, `ITraceReading`, `ITraceFamily`
  and the `ViewResult` / `ViewOptions` / `ViewArgs` helpers — the atoms a trace
  family is composed from. A family with views composes reading in; a family
  with none says nothing about reading, which is the only truthful way for a
  type to say it.

  `ITraceEntry` is transcribed from measurement, not designed: every field is
  one an `abaptraces` feed entry carries, present in every entry on both an
  on-prem system and a cloud tenant. That includes two nobody would have asked
  for — `state`, because a trace has a lifecycle and "exists" is not
  "readable", and `expiresAt`, because the system deletes traces.

- `IAbapTraceHitList`, `IAbapTraceStatements`, `IAbapTraceDbAccesses` and the
  row types beneath them, read off one real trace across all three views.

  Two members are declared but typed `unknown`: `grossTime` and
  `traceEventNetTime`. Both elements were seen on every row; their attributes
  were never captured, unlike `accessTime`'s, which are typed. Publishing four
  plausible attribute names would have been indistinguishable, to a consumer,
  from four measured ones.

- `ITraceScheduling`, with `listObjectTypes()`, `listProcessTypes()`,
  `listRequests()`, `getRequestsByUri()` and `scheduleTrace()`; plus
  `INamedItem` and `ITraceRequestEntry`.

  `ITraceRequestEntry` is what a scheduled request looks like once stored,
  including the two catalogue choices echoed back as exactly the URIs the
  catalogue readers hand out — which is how a request is connected to the trace
  it eventually yields.

  There is deliberately **no** operation that submits one. The stored entry is
  measured; the submitted document is not, and no capture of one exists. A
  published `requestTrace(request)` would tell a consumer that its argument's
  fields are the wire shape — that `{}` is a valid body, that `description` is
  the element name the server reads — on the strength of having read the
  *response*. It is additive in a minor release the moment a capture exists.

### Removed

- **BREAKING** — `IProfiler.getParameters()`,
  `IProfiler.getParametersForCallstack()` and
  `IProfiler.getParametersForAmdp()`. Three names for one byte-identical call,
  on a URL measured to refuse `GET` with `405` on both an on-prem system and a
  cloud tenant. Nothing reads through it; what reads the available choices is
  `listObjectTypes()` / `listProcessTypes()`, which moved rather than died.

  **Migration.** There is no replacement, because there was no operation.

### Moved

Five members left `IProfiler` for `ITraceScheduling`, which the executors
compose in. They are all about configuring a measurement rather than reading
one, and a scheduled request's life is bounded by the run that fulfils it.

| was | is now |
|---|---|
| `IProfiler.createParameters(o)` | `IClassExecutor \| IProgramExecutor` → `scheduleTrace(o)`, resolving to the request id |
| `IProfiler.listObjectTypes()` | the executors' `listObjectTypes()`, now returning `INamedItem[]` |
| `IProfiler.listProcessTypes()` | the executors' `listProcessTypes()`, now returning `INamedItem[]` |
| `IProfiler.listRequests()` | the executors' `listRequests()`, now returning `ITraceRequestEntry[]` |
| `IProfiler.getRequestsByUri(u)` | the executors' `getRequestsByUri(u)` |

`createParameters` is renamed because it created nothing a caller could read
back; it configures a run and yields a request id.

`listRequests` was nearly deleted in an earlier draft as "empty by
construction". It is empty when nothing is scheduled, which is a different
sentence — that collection is the schedule, consumed by the runs that fulfil
it. It serves `application/atom+xml;type=feed` and answers anything else
`400 acceptHeaderMissing`, which reads like a missing header and is not.

### Unchanged

Stated because a reader should not have to infer it: `ISt05Trace` is untouched,
and so is **`ICrossTrace`** — not reshaped, not deprecated, not annotated. Its
result documents could not be measured: the systems available answer `200` with
an empty document, so there are no cross traces to read. A contract for a
document nobody has read is worse than no contract, which is the same
judgement `ISt05Trace` already had. Cross-trace waits on a system that has
them.

`IProfilerListOptions`, `IProfilerTraceParameters` and the three view-option
types are unchanged in shape.

### PROG/I includes

Unrelated to the profiler, and in this release because it shares the major.

- **Added** — `IIncludeConfig`, `IIncludeState`, `ICreateIncludeParams`,
  `IUpdateIncludeSourceParams` and `IDeleteIncludeParams`.

  A standalone include is a different resource from a program, measured: it
  answers with `include:abapInclude`, its own namespace, `adtcore:type="PROG/I"`
  and `include:contextRefCount`, against a program's `program:abapProgram`,
  `program:programType` and `PROG/P`. The two collections advertise different
  accepted content types. Modelling an include as a flavour of program would
  build the wrong document and post it to the wrong collection.

  There is no `IValidateIncludeParams`: `/includes/validation` was measured to
  require the same three parameters as `/programs/validation`. There is also no
  main-program context field on create: a read include carries
  `include:contextRefCount`, so the system tracks the contexts, but nothing
  measured says the create call accepts one. It is additive when a capture shows
  otherwise.

- **BREAKING** — `IAdtContentTypes.includeCreate(): IAdtHeaders`, whose measured
  value is `application/vnd.sap.adt.programs.includes.v2+xml`. Breaking for
  every implementer of that interface, which is why it waited for a major.

  Creating an include is a **modern on-prem** capability: only there does
  discovery give the includes collection an `app:accept`, and a collection
  without one is not a POST target. The types are the same everywhere; whether
  the system accepts the request is not.

## [21.0.0] - 2026-08-23

### Removed

- **BREAKING** — `ICredentialOwningItsFetch` and `ICredentialTransport`.

  Both existed so a credential could run the CSRF exchange itself, on the reading
  that SPNEGO needs to: its token is consumed by one request, so the way in and
  the fetch are the same act. **Nothing ever implemented either.** The seam was
  built twice in `@mcp-abap-adt/connection` — once as a transport-shaped
  parameter, once as the atom added here in 20.0.0 — and the branch that read it
  was asked about no credential at all.

  They are removed because nothing implements them, and for no stronger reason
  than that. In particular they are NOT replaced by "answer with the token once
  and `null` afterwards": a wire asks `authorizationHeader()` per attempt and
  retries a failed establishment, so a credential that marked itself spent when
  the header was handed out would send nothing on the second attempt — after a
  timeout, an abort, or a refusal that never reached the server. From inside
  `authorizationHeader()` there is no way to know whether the request went out.

  A credential that may only be presented once therefore has no home here yet,
  and the requirement is stated rather than papered over: it needs either an
  exchange it owns end to end, or a signal that the establishing request
  succeeded. Whoever adds SPNEGO decides which, from that requirement — which is
  the thing these two contracts were written without.

  This is the third time this shape has been removed from this contract: a member
  declared, wired at a call site, and implemented by nobody. The first version of
  `fetchCsrfToken` took a URL and could not be implemented at all; the second
  could, and was not.

  **Migration.** Nothing shipped implements either, so nothing shipped changes.


## [20.0.0] - 2026-08-23

### Changed

- **BREAKING** — `IAuthProvider` states all of itself. `prepare()`, `cookies()`
  and `transportMaterial()` are required; `cookies()` answers `string | null`.

  They were optional, so a connection asked `credential.prepare?.()` — a runtime
  question about a collaborator it was handed, which is the thing a contract
  exists to answer instead. An empty implementation of each is TRUE of a
  credential that has nothing to say: "nothing to prepare", "I am not cookies",
  "I contribute no TLS material". A fact is stated, not left for a caller to
  discover by checking whether a method exists.

  `null` rather than `''` from `cookies()` for the reason `authorizationHeader()`
  already uses it: an empty string is a legal cookie header, so it cannot also
  mean there is none.

- **BREAKING** — `fetchCsrfToken()` leaves `IAuthProvider` for its own atom,
  `ICredentialOwningItsFetch`. The same criterion, the other way: an empty
  implementation here would be a LIE — it would report a token that was never
  earned, and the connection would stop doing a fetch that nobody then did. Only
  SPNEGO has it, because only there is the way in itself a round trip.

  This is the one question about a credential a connection still asks, and the
  only one whose answer changes what it DOES rather than what it sends.

  **Migration.**

  ```diff
  - class BasicAuthProvider implements IAuthProvider {
      readonly kind = 'basic';
  +   async prepare(): Promise<void> {}
      async authorizationHeader(): Promise<string | null> { … }
  +   cookies(): string | null { return null; }
  +   transportMaterial(): ICertificateMaterial { return {}; }
    }
  ```

  ```diff
  - class SpnegoProvider implements IAuthProvider {
  + class SpnegoProvider implements ICredentialOwningItsFetch {
  ```

  A consumer that called `credential.cookies?.()` can drop the `?.`; one that
  called `fetchCsrfToken?.()` narrows first.


## [19.0.0] - 2026-08-23

### Changed

- **BREAKING** — `IAuthProvider.renew()` moves out into its own atom,
  `IRenewableCredential`. Only some credentials have it: a password is a
  password, and a SAML session was negotiated elsewhere and handed over — making
  the member optional on every credential asked each of them to carry a
  possibility most of them do not have.

  The same split, and the same reason, as `ISessionLifecycleAware` beside
  `IAbapConnection`. A consumer narrows to it rather than casting:

  ```ts
  function isRenewable(c: IAuthProvider): c is IRenewableCredential {
    return typeof (c as Partial<IRenewableCredential>).renew === 'function';
  }
  ```

  **Nothing in a request path should call it.** Renewal on an expiry the provider
  can see happens inside `authorizationHeader()`, which is asked per request.
  This is the other case — a credential the provider still believes in and the
  server refuses — and deciding what that MEANT is the caller's, made with what
  the caller knows. `@mcp-abap-adt/connection` stopped calling it for exactly
  that reason, which is what left it with no caller and prompted this.

  **Migration.** An implementation that declared `renew()` keeps working; say so
  in its type:

  ```ts
  - class TokenAuthProvider implements IAuthProvider {
  + class TokenAuthProvider implements IRenewableCredential {
  ```

  A consumer that called `credential.renew?.()` on a bare `IAuthProvider` now
  narrows first — which is the point: the optional call compiled everywhere and
  did nothing on most credentials.


## [18.0.0] - 2026-08-22

### Changed

- **BREAKING** — `ISessionLifecycleAware.disconnect()` takes no arguments. The
  `options.deadlineMs` it accepted was a bound on waiting for the goodbye to be
  answered, and the method does not act on that answer: it TELLS the server the
  session is finished, and whether and when the session is freed is the server's
  affair. Waiting for a reply nobody reads bought a caller nothing, while being
  the one thing that could make a teardown unbounded — a goodbye carries no
  request timeout by design, so a server that never answers would have held the
  teardown open.

  The doc comment now says what the method is: a notification. Everything else
  about it is unchanged — it still resolves rather than throws, still always
  settles, still performs whatever is owed on a repeat call, and still does not
  wait for in-flight requests.

  **Migration.** Drop the argument:

  ```ts
  - await conn.disconnect({ deadlineMs: 5000 });
  + await conn.disconnect();
  ```

  An implementation that accepted the options object keeps compiling — a
  parameter nobody passes is not an error — but should drop it, along with any
  `SAP_RELEASE_DEADLINE_MS` handling, since nothing will ever supply one.


## [17.2.0] - 2026-08-21

### Added

- **The credential contract** — `src/auth/IAuthProvider.ts`: `IAuthProvider` and
  `ICredentialTransport`. How a connection proves who it is on each request, as
  opposed to which system it is dialling. Four of the five ways in are not tokens
  — basic is a header built from a username, a certificate is TLS material and no
  header at all, SPNEGO is a negotiation with the server — so this is deliberately
  not "give me a token".

  It lived in `@mcp-abap-adt/connection`, which pinned every credential inside that
  package: `@mcp-abap-adt/auth-providers` could not host one without depending on
  the connection package, which is backwards. Half of its world was already here —
  `ICertificateMaterialLoader` — and the contract itself had not followed.

  Distinct from `IAuthorizationStrategy`, one layer up: that is how an interactive
  login is conducted, asked once by a human, and its output becomes a token some
  implementation of this hands out. This one is asked on every request.

  Three corrections came with it rather than after it:

  - `authorizationHeader()` answers `string | null`, not `string`. The empty string
    is a legal header value, so using it to mean "this credential is not a header"
    gave one type two meanings and left every caller checking truthiness.
  - TLS material is `transportMaterial(): ICertificateMaterial`, not
    `httpsAgentOptions(): AgentOptions`. This package has no `node:` imports and
    the shape a client needs is what the loader already produces; the old member
    would have introduced the first one.
  - `fetchCsrfToken()` takes an `ICredentialTransport`, not a URL string. A
    credential that owns the fetch owns what the fetch produces: the SPNEGO round
    trip is the request the server answers with the session cookie, and that cookie
    has to reach the connection. Handed a URL and returning a string, it had
    nowhere to put it — which is why that member was declared, wired at its call
    site, and implemented by nobody.

  Additive: nothing existing changes shape, so this is a minor. What breaks is
  downstream, where the local copies are deleted.

  Compile-only coverage in `src/__typechecks__/authProvider.ts`, checked to fail on
  each of the three corrections being reverted.

## [17.1.0] - 2026-08-17

### Added

- **The ATC run contract** — `src/runtime/IAtcRun.ts`: `AtcObjectType`, `IAtcObjectRef`,
  `IAtcRunTarget`, `IAtcRunOptions`, `IAtcRunResult`, `IAtcRunStatus`, `IAtcRunStatusReadable`,
  `IAtcFindings`. Three capabilities — start a check run, ask whether it is done, read the
  worklist — declared as `IAdtRunnable` plus two readers rather than `IAdtObject`, because a
  check run is not created, locked, activated or versioned.

  Separate from the existing `IAtcLog`, which is untouched: that reads the execution log and the
  check-failure logs, two different resources, neither taking a worklist id.

  Every shape here was forced by captured traffic rather than chosen, and the doc comments say
  which. The three worth knowing about:

  - **`AtcObjectType` has seven members**, each confirmed by a run submitted at the URI a client
    builds whose *finished* worklist then listed that object under that type — acceptance alone
    proves nothing, since a URI that cannot exist is answered `201` too. `program` and `include`
    are absent because ABAP Cloud refuses to hold either (`403`, `S_DEVELOP`). **Widening this
    union later is a breaking change**: adding a member is invisible to a caller passing a value
    and fatal to one exhausting it.
  - **`IAtcRunResult` is a discriminated union on `waited`**, because the server answers two ways
    — `clientWait=false` with `201`, an empty body and a run id in `Location`; `clientWait=true`
    with `200`, `FINDING_STATS` and no `Location`. One interface with optional fields would let a
    caller write `result.runId!` and be wrong exactly when they waited.
  - **`isFinished` is completion, not success**, and there is no `isTerminal` or `isFailed`: no
    failed run has been observed, so any state named for one would be invented.

  There is deliberately no `waitForRun` helper — waiting needs a stopping condition for the run
  that does not finish, and the caller who knows how long their checks take is the one who can
  supply it.

## [17.0.0] - 2026-08-15

### Changed — BREAKING

- **`IFeatureToggleObject` and `IAdtServiceBinding` state what ADT gives them.** Both extended
  `IAdtObject` — the full capability set — and so promised version history, plus a transport for
  the toggle and a lock for the binding. The handlers implementing them refused all of it at
  runtime: `getVersions`, `getVersionSource`, `readTransport` on the toggle; `getVersions`,
  `getVersionSource`, `lock`, `unlock` on the binding. Each now extends the atoms it satisfies,
  plus its own operations, which are untouched — switching a toggle and reading its runtime
  state, generating and publishing a binding.

  ```typescript
  // Before
  interface IFeatureToggleObject extends IAdtObject<…> { switchOn(…); … }
  interface IAdtServiceBinding  extends IAdtObject<…> { publishODataV2(…); … }

  // After
  interface IFeatureToggleObject
    extends IAdtCrud<…>, IAdtValidatable<…>, IAdtCheckable<…>,
            IAdtActivatable<…>, IAdtLockable<…> { switchOn(…); … }

  interface IAdtServiceBinding
    extends IAdtCrud<…>, IAdtValidatable<…>, IAdtCheckable<…>,
            IAdtActivatable<…>, IAdtTransportAware<…> { publishODataV2(…); … }
  ```

  **Migration** — a consumer calling any of the seven removed methods was calling something that
  threw. There is nothing to move the call to: a feature toggle has no version history and a
  service binding has no lock, so the call goes away. Everything else compiles unchanged.

- **`AdtServiceBindingType`** was a second alias over `IAdtObject` for the same config, carrying
  the same promise. It now points at `IAdtServiceBinding`.

### Why this is the last of them

This finishes the work 15.0.0 and 16.0.0 began: after it, **no type in this package declares a
capability the object does not have**. That is not a claim from reading — it is what a guard in
`@mcp-abap-adt/adt-clients` asserts, comparing all 36 factory return types against 10 atoms in
both directions, and calling each declared method against a recording connection to check it
issues the request its capability names.

The three releases should have been one. 15.0.0 was cut because a phase ended rather than
because the work was done, and nothing ever resolved it: its consumer went straight from
`^14.1.0` to `^16.0.0`. A version now appears when the task is finished and ready to hand over.

## [16.0.0] - 2026-08-14

### Added

- **`IAdtRunnable<TTarget, TResult, TOptions>`** (`execution/IAdtRunnable.ts`) — the capability
  of being executed, and one method is the whole of it: `run(target, options?)`. `IExecutor`
  now extends it and keeps its profiler variants, so **`IExecutor`'s shape is unchanged** and
  nothing implementing or calling an executor has to move. A compile-time proof in
  `src/__typechecks__/runnableSplit.ts` asserts that in both directions **and asserts the
  parameter list itself**: with the default `TOptions = never` the options parameter is absent
  rather than optional, so `Parameters<IExecutor['run']>` is still `[target]` and a wrapper built
  from tuple types keeps compiling.

  There is deliberately **no test-specific runnable**. Two differently-shaped contracts for
  "this can be executed" would be two vocabularies for one idea, so a unit-test handler
  declares `IAdtRunnable` like anything else that runs.

- **`ITestRunInformation`** — `getStatus(runId, withLongPolling?)` and
  `getResult(runId, options?)`. Asking about a run is not running: a run is started once and
  asked about whenever, by whoever holds its id.

  It declares **no listing**. Every request this package makes addresses one run —
  `POST /abapunit/runs`, `GET /abapunit/runs/{id}`, `GET /abapunit/results/{id}`, and the legacy
  `/abapunit/testruns/{id}` — and whether ADT answers a collection GET is unverified. An
  unproven method is exactly what a contract should not promise.

- **`ICdsTestDoubleCheckable`** — `checkCdsTestDoubles(cdsViewName)`. It answers a question
  about a view, and it is asked before there is anything to run.

### Removed — BREAKING

- **`IAdtTestRunnable` and `IAdtCdsTestRunnable`.** They declared six members and eight
  respectively, of which one was running. Three were the handler's memory of its own last call
  — `getRunId`, `getStatusResponse`, `getResultResponse` returned whatever the previous
  invocation had stored — and nothing in ADT is "the run this handler happened to start last".
  Two were the polling machinery, which belongs to asking about a run. The CDS variant added a
  view check and two more remembered names.

  **Migration** — declare the parts a handler actually has:

  ```typescript
  // Before
  class AdtUnitTest implements IAdtTestRunnable { … }

  // After
  class AdtUnitTest
    implements IAdtRunnable<IClassUnitTestDefinition[], string, IClassUnitTestRunOptions> { … }

  // and, where the same object also answers questions about runs:
  //   ITestRunInformation
  // and for the CDS flavour:
  //   ICdsTestDoubleCheckable
  ```

  The removed *methods* need not disappear from an implementation — `getRunId` and the two
  response getters can stay as conveniences. They are simply no longer part of any contract.

### Changed — BREAKING

- **`IUnitTestConfig` describes a unit test, not a run.** It carried `tests`, `options`,
  `runId`, `status` and `result`, every one of them there to serve `create()` meaning "start a
  run" and `read(config.runId)` meaning "poll it". Running takes its arguments directly, so a
  config for it was never needed. The type now names what a unit test *is* as an object: the
  container class (`className`), the source of its whole `testclasses` include
  (`testClassSource`), and the three fields creating that class needs — `packageName`,
  `description`, `classTemplate` — plus `transportRequest`.

  ```typescript
  // Before
  await unitTest.create({ tests: [{ containerClass: 'ZCL_X', testClass: 'LTCL_X' }] });
  const state = await unitTest.read({ runId });
  state.runStatus; state.runResult;

  // After
  await unitTest.create({ className: 'ZCL_TESTS', packageName: '$TMP',
                          description: 'tests', classTemplate, testClassSource });
  const runId = await unitTest.run([{ containerClass: 'ZCL_TESTS', testClass: 'LTCL_X' }]);
  await testRuns.getStatus(runId);
  await testRuns.getResult(runId);
  ```

- **`IUnitTestState`** loses `runId`, `runStatus` and `runResult`. After the split the methods
  returning a state are the CRUD ones, and none of them produces a run.

- **`ICdsUnitTestConfig`** adds only `cdsViewName` now. `className`, `packageName`,
  `classTemplate`, `testClassSource`, `description` and `transportRequest` were declared twice —
  it always inherited them — and a CDS test lives in a generated global class exactly as a
  class's own tests do.

- **`testClassName` is removed from `IUnitTestConfig` and `ILocalTestClassConfig`.** ADT
  addresses the include, never one class inside it: reading GETs `/includes/testclasses` whole,
  writing PUTs a source that replaces it whole, and deleting PUTs an empty one. A
  `delete({ testClassName: 'LTCL_ONE' })` would have removed every test class in the include.
  The field named an addressing that does not exist.

  `IClassConfig.testClassName` **stays** — that one is real. It names the test class to activate
  through the `#testclass=NAME` fragment, which is the single place ADT addresses one.

## [15.0.0] - 2026-08-14

### Added

- **`IAdtUpdatable` and `IAdtDeletable`**, split out of `IAdtModifiable` — `update` and
  `delete` as their own atoms, so a handler that supports one but not the other now has a
  way to say so. `IAdtModifiable` stays, as their composite, with the same method shape it
  had before this release: a consumer that already implements both `update` and `delete` is
  unaffected by this change. `IAdtCrud` is unchanged in shape for the same reason — nothing
  that already implements everything needs to touch this release.

### Removed — BREAKING

- **`IAdtNonVersionedObject`.** It was `IAdtSourceObject` minus `IAdtVersionable` —
  `IAdtCrud & IAdtValidatable & IAdtCheckable & IAdtActivatable & IAdtLockable &
  IAdtTransportAware`, i.e. six capabilities enumerated in full just to spell out the one
  being omitted. Its three users — `getDomain`, `getDataElement`, `getFunctionGroup` — do
  implement all six, so nothing was misdescribed in practice; the flaw is that the composite
  fixes *every other* capability, so it can only ever describe a handler whose remainder
  matches exactly. Applied to any other handler that also lacks version history — a message
  class, which has no activation or check; a service binding, which has no lock — it would
  hand over methods that handler does not have. A name for "everything except versions"
  leaves no room for a different everything.

  Worse, `Non` means nothing to the type system: a composite is a set of methods, and
  omitting one method from a union does not forbid a *different* union from re-adding it.
  `IAdtNonVersionedObject<C, R> & IAdtVersionable<C>` compiled without error and handed out
  a working `getVersions` — the name promised an absence the compiler never enforced. A
  capability vocabulary can only state what an object supports; it has no mechanism to state
  what it lacks, so a composite defined by subtraction is a name with no type behind it.
  `IAdtSourceObject` is unaffected — it names its set positively and stays exactly as it was.

  **Migration** — declare the atoms the handler actually satisfies, written positively. The
  set is exactly what `IAdtNonVersionedObject` used to assemble, minus nothing:

  ```typescript
  // Before
  import type { IAdtNonVersionedObject } from '@mcp-abap-adt/interfaces';

  function getDomain(): IAdtNonVersionedObject<IDomainConfig, IDomainState> { /* ... */ }

  // After
  import type {
    IAdtActivatable,
    IAdtCheckable,
    IAdtCrud,
    IAdtLockable,
    IAdtTransportAware,
    IAdtValidatable,
  } from '@mcp-abap-adt/interfaces';

  function getDomain():
    & IAdtCrud<IDomainConfig, IDomainState>
    & IAdtValidatable<IDomainConfig, IDomainState>
    & IAdtCheckable<IDomainConfig, IDomainState>
    & IAdtActivatable<IDomainConfig, IDomainState>
    & IAdtLockable<IDomainConfig, IDomainState>
    & IAdtTransportAware<IDomainConfig, IDomainState> { /* ... */ }
  ```

  If a consumer instead named `IAdtModifiable` directly — rather than through `IAdtCrud` or
  `IAdtNonVersionedObject` — no change is needed: its shape did not move.

## [14.1.0] - 2026-08-12

### Added

- `ITransportTree`, `ITransportTreeRequest`, `ITransportTreeTask`,
  `ITransportTreeNode`, `ITransportTreeLink` — the parsed shape of the CTS
  transport tree.

  Nothing on the root, a request or a task is dropped: the root's own attributes
  (`adtcore:name` is the user the saved search ran for), every `atom:link` —
  those carry the operation URIs, so a caller releasing a transport does not
  rebuild them by convention — and `tm:long_desc`, with `undefined` for an absent
  element and `''` for a present empty one.

  Containers are an ordered list rather than named fields because the chain is
  not fixed: captured on one trial 2026-08-12, `?configUri=` alone returns
  `tm:workbench > tm:modifiable > tm:request`, while Eclipse's
  `?targets=true&configUri=` returns `tm:workbench > tm:target > tm:modifiable >
  tm:request`. They are kept rather than flattened away because `tm:target`
  carries a human name the request itself does not have.

  Attributes are verbatim — `tm:number`, not `number`.

## [14.0.0] - 2026-08-11

### Changed — BREAKING
- **`IListTransportsParams` narrowed to a required `configUri`.** `user`, `status`, `date_range`, `target_system` and `request_type` are gone — they were never read by the server.

  Probed on a live SAP trial 2026-08-07: `/sap/bc/adt/cts/transportrequests` answered with the same 309-byte empty root for `?user=`, for `?status=`, for the configuration's own property spellings, and for no parameters at all — while 15 transport requests existed on the system and reading them individually worked. `?configUri=<href>` returned 137 181 bytes and 16 requests from the same system in the same minute. The endpoint is a saved-configuration search, not a filtered query: the five fields this removes describe a filter the server never applied.

  **Migration**: obtain an href from `GET` on `TRANSPORT_SEARCH_CONFIGURATIONS_URL` (`/sap/bc/adt/cts/transportrequests/searchconfiguration/configurations`) and pass it as `configUri`. Filtering is a property of the saved configuration, created in Eclipse — there was no server-side filtering to lose, so there is no field-by-field equivalent to migrate to. `IListTransportsOptions.configUri` stays optional for callers that want to opt into a resolved default instead of naming one explicitly.

### Added
- **The contract that was still declared in `@mcp-abap-adt/adt-clients` moves here**, so a consumer has one import point and one seam to override, instead of importing from two packages with no substitution point. All moves are verbatim — no shape changes — except `IAdtClientOptions.contentTypes`, which was typed with an inline `import('../core/shared/contentTypes')` reaching into `adt-clients` and is now a normal sibling import of `IAdtContentTypes` declared alongside it.

  | group | count | added |
  |---|---|---|
  | abapGit (`adt/IAdtAbapGit.ts`) | 12 | `IAdtAbapGitClient`, `IAbapGitLinkArgs`, `IAbapGitPullArgs`, `IAbapGitPullResult`, `IAbapGitUnlinkArgs`, `IAbapGitRepoStatus`, `IAbapGitErrorLogEntry`, `IAbapGitExternalRepoCredentials`, `IAbapGitExternalRepoBranch`, `IAbapGitExternalRepoInfo`, `IAdtAbapGitClientOptions`, `AbapGitStatus` |
  | executors (`execution/IAdtExecutors.ts`) | 10 | `IClassExecutor`, `IProgramExecutor`, `IClassExecutionTarget`, `IProgramExecutionTarget`, `IClassExecuteWithProfilerOptions`, `IClassExecuteWithProfilingOptions`, `IClassExecuteWithProfilingResult`, `IProgramExecuteWithProfilerOptions`, `IProgramExecuteWithProfilingOptions`, `IProgramExecuteWithProfilingResult` |
  | debugger session (`runtime/IAdtDebuggerSession.ts`) | 5 | `IDebuggerListenParams`, `IDebuggerAttachParams`, `IDebuggerStepParams`, `IDebuggerGetVariablesParams`, `DebuggerStepAction` |
  | batch payload (`adt/IAdtBatch.ts`) | 3 | `IBatchRequestPart`, `IBatchPayload`, `IBatchResponsePart` |
  | content-type contract (`adt/IAdtContentTypes.ts`) | 2 | `IAdtContentTypes`, `IAdtHeaders` |
  | client options + system context (`adt/IAdtClientOptions.ts`) | 2 | `IAdtClientOptions`, `IAdtSystemContext` |

  **Two things deliberately stay in `adt-clients` — not part of this move**: the classes `AdtContentTypesBase`/`AdtContentTypesModern` (354 lines, 38 methods, `Modern extends Base`) are implementation, and `resolveContentTypes()` stays with them. Only the two interfaces above are here.

- **`IListTransportsOptions`, `ITransportSearchConfiguration`, `TRANSPORT_SEARCH_CONFIGURATIONS_URL`, `TransportSearchConfigurationMissing`** (`adt/IAdtTransport.ts`) — the high-level transport-list surface and the saved-configuration shape behind the breaking change above. `TransportSearchConfigurationMissing` is the error a consumer catches when a system has no saved search configured at all (precedent: `AdtOperationError` in `src/adt/AdtTypes.ts`).
- **`IDeferredResponseConnection` / `hasDeferredResponses()`** (`connection/IConnectionCapabilities.ts`) — marks a connection (typically a batch recorder) whose responses resolve only after a later flush, so a caller can detect the deadlock risk of awaiting mid-recording before hitting it.

## [13.1.0] - 2026-08-03

### Added
- **`IAdtTestRunnable` and `IAdtCdsTestRunnable`** — the ABAP Unit run surface finally has a contract. Starting a run, polling it and fetching its result is the reason a unit-test handler exists, yet no interface described any of it: the handler was typed as an ADT object, which covers creating and reading a run but says nothing about `run`, `getRunId`, `getStatus`, `getResult`. Consumers reached those methods by casting past the declared type, which is how `adt-clients`' own integration test does it today.

  `IAdtCdsTestRunnable` extends it with `checkCdsTestDoubles` — which has no equivalent for a plain class — and widens `run` to accept a class name, since a CDS run normally starts from the generated test class rather than an explicit test list.

  `getStatus` and `getResult` return the raw `IAdtResponse`. That is what the operation currently is, and the contract says so rather than promising a parsed report that nothing produces.

  Verified against the concrete handlers in `@mcp-abap-adt/adt-clients`: `AdtUnitTest` satisfies `IAdtTestRunnable` and `AdtCdsUnitTest` satisfies `IAdtCdsTestRunnable`, both checked by the compiler.
- **`IUnitTestResultOptions`** — `withNavigationUris`, `format: 'abapunit' | 'junit'`.

## [13.0.0] - 2026-08-03

### Changed — BREAKING
- **One shape for a located object: `IAdtObjectHit`.** Five types described the
  same thing — an object the repository handed back — and disagreed on how. The
  ADT type code lived under `type` in `ISearchResult`, `IWhereUsedReference` and
  `IObjectReference`, but under `adtType` in `IPackageContentItem` and
  `IPackageHierarchyNode`, where the name `type` was taken by an unrelated
  `PackageHierarchySupportedType` enum. On top of that the same concept was
  `isPackage` in one and `is_package` in its sibling — snake_case and camelCase
  for one idea in one file. A consumer could not read a hit without first knowing
  which producer made it.

  All five now extend `IAdtObjectHit` (`name`, `type`, optional `uri`,
  `packageName`, `description`). Migration, in the two types that moved:

  | before | after |
  |---|---|
  | `IPackageContentItem.adtType` | `.type` |
  | `IPackageContentItem.type` (enum) | `.kind` |
  | `IPackageHierarchyNode.adtType` | `.type` |
  | `IPackageHierarchyNode.type` (enum) | `.kind` |
  | `IPackageHierarchyNode.is_package` | `.isPackage` |

  `type` is required on the base, where `IPackageHierarchyNode.adtType` was
  optional. Both producers in `@mcp-abap-adt/adt-clients` already guard with
  `if (!objectName || !objectType) continue;`, so the code always supplied one
  and the stricter contract merely states what was already true.

- **`IAdtObject` is now assembled from the capability atoms** instead of
  declaring its 13 methods itself. The shape is unchanged — the compile-time
  proof in `IAdtCapabilities.ts` asserts the equivalence in both directions, and
  `adt-clients` compiles against it untouched — so this breaks no consumer. It is
  listed here because the atoms, not the composite, are now the definitions: a
  method added to `IAdtObject` directly instead of to an atom is a compile error.

### Added
- **`IAdtCreatable`, `IAdtReadable`, `IAdtModifiable`** — `IAdtCrud` bundled five
  methods, which made it a lie for any handler that refuses some of them: a
  unit-test run and a transport request are created and read but never updated or
  deleted. `IAdtCrud` is retained as the composite of the three, so existing
  consumers keep compiling.

  The grain is not arbitrary. It follows ADT: `lock`/`unlock` and
  `getVersions`/`getVersionSource` are two ends of one operation and stay
  together, while `update`+`delete` separate from `create`/`read`/`readMetadata`
  because an object that records an event is never edited afterwards. Across the
  35 handlers in `adt-clients`, `update` and `delete` are refused by exactly the
  same two handlers, and `create`/`read`/`readMetadata` by none.
- **`IAdtSearchable<TCriteria, TResult>`** — the capability of locating objects,
  parameterised because free-text search, where-used and package listing differ
  in what they accept and how much detail they return, while agreeing that a
  result is a named object with an ADT type code.
- **`IAdtObjectHit`** — see above.

## [12.0.0] - 2026-08-03

### Removed — BREAKING
- **`ITeardownReport`, `ILockWindowAware` and `WindowToken`.** They were added in
  11.5.0, four days before this release, and should not have been. The criterion
  they failed is this package's own: `interfaces` holds what a **consumer
  imports**. Counted across all four repositories that use it, `ITeardownReport`
  appeared in exactly one — `@mcp-abap-adt/connection` — and only to type its own
  method's return. No consumer imported it, and both of its fields were vacuous in
  practice: `releasePending` was hard-coded `false`, and `abandonedWindows` drew
  from windows that nothing opens.

  `ILockWindowAware` and `WindowToken` are worse: `beginWindow()` has **zero
  callers** anywhere, and the behaviour it was supposed to provide — a span in
  which a short per-request timeout must not abort a request — has been
  implemented in the connection's own reference-counted
  `beginCriticalSection()`/`endCriticalSection()` since 1.9.0. Two mechanisms for
  one idea, and the one promoted into the shared contract was the no-op.

  Removing them breaks nothing in practice, because nothing outside the connector
  ever referenced them; the major is formal. Doing it now, while that is still
  true, is cheaper than carrying deprecated types to the next one.

### Changed — BREAKING
- **`ISessionLifecycleAware.disconnect()` returns `Promise<void>`** and takes an
  optional `{ deadlineMs }`. It always settles: whatever a teardown could not
  finish is the connection's own state, and a repeat call performs what is still
  owed, so nothing has to be handed back for the caller to interpret. `deadlineMs`
  bounds the wait for the transport release — measured from the call, so time
  spent queued behind another lifecycle transition counts against it — and
  defaults to `SAP_RELEASE_DEADLINE_MS`. Omitting it does **not** mean "no bound";
  an unbounded teardown was the defect this whole line of work exists to remove.

### Kept
- `ISessionLifecycleAware` and `ADT_SESSION_ERROR` — the two additions from 11.5.0
  that a consumer genuinely imports.

Design: `docs/superpowers/specs/2026-07-31-teardown-policy-design.md` in
`@mcp-abap-adt/adt-clients`.

## [11.6.0] - 2026-07-30

### Added

- `IAuthorizationStrategy<TResult>`, `AuthorizationRequest` and
  `AuthorizationOutcome<TResult>` — the contract by which a consumer supplies
  its own way of conducting an interactive authorization.
- `ICallbackServerOptions.logger` — where the transport reports an ignored
  request.

### Changed

- `ICallbackServerOptions.port` accepts `0`, meaning an ephemeral port. Flows
  that build their authorization URL before binding still cannot use it.

## [11.5.0] - 2026-07-29

### Added
- **Connection capability atoms — `ISessionLifecycleAware` and `ILockWindowAware`**, with
  `ITeardownReport`, `WindowToken`, `ADT_SESSION_ERROR` and `AdtSessionErrorCode`.

  `ISessionLifecycleAware` describes a connection whose session is owned and observable:
  `disconnect()` resolving with a report of what it could not finish, `isConnected()`, and
  `getSessionIdentity()` naming which **server session** the connection is on. That last one
  is the point — a stable client-side conversation id says nothing about whether the server
  replaced the session underneath it, and a caller holding a lock had no way to notice.

  `ILockWindowAware` marks a span that must not lose its session, such as LOCK to UNLOCK. A
  lock outlives the request that takes it, so a teardown in that span strands the lock rather
  than merely failing a request; a teardown waits for an open window, bounded, and reports it
  as abandoned instead of dropping it silently. `WindowToken` is a symbol rather than a string
  because the same object may be locked twice in one chain and the two must close independently.

  **Additive, following the ADT capability atoms.** `IAbapConnection` is unchanged: it stays
  the minimum every transport can honour, and these are the things only some can. An RFC
  connection, a batch recorder and a test stub are all legitimate `IAbapConnection`s that own
  no HTTP session and can open no lock window — making these methods mandatory would force
  each of them to implement a lie. An implementation adds an atom when it genuinely supports
  it; a consumer narrows to the atom it needs. Pinned by `src/__typechecks__/connectionCapabilities.ts`,
  which asserts a session-less connection still satisfies `IAbapConnection`.

## [11.4.0] - 2026-07-28

### Added
- **Callback server contract** — `ICallbackServerOptions`, `ICallbackServerHandle<TResult>`
  and `CallbackServerFactory<TResult>`, describing the lifetime of the local listener that
  receives an interactive login's redirect.

  The handle is borrowed inside a factory callback, and the port is released on the first
  terminal outcome: the callback returning or throwing, an explicit `fail`, the timeout, or
  an abort. Releasing the socket is therefore never a consequence of a wait settling — which
  is the shape that lets an abandoned login hold a port for the lifetime of a process.

  `timeoutMs` is mandatory, bounded by Node's 32-bit `setTimeout` delay so that a
  generous-looking value cannot silently become 1 ms, and cancellation is available through
  an `AbortSignal`. The contract is domain-agnostic: an OAuth authorization code, OIDC
  `code` + `state` and a SAML `SAMLResponse` all fit through it, parameterised by result.

## [11.3.0] - 2026-07-21

### Added
- **Named capability composites** `IAdtSourceObject` (full capability set) and
  `IAdtNonVersionedObject` (all but version history), for handlers to declare
  their honest capability profile instead of the fat contract.

### Deprecated
- **`IAdtObject`.** It remains as the full-capability composite (structurally
  identical to `IAdtSourceObject`, asserted at compile time) for backward
  compatibility, and will be removed in a later major. New code should depend on
  the specific capability atoms or a composite.

## [11.2.0] - 2026-07-20

### Added
- **Capability atom interfaces.** Seven small interfaces — `IAdtCrud`,
  `IAdtValidatable`, `IAdtCheckable`, `IAdtActivatable`, `IAdtLockable`,
  `IAdtVersionable`, `IAdtTransportAware` — partition the 13 methods of
  `IAdtObject` so each method belongs to exactly one. Purely additive:
  `IAdtObject` is unchanged, and a compile-time proof asserts the intersection
  of the atoms is structurally identical to it. Consumers may depend on a
  narrow capability instead of the whole contract.

## [11.0.0] - 2026-07-19

Type-promotion consolidation: `@mcp-abap-adt/interfaces` becomes the single definition site for the object-type modules' consumer-facing types. adt-clients will import and re-export these (a follow-up adt-clients release); its public API is unchanged.

### Added
- **`IXxxConfig`/`IXxxState` for all object-type modules** (~29 pairs across 27 modules) — previously local-only in adt-clients, now defined here (verbatim).
- **Cross-cutting shared types** in the new `src/adt/IAdtShared.ts` — `AdtObjectType`(+`…Lower`/source variants), `IObjectReference`, `ISearchObjectsParams`/`ISearchResult`, `IGetSqlQueryParams`, `IGetTableContentsParams`, `IGetDiscoveryParams`, `IGetWhereUsed*Params`, `IWhereUsedReference`/`IWhereUsedListResult`, `IVirtualFolders*`, `IGetPackageHierarchyOptions`/`PackageHierarchy*`/`IPackageHierarchyNode`, `IGetPackageContentsListOptions`/`IPackageContentItem`, `IInactiveObjectsResponse`.
- **Missing/renamed params and option/result types** brought in to match adt-clients (e.g. `IMetadataExtensionCreateParams`/`ValidationParams`, `IFeatureToggleSource` + nested, service-binding operation params, `IClassUnitTest*`, `IFeatureToggleObject`).
- **Public helper/config types promoted so adt-clients can re-export its consumer-facing type surface from here:** behaviorDefinition `IValidationResult`/`ILockResult`/`CheckReporter`/`ICheckMessage`/`ICheckRunResult`, `IEnhancementMetadata`, CDS unit-test `ICdsUnitTestConfig`/`ICdsUnitTestState`, and class-includes `ILocalTestClassConfig`/`ILocalTypesConfig`/`ILocalDefinitionsConfig`/`ILocalMacrosConfig`. Deliberately NOT promoted (stay adt-clients-local): `IAdtClientOptions` (the client class's own constructor options), and the `AdtXxxType` convenience aliases (e.g. `AdtClassType = IAdtObject<IClassConfig, IClassState>`) which are composed locally from the promoted `Config`/`State` rather than being shared contract types themselves.

### Changed (BREAKING)
- **Param interfaces reconciled to adt-clients' actual shape (verbatim).** adt-clients is the source of truth (it runs against SAP); the interfaces copies had drifted. Reconciliation includes field-name changes where the two diverged — notably snake_case→camelCase for `masterSystem`/`masterLanguage` (interfaces previously used `master_system`), the `IFixedValue` nested shape (`{ low; high?; description? }` → `{ low; text }`), tightened optionality (e.g. `IUpdateDomainParams.package_name`), and `behaviorDefinition` param renames. A consumer compiling against the old field names/shapes must update.
- `IAdtService` replaced by the canonical `IAdtServiceBinding` shape (+ `IAdtService = IAdtServiceBinding` alias), restoring the previously-missing `deleteServiceBinding` member.

### Removed (BREAKING)
- **37 stale interfaces-only param types** that no consumer used (e.g. `IReadClassParams`, `IUpdateClassParams`, `IReadDomainParams`, the CRUD-named `ICreate/IRead/IUpdate/IDeleteMetadataExtensionParams`, `IRunUnitTestParams`, and other `IRead*`/`IUpdate*`/`IDelete*` leftovers). Each was verified to have zero references across adt-clients before removal.

`IReadOptions` (already at `src/shared/IReadOptions.ts`) is unchanged. `IUpdate*Params.source_code` (live) and all runtime/infrastructure types are untouched.

## [10.0.0] - 2026-07-17

### Removed (BREAKING)
- **`source_code` removed from create-params** — `ICreateAccessControlParams`, `ICreateServiceDefinitionParams`, `ICreateEnhancementParams`. The field was a no-op on create (deprecated in 9.2.1) and is now gone; source is written via the update flow (`IUpdate*Params.source_code`, untouched). This is a breaking type change: a consumer compiling against `ICreate*Params.source_code` under a `^9.x` range will no longer compile — hence the major bump. No runtime behavior changes (the field was never read on create). Completes the drift resolution with `@mcp-abap-adt/adt-clients` 7.4.3.

## [9.2.1] - 2026-07-17

### Deprecated
- **`source_code` on create-params marked `@deprecated`** in `ICreateAccessControlParams`, `ICreateServiceDefinitionParams`, and `ICreateEnhancementParams`. The field is a no-op on create — create posts metadata only; source is written by the update flow (`IUpdate*Params.source_code`). This resolves the drift with `@mcp-abap-adt/adt-clients` 7.4.3, which stopped populating it. The field is kept (not removed) to avoid a breaking change; hard removal is deferred to the planned type-consolidation pass. `IUpdate*Params.source_code` (live) is untouched.

## [9.2.0] - 2026-07-03

### Added
- **Message class (MSAG) param types** in `IAdtMessageClass.ts` — `ICreate/Read/Update/DeleteMessageClassParams` and the message equivalents (`ICreate/UpdateMessageClassMessageParams`, `IDeleteMessageClassMessageParams`). Low-level (snake_case) params for the upcoming adt-clients message-class CRUD clients. `IUpdateMessageClassMessageParams` keeps `msgtext` optional so an update may change only the description or self-explanatory flag. Additive; no changes to existing types.

## [9.1.1] - 2026-07-01

### Security
- **Bumped dev-only `axios` `^1.11.0` → `^1.18.1`** and added an `overrides` entry pinning `form-data` to `^4.0.6`, clearing all 25 Dependabot alerts (axios proxy-auth/prototype-pollution/SSRF/ReDoS advisories, `follow-redirects` `1.15.11`→`1.16.0` auth-header leak, `form-data` `4.0.5`→`4.0.6` CRLF injection). `axios` is only a devDependency here and is not shipped to consumers, so runtime exposure was negligible; no published API change.

## [9.1.0] - 2026-06-30

### Added
- **`IObjectVersion.transportRequest?` / `transportDescription?`** — optional fields exposing the transport request a version was recorded under (from the version feed's per-entry transport-request link, e.g. id `DS4K901917` + its short text). Additive; versions without a transport leave them undefined.

## [9.0.0] - 2026-06-28

### Added (BREAKING)
- **Object version history on `IAdtObject`.** New required methods `getVersions(config: Partial<TConfig>): Promise<IObjectVersion[]>` and `getVersionSource(contentUri: string): Promise<string>`, a new `IObjectVersion` type (`versionId`, `author?`, `updatedAt?`, `title?`, `contentUri`), and a new `AdtObjectErrorCodes.UNSUPPORTED_OPERATION` (`'ADT_UNSUPPORTED_OPERATION'`). Adding **required** methods to the exported `IAdtObject` interface is source-breaking for every implementer (all `AdtXxx` in `@mcp-abap-adt/adt-clients`, plus any consumer/test mocks), so this is a major bump. Implementations live in `adt-clients` (each object type owns its own `/versions` endpoint; non-source types throw `UNSUPPORTED_OPERATION`).

## [8.0.0] - 2026-06-27

### Changed (BREAKING)
- **Renamed the dead `IAdtView` parameter interfaces to `IAdtDdl`.** `ICreateViewParams`/`IReadViewParams`/`IUpdateViewParams`/`IDeleteViewParams` → `ICreate/Read/Update/DeleteDdlParams`, the `view_name` field → `ddl_name`, and `src/adt/IAdtView.ts` → `src/adt/IAdtDdl.ts`. These describe the generic DDL-source endpoint (`/sap/bc/adt/ddic/ddl/sources/` — CDS views, AMDP table functions, …), aligning with the View→Ddl rename in `@mcp-abap-adt/adt-clients` 6.0.0 and `@mcp-abap-adt/core` 8.0.0. The old exports were unused by current consumers (`@mcp-abap-adt/core` imports none of them; `adt-clients` defines its own local DDL param types). Major bump so `^7.x` consumers are not auto-upgraded onto the renamed exports.

## [7.3.0] - 2026-06-13

### Added
- `ICreatePackageParams.master_language?: string` — master/original language for created packages (e.g. `"EN"`, `"DE"`), defaults to EN when unset. Brings package create params in line with the configurable-master-language support of the other object types (fr0ster/mcp-abap-adt#105).

## [7.2.0] - 2026-05-23

### Added

- **Certificate (mTLS) and Kerberos auth types.** `SapAuthType` extended to `'basic' | 'jwt' | 'saml' | 'certificate' | 'kerberos'`.
- **`ISapConfig`** new optional fields: `certPath`, `certKeyPath`, `certPfxPath`, `certPassphrase` (certificate/mTLS) and `kerberosSpn`, `kerberosService` (Kerberos/SPNEGO).
- **`ICertificateMaterialLoader`** + **`ICertificateMaterial`** (`src/auth/ICertificateMaterialLoader.ts`) — contract for loading client-certificate material (PEM/PFX) for an `https.Agent`; exported from the package root.

### Notes

- Certificate and Kerberos are connection-layer auth types (on-prem HTTP); they bypass the auth-broker. `IConnectionConfig.authType` (the broker's surface) is intentionally left as `'basic' | 'jwt' | 'saml'`.

## [7.1.0] - 2026-04-23

### Added

- **`ICalmConnection`** interface (`src/connection/ICalmConnection.ts`) — minimal contract for SAP Cloud ALM HTTP APIs: `connect()`, `getBaseUrl()`, `getServiceUrl(service)`, `makeRequest(options)`. Mirrors the `IAbapConnection` narrow-contract pattern so resource clients depend on one interface only.
- **`ICalmResponse<T, D>`** type alias — shares `IAdtResponse` shape for consistent payload semantics across ADT and Cloud ALM.
- **`ICalmRequestOptions`** interface (`src/connection/ICalmRequestOptions.ts`) — request options accepted by `ICalmConnection.makeRequest`.
- **`CalmService`** string-literal union + **`CALM_SERVICES`** frozen tuple (`src/connection/CalmService.ts`) — the 9 Cloud ALM services: `features`, `documents`, `tasks`, `projects`, `testManagement`, `hierarchy`, `analytics`, `processMonitoring`, `logs`.

### Notes

- Purely additive — no existing interfaces or types changed. Consumers on `^7.0.0` continue to work unchanged.

## [7.0.0] - 2026-04-14

### Breaking Changes

- **`ICreateServiceBindingParams`**: replaced `binding_type: ServiceBindingType`, `binding_version: ServiceBindingVersion`, `binding_category?: string` with single `binding_variant: ServiceBindingVariant` field

### Added

- **`ServiceBindingVariant`** type — 4 ODATA variants: `ODATA_V2_UI`, `ODATA_V2_WEB_API`, `ODATA_V4_UI`, `ODATA_V4_WEB_API`
- **`SERVICE_BINDING_VARIANT_MAP`** constant — maps each variant to `{ bindingType, bindingVersion, bindingCategory, serviceType }`

## [6.1.0] - 2026-04-13

### Added

- **`connect()`** method to `IAbapConnection` interface — initializes connection by fetching CSRF token and establishing session cookies. Must be called before making any ADT requests. All existing implementations (`BaseAbapConnection`, `JwtAbapConnection`, `SamlAbapConnection`, `RfcAbapConnection`) already have this method; this change formalizes it in the contract.

## [6.0.0] - 2026-04-11

### Breaking Changes

- **`IRuntimeAnalysisObject`** is now generic: `IRuntimeAnalysisObject<TKind extends string = string>`
  - The `kind` field type changes from `string` to `TKind`, enabling literal type narrowing
  - Default generic (`= string`) preserves backwards compatibility for unparameterized usage
  - Consumers who extend `IRuntimeAnalysisObject` without a type parameter are unaffected
  - Consumers who inspect `kind` at the type level may see narrower types
- **`IListableRuntimeObject`** now extends `IRuntimeAnalysisObject` and accepts a third generic parameter:
  `IListableRuntimeObject<TResult, TOptions, TKind extends string = string>`
  - Previously `IListableRuntimeObject` was independent; now all listable runtime objects expose a `kind` discriminator
  - Existing `IListableRuntimeObject<TResult, TOptions>` usage compiles unchanged (default `TKind = string`)

### Added — from issue #6

The following interfaces were requested in #6 to support `@mcp-abap-adt/adt-clients` refactoring (branch `feature/feed-reader-extensions`), so factory methods return interfaces instead of concrete classes:

- **Debugger domain** (`runtime/IDebugger.ts`):
  - `IDebugger` — composite interface exposing `getAbap()`, `getAmdp()`, `getMemorySnapshots()`
  - `IAbapDebugger` — ABAP debugger with session management, breakpoints, variables, watchpoints, and batch operations (23 methods)
  - `IAmdpDebugger` — AMDP debugger with start/resume/terminate, variable inspection, breakpoints, data preview (14 methods)
  - Option types: `ILaunchDebuggerOptions`, `IStopDebuggerOptions`, `IGetDebuggerOptions`, `IGetSystemAreaOptions`, `IGetVariableAsCsvOptions`, `IGetVariableAsJsonOptions`, `IGetVariableValueStatementOptions`, `IStartAmdpDebuggerOptions`, `IGetAmdpDataPreviewOptions`, `IGetAmdpCellSubstringOptions`
  - Type alias: `IAbapDebuggerStepMethod` (`'stepInto' | 'stepOut' | 'stepContinue'`)
- **Memory snapshots** (`runtime/IMemorySnapshots.ts`):
  - `IMemorySnapshots` — list, getById, overview, ranking lists, children, references, and delta analysis (9 methods)
  - Option types: `IMemorySnapshotsListOptions`, `ISnapshotRankingListOptions`, `ISnapshotChildrenOptions`, `ISnapshotReferencesOptions`
- **Profiler** (`runtime/IProfiler.ts`):
  - `IProfiler` — trace parameter management, hit lists, statements, DB accesses, requests, object/process types (11 methods)
  - Option types: `IProfilerListOptions`, `IProfilerTraceParameters`, `IProfilerTraceHitListOptions`, `IProfilerTraceStatementsOptions`, `IProfilerTraceDbAccessesOptions`
- **Traces** (`runtime/ICrossTrace.ts`, `runtime/ISt05Trace.ts`):
  - `ICrossTrace` — cross-trace listing, records, activations (4 methods)
  - `ISt05Trace` — SQL trace state and directory (2 methods)
  - Option type: `IListCrossTracesOptions`
- **Logs** (`runtime/IApplicationLog.ts`, `runtime/IAtcLog.ts`):
  - `IApplicationLog` — application log object/source access and name validation (3 methods)
  - `IAtcLog` — ATC check failure logs and execution logs (2 methods)
  - Option types: `IGetApplicationLogObjectOptions`, `IGetApplicationLogSourceOptions`, `IGetCheckFailureLogsOptions`
- **DDIC** (`runtime/IDdicActivation.ts`):
  - `IDdicActivation` — activation graph access (1 method)
  - Option type: `IGetActivationGraphOptions`
- **Dumps** (`runtime/IRuntimeDumps.ts`):
  - `IRuntimeDumps` — dump listing by user, getById with view options (2 methods + inherited `list()`)
  - Option types: `IRuntimeDumpsListOptions`, `IRuntimeDumpReadOptions`
  - Type alias: `IRuntimeDumpReadView` (`'default' | 'summary' | 'formatted'`)
- **Feeds-based** (`runtime/ISystemMessages.ts`, `runtime/IGatewayErrorLog.ts`):
  - `ISystemMessages` — system message listing and getById (reuses `IFeedQueryOptions`)
  - `IGatewayErrorLog` — gateway error listing and getById by type+id (reuses `IFeedQueryOptions`)

### Added — design decisions beyond issue #6

The following were not in the original issue but emerged during design review:

- **Typed discriminator** (`IRuntimeAnalysisObject<TKind>`) — enables literal `kind` values per interface (e.g., `'profiler'`, `'debugger'`), supporting `switch`/`if` narrowing in consumer code. Discriminator values are contractual (changing them is a breaking change).
- **`IListableRuntimeObject` extends `IRuntimeAnalysisObject`** — all listable objects now expose `kind` consistently, eliminating the need for each interface to extend both base types separately.
- **`TKind` propagation** — `IListableRuntimeObject` passes `TKind` to `IRuntimeAnalysisObject`, so consumers get literal `kind` types from listable objects too.
- **Implementation helpers excluded** — methods like `buildBatchPayload()`, `buildParametersXml()`, `extractIdFromResponse()`, `getDefaultParameters()`, `buildIdPrefix()`, `buildUserQuery()` were in the issue but excluded from the public interface contract. These are implementation details that stay in `@mcp-abap-adt/adt-clients`.

### Discriminator values (public contract)

| Interface | `kind` value |
|-----------|-------------|
| `IDebugger` | `'debugger'` |
| `IAbapDebugger` | `'abapDebugger'` |
| `IAmdpDebugger` | `'amdpDebugger'` |
| `IMemorySnapshots` | `'memorySnapshots'` |
| `IProfiler` | `'profiler'` |
| `ICrossTrace` | `'crossTrace'` |
| `ISt05Trace` | `'st05Trace'` |
| `IApplicationLog` | `'applicationLog'` |
| `IAtcLog` | `'atcLog'` |
| `IDdicActivation` | `'ddicActivation'` |
| `IRuntimeDumps` | `'runtimeDumps'` |
| `ISystemMessages` | `'systemMessages'` |
| `IGatewayErrorLog` | `'gatewayErrorLog'` |

### Consumer usage

**Importing runtime interfaces:**

```typescript
import type {
  IDebugger,
  IAbapDebugger,
  IProfiler,
  IRuntimeDumps,
  IProfilerTraceParameters,
} from '@mcp-abap-adt/interfaces';
```

**Using typed discriminators for narrowing:**

```typescript
import type { IRuntimeAnalysisObject } from '@mcp-abap-adt/interfaces';

function handleRuntimeObject(obj: IRuntimeAnalysisObject) {
  switch (obj.kind) {
    case 'profiler':
      // TypeScript knows obj has kind: 'profiler'
      break;
    case 'debugger':
      break;
  }
}
```

**Factory methods in `adt-clients` will return these interfaces:**

```typescript
// Before (adt-clients returns concrete class):
const profiler = client.getProfiler(); // returns ProfilerDomain

// After (adt-clients returns interface from this package):
const profiler: IProfiler = client.getProfiler(); // returns IProfiler
```

### Migration guide (5.1.0 → 6.0.0)

**Most consumers: no changes needed.** The default generic parameters (`= string`) ensure backwards compatibility.

**If you extend `IRuntimeAnalysisObject`:**

```typescript
// Before (5.1.0):
interface MyObject extends IRuntimeAnalysisObject { ... }

// After (6.0.0) — still works as-is, but you can now add a literal kind:
interface MyObject extends IRuntimeAnalysisObject<'myObject'> { ... }
```

**If you extend `IListableRuntimeObject`:**

```typescript
// Before (5.1.0):
interface MyList extends IListableRuntimeObject<IAdtResponse, MyOptions> { ... }

// After (6.0.0) — still works, but now MyList also has `kind: string`.
// To add a literal kind:
interface MyList extends IListableRuntimeObject<IAdtResponse, MyOptions, 'myList'> { ... }
```

**If you check `kind` at the type level:**
The `kind` field is now `readonly`. If you were assigning to it, you'll get a compile error. Use the constructor or factory to set it.

## [5.1.0] - 2026-04-10

### Added
- **Runtime Analysis Domain** (`runtime/`):
  - `IRuntimeAnalysisObject` — base interface with `readonly kind: string` discriminator for runtime analysis domain objects (not CRUD)
  - `IListableRuntimeObject<TResult, TOptions>` — generic listable runtime object with `list()` method
- **Feeds Domain** (`feeds/`):
  - `IAbapTimestamp` — type alias for ABAP timestamp strings (`YYYYMMDDHHMMSS`)
  - `IFeedQueryOptions` — query parameters for feed methods (`user`, `maxResults`, `from`, `to`)
  - `IFeedEntry` — generic feed entry
  - `IFeedDescriptor` — feed metadata
  - `IFeedVariant` — feed variant metadata
  - `ISystemMessageEntry` — system message with severity and validity period
  - `IGatewayErrorEntry` — basic gateway error log entry
  - `IGatewayErrorDetail` — extended error with service info, error context, source code, and call stack
  - `IGatewayException`, `ICallStackEntry`, `ISourceCodeLine` — supporting types for error details
  - `IFeedRepository` — domain-facing interface for feed access with typed methods: `list()`, `variants()`, `dumps()`, `systemMessages()`, `gatewayErrors()`, `gatewayErrorDetail()`

## [2.7.0] - 2026-03-06

### Added
- Added `'rfc'` to `SapAuthType` union type to support RFC-based connections for on-premise SAP systems (via `SADT_REST_RFC_ENDPOINT`).

## [2.6.0] - 2026-02-18

### Added
- Added new service domain contracts for ADT service binding lifecycle:
  - `IAdtService`
  - `ServiceBindingType`, `ServiceBindingVersion`, `GeneratedServiceType`, `DesiredPublicationState`
  - `IValidateServiceBindingParams`
  - `ITransportCheckServiceBindingParams`
  - `ICreateServiceBindingParams`
  - `IReadServiceBindingParams`
  - `IUpdateServiceBindingParams`
  - `ICheckServiceBindingParams`
  - `IActivateServiceBindingParams`
  - `IGenerateServiceBindingParams`
  - `ICreateAndGenerateServiceBindingParams`
  - `IGetServiceBindingODataParams`
  - `IPublishODataV2Params`
  - `IUnpublishODataV2Params`
  - `IClassifyServiceBindingParams`

### Changed
- Exported all new service domain interfaces and types from package root (`@mcp-abap-adt/interfaces`).

## [2.5.0] - 2026-02-14

### Added
- Added execution contract interface:
  - `IExecutor<TTarget, TResult, TRunWithProfilerOptions, TRunWithProfilingOptions, TRunWithProfilingResult>`
- Exported `IExecutor` from package root (`@mcp-abap-adt/interfaces`).

## [2.4.0] - 2026-02-13

### Added
- Added generic realtime WebSocket transport contracts in connection domain:
  - `IWebSocketTransport`
  - `IWebSocketConnectOptions`
  - `IWebSocketCloseInfo`
  - `IWebSocketMessageEnvelope`
  - `IWebSocketMessageHandler`
- Exported all new WebSocket contracts from package root.

## [2.3.0] - 2026-02-10

### Added
- Added `authType: 'saml'` and `sessionCookies` to connection and SAP config interfaces.

## [2.2.0] - 2026-02-10

### Added
- `ITokenResult` now supports `expiresAt` and `tokenType` to handle non-JWT tokens.
- Added `AUTH_TYPE_SAML2_BEARER` to `OAuth2GrantType` for SAML 2.0 bearer exchanges.

## [0.2.15] - 2025-12-29

### Changed
- `readMetadata()` now accepts `version: 'active' | 'inactive'` via options.

## [0.2.14] - 2025-12-24

### Changed
- Added `IAdtHeaderValue` to cover non-string header values returned by ADT responses.

## [0.2.13] - 2025-12-24

### Changed
- `IAdtResponse.headers` now allows ADT-specific header keys such as `location` and `sap-adt-location`.

## [0.2.12] - 2025-12-24

### Changed
- `IAbapConnection` now uses `IAdtResponse<T, D>` (custom response type, no axios dependency).
- `makeAdtRequest` is generic and returns `IAdtResponse<T, D>`.

## [0.2.11] - 2025-12-24

### Changed
- `IAbapConnection.AxiosResponse` now aliases `axios` `AxiosResponse` with generics preserved.
- `makeAdtRequest` is generic and returns `AxiosResponse<T, D>`.
- `axios` is now required for typing (moved from dev-only usage).

## [0.2.10] - 2025-12-24

### Changed
- **Breaking**: `ITokenProvider` is now stateful only and requires `getTokens(authConfig, options)`.
- Removed legacy stateless token methods from `ITokenProvider`.
- Removed `ITokenProviderResult` from public exports.
- Updated README examples to use `getTokens()`.

## [0.2.9] - 2025-12-23

### Changed
- **OAuth2 grant types**: Removed `AUTH_TYPE_IMPLICIT` and added `AUTH_TYPE_USER_TOKEN` and `AUTH_TYPE_CLIENT_X509` to `OAuth2GrantType`.

## [0.2.8] - 2025-12-23

### Added
- **New Token Provider Interface**: Added `getTokens()` method to `ITokenProvider` for stateful token management
  - New `ITokenResult` interface with `authorizationToken`, `refreshToken`, `authType`, and `expiresIn` fields
  - New `OAuth2GrantType` type and constants for OAuth2 grant types:
    - `AUTH_TYPE_AUTHORIZATION_CODE` - Standard authorization code flow
    - `AUTH_TYPE_AUTHORIZATION_CODE_PKCE` - Authorization code with PKCE
    - `AUTH_TYPE_IMPLICIT` - Implicit grant (legacy)
    - `AUTH_TYPE_PASSWORD` - Password credentials grant
    - `AUTH_TYPE_CLIENT_CREDENTIALS` - Client credentials grant
  - All old methods (`getConnectionConfig`, `refreshTokenFromSession`, `refreshTokenFromServiceKey`) remain optional for backward compatibility

### Changed
- **ITokenProvider Interface**: Extended with optional `getTokens()` method
  - Old stateless methods are now optional (marked with `?`)
  - New stateful `getTokens()` method is optional (marked with `?`)
  - Allows gradual migration from old to new API

## [0.2.7] - 2025-12-22

### Changed
- **Migrated to Biome**: Replaced ESLint/Prettier with Biome for linting and formatting
  - Added `@biomejs/biome` as dev dependency (^2.3.10)
  - Added `biome.json` configuration file with recommended rules
  - Added npm scripts: `lint`, `lint:check`, `format`
  - Updated `build` script to include Biome check before TypeScript compilation
  - All code now follows Biome formatting and linting rules

### Fixed
- **Type Safety Improvements**: Replaced `any` types with `unknown` for better type safety
  - `IAbapRequestOptions.data` and `IAbapRequestOptions.params`: Changed from `any` to `unknown`
  - `ILogger` interface methods (`info`, `error`, `warn`, `debug`): Changed `meta` parameter from `any` to `unknown`
  - `IAbapConnection.AxiosResponse` type: Changed from `any` to `unknown` (type alias to avoid axios dependency)
  - `isNetworkError()` function: Changed parameter type from `any` to `unknown` with proper type guards
- **Code Quality**: Removed unused imports
  - Removed unused `AxiosResponse` import from `IAdtObject.ts`
  - Removed unused `IConnectionConfig` import from `ITokenProvider.ts`

## [0.2.6] - 2025-12-21

### Removed
- **IAbapConnectionExtended**: Removed deprecated interface completely
  - No backward compatibility - all consumers must use `IAbapConnection`
  - Migration: Replace `IAbapConnectionExtended` with `IAbapConnection` in your code
  - Methods `getConfig()`, `getAuthHeaders()`, `connect()`, `reset()` no longer in public interface

## [0.2.5] - 2025-12-21

### Added
- **ITokenRefresher Interface**: New interface for dependency injection of token refresh logic into connections
  - `getToken(): Promise<string>` - Get current valid token (cached or refreshed)
  - `refreshToken(): Promise<string>` - Force refresh token and save to session store
  - Created by `AuthBroker.createTokenRefresher(destination)` and injected into `JwtAbapConnection`
  - Enables connections to handle 401/403 errors transparently without knowing about auth internals
  - Exported from `@mcp-abap-adt/interfaces` in token domain

### Changed
- **IAbapConnection Simplified**: Removed implementation details from interface, keeping only consumer-facing methods
  - Removed `getConfig()` - internal implementation detail
  - Removed `getAuthHeaders()` - handled internally by `makeAdtRequest()`
  - Removed `connect()` - handled internally, connection established on first request
  - Removed `reset()` - internal method for token refresh logic
  - Kept: `getBaseUrl()`, `getSessionId()`, `setSessionType()`, `makeAdtRequest()`
  - This change simplifies the interface for consumers who only need to make requests

### Deprecated
- **IAbapConnectionExtended**: Added for backward compatibility, extends `IAbapConnection` with removed methods
  - `getConfig()`, `getAuthHeaders()`, `connect()`, `reset()`
  - Will be removed in next major version
  - Use `IAbapConnection` for new code

## [0.2.4] - 2025-12-21

### Added
- **Headless Browser Mode**: Added `"headless"` option to `ITokenProviderOptions.browser`
  - `"headless"`: Does not open browser, logs authentication URL and waits for manual callback
  - Ideal for SSH sessions, remote terminals, and environments without display
  - Differs from `"none"` which immediately rejects (for automated tests)
  - Updated JSDoc documentation for browser option with all supported values

## [0.2.3] - 2025-12-19

### Added
- **Store Error Codes**: Added standardized error codes for store operations
  - `STORE_ERROR_CODES` - Object containing error codes for store failures:
    - `FILE_NOT_FOUND` - Service key or session file not found
    - `PARSE_ERROR` - JSON or YAML parsing failed
    - `INVALID_CONFIG` - Required configuration fields are missing
    - `STORAGE_ERROR` - File write or permission error
  - `StoreErrorCode` - Type for store error codes
  - These constants enable auth-stores to provide typed errors to auth-broker
  - Error codes help broker distinguish between file not found, parsing errors, and validation failures
  - Exported from `@mcp-abap-adt/interfaces` package in store domain

## [0.2.2] - 2025-12-19

### Added
- **Token Provider Error Codes**: Added standardized error codes for token provider operations
  - `TOKEN_PROVIDER_ERROR_CODES` - Object containing error codes for token provider failures:
    - `VALIDATION_ERROR` - Authentication configuration validation failed
    - `REFRESH_ERROR` - Token refresh operation failed
    - `SESSION_DATA_ERROR` - Session data is invalid or incomplete
    - `SERVICE_KEY_ERROR` - Service key data is invalid or incomplete
    - `BROWSER_AUTH_ERROR` - Browser authentication failed or was cancelled
  - `TokenProviderErrorCode` - Type for token provider error codes
  - These constants enable consistent error handling across token providers and auth-broker
  - Error codes help distinguish between different types of authentication failures
  - Exported from `@mcp-abap-adt/interfaces` package in token domain

## [0.2.1] - 2025-12-19

### Added
- **Token Refresh Methods in ITokenProvider**: Added two new methods to `ITokenProvider` interface for explicit refresh scenarios
  - `refreshTokenFromSession(authConfig, options?)` - Refresh token using refresh token from session
    - Uses refresh token from `authConfig.refreshToken` to get new access token
    - Typically uses refresh_token grant type or browser-based re-authentication
    - Returns new authorization token and optional new refresh token
  - `refreshTokenFromServiceKey(authConfig, options?)` - Refresh token using UAA credentials from service key
    - Uses UAA credentials (uaaUrl, uaaClientId, uaaClientSecret) without refresh token
    - Typically uses browser-based authorization flow to ensure proper role assignment
    - Returns new authorization token and optional refresh token
  - These methods provide explicit control over token refresh strategy in AuthBroker
  - Allows separation of refresh-by-session vs refresh-by-service-key logic in token providers

## [0.2.0] - 2025-12-19

### Added
- **Network Error Detection Constants and Utility**: Added network error codes and helper function for detecting infrastructure-level connection issues
  - `NETWORK_ERROR_CODES` - Object containing standard network error codes:
    - `ECONNREFUSED` - Connection refused (server not accepting connections)
    - `ETIMEDOUT` - Connection timeout (server not responding)
    - `ENOTFOUND` - DNS resolution failed (hostname not found)
    - `ECONNRESET` - Connection reset by peer
    - `ENETUNREACH` - Network is unreachable
    - `EHOSTUNREACH` - Host is unreachable
  - `NetworkErrorCode` - Type for network error codes
  - `isNetworkError(error: any): boolean` - Utility function to check if an error is a network-level error
  - These constants and utilities help distinguish network/infrastructure errors from application-level HTTP errors
  - Network errors should not trigger retry logic (CSRF, auth) as they indicate VPN, DNS, or connectivity issues
  - Exported from `@mcp-abap-adt/interfaces` package in connection domain

## [0.1.19] - 2025-12-17

### Added
- **Low-level Update Mode in IAdtOperationOptions**: Added `lockHandle` field to `IAdtOperationOptions` interface
  - `lockHandle?: string` - Lock handle to use for low-level update operations
  - When `lockHandle` is provided in `update()` options, the method will skip lock, check, and unlock operations
  - Performs only the core update operation, useful when managing lock/unlock manually or in custom workflows
  - The update method assumes the object is already locked when `lockHandle` is provided

## [0.1.18] - 2025-12-17

### Added
- **Lock and Unlock Methods in IAdtObject Interface**: Added `lock()` and `unlock()` methods to `IAdtObject` interface
  - `lock(config: Partial<TConfig>): Promise<string>` - Lock object for modification, returns lock handle
  - `unlock(config: Partial<TConfig>, lockHandle: string): Promise<TReadResult>` - Unlock object using lock handle
  - These methods allow consumers to manually manage object locks for custom update workflows
  - Lock sets connection to stateful mode, unlock sets it back to stateless mode
  - Lock handle must be used in subsequent unlock() and update operations

## [0.1.17] - 2025-12-16

### Added
- **Basic Authentication Support for IConnectionConfig**: Added support for basic auth (username/password) in addition to JWT tokens
  - Added optional `username?: string` field for basic authentication (on-premise systems)
  - Added optional `password?: string` field for basic authentication (on-premise systems)
  - Added optional `authType?: 'basic' | 'jwt'` field to indicate authentication type
  - Made `authorizationToken` optional (required for JWT auth, optional for basic auth)
  - This enables on-premise systems to use `--mcp` parameter with basic auth instead of requiring JWT tokens

## [0.1.16] - 2025-12-13

### Changed
- **HTTP timeout docs**: Clarified `timeout` option in `IAdtOperationOptions` to explain behavior and mention `withLongPolling` interplay
- **VSCode spell checking**: Limited spell checker scope to project files to reduce false positives

## [0.1.15] - 2025-12-12

### Added
- **Long Polling Support for Read Operations**: Added optional `withLongPolling` parameter to all GET-based read methods
  - **IAdtObject Interface**:
    - `read(config, version?, options?)` - Added optional `options?: { withLongPolling?: boolean }` parameter
    - `readMetadata(config, options?)` - Added optional `options?: { withLongPolling?: boolean }` parameter
    - `readTransport(config, options?)` - Added optional `options?: { withLongPolling?: boolean }` parameter
  - **IBuilder Interface** (in `@mcp-abap-adt/adt-clients`):
    - `read(version?, options?)` - Added optional `options?: { withLongPolling?: boolean }` parameter
  - **Usage**: When `withLongPolling: true` is specified, the request includes `?withLongPolling=true` query parameter
    - This allows the server to hold the connection open until the object becomes available or a timeout occurs
    - Useful after create/activate operations to wait until object is ready for reading
    - Can replace timeout-based polling in tests and production code
  - **Example**:
    ```typescript
    // Wait for object to become available after creation
    const domain = await adtDomain.read(
      { domainName: 'Z_TEST' },
      'active',
      { withLongPolling: true }
    );
    
    // Read metadata with long polling
    const metadata = await adtDomain.readMetadata(
      { domainName: 'Z_TEST' },
      { withLongPolling: true }
    );
    ```

## [0.1.14] - 2025-12-19

### Added
- **LogLevel Enum**: Added `LogLevel` enum to logging domain exports
  - Defines log levels: `ERROR = 0`, `WARN = 1`, `INFO = 2`, `DEBUG = 3`
  - Exported from `@mcp-abap-adt/interfaces` for use across all packages
  - Allows logger implementations to use standardized log level constants
  - **Usage**: `import { LogLevel } from '@mcp-abap-adt/interfaces';`

## [0.1.13] - 2025-12-19

### Removed
- **Unit Test and Transport Config Types**: Removed `IUnitTestBuilderConfig` and `ITransportBuilderConfig` from package exports
  - These types are now defined locally in `@mcp-abap-adt/adt-clients` package as `IUnitTestConfig` and `ITransportConfig`
  - This change aligns with the pattern used by all other ADT object types (Class, Program, Interface, etc.) which have local Config types
  - **Migration**: If you were importing these types from `@mcp-abap-adt/interfaces`, update your imports to use local types from `@mcp-abap-adt/adt-clients`:
    - `IUnitTestBuilderConfig` → `IUnitTestConfig` from `@mcp-abap-adt/adt-clients/src/core/unitTest/types`
    - `ITransportBuilderConfig` → `ITransportConfig` from `@mcp-abap-adt/adt-clients/src/core/transport/types`
  - **Note**: `IClassUnitTestDefinition` and `IClassUnitTestRunOptions` remain exported from this package as they are shared types

## [0.1.12] - 2025-12-10

### Added
- **IAdtObject Interface - Metadata Reading**: Added `readMetadata()` method to `IAdtObject` interface
  - `readMetadata(config: Partial<TConfig>): Promise<TReadResult>` - Reads object metadata (characteristics: package, responsible, description, etc.)
  - For objects with source code (Class, Interface, Program), reads metadata separately from source code
  - For objects without source code (Domain, DataElement), may delegate to `read()` as `read()` already returns metadata
  - Returns state with metadata result in `metadataResult` field
- **IAdtObjectState - Metadata Result Field**: Added `metadataResult?: AxiosResponse` field to `IAdtObjectState`
  - Stores metadata read result from `readMetadata()` method
  - Contains object characteristics (package, responsible, description, etc.)

## [0.1.11] - 2025-12-10

### Changed
- **IAdtObjectConfig Interface - Common Fields**: Extended `IAdtObjectConfig` with common fields shared across all ADT object configurations
  - Added `packageName?: string` - Package name (required for create operations, optional for others)
  - Added `description?: string` - Description (required for create/validate operations, optional for others)
  - `transportRequest?: string` - Transport request (already existed)
  - All specific configuration types (e.g., `IAdtClassConfig`, `DomainBuilderConfig`) should extend `IAdtObjectConfig` to inherit these common fields

## [0.1.10] - 2025-12-10

### Added
- **IAdtObject Interface - Transport Request Reading**: Added `readTransport()` method to `IAdtObject` interface
  - `readTransport(config: Partial<TConfig>): Promise<TReadResult>` - Reads transport request information for the object
  - Returns state with transport result in `transportResult` field
  - Allows consumers to query transport request details for any ADT object

## [0.1.9] - 2025-12-10

### Changed
- **IAdtObject Interface - Unified Return Types**: All methods now return `Promise<TReadResult>` instead of mixed types
  - `validate()`: Changed from `Promise<AxiosResponse>` to `Promise<TReadResult>`
  - `check()`: Changed from `Promise<AxiosResponse>` to `Promise<TReadResult>`
  - `activate()`: Changed from `Promise<AxiosResponse>` to `Promise<TReadResult>`
  - `delete()`: Changed from `Promise<AxiosResponse>` to `Promise<TReadResult>`
  - This provides consistent return types across all IAdtObject methods
  - State types (e.g., `ClassBuilderState`) should include fields for all operation results

## [0.1.8] - 2025-12-10

### Added
- **ADT Object Error Codes**: Added `AdtObjectErrorCodes` constants for error handling
  - Constants for all IAdtObject operation errors: `OBJECT_NOT_FOUND`, `OBJECT_NOT_READY`, `VALIDATION_FAILED`, `CREATE_FAILED`, `UPDATE_FAILED`, `DELETE_FAILED`, `ACTIVATE_FAILED`, `CHECK_FAILED`, `LOCK_FAILED`, `UNLOCK_FAILED`
  - Allows consumers to catch specific errors by error code
  - Exported from package root: `import { AdtObjectErrorCodes } from '@mcp-abap-adt/interfaces'`

## [0.1.7] - 2025-12-10

### Added
- **Transport Request Builder Configuration Interface**: Added `ITransportBuilderConfig` interface
  - Configuration interface for Transport Request operations
  - Fields: `description`, `transportType`, `targetSystem`, `owner`, `transportNumber`
  - Located in `src/adt/ITransportBuilderConfig.ts`
  - Exported from package root: `import { ITransportBuilderConfig } from '@mcp-abap-adt/interfaces'`
- **Unit Test Builder Configuration Interfaces**: Added unit test configuration interfaces
  - `IUnitTestBuilderConfig` - Main configuration interface for unit test operations
    - Fields: `tests`, `options`, `runId`, `status`, `result`
  - `IClassUnitTestDefinition` - Interface for defining class unit tests
    - Fields: `containerClass`, `testClass`
  - `IClassUnitTestRunOptions` - Interface for unit test run options
    - Fields: `title`, `context`, `scope`, `riskLevel`, `duration`
  - Located in `src/adt/IUnitTestBuilderConfig.ts`
  - Exported from package root: `import { IUnitTestBuilderConfig, IClassUnitTestDefinition, IClassUnitTestRunOptions } from '@mcp-abap-adt/interfaces'`

## [0.1.6] - 2025-12-09

### Added
- **Unified Operation Options Interface**: Created `IAdtOperationOptions` interface
  - Unified interface for both create and update operations (replaces `CreateOptions` and `UpdateOptions`)
  - Includes all fields from both interfaces: `activateOnCreate`, `activateOnUpdate`, `deleteOnFailure`, `sourceCode`, `xmlContent`, `timeout`
  - `sourceCode` and `xmlContent` now available for update operations (previously only in create)
  - `timeout?: number` - Timeout for operations in milliseconds (default: 1000)
    - Prevents operation failures due to system not completing commands in time
    - Increase timeout for complex operations or slow systems

### Changed
- **Operation Options Interfaces**: Unified `CreateOptions` and `UpdateOptions` into `IAdtOperationOptions`
  - Both create and update operations now use the same interface
  - `sourceCode` and `xmlContent` are now available for update operations
  - Removed `lockHandle` field from update options (update operations always start with lock internally)
  - All interfaces now follow `I` prefix convention (`IAdtOperationOptions`)

### Removed
- **Deprecated Interfaces**: Removed `CreateOptions` and `UpdateOptions` interfaces
  - Replaced by unified `IAdtOperationOptions` interface
  - No backward compatibility maintained (version < 1.0.0)

## [0.1.5] - 2025-12-09

### Added
- **High-Level ADT Object Operations Interface**: Added `IAdtObject` interface for high-level CRUD operations
  - `IAdtObject<TConfig, TReadResult>` - Main interface for ADT object operations
  - Provides simplified CRUD operations with automatic operation chains, error handling, and resource cleanup
  - Methods: `validate()`, `create()`, `read()`, `update()`, `delete()`, `activate()`, `check()`
  - Supports full operation chains:
    - Create: validate → create → check → lock → check(inactive) → update → unlock → check → activate
    - Update: lock → check(inactive) → update → unlock → check → activate
    - Delete: check(deletion) → delete
- **Operation Options Interfaces**: Added options interfaces for create and update operations
  - `CreateOptions` - Options for create operations:
    - `activateOnCreate?: boolean` - Activate object after creation (default: false)
    - `deleteOnFailure?: boolean` - Delete object if creation fails (default: false)
    - `sourceCode?: string` - Source code to use for update after create
    - `xmlContent?: string` - XML content to use for update after create
  - `UpdateOptions` - Options for update operations:
    - `activateOnUpdate?: boolean` - Activate object after update (default: false)
    - `deleteOnFailure?: boolean` - Delete object if update fails (default: false)
    - `lockHandle?: string` - Lock handle if object is already locked
- **ADT Domain**: New domain for ADT client interfaces
  - All interfaces exported from `@mcp-abap-adt/interfaces` under ADT domain
  - Located in `src/adt/IAdtObject.ts`

## [0.1.4] - 2025-12-08

### Breaking Changes

- **Session State Methods Removed from IAbapConnection**: Removed session state management methods from connection interface
  - `getSessionState()` method removed from `IAbapConnection`
  - `setSessionState()` method removed from `IAbapConnection`
  - Session state management is no longer a responsibility of connection package
  - Connection package now focuses solely on HTTP communication
  - Session state persistence should be handled by higher-level packages (e.g., auth-broker)

### Changed

- **Connection Package Scope**: Updated `IAbapConnection` interface to reflect connection package responsibilities
  - Connection package handles only HTTP communication and session headers
  - Token refresh is not a responsibility of connection package - handled by `@mcp-abap-adt/auth-broker` package
  - Session state persistence is not part of connection package scope

### Migration Guide

If you were using session state methods:

**Before (0.1.x)**:
```typescript
const state = connection.getSessionState();
connection.setSessionState(state);
```

**After (0.1.4)**:
```typescript
// Session state management is now handled by auth-broker or other higher-level packages
// Connection package only handles HTTP communication
```

## [0.1.3] - 2025-12-07

### Added
- **Session ID Header Constants**: Added constants for session identification headers
  - `HEADER_SESSION_ID` - Standard session ID header (`x-session-id`)
  - `HEADER_MCP_SESSION_ID` - MCP session ID header (`mcp-session-id`)
  - `HEADER_X_MCP_SESSION_ID` - Extended MCP session ID header (`x-mcp-session-id`)
  - These constants are used for session identification in proxy requests

## [0.1.2] - 2025-12-07

### Added
- **HTTP Header Constants**: Added `Headers.ts` module with all HTTP header constants used across MCP ABAP ADT packages
  - Proxy routing headers: `HEADER_BTP_DESTINATION`, `HEADER_MCP_DESTINATION`, `HEADER_MCP_URL`
  - SAP ABAP connection headers: `HEADER_SAP_DESTINATION`, `HEADER_SAP_DESTINATION_SERVICE`, `HEADER_SAP_URL`, `HEADER_SAP_JWT_TOKEN`, `HEADER_SAP_AUTH_TYPE`, `HEADER_SAP_CLIENT`, `HEADER_SAP_LOGIN`, `HEADER_SAP_PASSWORD`, `HEADER_SAP_REFRESH_TOKEN`
  - UAA/XSUAA headers: `HEADER_SAP_UAA_URL`, `HEADER_UAA_URL`, `HEADER_SAP_UAA_CLIENT_ID`, `HEADER_UAA_CLIENT_ID`, `HEADER_SAP_UAA_CLIENT_SECRET`, `HEADER_UAA_CLIENT_SECRET`
  - Standard HTTP headers: `HEADER_AUTHORIZATION`, `HEADER_CONTENT_TYPE`, `HEADER_ACCEPT`
  - Header groups: `PROXY_ROUTING_HEADERS`, `SAP_CONNECTION_HEADERS`, `UAA_HEADERS`, `PRESERVED_HEADERS`, `PROXY_MODIFIED_HEADERS`
  - Authentication type constants: `AUTH_TYPE_JWT`, `AUTH_TYPE_BASIC`, `AUTH_TYPE_XSUAA`, `AUTH_TYPES`
  - Special constant `HEADER_SAP_DESTINATION_SERVICE` for SAP destination service on Cloud (URL automatically derived from service key)
- All header constants are exported from package root for easy import: `import { HEADER_SAP_DESTINATION } from '@mcp-abap-adt/interfaces'`

## [0.1.1] - 2024-12-04

### Changed
- **ILogger Interface**: Simplified to include only core logging methods (info, error, warn, debug)
  - Removed domain-specific methods (csrfToken, tlsConfig, browserAuth, refresh, success, browserUrl, browserOpening, testSkip)
  - Interface now focuses on universal logging capabilities without implementation-specific details
- **ITokenProviderOptions**: Enhanced documentation with detailed descriptions of browser and logger options

## [0.1.0] - 2025-12-04

### Added
- Initial release of interfaces package
- All interfaces from `@mcp-abap-adt/auth-broker`
- All interfaces from `@mcp-abap-adt/connection`
- All interfaces from `@mcp-abap-adt/header-validator`
- Interface renaming to follow `I` prefix convention:
  - `TokenProviderResult` → `ITokenProviderResult`
  - `TokenProviderOptions` → `ITokenProviderOptions`
  - `AbapConnection` → `IAbapConnection`
  - `AbapRequestOptions` → `IAbapRequestOptions`
  - `SapConfig` → `ISapConfig`
  - `SessionState` → `ISessionState`
  - `TokenRefreshResult` → `ITokenRefreshResult`
  - `TimeoutConfig` → `ITimeoutConfig`
  - `ValidatedAuthConfig` → `IValidatedAuthConfig`
  - `HeaderValidationResult` → `IHeaderValidationResult`
- Organized interfaces by domain:
  - `auth/` - Authentication interfaces
  - `token/` - Token-related interfaces
  - `session/` - Session storage interface
  - `serviceKey/` - Service key storage interface
  - `connection/` - Connection interfaces
  - `sap/` - SAP-specific configuration
  - `storage/` - Storage interfaces
  - `logging/` - Logging interfaces
  - `validation/` - Validation interfaces
  - `utils/` - Utility types and interfaces

[24.0.0]: https://github.com/fr0ster/mcp-abap-adt-interfaces/compare/v23.0.0...v24.0.0
[23.0.0]: https://github.com/fr0ster/mcp-abap-adt-interfaces/compare/v22.0.0...v23.0.0
[22.0.0]: https://github.com/fr0ster/mcp-abap-adt-interfaces/compare/v21.0.0...v22.0.0
[21.0.0]: https://github.com/fr0ster/mcp-abap-adt-interfaces/compare/v20.0.0...v21.0.0
[20.0.0]: https://github.com/fr0ster/mcp-abap-adt-interfaces/compare/v19.0.0...v20.0.0
[19.0.0]: https://github.com/fr0ster/mcp-abap-adt-interfaces/compare/v18.0.0...v19.0.0
[18.0.0]: https://github.com/fr0ster/mcp-abap-adt-interfaces/compare/v17.2.0...v18.0.0
[17.2.0]: https://github.com/fr0ster/mcp-abap-adt-interfaces/releases/tag/v17.2.0
[0.1.0]: https://github.com/fr0ster/mcp-abap-adt-interfaces/releases/tag/v0.1.0
