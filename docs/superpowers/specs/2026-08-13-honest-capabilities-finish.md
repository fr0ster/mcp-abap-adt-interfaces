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
| stubs `getVersions`/`getVersionSource` | **10** — `dataElement`, `domain`, `functionGroup`, `messageClass`, `authorizationField`, `featureToggle`, `package`, `AdtServiceBinding`, `transport`, `unitTest` |
| stubs `readTransport` | 4 — `messageClass`, `authorizationField`, `featureToggle`, `functionInclude` |
| stubs more than versions and `readTransport` | 4 — `transport` 9, `unitTest` 8, `messageClass` 5, `AdtServiceBinding` 4 |

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
`featureToggle`, `package`, `AdtServiceBinding`, `transport`, `unitTest` — **ten**, not nine. An earlier
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
**`AdtServiceBinding`** — 25 real methods, stubs only on `lock`/`unlock` and versions.

Note the name: the class is `AdtServiceBinding` and it lives in
`src/core/service/AdtService.ts`. `AdtServiceDefinition`, in its own module, is **clean** — it
has `lock.ts`, `unlock.ts` and `versions.ts` and stubs nothing. Saying "service" conflates
them, as an earlier draft of this document did.

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

### No new composites — that was the wrong question

An earlier draft said "apply `IAdtNonVersionedObject` to the ten version-stubbing handlers"
and left the `readTransport` cluster's composite "to be settled in the plan". Both were wrong,
and for the same reason the maintainer named: **`IAdtNonVersionedObject` is a negative name for
a positive thing.** It means "CRUD, validation, check, activation, lock and transport awareness
— but not versions", so it enumerates everything else in order to omit one atom. Composing from
atoms means you simply do not add `IAdtVersionable`.

It is also wrong on the facts: it still carries check, activation, lock and transport
awareness, which `transport`, `AdtServiceBinding`, `messageClass`, `authorizationField` and
`featureToggle` do not all have. Applying it to the ten would replace one lie with another.

**So: no new composite, and no wider use of the existing ones.** Each handler declares the
intersection of atoms it actually satisfies, exactly as `AdtUnitTest` already does:

```ts
export class AdtUnitTest
  implements
    IAdtCreatable<IUnitTestConfig, IUnitTestState>,
    IAdtReadable<IUnitTestConfig, IUnitTestState>,
    IAdtValidatable<IUnitTestConfig, IUnitTestState>,
    IAdtTestRunnable
```

That is the pattern. It needs no name of its own, it reads as what the handler can do, and it
cannot drift from the truth without a compile error.

`IAdtSourceObject` and `IAdtNonVersionedObject` stay for the handlers that genuinely match
them and for consumers already naming them. They are not extended to new ones, and the plan
should not add a third.

**What the plan needs from the inventory** is therefore not a composite design but, per
handler, the atom list it satisfies. That is mechanical once the open questions below are
answered.

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

**One criterion, and it is not a grep.** An earlier draft defined a stub as a method that
throws "not supported", then proposed the same parsing script as the guard test.
`unitTest.readTransport()` disproves it: no throw, returns an empty state, equally dishonest.
A later draft over-corrected to "every declared method must issue a real request", which is
also wrong — `IAdtTestRunnable.getRunId()`, `getStatusResponse()` and `getResultResponse()` are
state accessors that correctly touch no network, and a local `validate()` can be a genuine
capability with no endpoint behind it.

So the guard is **per atom, asserting that atom's own semantics**, against a recording
connection:

| atom | what the test asserts of a handler declaring it |
|---|---|
| `IAdtCreatable` | `create` issues a POST to the object's collection |
| `IAdtReadable` | `read` issues a GET and returns what came back |
| `IAdtUpdatable` | `update` issues a PUT |
| `IAdtDeletable` | `delete` issues a DELETE |
| `IAdtLockable` | `lock` returns a handle the server supplied |
| `IAdtVersionable` | `getVersions` issues a GET and parses a feed |
| `IAdtTransportAware` | `readTransport` reports a request the server named |
| `IAdtTestRunnable` | `run` issues a POST; the `get*` accessors return prior state without a request |

The shape is: **for every atom a handler declares, the behaviour that atom promises actually
happens.** A method that throws fails it. A method that silently returns an empty state fails
it too — which is the point, since that is the class the grep could not see and the class that
produced `{"success": true, "count": 0}` over 55 real transport requests.

Handlers are enumerated by reflection over the exported classes, so a new object type is
covered the day it is added — which is what stops this recurring, since the current eleven
arose by copying an existing handler.

## Open questions — closed 2026-08-13

The maintainer answered both: **these are ADT's limits, not unimplemented features.**

1. **`AdtServiceBinding`** (not `AdtServiceDefinition`, which is clean) stubs `lock`/`unlock`
   and versions — **ADT does not offer them**. So they leave the atom list; there is no code
   to write. It declares neither `IAdtLockable` nor `IAdtVersionable`.
2. **`messageClass`** stubs `activate`, `check`, `readTransport` and versions — **also ADT's
   limits**. Same treatment: those atoms are simply not declared.
3. ~~Does the `readTransport` cluster need a composite?~~ **No.** Those four do not declare
   `IAdtTransportAware`. There is no cluster to name.

This settles the shape of the work, and it is smaller than it looked: **`transport` is the
only handler needing code.** Its `update` and `delete` are stubs that lie — ADT changes a
request's description and deletes an empty one, which `package` proves against the same
server. Everywhere else the fix is subtraction: stop declaring what ADT cannot do.

It also means the per-handler atom lists are now writable without further probing, which is
what the plan was waiting on.

## Related

- 8.0.0 — the release that introduced the atoms and stopped short
- `src/adt/IAdtCapabilities.ts`, `src/adt/IAdtComposites.ts` — the atoms and the two composites this spec extends
