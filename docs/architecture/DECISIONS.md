# Decisions, and why

Every entry here is a choice that could reasonably have gone the other way. The
point is not the choice — it is the reasoning and the evidence, so that whoever
meets the question next can tell a decision from an accident, and can reopen one
without re-deriving it from scratch.

This file exists because that reasoning was scattered across commit messages, PR
bodies and code comments: findable only by someone who already knew what to look
for. Several decisions below were re-litigated more than once for exactly that
reason.

**Adding an entry.** One per decision, in the shape used below, and it starts
from the **problem** — the thing that was actually hit, not the principle it
illustrates. Then what was decided, what it was decided *against*, why, and what
would change it. An entry that cannot name what would overturn it is a
preference, not a decision; an entry that cannot name the problem is a rule
somebody invented.

**Where the evidence lives.** Some of it is not in this repository. This package
is the contract; `@mcp-abap-adt/adt-clients` is the implementation these decisions
were forced by, and several entries cite its files. Those are marked
**[adt-clients]** and linked, so a reader can check the claim rather than take it.
Links are pinned to a commit — a moving link is not evidence.

**Superseding.** Do not delete an entry. Mark it superseded and link to the one
that replaces it: the history of a reversed decision is the most useful part of
it.

---

## 1. The contract is measured, never inferred

**Decided.** A type states what a system was observed to send. Not what the
documentation says, not what the name suggests, not what would be convenient.

**Against.** Filling gaps with plausible values so the type looks complete.

**Why.** A plausible field is indistinguishable, to a consumer, from a measured
one. `ITraceTiming` was `unknown` through two releases rather than carrying four
invented attribute names; when a raw capture arrived it became
`{ time, percentage }` in one release. The cost of waiting was two `unknown`s;
the cost of guessing would have been a contract nobody could trust and no way to
tell which parts to doubt.

**Still visible in the code.** The unit of `ITraceTiming.time` is deliberately
unnamed — the wire gives `243` and says nothing about what 243 is. Calling it
`timeMicros` is a `@ts-expect-error` in the typechecks.

**What would change it.** A measurement.

---

## 2. Absence is stated by omission, never by a negative

**Decided.** A type lists the capabilities that exist. What is missing is
missing.

**Against.** `IAdtNonVersionedObject`, optional members meaning "perhaps", or
methods that throw to say "not supported here".

**Why.** A negative interface has to be kept in sync with the positive one, and
drifts. A throwing method compiles everywhere and fails at runtime in front of a
user. Fifteen handlers once carried methods that refused at runtime what their
types promised; removing them was a breaking release that made the types honest.

**Consequence.** Factory returns are narrowed: `getInclude()` offers create,
read, update, delete, validate, activate, lock — and not versioning, checking or
transports, because nothing measured says a `PROG/I` include has them.

**What would change it.** A capability that genuinely varies *within* one type —
present on one release and absent on the next, with callers needing to ask at
runtime rather than at compile time. Nothing measured behaves that way yet:
where support varies by system, the request simply fails, and the type stays
true.

---

## 3. Capabilities are atoms, composed — not one wide interface

**Decided.** Small interfaces (`IAdtReadable`, `ITraceListing`,
`ITraceReadingWithParser`), combined per object.

**Against.** One `IAdtObject` that every handler implements and that most
handlers partly lie about.

**Why.** `IAdtRunnable` is implemented by an ATC run and a unit-test run as well
as by executors. Putting trace scheduling on it would oblige an ATC run to
answer for trace parameters. Composed in, the capability is stated exactly where
it is true — and a typecheck holds the line: an ATC-shaped runnable compiles with
no scheduling member and stops compiling if scheduling ever migrates upward.

**What would change it.** Enough atoms that a consumer cannot find the one it
needs — composition has a cost, and it is paid in names. If a reader has to
assemble five interfaces to state an ordinary handler, the split has gone too
far and should be collapsed where the pieces are never used apart.

---

## 4. The library speaks ADT; it does not validate

**Decided.** Parsers map documents onto types. They do not judge whether SAP was
entitled to send what it sent.

**Against.** Guarding the wire — checking roots, rows, fields, containers,
values — so a malformed document is refused rather than mapped.

