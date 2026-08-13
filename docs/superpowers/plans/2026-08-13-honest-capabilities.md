# Honest Capabilities — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** No handler declares a capability it does not have, and none carries a method that
does not do what its capability promises.

**Architecture:** Two positive atoms split out of `IAdtModifiable`; one negative composite
deleted; fifteen handlers narrowed to the exact intersection of atoms they satisfy; three
behavioural defects fixed; and a guard — manifest, compile-time equality over the full
handler × atom product, and per-atom behaviour tests — that keeps the state true.

**Tech Stack:** TypeScript (strict, CommonJS), Jest, Biome. Two npm packages.

**Spec:** `docs/superpowers/specs/2026-08-13-honest-capabilities-finish.md` in this repo,
approved 2026-08-13 after eight review rounds. **Read it before Task 1** — every number here
comes from it.

## Global Constraints

- All repository artifacts in **English**.
- Contract types live in `@mcp-abap-adt/interfaces` and are imported; never redefined locally.
- **Publish the dependency first.** interfaces must be on npm before adt-clients consumes it.
  No `file:`, no tarball, no `"link": true` — verify after every `npm install`.
- Claude opens PRs, merges **reviewed** PRs, tags. `npm publish` is the user's, on the user's
  timing — state the dependency, never the request.
- Biome: single quotes, semicolons, 2-space indent. `npm run lint` before every commit.
- adt-clients unit tests: `MCP_ENV_PATH=/tmp/nonexistent-env npx jest src/__tests__/unit`.
- **No SAP run is needed by this plan.** Every check is a unit test or a type check.
- interfaces default branch is **`master`**; adt-clients is **`main`**.

## The two rules everything here follows

1. **An interface states what an object supports, never what it does not.** Absence is
   expressed by not declaring an atom. A name reaching for "Non…", "…Without…" or "…Except…"
   means an atom should be dropped, not a type added.
2. **The verbs are invariant.** `create` → POST, `read` → GET, `update` → PUT, `delete` →
   DELETE, `check` → POST, `activate` → POST. A handler that cannot meet its atom's verb does
   not have that capability — the guard rejecting it is the guard working.

## Scope, fixed

| | count | who |
|---|---|---|
| handlers with a problem | 16 | the 11 below plus 5 `create()` aliases |
| type/API subtraction | 15 | 10 declaring unsupported atoms + 5 alias holders |
| behavioural code | 3 | `transport`, `unitTest.validate`, `functionGroup.activate` |
| dead-method deletion | 1 | `unitTest` — nine methods |

**The ten declaring unsupported atoms:** `dataElement`, `domain`, `functionGroup`,
`messageClass`, `authorizationField`, `featureToggle`, `package`, `AdtServiceBinding`,
`transport`, `unitTest`.

**The five alias holders:** `AdtMessageClassMessage`, `AdtLocalTestClass`, `AdtLocalTypes`,
`AdtLocalDefinitions`, `AdtLocalMacros`. `AdtMessageClass` is **not** among them — a message
class is created by a POST and keeps `IAdtCreatable`.

---

## Phase A — behavioural fixes in adt-clients

These are independent of every type change and ship on their own. They come first because the
guard cannot be switched on over a handler whose method lies.

**Branch:** `feat/honest-capabilities` off `main` in
`/home/okyslytsia/prj/mcp-abap-adt-clients`.

### Task 1: `functionGroup.activate` must read the server's answer

**Files:**
- Modify: `src/core/functionGroup/activation.ts`
- Modify: `src/core/functionGroup/AdtFunctionGroup.ts` — three call sites, one at line 711
- Test: `src/__tests__/unit/core/functionGroup/activateReportsFailure.test.ts` (create)

**Interfaces:** consumes `assertActivationSucceeded` from `src/utils/activationUtils.ts`.
Produces nothing new.

