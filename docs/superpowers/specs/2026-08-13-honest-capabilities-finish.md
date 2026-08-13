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

The counts below are **throw-detected only** — they come from looking for
`throw ... not supported` and `throwUnsupportedVersions`, and are therefore a floor. Two
handlers have more problem methods than their number shows: `transport` ten (nine plus the
no-op `validate`), `unitTest` ten (eight plus the no-op `readTransport` plus the mock
`validate`). See "Stubs that do not throw".

| symptom | modules |
|---|---|
| clean | 19 |
| stubs `getVersions`/`getVersionSource` | **10** — `dataElement`, `domain`, `functionGroup`, `messageClass`, `authorizationField`, `featureToggle`, `package`, `AdtServiceBinding`, `transport`, `unitTest` |
| stubs `readTransport` | 4 — `messageClass`, `authorizationField`, `featureToggle`, `functionInclude` |
| stubs more than versions and `readTransport` | 4 — `transport` 9, `unitTest` 8, `messageClass` 5, `AdtServiceBinding` 4 |

**11 of 30 handlers carry at least one stub.** Ten need their **type narrowed** — they declare
atoms ADT does not support. The eleventh, `unitTest`, needs **behaviour implemented**: its
shape is already narrow, but it declares `IAdtValidatable` over a validate that returns what
its own comment calls a mock, so it overclaims too — just not by declaring too many atoms. A caller reading the type
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
Real: `create`, `read`, `readMetadata`, `list`, `listNodes`. `validate` is a no-op — it checks an argument and returns an empty state, and is deleted rather than implemented (see below).
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

That is the pattern. It needs no name of its own and it reads as what the handler can do.

It does **not** protect the truth on its own: a stub satisfies a structural interface
perfectly — a `delete` that throws has exactly the signature `IAdtDeletable` asks for. The
compiler guards the *shape*; only a behavioural test guards the *behaviour*. That is precisely
how the present eleven arose, and why the guard below is not optional.

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
  "types narrowed".

  **An earlier draft offered an alternative — keep the throwing method, remove it only from the
  contract — for the friendlier message. It is withdrawn: it cannot coexist with the guard.**
  A public throwing method structurally satisfies its atom, so the bidirectional check would
  force the manifest to claim the capability, and the behaviour test would then fail on the
  throw. Keeping the better error message would mean giving up the mechanism that stops this
  recurring. The methods go.

- **No change to any supported ADT operation** — every one that works today keeps working, and
  `transport` gains two. What does change is *failure* behaviour on the removed methods, as
  described immediately above. Those are different claims and an earlier draft ran them
  together.
- **Not `IAdtDeletable` alone.** Shipping only the atom would remove one stub of the eleven
  cases' many and leave the rest declaring what they cannot do.

## Order of work

1. **Code, with tests — two handlers, independent of everything below and shippable on their
   own:**
   - `transport.update` / `transport.delete` — description change, and deletion of an empty
     request;
   - `unitTest.validate` — real class-name validation, as `AdtClass` does, replacing the
     self-declared mock.

   `transport.validate` is **deleted** rather than implemented: the request number is
   system-generated, so there is nothing to validate.
2. **Atoms** in `@mcp-abap-adt/interfaces`: `IAdtUpdatable`, `IAdtDeletable`,
   `IAdtModifiable` as their composite. Additive — a minor.
3. ~~Composites.~~ **Removed** — this design adds none. See "No new composites" above.
4. **Publish interfaces**, then narrow the **ten** overclaiming handlers in adt-clients, each
   to the exact intersection of atoms it satisfies — not to a composite. `unitTest` is not among them — it is already narrow.
   **Breaking** for a consumer that named a wide type — a major.
5. Delete each stub as its handler stops declaring the method — and for `unitTest`, delete the
   **nine** that were never declared: the eight that throw, plus `readTransport`, which does
   not throw at all (see "Stubs that do not throw" below). `transport.validate` goes here too.

   **This step must complete before the shape guard is switched on**, for the reason given
   under check 1: TypeScript reads shape, not intent, so an undeclared method still satisfies
   its atom. See the runtime-break note above before doing this: for an
   operation that is genuinely impossible, consider keeping the throwing method while removing
   it from the contract, so a JavaScript caller still gets a sentence instead of a `TypeError`.

Step 2 is the interfaces release. Step 4 is one adt-clients major.

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

So the guard test cannot be a grep over source. It has to assert **the semantics each atom
promises**, against a recording connection — which is not the same as "a request goes out",
since some capabilities legitimately make none. The next section works that out; this class of
stub is the one that produced `{"success": true, "count": 0}` over 55 real transport requests,
and it is the class a grep cannot see.

## How this is verified

Three earlier attempts at this section were wrong, each in an instructive way:

- **grep for `throw ... not supported`** — `unitTest.readTransport()` disproves it: no throw,
  returns an empty state, equally dishonest.
- **"every declared method issues a request"** — `IAdtTestRunnable.getRunId()`,
  `getStatusResponse()` and `getResultResponse()` are state accessors that correctly touch no
  network, and a local `validate()` can be a real capability with no endpoint.
- **reflect over the classes to discover their atoms** — impossible. `implements`,
  intersections and type aliases are erased at compile time; nothing at runtime can say which
  atoms a class declared.

### The manifest is the source, and three checks defend it

```ts
// src/__tests__/unit/capabilities/manifest.ts  (adt-clients)
export const HANDLER_CAPABILITIES = {
  AdtClass: ['creatable', 'readable', 'updatable', 'deletable', 'validatable',
             'checkable', 'activatable', 'lockable', 'versionable', 'transportAware'],
  AdtRequest: ['creatable', 'readable', 'updatable', 'deletable'],   // no validatable
  AdtServiceBinding: ['creatable', 'readable', 'updatable', 'deletable', 'validatable',
                      'checkable', 'activatable', 'transportAware'],
  // … one entry per exported handler
} as const satisfies Record<string, readonly Capability[]>;
```

