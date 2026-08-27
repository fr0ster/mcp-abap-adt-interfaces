# One contract for reading what a run produced — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** `IProfiler` stops being a bag of eleven members that promise HTTP calls, and becomes a
listing and a read, typed, with an implementation per trace family. Everything about causing a run
to be measured moves to the executors, where the run already is.

**Architecture:** Two atoms — `ITraceListing` and `ITraceReading` — composed by family.
`ITraceFamily` carries the listing and a literal `kind`; families that have views compose reading
in, families that do not say nothing about it. Five members deleted, three moved to a new
`ITraceScheduling` capability on the executors, and the class executor stops promising a `traceId`
it cannot honestly produce.

**Tech Stack:** TypeScript (strict, CommonJS), Jest, Biome. Two npm packages.

**Spec:** `docs/superpowers/specs/2026-08-27-profiler-contract-design.md` in this repo, reviewed
across seven rounds. **Read it before Task 1** — every count, every deletion and every measurement
below comes from it.

## Global Constraints

- All repository artifacts in **English**.
- Contract types live in `@mcp-abap-adt/interfaces` and are imported; never redefined locally.
- **Publish the dependency first.** interfaces must be on npm before adt-clients consumes it. No
  `file:`, no tarball, no `"link": true` — verify `package-lock.json` after every `npm install`.
- Claude opens PRs, merges **reviewed** PRs, tags. `npm publish` is the user's, on the user's
  timing — state the dependency, never chase it.
- Biome: single quotes, semicolons, 2-space indent. `npm run lint` before every commit.
- adt-clients unit tests without SAP:
  `MCP_ENV_PATH=/tmp/nonexistent-env npx jest src/__tests__/unit`.
- interfaces default branch is **`master`**; adt-clients is **`main`**.
- The adt-clients half lands in **PR #118**, which is open and carries the harness work this
  depends on.

## The rule this plan follows

**Nothing is published that has not been measured.** The spec deletes `getParameters*` because a
GET there answers 405 on cloud, keeps `listObjectTypes`/`listProcessTypes` because they answer 200,
and transcribes `ITraceEntry` from six feed entries rather than designing it. Where a measurement
is missing the type waits — that is why ST05 is untouched and why Phase 0 exists.

---

## Phase 0 — Close the measurement gates

Three of the five shapes Phase 1 publishes are already measured on the trial and written into the
spec: `ITraceEntry` from six feed entries, and `hitlist` / `statements` / `dbAccesses` from a real
trace. What is left cannot be answered there — the trial has no cross traces, and its parameters
endpoint refuses GET. **On-prem, by the user.**

- [ ] **Task 0.1 — What a cross trace looks like.** On a system that has them:
      `GET /sap/bc/adt/crosstrace/traces` with
      `Accept: application/vnd.sap.adt.crosstrace.traces.v1+xml` (it answers `406` and names this
      type if you ask for `application/xml`), then `…/traces/{id}`, `…/{id}/records`, and
      `…/{id}/records/{n}/content`.
      **Record:** which elements appear in **every** entry, as was done for `abaptraces`.
      **Decides:** `ICrossTraceDocument`, `ICrossTraceRecords`, `ICrossTraceRecordContent`, and
      whether `ITraceEntry` covers a cross-trace entry or needs widening.

- [ ] **Task 0.2 — Where the catalogue choices go.** `listObjectTypes()` and `listProcessTypes()`
      answer `200` with `namedItemList`s of URIs, and `IProfilerTraceParameters` has nowhere to put
      one. Either:
      **(a)** `POST` a parameters resource, `GET` the `Location` it returns, and see whether the
      stored document carries object/process type elements — then the payload takes more than we
      model; or
      **(b)** the catalogues feed a trace **request**, and `POST /abaptraces/requests` is the
      operation that consumes them.
      **Decides:** whether `scheduleTrace(options?: IProfilerTraceParameters)` keeps its signature,
      gains fields, or gains a sibling operation.

- [ ] **Task 0.3 — Write the answers into the spec** and mark the provisional note resolved.
      **Verify:** the spec's "Provisional until step 0a" block is gone, and no type in it is
      described as unmeasured except ST05's.