The defect: `activateFunctionGroup` POSTs correctly, then returns the raw response. Neither it
nor its caller reads `<msg type="E">`, so `AdtFunctionGroup` returns `{ activateResult, errors: [] }`
whatever the server said. Nine other handlers call `assertActivationSucceeded`; this one has
its own implementation and was missed when 10.0.2 fixed the rest.

This is the defect 10.0.2 removed: `activationExecuted=false` means no work was done, **not**
failure; only an error-severity `<msg>` is the verdict.

- [ ] **Step 1: Write the failing test**

```ts
/**
 * Activation is judged by the messages, never by a flag — and never by silence.
 *
 * This handler POSTs correctly and then ignores what comes back, so a failed
 * activation reached the caller as `errors: []`. Nine other handlers call
 * assertActivationSucceeded; this one has its own activation and was missed
 * when 10.0.2 fixed them.
 */
import type { IAbapConnection, IAdtResponse } from '@mcp-abap-adt/interfaces';
import { AdtFunctionGroup } from '../../../../core/functionGroup/AdtFunctionGroup';

const FAILED = `<?xml version="1.0" encoding="utf-8"?>
<chkl:messages xmlns:chkl="http://www.sap.com/abapxml/checklist">
  <msg objDescr="ZFG_TEST" type="E" line="12"
       href="/sap/bc/adt/functions/groups/zfg_test">
    <shortText><txt>Function group ZFG_TEST could not be activated</txt></shortText>
  </msg>
</chkl:messages>`;

const connectionReturning = (body: string) => {
  const calls: { url: string; method: string }[] = [];
  return {
    calls,
    connection: {
      connect: async () => {},
      getBaseUrl: async () => 'https://example',
      getSessionId: () => null,
      setSessionType: () => {},
      makeAdtRequest: async (o: { url: string; method: string }) => {
        calls.push({ url: o.url, method: o.method });
        return { data: body, status: 200, statusText: 'OK', headers: {} } as unknown as IAdtResponse;
      },
    } as unknown as IAbapConnection,
  };
};

describe('function group activation reports what the server said', () => {
  it('rejects when the response carries an error-severity message', async () => {
    const { connection } = connectionReturning(FAILED);

    await expect(
      new AdtFunctionGroup(connection).activate({ functionGroupName: 'ZFG_TEST' }),
    ).rejects.toThrow(/could not be activated/);
  });

  it('still POSTs to the activation resource', async () => {
    const { connection, calls } = connectionReturning('<chkl:messages/>');

    await new AdtFunctionGroup(connection).activate({ functionGroupName: 'ZFG_TEST' });

    expect(calls).toHaveLength(1);
    expect(calls[0].method).toBe('POST');
    expect(calls[0].url).toContain('/sap/bc/adt/activation');
  });

  it('does not treat an empty message list as failure', async () => {
    const { connection } = connectionReturning('<chkl:messages/>');

    const state = await new AdtFunctionGroup(connection).activate({
      functionGroupName: 'ZFG_TEST',
    });

    expect(state.errors).toEqual([]);
  });
});
```

Read the real `IFunctionGroupConfig` for the argument name before writing — `functionGroupName`
is the expected field but confirm it.

- [ ] **Step 2: Run it, confirm the first case fails**

```bash
MCP_ENV_PATH=/tmp/nonexistent-env npx jest src/__tests__/unit/core/functionGroup 2>&1 | tee unit-run.log
```

Expected: the error-message case fails — today the handler resolves with `errors: []`.

- [ ] **Step 3: Call the shared assert**

In `AdtFunctionGroup.ts`, at **all three** call sites of `activateFunctionGroup` (around lines
221, 565 and 711), pass the response through:

```ts
import { assertActivationSucceeded } from '../../utils/activationUtils';
// …
const result = await activateFunctionGroup(this.connection, functionGroupName);
assertActivationSucceeded('Function group', result.data);
```

Do not change `activation.ts`'s request — the verb and URL are already right.