**1. Shape — compile time, and it must be BIDIRECTIONAL.**

A one-way assertion "the class satisfies what the manifest claims" is not enough, and permits
exactly the regression this guard exists to stop: a class declares `IAdtDeletable`, its
`delete` throws, and the manifest simply omits `deletable`. All three checks pass while the
public contract overclaims. Under-claiming is not the safe direction — it is a hiding place.

So the assertion runs both ways: **the manifest names an atom if and only if the class's public
type structurally satisfies it.**

```ts
type Has<C, A> = C extends A ? true : false;
type Claims<H extends keyof typeof HANDLER_CAPABILITIES, A extends Capability> =
  A extends (typeof HANDLER_CAPABILITIES)[H][number] ? true : false;

// One line per handler × atom. Both directions in one equality.
type _AdtRequestDeletable =
  Assert<Equals<Has<AdtRequest, IAdtDeletable<ITransportConfig, ITransportState>>,
                Claims<'AdtRequest', 'deletable'>>>;
```

This only works once step 5 has deleted the undeclared stubs — while `AdtUnitTest` still
carries a `delete` method it never declared, it satisfies `IAdtDeletable` structurally.
TypeScript sees shape, not intent. **Order matters: delete the dead methods first, then this
check becomes meaningful.** Until then it would demand the manifest claim capabilities the
handler was never meant to have.

**2. Completeness — runtime, and this part reflection *can* do.** Enumerate the package's
exported classes — values, not types, so they survive compilation — and fail on any handler
absent from the manifest. This is what stops a new object type, copied from an existing one,
from arriving unchecked; that is how the current eleven appeared.

**3. Behaviour — runtime, driven by the manifest.** For each handler, for each atom it claims,
assert that atom's own semantics against a recording connection:

| atom | asserted of every handler claiming it |
|---|---|
| `IAdtCreatable` | `create` issues a POST to the object's collection |
| `IAdtReadable` | `read` issues a GET and returns the body; `readMetadata` likewise |
| `IAdtUpdatable` | `update` issues a PUT |
| `IAdtDeletable` | `delete` issues a DELETE |
| `IAdtValidatable` | `validate` either issues a request **or** returns a decision it computed — never an empty state with no decision in it |
| `IAdtCheckable` | `check` issues a request and reports what came back |
| `IAdtActivatable` | `activate` issues a POST to the activation resource |
| `IAdtLockable` | `lock` returns a handle the server supplied; `unlock` issues a request releasing it |
| `IAdtVersionable` | `getVersions` issues a GET and parses a feed; `getVersionSource` fetches a version's body |
| `IAdtTransportAware` | `readTransport` reports a request the server named |
| `IAdtTestRunnable` | `run` issues a POST; `getStatus` and `getResult` each issue a GET and report what came back; `getRunId`/`getStatusResponse`/`getResultResponse` return prior state **without** a request |

Every method of an atom is covered, not one per atom — `readMetadata`, `unlock` and
`getVersionSource` are exactly where stubs hid before.

`IAdtValidatable` was the awkward one. **Both cases are now decided, and oppositely** — which
is what a test can force but never settle:

- **`transport` does not get the atom at all.** A transport request's number is generated by
  the system, so there is nothing to validate before creating one. `AdtRequest.validate()` is
  deleted, and `IAdtValidatable` leaves its list.
- **`unitTest` keeps the atom and gets code.** A unit test *is* a class, so validation there is
  a class's validation. `AdtUnitTest.validate()` currently checks an argument and returns what
  its own comment calls "a mock success response" — a stub that admits itself. `AdtClass`
  shows what it should do: call the real name validation against the server.

For reference, the three as they stand:

```
class.validate      calls validateClassName against the server   real
transport.validate  argument check, then an empty state          nothing to validate
unitTest.validate   argument check, then a "mock success"        stub
```

**What none of the three catches:** an atom nobody has thought of. The manifest and the
behaviour table enumerate the atoms that exist; a capability with no atom is invisible to all
three, and always will be. That is the limit of the design, and it is stated rather than
hidden.

## Open questions — closed 2026-08-13

The maintainer answered both: **these are ADT's limits, not unimplemented features.**

1. **`AdtServiceBinding`** (not `AdtServiceDefinition`, which is clean) stubs `lock`/`unlock`
   and versions — **ADT does not offer them**. So they leave the atom list; there is no code
   to write. It declares neither `IAdtLockable` nor `IAdtVersionable`.
2. **`messageClass`** stubs `activate`, `check`, `readTransport` and versions — **also ADT's
   limits**. Same treatment: those atoms are simply not declared.
3. ~~Does the `readTransport` cluster need a composite?~~ **No.** Those four do not declare
   `IAdtTransportAware`. There is no cluster to name.

This settles the shape of the work: **two handlers need code, the rest need subtraction.** `transport`'s `update` and `delete` are stubs that lie — ADT changes a request's description
and deletes an empty one, which `package` proves against the same server. And
`unitTest.validate()` returns a self-declared mock where a class's real validation belongs.
Everywhere else the fix is subtraction: stop declaring what ADT cannot do.

It also means the per-handler atom lists are now writable without further probing, which is
what the plan was waiting on.

## Related

- 8.0.0 — the release that introduced the atoms and stopped short
- `src/adt/IAdtCapabilities.ts`, `src/adt/IAdtComposites.ts` — the atoms and the two composites this spec extends