**Gate:** Phase 1 does not start until 0.1 and 0.2 are answered. Publishing a type for a document
nobody has read is the mistake ST05 was excluded for.

---

## Phase 1 — `@mcp-abap-adt/interfaces` 22.0.0

One branch, `feat/one-contract-for-trace-results`. Every task ends with
`npm run build && npm run test:check` clean.

- [ ] **Task 1.1 — The atoms.** Add `ITraceEntry`, `ITraceView`, `ITraceListing`, `ITraceReading`,
      `ITraceFamily`, and the `ViewResult` / `ViewOptions` / `ViewArgs` helpers, exactly as the
      spec compiles them. `ITraceReading`'s constraint is self-mapped —
      `TViews extends { [K in keyof TViews]: ITraceView<unknown, unknown> }` — not `object` and not
      `Record<string, unknown>`; the spec explains what each of those admits wrongly.
      **Verify:** a `__typechecks__` file proving a good view map compiles, a map with a non-view
      member is refused **where it is declared**, a required option cannot be omitted, an unknown
      view is rejected, and a result is typed rather than `any`.

- [ ] **Task 1.2 — The result types.** `IAbapTraceHitList`, `IAbapTraceStatements` and
      `IAbapTraceDbAccesses` from the tables already in the spec — 473 `trc:entry`, 1801
      `trc:statement`, and `trc:dbAccess` with its `trc:accessTime`, all read from one real trace.
      The cross-trace three come from Task 0.1.
      **Verify:** every field traceable to a measurement; none invented. If Task 0.1 has not
      happened, the cross-trace views are declared as their parsed document and nothing more — the
      spec permits that explicitly, and it is better than three invented shapes.

- [ ] **Task 1.3 — The published families.** `IProfiler` and `ICrossTrace` keep their names and
      become compositions. `ICrossTrace.list()` keeps `IListCrossTracesOptions` — all three of
      `traceUser`, `actCreateUser`, `actChangeUser`. `getActivations()` stays on it, declared, with
      the comment saying it is recording and moves when a recording contract exists.
      **Verify:** `__typechecks__` shows a consumer's own implementation satisfying each, and a
      cross-trace option offered to the profiler's listing refused.

- [ ] **Task 1.4 — Delete the five.** `getParameters`, `getParametersForCallstack`,
      `getParametersForAmdp`, `listRequests`, `getRequestsByUri`.
      **Verify:** none appears anywhere in `src/`.

- [ ] **Task 1.5 — `ITraceScheduling`.** `listObjectTypes()`, `listProcessTypes()` returning
      `INamedItem[]`, and `scheduleTrace()` in whatever shape Phase 0 settled. Composed into
      `IClassExecutor` and `IProgramExecutor` — **not** added to `IExecutor` or `IAdtRunnable`,
      which `AdtAtc` and `AdtUnitTest` also implement and which have no business with traces.
      **Verify:** a typecheck showing an ATC-shaped runnable still compiles without any scheduling
      member.

- [ ] **Task 1.6 — The executor results tell the truth.** Remove `traceId` and
      `traceRequestsResponse` from `IClassExecuteWithProfilingResult`, and `traceLookupUris`,
      `maxTraceAttempts`, `traceRetryDelayMs` from `IClassExecuteWithProfilingOptions`.
      **Verify:** the two profiling option types are now identical, and a typecheck asserts a run
      result offers no `traceId`.

- [ ] **Task 1.7 — CHANGELOG and version.** **`22.0.0`, fixed by the spec** and already relied on
      by the phase heading, the npm wait and the consumer's dependency range — so it is not asked
      again here. Deviating means changing it in all four places, deliberately, not discovering the
      mismatch when Phase 2 waits forever for a version nobody published.
      The entry carries the accounting from the spec: five deleted, three moved, the executor
      fields removed, `ISt05Trace` and every reading option type unchanged. Run
      `npm install --package-lock-only` in the same commit.
      **Verify:** `npm run build && npm run test:check`. There is no `check:docs` in this
      repository — that script is adt-clients'. The CHANGELOG link definitions are checked by eye
      here, and a missing one has failed a publish in a sibling package before, so check them.

- [ ] **Task 1.8 — PR, review, merge, tag.** Then **stop**: `npm publish` is the user's.

---

## Phase 2 — Prove a consumer can implement it, then wait for npm