- [ ] **Step 4: Verify**

```bash
MCP_ENV_PATH=/tmp/nonexistent-env npx jest src/__tests__/unit 2>&1 | tee unit-run.log
npx tsc -p tsconfig.json     # production sources
npm run test:check           # the tests — tsconfig.json excludes src/__tests__
npm run lint
```

- [ ] **Step 5: Commit**

```bash
git add src/core/functionGroup src/__tests__/unit/core/functionGroup
git commit -m "fix(functionGroup): activation must report what the server said

The POST was right and the answer was thrown away: neither activation.ts nor
its caller read <msg type=\"E\">, so a failed activation reached the caller as
errors: []. Nine handlers call assertActivationSucceeded; this one has its own
activation and was missed when 10.0.2 fixed the rest."
```

---

### Task 2: `transport.update` and `transport.delete`

**Files:**
- Create: `src/core/transport/update.ts`, `src/core/transport/delete.ts`
- Modify: `src/core/transport/AdtRequest.ts` — replace both stubs
- Test: `src/__tests__/unit/core/transport/updateDelete.test.ts` (create)

The stubs say "immutable after creation" and "cannot be deleted via ADT". Both are false: ADT
changes a request's description, and deletes an **empty** request. `AdtPackage` implements both
against the same server — read `src/core/package/update.ts` and `delete.ts` for the shape.

- [ ] **Step 1: Read the reference implementation**

```bash
cat src/core/package/update.ts src/core/package/delete.ts
cat src/core/transport/read.ts   # for the item URL and its Accept header
```

The item resource is `/sap/bc/adt/cts/transportrequests/<NUMBER>` and takes
`application/vnd.sap.adt.transportorganizer.v1+xml` — captured 2026-08-07, and different from
the collection's type.

- [ ] **Step 2: Write the failing tests**

Assert, against a recording connection:

- `update` issues **exactly one PUT** to the item URL with the new description in the body,
  **optionally preceded by exactly one GET** of the same URL if it follows `package`'s
  read-modify-write. The test asserts the PUT and tolerates the GET; it must not assert a total
  request count of one. Whichever shape the implementation takes, the mock connection has to
  answer that GET with a realistic body — an empty one is what silently corrupted
  read-modify-write updates before;
- `delete` issues exactly one **DELETE** to the item URL;
- neither touches the collection or the search-configuration endpoint;
- `update` without a description rejects **before** any request goes out.

- [ ] **Step 3: Implement, following `package`'s shape**

**Use read-modify-write: GET, patch the description, PUT.** This is decided here rather than
left to the implementer, because no test in this plan can settle it — a recording mock cannot
prove the server accepts a partial body, and the plan takes no SAP run. `package` does it this
way for a reason that applies unchanged: building the XML from scratch drops every field the
client does not model, which is how a domain update once shipped without its description and
the server blamed something else.

So the test asserts **exactly one GET followed by exactly one PUT**, and the mock answers the
GET with a realistic transport-request body. If a later SAP run shows a partial PUT is
accepted, simplifying is cheap; guessing the other way corrupts data.

- [ ] **Step 4: Replace the stubs in `AdtRequest.ts`** and delete the "not supported" messages.

- [ ] **Step 5: Verify and commit**

```bash
MCP_ENV_PATH=/tmp/nonexistent-env npx jest src/__tests__/unit 2>&1 | tee unit-run.log
npx tsc -p tsconfig.json && npm run lint
git commit -m "fix(transport): update and delete work — the stubs were false

ADT changes a transport request's description and deletes an empty one;
AdtPackage does both against the same server. The stubs claimed the request
was immutable and undeletable."
```

---

### Task 3: `unitTest.validate` — real validation

**Files:**
- Modify: `src/core/unitTest/AdtUnitTest.ts`
- Test: `src/__tests__/unit/core/unitTest/validateIsReal.test.ts` (create)

