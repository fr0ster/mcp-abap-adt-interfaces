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
- **The dependency that LANDS is the published one.** What adt-clients commits — `package.json`
  and `package-lock.json` — resolves from the npm registry. No `file:`, no tarball path, no
  `"link": true` reaches a commit; verify `package-lock.json` after every `npm install`.
  **This governs what ships, not what compiles during validation.** Phase 2 deliberately builds
  the consumer against a local `npm pack` tarball and reverts it, because the alternative is that
  the first consumer of a breaking contract is production. The rule and the gate are about
  different moments: one is what the repository depends on, the other is how we find out whether
  it can.
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

- [ ] **Task 0.3 — Write the answers into the spec.** What is written depends on which of them
      came back, and the two are independent:

      **0.2 answered** — `scheduleTrace` takes its settled shape and the "Provisional until step
      0a" block goes. This one has no other branch: without 0.2 there is no release.

      **0.1 answered** — the cross-trace result types get their measured field tables, beside the
      ones `abaptraces` already has.

      **0.1 not answered** — the spec says so, in the same voice it uses for ST05: cross-trace is
      **excluded from 22.0.0**, `ICrossTrace` is untouched, and it joins when someone can read one.
      Its unmeasured notes stay, because they are true.

      **Verify:** no type is described as both unmeasured and being published. That is the actual
      rule — not "nothing is unmeasured", which the ST05 section has always contradicted on
      purpose. An unmeasured type is fine in this document as long as the spec also says it is not
      shipping.

**Gate, and what it does when it is not met.** Publishing a type for a document nobody has read is
the mistake ST05 was excluded for, so:

- **0.2 blocks the release.** `ITraceScheduling` cannot be written without it.
- **0.1 blocks cross-trace, not the release.** If nobody can measure a cross trace, `ICrossTrace`
  stays exactly as it is in 22.0.0 and joins in a later one — the ST05 treatment, for the same
  reason. It does **not** get "declared as its parsed document": that is publishing an unmeasured
  shape with a vaguer name.

Choosing this at the gate is the point. Discovering it in Task 1.2 and improvising a fallback is
how a hard rule becomes a soft one.

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

- [ ] **Task 1.2 — The ABAP result types.** `IAbapTraceHitList`, `IAbapTraceStatements` and
      `IAbapTraceDbAccesses` from the tables already in the spec — 473 `trc:entry`, 1801
      `trc:statement`, and `trc:dbAccess` with its `trc:accessTime`, all read from one real trace.
      **Verify:** every field traceable to a measurement; none invented.

- [ ] **Task 1.2c — The cross-trace result types. ONLY if Task 0.1 was answered.**
      `ICrossTraceDocument`, `ICrossTraceRecords`, `ICrossTraceRecordContent` from what it
      measured. **If 0.1 was not answered this task does not run**, and neither do 1.3c, 2.4 or the
      cross-trace lines of the CHANGELOG — see *Two shapes this release can take*.

- [ ] **Task 1.3 — `IProfiler` becomes a composition**, keeping its name.
      **Verify:** `__typechecks__` shows a consumer's own implementation satisfying it.

- [ ] **Task 1.3c — `ICrossTrace` becomes one too. ONLY if Task 0.1 was answered.** It keeps its
      name; `list()` keeps `IListCrossTracesOptions` — all three of `traceUser`, `actCreateUser`,
      `actChangeUser`; `getActivations()` stays declared, with the comment saying it is recording
      and moves when a recording contract exists.
      **Verify:** a consumer's own implementation satisfies it, and a cross-trace option offered to
      the profiler's listing is refused.
      **If 0.1 was not answered, `ICrossTrace` is not touched at all** — not reshaped, not
      deprecated, not annotated.

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
      mismatch when the wait never ends.
      The entry carries the accounting from the spec: five deleted, three moved, the executor
      fields removed, `ISt05Trace` and every reading option type unchanged — **and whichever of the
      two shapes above this release took**, said plainly, so a consumer reading the CHANGELOG knows
      whether `ICrossTrace` changed. Run
      `npm install --package-lock-only` in the same commit.
      **Verify:** `npm run build && npm run test:check`. There is no `check:docs` in this
      repository — that script is adt-clients'. The CHANGELOG link definitions are checked by eye
      here, and a missing one has failed a publish in a sibling package before, so check them.

### Two shapes this release can take

| | Task 0.1 answered | Task 0.1 not answered |
|---|---|---|
| `IProfiler` | reshaped | reshaped |
| `ICrossTrace` | reshaped | **untouched** |
| Tasks 1.2c, 1.3c, 2.4 | run | skipped |
| CHANGELOG | both families | profiler only, and says cross-trace waits on a measurement |
| the spec | provisional notes resolved | its cross-trace section keeps them, and says so |