**Why.** The server is the authority on its own responses, and where a check is
genuinely needed ADT has an endpoint for it: [`AdtInclude.validate()`](https://github.com/fr0ster/mcp-abap-adt-clients/blob/8b2b4b5/src/core/include/AdtInclude.ts) **[adt-clients]**
posts to `/includes/validation`. A library that also judges the wire accumulates claims
nobody measured, and each guard invites the next: one [trace parser](https://github.com/fr0ster/mcp-abap-adt-clients/blob/8b2b4b5/src/runtime/traces/traceParsing.ts)
**[adt-clients]** grew six levels of them across eleven review rounds, including a validator that rejected
timestamps RFC 3339 explicitly permits. All of it was removed; the file went from
1020 lines to 343.

**Where the line runs.** If code answers *"was SAP entitled to send this?"* it
does not belong here. If it answers *"what do I do with what arrived?"* it does.
That is why [`compareRecordedAt`](https://github.com/fr0ster/mcp-abap-adt-clients/blob/8b2b4b5/src/runtime/traces/traceParsing.ts)
**[adt-clients]** survived the removal: comparing ISO timestamps
as strings is wrong across UTC offsets regardless of what SAP sends, and
[`latestTraceId()`](https://github.com/fr0ster/mcp-abap-adt-clients/blob/8b2b4b5/src/runtime/traces/ProfilerDomain.ts) **[adt-clients]**
exists precisely to avoid taking a stale trace.

**A 200 with an empty body is a faithful "nothing".** ADT has 404 and it has
error payloads; when it uses neither, relaying emptiness is accurate. The known
hazard around empty reads belongs to the *update* path on editable objects,
where an empty read becomes the basis of a write that erases what was there. It
does not transfer to read-only views.

**What would change it.** A case where a silently mismapped document caused
damage the server could not have prevented — a wrong read becoming the basis of
a write, which is the one shape where emptiness is dangerous. That is why the
*update* path is excluded from this rule rather than covered by it. A second
condition: if ADT were shown to return malformed documents routinely rather than
exceptionally, mapping them faithfully would stop being the honest choice.

**Superseded within itself.** Earlier releases of the trace parser did validate.
This entry records why that was reversed rather than pretending it never
happened.

---

## 5. Big XML is the consumer's to parse

**Decided.** A plain default mapping, plus a way for the consumer to supply its
own reader and keep a type: `ITraceReadingWithParser.readWith()`,
[`AdtRequest.listNodes(parse)`](https://github.com/fr0ster/mcp-abap-adt-clients/blob/8b2b4b5/src/core/transport/AdtRequest.ts)
**[adt-clients]**.

**Against.** Growing filtering and reshaping options on our side; or handing
back a raw response and telling the consumer to go untyped.

**Why.** Searching and filtering belong to the server, which has endpoints for
them. A consumer whose system answers in a shape our default does not fit needs
a type, not an escape hatch.

**Shape note.** `readWith` is a **method** and not an overload on `read`, and
that came from the compiler rather than from taste:
[`listNodes()`](https://github.com/fr0ster/mcp-abap-adt-clients/blob/8b2b4b5/src/core/transport/AdtRequest.ts)
**[adt-clients]** is an overload on a concrete class nobody else implements, while `ITraceReading` is implemented
by consumers, and an overloaded method cannot be satisfied by an object literal.
The typecheck failed the moment it was tried.

**What would change it.** The default mapping failing on a second system. One
consumer needing a different reading is what `readWith` is for; two systems
disagreeing would mean our default encodes one landscape's quirk and should be
replaced by something both fit — or removed, leaving only the caller's reader.

---

## 6. Every returned shape has a name

**Decided.** No anonymous object types in a published contract. `ITraceState`,
`ITraceExecutions` exist even though they are two fields each.

**Against.** Inline `{ value: string; text: string }` where it is used.

**Why.** A contract is implemented by somebody else's class, and after
`implements` there has to be something to write. An anonymous type forces the
consumer to re-declare the same fields in its own code — the duplication this
package exists to remove.

**What would change it.** A shape that is genuinely internal — never returned,
never accepted, never named by a consumer. There are none in this contract
today, and a returned shape is by definition not one.

---

## 7. A run does not promise a trace

**Decided.** `runWithProfiling` returns what it did. It does not return a
`traceId` and does not wait for one.

**Against.** Polling for the trace inside the run and failing when none appears.

**Why.** SAP writes traces asynchronously. When a run returns there may be no
trace, there may never be one, and the caller may legitimately read it a week
later — the feed carries an expiration about four weeks out. The previous
version polled five times and then **threw**, turning the normal case into a
failed run; its fallback took the first id in the feed, and position there is not
age, so it could return a trace from eight days earlier with nothing to say it
had.

**Consequence.** A caller that wants its own trace notes the ids before running
and looks for one that is new. The waiting lives in
[`waitForNewTrace`](https://github.com/fr0ster/mcp-abap-adt-clients/blob/8b2b4b5/src/__tests__/helpers/traceHelpers.ts)
**[adt-clients]**, because only the caller knows how long it is willing to wait.

**What would change it.** ADT offering a synchronous mode that hands back the
trace id with the run, the way the ATC run takes `clientWait`. Then the run
*could* promise one, and refusing to would be the dishonest choice. Worth
re-checking on each release: this is a property of the server, not of the
design.

**Supersedes** the proposal in `#45` to put `latestTraceId()` on the contract:
"newest" is rarely the question, and the id now comes back from `list()` itself.

---

## 8. Codes are strings; only counts are numbers

**Decided.** `client`, `system`, `host` are `string`. `size`, the four
`runtime*`, `amdpFileSize` are `number`.

**Against.** Typing anything numeric-looking as a number.

**Why.** A SAP client is `010`, an instance is `00`, and `Number('010')`
destroys the leading zero irreversibly. The test that pins `client` exists
because a number is the obvious wrong choice.

**What would change it.** A field measured to be a genuine count that this rule
typed as a string out of caution. The test is per field, not blanket, precisely
so a mistake in one direction is visible.

---

## 9. Green is not proof

**Decided.** A new test is run **red** against the old behaviour before it is
believed, and exit codes are read directly rather than through a pipe.

**Why.** `npm run build 2>&1 | tail -1` exits with the status of `tail`, so a
failing build reported success — that shipped once. And a test can be sensitive
and still assert the wrong thing: one written here pinned a bug as correct while
its own comment called it a defect. Running it red proves sensitivity; reading
what it asserts proves direction. Both are needed.

**Consequence for parsers.** Compile-time proof does not reach a round trip. The
fourteen fields of `IAbapTraceEntry` are required by the type and unchecked at
runtime, so [`scripts/print-trace-entry.ts`](https://github.com/fr0ster/mcp-abap-adt-clients/blob/8b2b4b5/scripts/print-trace-entry.ts)
**[adt-clients]** reads a live feed and names anything that came back `undefined` — because a field the wire omits arrives as `undefined`
despite the type.

**What would change it.** A harness that proves sensitivity on its own —
mutation testing, or a gate that fails a test which passes against both the old
and the new behaviour. Running each test red by hand is a stand-in for that, not
a preference; automate it and this entry becomes redundant.

---

## 10. A guard that can be silenced is not a guard

**Decided.** Tools live under the same compiler as the code. In
`@mcp-abap-adt/adt-clients` that means `scripts/**/*` in both
[`tsconfig.test.json`](https://github.com/fr0ster/mcp-abap-adt-clients/blob/8b2b4b5/tsconfig.test.json) and
[`tsconfig.test.integration.json`](https://github.com/fr0ster/mcp-abap-adt-clients/blob/8b2b4b5/tsconfig.test.integration.json)
**[adt-clients]**; this package has no scripts directory, and the rule is recorded
here because it is the same one that puts `__typechecks__` under `tsc` rather
than beside it.

**Against.** Adding files to the config one at a time, and reaching for
`as any` when a signature changes.

**Why.** Two renames — `adtType` → `type`, `is_package` → `isPackage` — went
unnoticed because nothing compiled the scripts, so at runtime they read
`undefined` and printed every package entry as a non-package: confidently, and in
silence. A tool that fails is better than one that lies. And when the scripts
were finally put under the compiler, four `(connection as any).reset()` calls
survived it — the cast telling the compiler to stop looking at precisely the API
that had been removed.

**What would change it.** A genuinely untyped boundary — a third-party module
with no declarations, or a deliberate runtime probe of a shape the compiler
cannot know. Then the escape is legitimate, and the rule becomes: name it, scope
it to one expression, and say in a comment what is being asserted and why the
compiler cannot check it. A bare `as any` on a typed object of ours stays
forbidden.

---

## 11. A member is added because someone needs it, not because a sibling has one

**The problem.** `readWith` gives a consumer its own reader for a trace view.
A proposal followed to add `listWith`, giving it its own reader for the listing
— on the grounds that the contract was "lopsided" without it.

**Decided.** No `listWith`. The proposal was reverted before it shipped.

**Against.** Completing a pattern for its own sake.

**Why.** The two cases are not alike, and one look at the sizes says so: a view
is 473 rows of hit list, 1801 statements, 1.3MB, with nested program references
— a system that structures that differently is imaginable. A listing is an id
and a few identifying fields: fourteen of them, measured on two systems that
agreed. There is nothing there to parse differently.

Symmetry is not a requirement. It is pattern-matching that looks like design,
and it costs every implementer of the contract a member to write.

**The reasoning that made it look justified, which is the part worth keeping.**
The evidence offered was
[`listTraceFilesResponse()`](https://github.com/fr0ster/mcp-abap-adt-clients/blob/8b2b4b5/src/runtime/traces/ProfilerDomain.ts)
**[adt-clients]** on the concrete `Profiler` — "the need is real, the
implementation already has it". That
method was added in `22.0.0` as a fallback when `list()` began returning parsed
entries, by the same hand that then cited it, and it has no callers outside its
own class. Inventing something and later quoting its existence as a requirement
is circular, and it is hard to see from inside: the artefact is genuinely there.

**How to catch it.** Ask who calls the thing. Zero callers outside the code that
declares it is not evidence of demand — it is evidence of an unused method.

**What would change it.** A consumer showing a system whose trace feed does not
fit `IAbapTraceEntry`. Then the listing has the same problem the views have, and
the same answer.

---

## 12. A factory returns a contract, never the class that satisfies it

**The problem.** `AdtClient` in `@mcp-abap-adt/adt-clients` has 38 factories.
Thirty-six return interfaces; two return the implementation itself —
`getRequest(): AdtRequest` and `getUtils(): AdtUtils`. Which kind a factory got
was an accident of when it was written.

**Decided.** A factory's declared return is a contract. `IAdtRequest` lands in
26.1.0; the atoms `getUtils()` will return land in 26.2.0 as `IAdtUtilities`,
and the factory itself changes when `@mcp-abap-adt/adt-clients` consumes them.

**Against.** Leaving the two as they are on the grounds that the class *is* the
contract in practice, and a consumer can read it.

**Why.** Three things a consumer can do with a contract and cannot do with a
class, and the third is the one that decided it:

- **Substitute.** Their own transport handler cannot stand in where the type
  names a class. This package exists so any part of the implementation can be
  replaced with their own; a concrete return is the one place that promise does
  not hold.
- **Compose.** They cannot intersect the return with their own types, because
  there is no interface to intersect with.
- **Be enforced by the compiler.** With a contract as the return type, the class
  must satisfy it *at the factory*, or the package does not build. Removing
  `list()` from `AdtRequest` gives
  `AdtClient.ts: Property 'list' is missing in type 'AdtRequest' but required in
  type 'IAdtRequest'` **[adt-clients]**. With the class as the return type the
  same removal is caught only by whatever happens to call the method — two errors
  inside the transport module itself, none at the factory. Had no internal caller
  existed, the method could have disappeared and the build stayed green while
  consumers silently lost it.

That last point is why this is not cosmetic: the contract is the only thing that
makes "this handler still offers what it offered" a question the compiler asks.

**A correction, kept because the wrong reason is instructive.** The first version
of this entry claimed the capability guard in `src/__tests__/unit/capabilities/`
**[adt-clients]** was blind to the two concrete returns — "a comparison between a
thing and itself". That is false, and one experiment settles it: planting a
capability the handler does not have makes the guard fail *identically* whether
the factory returns the class or the contract, because its check is structural
and a class satisfies an atom the same way an interface does. The guard was
never silent. The argument for this decision is compiler enforcement at the
factory, which the guard does not do and was never meant to.

**What the interface is not.** Not "every public member of the class". It is
`IAdtCrud` with the transport's own config and state, plus the two methods
nothing else has. No atom was invented for a set of one — see decision 11.

**Not covered by 26.1.0, and stated rather than quietly skipped.**
`getUtils()`. One interface with 35 members would satisfy the letter of this
decision and contradict decision 11 in the same stroke. Answered in 26.2.0 by
seven atoms split along ADT's own resource families — and the decomposition
removed nine of the 34 members on the way, six of them because nothing
anywhere called them. The factory stays concrete until adt-clients consumes
the atoms: this decision is satisfied for `getRequest()` and pending for
`getUtils()`.

**How to catch it.** A factory whose return type is not an `I`-prefixed name.

**What would change it.** Nothing for the returns themselves. The *shape* of a
contract is open: where a set of atoms is used by one handler it is spelled at
the getter, and earns a name when a second handler wants the same set.

---

## 13. What a method hands back is named by a contract, never by an implementation

Decision 12 for return types of factories; this is the same rule for the results
of every other method.

**Decided.** It does not matter what concrete type an implementation returns, as
long as it satisfies the contract the caller was promised. `Promise<T>` is a
promise about `T`, and `T` is what the consumer holds — so `T` is a contract.

**Against.** `Promise<IAdtResponse>` as a result. It names the transport
envelope, which every method could name, and tells the consumer only that a
request happened.

**The problem.** `IAdtUtilities` has 31 members. Eight resolve to a contract; 23
resolve to the envelope.

**Why.** A consumer decides what to do next from the type it was handed. If that
type is the envelope, the decision is made by reading the implementation instead
— which is the coupling a contract exists to remove, and the same coupling
decision 12 removed at the factory.

**Where `T` comes from.** Measured. Decision 1 forbids inventing it, and nothing
else supplies it.

**A strategy is not a result contract, and they are different planes.** Decision 5
lets a consumer pass a parser where the implementation *deliberately delegates the
choice* — a large XML whose shape is not ours to fix. That is strategy injection:
the caller decides how the document is read.

It does not answer this decision, and using it to try was the mistake that
produced this paragraph. Handing the caller a parser makes the caller decide what
comes back, which is the opposite of a contract: the point of returning one is
that the consumer is **not** rewritten when the implementation changes. A
consumer who wants different behaviour imports a different implementation; it
does not describe the result at the call site.

Concretely: an attempt to close 23 envelope-returning members by giving each a
`<T>(parse, …)` overload compiled, and immediately cost every implementer two
signatures per method — the cost decision 11 exists to refuse. The two planes
compose (a method can return a contract *and* take a strategy) but neither
substitutes for the other.

**The envelope is a container for everything, which is the deeper fault.**
`IAdtResponse<T = any>` defaults its body to `any`. Counted: **180** uses in this
package name no type argument against **4** that do, and in
`@mcp-abap-adt/adt-clients` it is **1121 against 5**. The generic exists and is
not used, so every method sharing this return shares one type — apples and
oranges in one container, and no consumer can tell them apart.

And it is not the wire that does this. Of the 180 here, **one** is in
`connection/`, where an envelope belongs. The other 179 are in contracts: 48 in
`adt/`, 81 in `runtime/`, of which `IDebugger` alone accounts for 40. The
envelope leaked into the contracts almost in its entirety.

So this decision is not about `IAdtUtilities`' twelve. Counted with the parser
rather than estimated: **94 method signatures** in this package return exactly
`Promise<IAdtResponse>`, against **139** that name a result. The twelve are where
the counting started, and they are an eighth of it.

Where the 94 sit matters more than the total, because it says what closing them
would take:

| interface | members answering the envelope |
|---|---|
| `IAbapDebugger` | 25 |
| `IAdtServiceBinding` | 15 |
| `IAmdpDebugger` | 14 |
| `IMemorySnapshots` | 9 |
| `IAdtUtilities` atoms | 12 across seven |
| everything else | 19, in ones and twos |

Three interfaces hold half of it, and 48 of those 94 are the debugger — which is
[deliberately out of scope](#idebugger-is-not-a-design-problem-yet) until its own
shape is settled. The long tail is where this rule is cheap to apply; the
concentrations are where it is a redesign wearing a return type.

**How to catch it.** `Promise<IAdtResponse>` in a published contract, or
`IAdtResponse` written without a type argument anywhere it is a *result* rather
than a transport frame. Correct only where the answer genuinely is the envelope —
a status with no body worth naming — and that should be said at the member.

**A contract names an essence, not a method.** This is what stops the rule from
meaning "94 new types". A contract differs from a concrete class by saying *how
to work with the thing*, and two methods return the **same** contract when their
results mean the same. `IAdtObjectHit` already works that way here: `search`,
`getWhereUsedList`, `getPackageContentsList` and `getPackageHierarchy` all answer
"an identified object in the repository", through types that extend it.

So the question at each member is not "what shall I call this one" but "which
essence is this". A heap of one-method result types would be the same mistake as
the envelope with the sign reversed: instead of everything meaning one thing,
nothing would mean the same as anything.

**The test for whether two things are the same contract: substitution.**
Implementations of one contract are interchangeable — a caller holding the
contract can be handed either and carry on. If the logic forbids putting one
where the other is expected, they implement **different contracts, even with
identical methods**.

TypeScript will not tell you this. Structural typing says two classes with the
same members satisfy the same interface, and it is right about the shape and
silent about the meaning. `AdtRequestLegacy` **[adt-clients]** has every method
`AdtRequest` has — by inheritance — and refuses four of them; the compiler was
content for years. They are not implementations of one contract, and decision 11
is the consequence.

The same test decides result grouping. Two methods return one contract when a
caller could take either answer and do the same thing with it. Where that is not
true, the shared name would be a lie that reads as economy — so the question
"which essence is this" is answered by trying the substitution, not by the
members lining up.

**What would change it.** Nothing about the rule. The members close one at a
time, each on evidence, and each closure is a member that stops meaning the same
thing as every other.

### IDebugger is not a design problem yet

48 of the 94 envelope members are `IAbapDebugger` and `IAmdpDebugger`, which
makes them look like the obvious place to start. They are excluded on purpose.

The debugger has architectural problems below the level a return type can reach,
and an interface is a statement about a design that has settled. Naming results
for it now would fix the current shape in a contract and make the redesign a
breaking change — paying the price of a decision before making it. The envelope
here is a symptom, and the counts above keep it visible without treating it as
the next task.

**What would change it.** The debugger's own design being settled. Until then it
is counted and left alone.

## 14. The envelope's type parameter is transport pass-through, not a strategy receiver

**The question.** `IAdtResponse<T = any, D = any>` has a generic. Decision 13
says the envelope loses the caller's type; decision 5 says a consumer supplies
the parser for big XML. Is the generic the seam where those meet — the place a
consumer's parsed type lands — or is it something else?

**Measured, because nothing recorded it.** Every use of `IAdtResponse` *with* a
type argument, in both packages, is on the transport call:

```ts
makeAdtRequest<T = unknown, D = unknown>(req): Promise<IAdtResponse<T, D>>;
```

`T` and `D` there are the method's own parameters, passed straight through.
Outside those signatures nobody writes a concrete argument, and **no call site
supplies `T`** — so it resolves to its default at every one. The generic exists
and has never carried a type.

The strategy plane looks nothing like it:

```ts
listNodes<T>(parse: (data: unknown) => T, options?): Promise<T>;
readWith<K extends keyof TViews, T>(view: K, parse: (data: unknown) => T): Promise<T>;
```

`Promise<T>`, bare. But the returned type is the *consequence*, not the point,
and stating the difference in terms of types is what kept this confusing:

> **The envelope is variation in the result. A strategy is the consumer's choice
> about behaviour that we implement.**

A strategy parameter does not ask the consumer for a type — it asks which of the
behaviours we provide should run. `listNodes(parse)` still fetches, still handles
the session, still decides the request; the one thing it delegates is what to do
with a document too large for us to name a shape for. `T` falls out of that
choice. The consumer supplies a decision, we supply the work.

That is why `IAdtResponse<T>` cannot be the seam. The envelope varies what comes
*back*; a strategy varies what we *do*. Parameterising the frame would let a
caller declare an expected type without changing any behaviour — a claim about
the result with nothing behind it, which is worse than the untyped envelope,
because the untyped one at least does not pretend.

**Decided.** The generic is transport pass-through. `IAdtResponse` is the HTTP
frame — status, headers, body — and belongs at the connection boundary, which is
where exactly one of this package's 180 uses sits.

Three planes, and the generic is only on the first:

| plane | what varies | who decides |
|---|---|---|
| transport frame — `IAdtResponse` | nothing; it is the same frame every time | neither; it is what HTTP is |
| result contract — decision 13 | the result | the implementation, within what the contract promises |
| strategy — decision 5 | the behaviour | the consumer, choosing; we implement it |

The envelope is not a weak result contract, and a strategy is not a way to
supply one. Confusing the last two cost 23 methods a second signature each
before it was reverted.

**Against.** Making the generic the result mechanism —
`getPackageHierarchy(): Promise<IAdtResponse<IPackageHierarchyNode>>` — would
close decision 13's gap without new types. Rejected: the caller then unwraps
`.data` on every call to reach a thing the method already knows, and inherits
`status`, `headers`, `config` and `request` in a signature about a package tree.
A result contract states the result; the transport frame is the connection's
business, and a consumer of a handler should not have to know a request was HTTP.

**How to catch it.** `IAdtResponse<Something>` in a handler contract, where
`Something` is a concrete type rather than the surrounding method's parameter.
That is the envelope being used as a result type through the back door.

**What would change it.** A capability where the caller genuinely needs the
status or headers *and* the body typed together — a conditional GET exposing an
ETag, say. That is a result contract with those fields named, not the transport
frame promoted.

**The cost of finding this out by measurement.** This decision is reconstructed
from silence: the generic's absence of use tells us it is not load-bearing, and
tells us nothing about what it was *for*. Strategy seam, consumer extension
point, or a shape inherited from an HTTP client and never questioned — whoever
added it knew, and nobody wrote it down. Measurement recovers what the code
does. Only a record recovers what it was meant to do, and the gap between those
two is exactly the work of guessing that this file exists to make unnecessary.

## 15. The response contract is an answer from ADT, not an HTTP response

**The question.** `IAdtResponse` carries `status`, `statusText`, `headers`,
`config` and `request`. Those are HTTP words, and two of them are `axios`'s own.
What happens when the transport is not HTTP?

**Measured.** RFC already is that case, and it does not break — but not for the
reason the shape suggests. `SADT_REST_RFC_ENDPOINT`, the FM Eclipse uses for
on-prem ADT through JCo, carries `STATUS_LINE`, `HEADER_FIELDS` and
`MESSAGE_BODY`: a request line, headers and a body, an HTTP exchange in all but
the wire. `RfcTransport` translates rather than fabricates, and translating is
the whole of its job.

The connector's own seam already states this correctly:

```ts
export interface IAdtTransportResponse {
  status: number;
  statusText?: string;
  /** a transport names its own header container; HTTP has axios's,
      RFC builds one out of HEADER_FIELDS. */
  headers: unknown;
  data: unknown;
}
```

`headers: unknown` — because the container is the transport's business. The
contract one layer up did not follow: it fixes `Record<string, IAdtHeaderValue>`
with `location`, `content-location` and `sap-adt-location` named in it, plus
`config?: D` and `request?: unknown`, which exist because `axios` has them.
Counted across the three packages: `request` is read **0** times, `config`
**once**, `statusText` 16 times, and `sap-adt-location` twice — the ADT-specific
key earns its place; the HTTP-client ones do not.

**Decided.** What the contract names is *an answer from the ADT server*: an
outcome, whatever the transport calls its metadata, and a body. A transport that
is not HTTP satisfies it by saying what it has, not by inventing an HTTP frame to
put it in. What an implementation actually returns is its own affair as long as
the contract is met — that is the whole point of naming one.

`status` stays, because ADT genuinely answers with one over both transports. The
axios fields do not belong in a contract, and the header container is the
transport's to name.

**The hole this exposes, and it is real.** On BASIS < 7.50 the RFC endpoint
answers without populating `STATUS_LINE`. `RfcTransport` reads a code out of the
exception XML when the body has one, and otherwise:

```ts
if (!status) { status = 200; statusText = statusText || 'OK'; }
```

That 200 means "no evidence of failure was found", not "the server said 200", and
**a consumer holding the response cannot tell those apart**. The fallback is
right to exist — the alternative is a legacy system where every call looks
broken — but the contract gives it nowhere to say so, because a bare `number`
cannot carry "this was not reported". Naming the outcome instead of the HTTP
status is what would let it.

**Against.** Leaving it, on the grounds that RFC already works and the shape has
not hurt anyone. Rejected on what the shape *obliges*: every contract returning
`Promise<IAdtResponse>` requires each implementation to produce an HTTP-shaped
answer, so a genuinely non-HTTP transport must fake fields to compile. That is
the same fault as decision 13's envelope, one layer down — a contract stating the
mechanism instead of the meaning.

**How to catch it.** An `axios` concept in a published contract. A header key
named in a type that is not ADT's own. Any field whose honest value for some
transport would have to be invented.

**What would change it.** Nothing about the rule. The shape changes when the
consumers of `config` (one) and the header keys are given contract-shaped
replacements — this is a breaking change to the most widely used type in the
package, and it is written down here before it is scheduled rather than after.