**The nine dead methods are NOT deleted here.** They move to Phase C, next to the other
deletions and immediately before the shape guard that needs them gone. Keeping them out of
Phase A is what lets that release stay additive.

**`validate()`** currently checks an argument and returns what its own comment calls "a mock
success response". A unit test **is** a class, so validation there is a class's validation:
`AdtClass.validate()` calls `validateClassName` against the server. Do the same.

- [ ] **Step 1: Write the failing test** — `validate` issues a request and reports what came
  back; a name the server rejects produces errors rather than an empty success.

- [ ] **Step 2: Implement `validate` on `AdtClass`'s pattern.** Delete nothing.

- [ ] **Step 3: Verify and commit**

```bash
git commit -m "fix(unitTest): real validation instead of a self-declared mock

validate() checked an argument and returned what its own comment called a mock
success response. A unit test is a class, so validation there is a class's
validation, as AdtClass does it."
```

---

### Task 4: Release adt-clients — behavioural fixes only

**Additive, so a minor.** Three operations that threw or lied start working; nothing is removed
and no type changes. The deletions that would have forced a major moved to Phase C.

- [ ] **Step 1: Ask the user for the version.** State the assessment: additive, so a minor on
  top of 11.0.0. Wait.
- [ ] **Step 2: Sweep the docs** — `README.md` and all of `docs/`, not only the changelog.
  A doc describing the old contract is worse than none.
- [ ] **Step 3: CHANGELOG** — three operations begin working; nothing is removed. No
  runtime-break note belongs here: the deletions that would have needed one are in Phase C.
- [ ] **Step 4: Bump, relock, build, full unit suite; read every log.**
- [ ] **Step 5: PR, user review, merge, tag, GitHub release.** Then stop.

**Phase B does not wait for this.** `interfaces` does not depend on adt-clients, and Phase A
uses none of the new atoms — the two can run in parallel. Only **Phase C** needs both: the
atoms from B on npm, and A's behavioural fixes in place, since the guard cannot be switched on
over a handler whose method lies.

---

## Phase B — the atoms, in interfaces

**Branch:** `feat/honest-capabilities` off **`master`** in
`/home/okyslytsia/prj/mcp-abap-adt-interfaces`.

### Task 5: Split `IAdtModifiable`, delete `IAdtNonVersionedObject`

**Files:**
- Modify: `src/adt/IAdtCapabilities.ts`
- Modify: `src/adt/IAdtComposites.ts` — remove the composite and its assertion helper if unused
- Modify: `src/index.ts`
- Test: `src/__typechecks__/modifiableSplit.ts` (create)

**Produces:** `IAdtUpdatable`, `IAdtDeletable`. `IAdtModifiable` becomes their composite —
same shape, so `IAdtCrud` is unchanged and nothing implementing everything notices.

```ts
export interface IAdtUpdatable<TConfig, TReadResult = TConfig> {
  update(config: Partial<TConfig>, options?: IAdtOperationOptions): Promise<TReadResult>;
}

export interface IAdtDeletable<TConfig, TReadResult = TConfig> {
  delete(config: Partial<TConfig>): Promise<TReadResult>;
}

export interface IAdtModifiable<TConfig, TReadResult = TConfig>
  extends IAdtUpdatable<TConfig, TReadResult>,
    IAdtDeletable<TConfig, TReadResult> {}
```

Move the existing doc comments onto the atom each method now belongs to; do not rewrite them.

- [ ] **Step 1: Write the compile-only assertion** — `IAdtCrud` is still assignable to and from
  the four-atom intersection (so the split is shape-preserving), and a type with `update` but
  no `delete` satisfies `IAdtUpdatable` and **not** `IAdtModifiable`.