The second column is not a failure. It is the same judgement ST05 already got: a contract for a
document nobody has read is worse than no contract.

**The interfaces branch stops here — not merged, not tagged.** What proves it is Phase 2.

---

## Phase 2 — A real consumer implements it, against a tarball, before anything is published

This is the phase the earlier version of this plan got wrong twice: it put the check after the
tag, and it expected a green build from an adt-clients that had not been changed yet. Neither can
work. A contract is proved by a real implementation satisfying it, and the implementation is the
work of Phase 3 — so Phase 3 happens **here**, against a package that exists only locally.

- [ ] **Task 2.1 — Build the tarball.** `npm pack` on the interfaces branch. Nothing is merged,
      nothing is tagged, nothing is on npm.

- [ ] **Task 2.2 — Install it into the adt-clients branch, uncommitted.** PR #118's branch,
      `npm install /path/to/mcp-abap-adt-interfaces-22.0.0.tgz` — and **the change to
      `package.json` and `package-lock.json` is not committed**. It exists to compile against and
      is reverted in Phase 4. The rule against `file:` and tarballs governs what the repository
      *ships as a dependency*; it cannot also forbid the only way to find out whether the contract
      works, because then the first consumer of a breaking change is production.

- [ ] **Task 2.3 — `Profiler` implements the new shape.** `list()` returns parsed `ITraceEntry[]`
      — `parseTraceFeedEntries` is already on the branch and is where the measured fields go. The
      three getters become `read(id, view, options)`.
      **Verify:** unit tests over a fixture of the real feed, including that `state` and
      `expiresAt` survive parsing.

- [ ] **Task 2.4 — `CrossTrace` implements it**, if Task 0.1 was answered. It has none of this
      today: `list()` returns a raw `IAdtResponse` and there is no `read()`.
      **Verify:** unit tests over a fixture captured in Task 0.1. If 0.1 was not answered, this
      task does not exist and neither does the cross-trace half of 22.0.0.

- [ ] **Task 2.5 — Executors take scheduling.** `ClassExecutor` and `ProgramExecutor` implement
      `ITraceScheduling`; the trace-polling loop and its three options go; `runWithProfiling`
      returns `{ response, profilerId }`.
      **Verify:** both results are the same shape; nothing imports profiler functions past the
      contract.

- [ ] **Task 2.6 — The tests stop reaching around the contract.**
      `(runtime.getProfiler() as Profiler).extractIdFromResponse(...)` goes; the
      schedule-without-running test either goes or becomes an executor test — it is the only
      producer of orphaned trace requests.
      **Verify:** no `as Profiler` in the test tree.

- [ ] **Task 2.7 — Docs.** `CLIENT_API_REFERENCE.md` and any usage page showing the old profiler
      calls. **Verify:** `npm run check:docs`, which is in `lint:check` on this branch.

- [ ] **Task 2.8 — The gate itself.** `npm run build`, `npm run test:check`,
      `npm run test:check:integration`, unit tests, and a full run on each system — cloud from
      here, on-prem from the other machine.
      **Verify:** green everywhere. **Only now** is the contract known to be implementable.

---

## Phase 3 — Publish the interfaces

- [ ] **Task 3.1 — Interfaces PR: review, merge, tag.** With Phase 2's evidence in the PR — the
      consumer compiles and its tests pass against this exact tarball.

- [ ] **Task 3.2** — `npm publish` is the user's. State that it is ready; do not chase it.

- [ ] **Task 3.3** — `npm view @mcp-abap-adt/interfaces version` reports `22.0.0`.

---

## Phase 4 — Land the consumer on the published version

- [ ] **Task 4.1 — Swap the tarball for the registry.** `@mcp-abap-adt/interfaces` to `^22.0.0`,
      `rm -rf node_modules/@mcp-abap-adt/interfaces && npm install`.
      **Verify:** no `"link": true`, no `file:` and no tarball path anywhere in
      `package-lock.json`; the installed `package.json` says `22.0.0`; build and tests still green.
      This is the commit the dependency change lands in — the first one that touches the lockfile.

- [ ] **Task 4.2 — CHANGELOG.** Ask which version. `npm install --package-lock-only` in the same
      commit.

- [ ] **Task 4.3 — Green on the published dependency.** `npm run build`, `lint:check` (which runs
      `check:docs`), `test:check`, `test:check:integration`, unit tests, and a full run on each
      system. Phase 2's runs were against a tarball; this is the same code against what consumers
      will actually install.

- [ ] **Task 4.4 — Review, then merge PR #118 into `main`.** A reviewed PR, per the standing rule.
      Nothing is tagged before this: a tag on a feature branch does not put the release on the
      default branch, and the one thing a release tag must be is reachable from `main`.

- [ ] **Task 4.5 — Tag the merged commit on `main`, then the GitHub release.** `npm publish` is
      the user's.

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