Between "the contract compiles" and "a real class satisfies it" there is a gap that typechecks
inside the interfaces package cannot close: they use written-for-the-purpose stand-ins. If the
real `Profiler`, `CrossTrace` and executors turn out not to fit, the version that says they must
is already on npm and cannot be taken back.

- [ ] **Task 2.1 — A throwaway consumer gate, before the tag.** `npm pack` the interfaces branch,
      install the tarball into a **scratch copy** of adt-clients — `/tmp`, or a git worktree —
      and compile the three real implementations against it.
      **Verify:** `npm run build` and `npm run test:check` pass there.
      **This does not touch the repository.** No tarball, `file:` or `"link": true` is committed
      to `package.json` or `package-lock.json`; the scratch copy is deleted afterwards. The rule
      that forbids them governs what the repository *depends on*, not what a throwaway workspace
      compiles against — and a rule that made this check impossible would be trading a real
      failure for a tidy lockfile.

- [ ] **Task 2.2** — `npm view @mcp-abap-adt/interfaces version` reports `22.0.0`. Phase 3 starts
      only then, and installs from the registry.

---

## Phase 3 — `@mcp-abap-adt/adt-clients`, in PR #118

- [ ] **Task 3.1 — Bump and install.** `@mcp-abap-adt/interfaces` to `^22.0.0` — the same
      version as everywhere else in this plan.
      **Verify:** no `"link": true` in `package-lock.json`; `npm run build` shows what actually
      broke.

- [ ] **Task 3.2 — `Profiler` implements the new shape.** `list()` returns parsed
      `ITraceEntry[]` — the branch already has `parseTraceFeedEntries`, which is where the measured
      fields go. The three getters become `read(id, view, options)`.
      **Verify:** unit tests over a fixture of the real feed, including that `state` and
      `expiresAt` survive parsing.

- [ ] **Task 3.3 — `CrossTrace` implements it too.** It has none of this today: `list()` returns a
      raw `IAdtResponse` and there is no `read()`. It needs its own feed parser and the three
      members folded in.
      **Verify:** unit tests over a fixture captured in Task 0.1.

- [ ] **Task 3.4 — Executors take scheduling.** `ClassExecutor` and `ProgramExecutor` implement
      `ITraceScheduling`; the trace-polling loop and its three options go; `runWithProfiling`
      returns `{ response, profilerId }`.
      **Verify:** both executors' results are the same shape, and nothing imports profiler
      functions past the contract.

- [ ] **Task 3.5 — The tests stop reaching around the contract.**
      `(runtime.getProfiler() as Profiler).extractIdFromResponse(...)` goes; the
      schedule-without-running test either goes or becomes an executor test — it is the only
      producer of orphaned trace requests.
      **Verify:** no `as Profiler` in the test tree; a full run leaves no unfulfilled request.

- [ ] **Task 3.6 — Docs.** `CLIENT_API_REFERENCE.md` and any usage page showing the old profiler
      calls.
      **Verify:** `npm run check:docs` — added to `lint:check` on this branch precisely for this.

- [ ] **Task 3.7 — Full runs.** Cloud from here, on-prem from the other machine.
      **Verify:** no regression against the numbers in PR #118; profiling tests pass on both.

---

## Phase 4 — Release adt-clients

- [ ] **Task 4.1** — CHANGELOG (ask which version), `npm install --package-lock-only` in the same
      commit, PR reviewed and merged, tag, GitHub release. `npm publish` is the user's.

---

## What this plan deliberately does not do

- **ST05 is untouched.** Its `directory` payload has never been read here. When it is, it becomes
  `ITraceFamily<'st05Trace'>` — a listing, no views, and no contract of its own.
- **Dumps, logs, system messages and memory snapshots are not merged in.** They share a listing
  shape with traces and nothing else: a profile is asked for and belongs to whoever asked, a dump
  is asked for by nobody, a log arises because somebody ran something. `IRuntimeDumps` is already
  the shape this plan builds and stays as it is.
- **No arrow between a run and a trace is invented.** A run may leave no trace, and a trace may be
  deleted or expire — four weeks, per `trc:expiration`. `list()` says what exists; `read()` says
  what is in one; neither claims to know which was yours.