- [ ] **Step 2: Run `npm run test:check`, confirm it fails.**
- [ ] **Step 3: Split the interface. Delete `IAdtNonVersionedObject` and its barrel export.**
- [ ] **Step 4: `npm run test:check` and `npm run lint:check` clean.** Then prove the typecheck
  is load-bearing: merge `delete` back into `IAdtUpdatable`, confirm the assertion fails,
  revert that one edit.
- [ ] **Step 5: Commit.**

### Task 6: Release interfaces — a major

Deleting an exported type is breaking.

- [ ] Ask the user for the version; state that the removal forces a major.
- [ ] Sweep `README.md` — it lists what the package covers. Both new atoms belong there, and
  any mention of `IAdtNonVersionedObject` must go.
- [ ] CHANGELOG with the removal as a **Breaking** entry and the reason: a type defined by
  absence has no place in a capability vocabulary, and `Non` means nothing to the compiler —
  `IAdtNonVersionedObject & IAdtVersionable` compiled and handed out `getVersions`.
- [ ] Bump, relock, build; PR; user review; merge; tag; GitHub release. Then stop.

**Phase C does not start until this version is on npm.**

---

## Phase C — narrowing, in adt-clients

Fifteen handlers. Same branch as Phase A if it is still open; otherwise a new one off `main`.

### Task 7: Delete the five `create()` aliases

**Files:** `src/core/messageClass/AdtMessageClassMessage.ts`,
`src/core/class/AdtLocalTestClass.ts`, `AdtLocalTypes.ts`, `AdtLocalDefinitions.ts`,
`AdtLocalMacros.ts`; their barrels; the tests naming `create` on them.

All five already have a separate `update()` — verified 2026-08-13 — so `create()` is an alias
over it and there is nothing to rename into. Delete the alias; `update()` remains the single
PUT capability. Drop `IAdtCreatable` from each class's `implements`.

`AdtMessageClass` is **untouched**: a message class is created by a POST and keeps the atom.

- [ ] **Step 1:** `grep -rn "\.create(" src/__tests__` for calls on these five and update them
  to `update()` before deleting anything.
- [ ] **Step 2:** delete the aliases and the `IAdtCreatable` declarations.
- [ ] **Step 3:** verify; commit with a `BREAKING CHANGE:` footer naming all five.

### Task 8: Narrow the nine

Per handler, replace the declared composite with the exact intersection of atoms it satisfies.
The spec's cluster tables give the starting point; **read each class** before writing its list.

| handler | drops |
|---|---|
| `dataElement`, `domain`, `functionGroup`, `package` | `IAdtVersionable` |
| `messageClass` | `IAdtVersionable`, `IAdtTransportAware`, `IAdtActivatable`, `IAdtCheckable` |
| `authorizationField`, `featureToggle` | `IAdtVersionable`, `IAdtTransportAware` |
| `functionInclude` | `IAdtTransportAware` |
| `AdtServiceBinding` | `IAdtVersionable`, `IAdtLockable` |
| `transport` | everything ADT does not give it; `IAdtValidatable` goes too — a request's number is system-generated, so `validate()` is deleted, not implemented |
`unitTest` is deliberately absent: its declared atoms are already correct. Its nine dead
methods are deleted in Task 8a below, which is where the shape guard needs them gone.

Then delete every stub whose atom is gone, until
`grep -rn "is not supported" src/core/*/Adt*.ts` returns nothing and
`throwUnsupportedVersions` has no call site left and is itself deleted.

- [ ] One commit per handler, so a reviewer can reject one without the rest.

### Task 8a: Delete `unitTest`'s nine undeclared methods

**Files:** `src/core/unitTest/AdtUnitTest.ts`; any test naming them.

Implemented but never declared, so nothing in the contract promises them and no TypeScript
caller can reach them: `update`, `delete`, `activate`, `check`, `lock`, `unlock`,
`getVersions`, `getVersionSource` — all throwing — plus **`readTransport`**, which does not
throw at all: it returns an empty state and says in its own comment that a test run has no
transport request.

