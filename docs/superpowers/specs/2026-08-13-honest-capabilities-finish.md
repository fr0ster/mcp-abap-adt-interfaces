# Finishing the honest capabilities

**Status:** design, for review.
**Date:** 2026-08-13
**Repo:** this one. The design — atoms and composites — is decided here. The application side
(narrowing ten handlers, deleting `unitTest`'s undeclared methods, fixing `transport`, the guard test) lands in
`mcp-abap-adt-clients`, where the inventory below was measured.

## Why this exists

Release 8.0.0 was called "honest capability types" and split the ADT contract into atoms so a
handler would declare what it can actually do. It did not finish. Measured across all 30
handler modules on 2026-08-13:

**Counts below overlap** — a handler can appear in more than one row. 11 of 30 have at least
one stub:

| symptom | modules |
|---|---|
| clean | 19 |
| stubs `getVersions`/`getVersionSource` | **10** — `dataElement`, `domain`, `functionGroup`, `messageClass`, `authorizationField`, `featureToggle`, `package`, `service`, `transport`, `unitTest` |
| stubs `readTransport` | 4 — `messageClass`, `authorizationField`, `featureToggle`, `functionInclude` |
| stubs more than versions and `readTransport` | 4 — `transport` 9, `unitTest` 8, `messageClass` 5, `service` 4 |

**11 of 30 handlers carry at least one stub; 10 of them declare a contract wider than they
implement.** `unitTest` is the eleventh and a different case — its contract is already narrow,
and its stubs are undeclared dead code. A caller reading the type
is told an operation exists; calling it throws. That is the defect 8.0.0 set out to remove.

The trigger for this spec was narrower — the maintainer asked for `IAdtDeletable` as its own
interface. It is needed, but the inventory shows it closes none of the eleven cases on its
own: only two handlers stub `delete`, and in one of them the stub is **wrong** rather than
honest.

## What is actually broken, by cluster

### 1. Versions — ten handlers, and the fix already exists

`dataElement`, `domain`, `functionGroup`, `messageClass`, `authorizationField`,
`featureToggle`, `package`, `service`, `transport`, `unitTest` — **ten**, not nine. An earlier
draft of this document said nine here and then named `service` as a version-stubber further
down; both `throwUnsupportedVersions` calls are in its source. `service` was therefore about to
be left without a migration.

`IAdtNonVersionedObject` exists in `IAdtComposites.ts` for exactly this and is the same as
`IAdtSourceObject` minus `IAdtVersionable`. This is not a design problem; it is a migration
that stopped halfway.

### 2. `readTransport` — four handlers

`messageClass`, `authorizationField`, `featureToggle`, `functionInclude` throw from it, while
`IAdtTransportAware` is part of both composites. Same shape as cluster 1: an atom exists, the
composite includes it unconditionally.

### 3. The four deep cases — four different diagnoses

**`transport` — a CRUD object with its hands tied, and two stubs that lie.**
Real: `validate`, `create`, `read`, `readMetadata`, `list`, `listNodes`.
Stubbed: `update`, `delete`, `activate`, `check`, `readTransport`, `lock`, `unlock`,
`getVersions`, `getVersionSource`.

Two of those stubs are **false**: ADT changes a request's description, and deletes an **empty**
request via `DELETE /cts/transportrequests/<NR>`. The stubs say "immutable after creation" and
"cannot be deleted via ADT". Compare `package`, which implements both against the same server.
**This is a code defect, not a typing one** — and it must be fixed before the type is narrowed,
or the narrowing will make the lie permanent.

**`unitTest` — already narrowed; the stubs are dead code, not overclaiming.**

`AdtUnitTest` declares
`IAdtCreatable, IAdtReadable, IAdtValidatable, IAdtTestRunnable` — **no `IAdtCrud`**. So its
eight stubbed methods are implemented but *not declared*: nothing in the contract promises
them, and a TypeScript caller cannot reach them through the handler's type at all.

That is a different defect from the rest of this document, and a smaller one: **delete the
methods**, do not narrow the type. The narrowing already happened.

`IAdtTestRunnable` has existed since 13.1.0 and already carries `run`, `getStatus`,
`getResult`, `getRunId`, `getStatusResponse`, `getResultResponse`. An earlier draft of this
spec proposed a new `IAdtRunnable` with three of those six — it would have created a second,
competing contract and lost the other three. There is nothing to add here.

**`messageClass`** — no activation, no check, no versions, no `readTransport`.
**`service`** — 25 real methods, stubs only on `lock`/`unlock` and versions.

## The shape of the fix

### Atoms

Split `IAdtModifiable` — today it is `update` **and** `delete` in one interface, so a handler
that can change an object but not remove it (or the reverse) cannot say so:

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

`IAdtModifiable` **stays**, as the composite of the two. `IAdtCrud` is unchanged in shape, so
nothing that already implements everything notices. Only code naming `IAdtModifiable` where it
means one half is affected — and that is the point.

This mirrors what the package already does with `IAdtCrud`: keep the assembled name, add the
parts, prefer the part you actually mean.

### Composites

- Apply `IAdtNonVersionedObject` to the **ten** version-stubbing handlers, `service` included.
- A composite without `IAdtTransportAware` for the four that stub `readTransport`. Name and
  membership to be settled in the plan, from what those four actually share.
- **Nothing new for `unitTest`.** It already composes
  `IAdtCreatable + IAdtReadable + IAdtValidatable + IAdtTestRunnable`. If a named composite is
  wanted for readability, it is an alias over those four — but the contract is correct today
  and the work there is deleting undeclared methods, not adding a type.

### Code, before the types

`transport.update()` and `transport.delete()` are implementable and must be implemented first:
description change, and deletion of an empty request. Narrowing the type around a stub that
lies would carve the lie into the contract.

## What this is not

- **Not a rename.** Every existing name survives; atoms are added beneath them.
- **A runtime breaking change, and this is the one to read twice.** Step 5 deletes the stub
  methods. Today a caller reaching one gets a controlled `Error("... is not supported ...")`;
  afterwards it gets `TypeError: x.delete is not a function`. TypeScript callers are stopped at
  compile time, but **JavaScript consumers, and TypeScript ones going through `any` or a cast,
  see the change only at runtime, and the message is worse.**

  That is acceptable in a major — an object that never supported an operation should not carry
  a method for it — but it must be in the changelog as a runtime break, not filed under
  "types narrowed". The alternative, keeping the stubs while removing them from the contract,
  keeps the friendlier message and is worth considering for the handlers where the operation
  is genuinely impossible rather than merely unimplemented.

- **No change to any supported ADT operation** — every one that works today keeps working, and
  `transport` gains two. What does change is *failure* behaviour on the removed methods, as
  described immediately above. Those are different claims and an earlier draft ran them
  together.
- **Not `IAdtDeletable` alone.** Shipping only the atom would remove one stub of the eleven
  cases' many and leave the rest declaring what they cannot do.

## Order of work

1. **`transport.update` / `transport.delete`** — code, with tests. Independent of everything
   below and shippable on its own.
2. **Atoms** in `@mcp-abap-adt/interfaces`: `IAdtUpdatable`, `IAdtDeletable`,
   `IAdtModifiable` as their composite. Additive — a minor.
3. **Composites**: whatever the `readTransport` cluster needs. `unitTest` needs none —
   `IAdtTestRunnable` has covered it since 13.1.0. Additive.
4. **Publish interfaces**, then narrow the **ten** overclaiming handlers in adt-clients to the
   composite each actually satisfies. `unitTest` is not among them — it is already narrow.
   **Breaking** for a consumer that named a wide type — a major.
5. Delete each stub as its handler stops declaring the method — and for `unitTest`, delete the
   **nine** that were never declared: the eight that throw, plus `readTransport`, which does
   not throw at all (see "Stubs that do not throw" below). See the runtime-break note above before doing this: for an
   operation that is genuinely impossible, consider keeping the throwing method while removing
   it from the contract, so a JavaScript caller still gets a sentence instead of a `TypeError`.

Steps 2 and 3 are one interfaces release. Step 4 is one adt-clients major.

## Stubs that do not throw — and why the guard needs more than a `throw`

`unitTest.readTransport()` does not throw. It returns an empty state, and its own comment says
a test run has no transport request. The dishonesty is identical to a throwing stub; only the
disguise differs, and the contract correctly does not declare it.

**This breaks the detection criterion**, not just the count. Every number in this document came
from looking for `throw ... not supported` or `throwUnsupportedVersions`. A method that quietly
returns nothing is invisible to that, so the inventory is a floor, not a total.

A scan for the wider class — a body that issues no request and returns a bare state — was run
across all 30 modules on 2026-08-13 and is **not reliable**: most of its hits are two-line
delegates in `AdtUtils` that genuinely call an imported function, which a regex cannot tell
from a no-op. It did surface, besides `unitTest.readTransport`, the `validate()` of both
`transport` and `unitTest`, each returning an empty state with a comment that ADT offers no
validation endpoint — arguably the same pattern, arguably an honest "nothing to validate".

So the guard test cannot be a grep. It has to assert the positive: **for every method a handler
declares, a real request goes out** — checked against a recording connection, not by reading
source. Anything weaker will keep missing this class, and this class is the one that produced
`{"success": true, "count": 0}` over 55 real transport requests.

## How this is verified

A stub is a method whose body throws "not supported" or calls `throwUnsupportedVersions`. The
inventory above came from parsing every `src/core/*/Adt*.ts` in `mcp-abap-adt-clients`, and the same script is the check:
**after step 5, no handler may declare a method it stubs.** That is a test, not a review note —
it can be written as a unit test that walks the handlers and fails on any stub whose name is
still in the declared contract.

Without that test this regresses the moment a new object type is added by copying an existing
one, which is how the current eleven arose.

## Open questions

1. **`service`** stubs `lock`/`unlock` *and* versions. Is either ADT's truth or an
   unimplemented feature? If the latter, it belongs with `transport` in step 1, not in a
   narrowed composite.
2. **`messageClass`** stubs `activate` and `check`. Same question.
3. Does the `readTransport` cluster share anything else, or does each need its own composite?
   Four handlers is enough to justify a name only if they are actually alike.

## Related

- 8.0.0 — the release that introduced the atoms and stopped short
- `src/adt/IAdtCapabilities.ts`, `src/adt/IAdtComposites.ts` — the atoms and the two composites this spec extends