They sit here rather than in Phase A for two reasons. Deleting a public method is a runtime
break for JavaScript callers, and Phase A is otherwise additive — no need to force a major for
it. And the shape guard in Task 9 cannot run while they exist: TypeScript reads shape, not
intent, so a class carrying `delete` satisfies `IAdtDeletable` however little it declares.

- [ ] **Step 1: Confirm the class declares none of the nine**

```bash
sed -n '/^export class AdtUnitTest/,/^{/p' src/core/unitTest/AdtUnitTest.ts
```

Expected: `IAdtCreatable`, `IAdtReadable`, `IAdtValidatable`, `IAdtTestRunnable` — no
`IAdtCrud`. If any of the nine **is** declared, it is a contract change and needs saying in the
changelog as one.

- [ ] **Step 2: Delete them; update any test that calls one.**
- [ ] **Step 3: Verify** — `npx tsc -p tsconfig.json`, `npm run test:check`, the unit suite.
- [ ] **Step 4: Commit** with a `BREAKING CHANGE:` footer naming all nine and the runtime
  consequence: a JavaScript caller moves from a sentence to `TypeError: … is not a function`.

### Task 9: The guard

**Files:**
- Create: `src/__tests__/unit/capabilities/manifest.ts`
- Create: `src/__tests__/unit/capabilities/shape.ts` — compile-time
- Create: `src/__tests__/unit/capabilities/behaviour.test.ts` — runtime
- Create: `src/__tests__/unit/capabilities/completeness.test.ts` — runtime

**This task must come after Tasks 8 and 8a**, and the spec says why: TypeScript reads shape,
not intent, so while a handler still carries an undeclared method — `unitTest`'s nine, deleted
in 8a — it satisfies that atom structurally and the bidirectional check would demand the
manifest claim it.

**The subject of every check is the FACTORY RETURN TYPE, not the concrete class.** A consumer
never names `AdtClass`; it calls `client.getClass()`, and that method's declared return type is
the contract it receives:

```ts
getClass(): IAdtSourceObject<IClassConfig, IClassState>
getDomain(): IAdtNonVersionedObject<IDomainConfig, IDomainState>   // the composite being deleted
```

Checking the class would let a getter keep a wide composite while the class underneath is
narrow, and see nothing wrong. Measured 2026-08-13: **37 getters on `AdtClient` against 18
handler classes exported from the package root** — so a class-based check is blind to 19
handlers as well as to every getter's own type.

```ts
type PublicContract<K extends HandlerGetter> = ReturnType<AdtClient[K]>;
```

**Check 1 — shape, compile time, bidirectional and generated.** Not one line per pair: 37
getters × 11 atoms, and a forgotten line is a silent hole in the check meant to close silent
holes. A mapped type over the full product whose `as` clause drops every atom that agrees, so a
disagreeing getter keeps a key and the assertion fails naming both. The two lookups to write
are the getter registry below and the atom types bound to each handler's config.

**Check 2 — completeness, runtime, against an authoritative registry.** Package exports are not
that registry — 18 of 37. The registry is the list of factory names, and the check asserts
three things at once: every getter on `AdtClient` (and `AdtClientLegacy`) appears in it, every
registry entry has a manifest entry, and nothing is in the manifest that is not a getter. This
is what stops a new object type, copied from an existing one, arriving unchecked; that is how
the sixteen arose.

**A `get*` filter is not the criterion.** Of the 37, `getUtils()` returns `AdtUtils` — search,
where-used, package hierarchy — which is not an object handler and has no capability matrix.
Any purely mechanical rule that admits it is wrong, and one that excludes it by name is a
hand-maintained list wearing a filter's clothes.

So the registry is **explicit and typed**, and it is the single source both checks read:

```ts
export const HANDLERS = {
  class:   { factory: (c: AdtClient) => c.getClass(),   … },
  program: { factory: (c: AdtClient) => c.getProgram(), … },
  // one entry per object handler; getUtils and any other non-handler factory
  // is simply absent, deliberately
} as const;
```

Completeness then asserts, in both directions:

- every getter on `AdtClient` and `AdtClientLegacy` is either in `HANDLERS` or in an explicit
  `NOT_HANDLERS` list with a one-line reason — so a new factory cannot be ignored by silence,
  only by a decision someone wrote down;
- every `HANDLERS` entry names a getter that exists.

`Object.getOwnPropertyNames(AdtClient.prototype)` supplies the runtime side of the first.

**The manifest is not a list of names.** Check 3 must *construct* each handler and *call* each
method, and that needs more than capabilities: factories take arguments, every atom needs a
valid object-specific config, and the recording connection has to answer differently for
`read`, `lock`, `getVersions` and `activate`. So each entry carries its own fixture:

```ts
export const HANDLERS = {
  class: {
    factory: (c: AdtClient) => c.getClass(),
    config: { className: 'ZCL_GUARD', packageName: '$TMP', description: 'guard' },
    responses: {
      read:        CLASS_XML,          // a realistic body, never ''
      lock:        LOCK_HANDLE_XML,    // carries the handle the atom must return
      getVersions: VERSIONS_FEED_XML,
      activate:    '<chkl:messages/>',
      default:     '',
    },
    capabilities: ['creatable', 'readable', 'updatable', 'deletable', 'validatable',
                   'checkable', 'activatable', 'lockable', 'versionable', 'transportAware'],
  },
  // getLocalTestClass and friends take arguments — the factory closure hides that
} as const;
```

**Writing these fixtures is the bulk of this task**, not an afterthought: one per handler, each
body realistic enough that the assertion means something. An empty body is what let
read-modify-write corrupt updates silently, and it would let this guard pass vacuously too.

**Check 3 — behaviour, runtime, driven by the manifest.** For each handler, for each atom it
claims, assert that atom's semantics against a recording connection. Every method of every
atom, not one per atom — `readMetadata`, `unlock` and `getVersionSource` are where stubs hid.
The verbs are invariant. And for `IAdtActivatable` the assertion is **not** merely that a POST
went out: an error-severity `<msg>` in the response must reach the caller, which is the only
check that would have caught `functionGroup`.

- [ ] **Step 1:** write Check 2 first — it is the simplest and immediately lists what the
  manifest is missing.
- [ ] **Step 2:** write the manifest from that list, one entry per handler.
- [ ] **Step 3:** Check 1. Expect it to fail at first and to name real disagreements; fix the
  manifest or the handler, never the check.
- [ ] **Step 4:** Check 3, atom by atom.
- [ ] **Step 5:** confirm the target state: no `is not supported` anywhere under
  `src/core/*/Adt*.ts`, no `throwUnsupportedVersions`, all three checks green.

### Task 10: Release adt-clients — the narrowing

A major: fifteen handlers lose declared capabilities, five lose `create()`.

- [ ] Ask for the version. Sweep the docs. CHANGELOG listing, per handler, what it no longer
  declares — a consumer needs to know which of its calls stops compiling.
- [ ] PR, user review, merge, tag, GitHub release. Then stop.

---

## What this plan does not do

- **No SAP run.** Every check here is a unit test or a type check. `transport.update`/`delete`
  are exercised against a recording connection; whether ADT accepts the exact body is proved by
  the first integration run after release, and the plan says so rather than implying coverage
  it does not have.
- **No new composite.** `IAdtSourceObject` stays; nothing is added beside it.
- **`AdtMessageClass` is untouched** — it is created by a POST and keeps `IAdtCreatable`.
- **The `IAdtValidatable` question for other handlers is not reopened.** Only `transport`
  (deleted) and `unitTest` (implemented) were ruled on; any other handler whose `validate`
  turns out to be a no-op is a finding for the guard to surface, not something this plan
  pre-empts.
