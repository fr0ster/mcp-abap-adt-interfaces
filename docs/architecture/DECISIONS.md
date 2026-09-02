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

**The problem.** `IAdtUtilities` had 31 members when this was written — eight
resolving to a contract, 23 to the envelope. It ships with **25**, of which
**13** state a result and **12** answer the envelope: two were closed from
evidence, three were envelope leaks whose contract-shaped sibling already
existed, and six were removed outright because nothing anywhere called them.

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

Concretely: an attempt to close the 23 envelope-returning members the file then
had, by giving each a `<T>(parse, …)` overload, compiled, and immediately cost every implementer two
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
supply one. Confusing the last two cost 23 methods — every envelope-returning
member `IAdtUtilities` had at the time — a second signature each, before it was
reverted.

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

**Open, and deliberately not settled here.** Legacy systems answer differently —
the empty `STATUS_LINE` is the one instance already in the code, and it is not
assumed to be the only one. What legacy actually sends has not been captured, and
capturing it needs an on-prem system this machine cannot reach. Until then the
shape of that difference is unknown, and a contract is not written against an
unknown (decision 1).

One live option is that legacy gets its **own implementation** rather than a
fallback inside the shared one. That would put the invented 200 where it belongs
— in a transport that says it is speaking to a system that does not report status
— and leave the general contract free of a value that means "nobody told us". It
would also fit what already exists: `LegacyOnPremHttpTransport` and
`AdtUtilsLegacy` are the same answer to the same kind of problem. Which way it
goes is decided after the capture, not before.

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

## 16. One endpoint is one contract member

**The problem.** `AdtUtils` had two members over
`/repository/informationsystem/search`: `searchObjects`, answering the envelope,
and `search`, answering `ISearchResult[]`. The same request, twice, distinguished
only by how much of the answer the caller was given.

Decision 13's substitution test appears to say they are different contracts — a
caller holding `search`'s array cannot do what `mcp-abap-adt` does with
`searchObjects`' response, which is read `status`, take `data` and hand the ADT
document on. By that reading the pair should stay.

**Decided.** It should not. **One endpoint is one contract member**, at least at
the level this package describes. Substitution decides whether two *results*
mean the same thing; it does not license two members for one request. A second
member over one endpoint is not a second essence — it is the same essence at two
levels of doneness, and which level a caller gets stops being a property of the
contract and becomes a property of which method they happened to call.

The cost of the alternative is what settles it. Two members per endpoint doubles
the surface every implementation must provide (decision 11), and the second one
is always the envelope — so "the raw variant" becomes the standing excuse for
decision 13's gap never closing: every member could have one, and any member that
does need never name its result.

**How the raw document is still reached.** By a strategy, not a second member.
Wanting the document rather than the parsed hits is a choice about *behaviour*,
and behaviour the implementation still performs — it issues the same request,
handles the same session, and hands the caller the answer to read. That is
decision 5's shape exactly (`listNodes(parse)`, `readWith`), and decision 14's
line: the consumer chooses among behaviours we implement.

What this is not: a licence to give every member a parse overload. That was tried
across 23 members and reverted — it cost every implementer a second signature and
moved the result's meaning from the contract to the call site. A strategy is
added where a document is genuinely too large or too variable to name (decision
5), on that member, for that reason.

**Against.** Keeping both, on the grounds that a consumer already depends on the
raw one. Real — `mcp-abap-adt` calls `searchObjects` in three places and passes
the XML to a language model. But that is an argument about migration order, not
about the contract; the consumer's need is served by a strategy on the one
member, and it is served better, because today it reads `response.data` and
guesses at the shape with no contract at all.

**How to catch it.** Two members whose implementations issue the same request. If
the difference between them is how far the answer was parsed, it is one member
and possibly a strategy.

**What would change it.** An endpoint whose responses genuinely mean different
things by parameter rather than by parsing — the same URL serving two resources.
Then the split is by essence and decision 13 applies to each half separately.

## 17. A contract takes what the endpoint takes; what builds that is the implementation's

**The problem.** `IAdtUtilities` carried `getWhereUsedList(IGetWhereUsedListParams)`
— `object_name`, `object_type`, `enableAllTypes`, `enableOnlyTypes`,
`disableTypes`, `includeRawXml`. Beside it on the class sat
`getWhereUsed(IGetWhereUsedParams)` — `object_name`, `object_type`, `scopeXml`.
Two members, one endpoint, and I recorded the difference as a **gap in the
contract**: a caller running the two-step flow had nowhere to hand back the scope
document they had fetched and edited.

That diagnosis was wrong, and measuring the request says why.

**Measured.** `/repository/informationsystem/usageReferences` receives exactly
two things: `?uri=`, built from the object's name and type, and a request body
carrying an optional `<scope>` element taken from a scope document. That is all.

`enableAllTypes`, `enableOnlyTypes` and `disableTypes` **never reach the wire**.
They are instructions to the client: fetch the scope sub-resource, edit the
selections, and put the result in that same `<scope>` element. They are a way of
*producing* the one parameter the endpoint takes.

**Decided.** A contract's parameters are what the endpoint needs, in the form it
needs them. Parameters that exist to *derive* those belong to an implementation,
which is free to offer them, and free not to.

So the contract takes `scopeXml`. An implementation that also accepts
"enable all types" and builds the scope itself is a good implementation; one that
requires the caller to build it is a lesser one; **both satisfy the contract**,
which is the test. How a scope was arrived at is not the caller's guarantee — the
guarantee is that a scope, however obtained, produces that search.

**And this is what collapses two members into one.** The remaining difference
between them was the *result*: one handed back the document, the other a parsed
list. That is a strategy — the consumer choosing among behaviours the
implementation performs (decision 14) — not a second capability.

**Which way round, and this took a wrong turn first.** A member returns **the
contract**; a strategy is how a choice is delegated. So the default is
`IWhereUsedListResult`, and a caller wanting the document passes a parser —
exactly the shape `search` already shipped in 26.3.0. The first attempt at this
decision inverted it, making the envelope the default and the contract something
you had to ask for, which is the envelope reinstated under a new name.

**What a strategy is for, stated plainly, because it decides where one belongs.**
It solves the *volume* of the answer. A where-used run on a common object, a
search across a namespace, a package tree — these documents are large, their size
is not knowable in advance, and how much of one a caller needs is a question only
the caller can answer. A strategy lets them take what they need instead of the
library guessing on their behalf, or handing over megabytes so they can discard
most of it. That is the test for adding one: an answer whose size the caller must
be able to control. Not "someone might want it differently".

**And a strategy must never mask an error from the SAP system.** This one is
easy to get wrong while looking right. Handing the parser an `<exc:exception>`
document seems faithful — nothing was withheld — but a parser looking for hits
finds none in a refusal and answers "nothing found". The caller is then told a
fact where the server said no, and the strategy is where it happened.

So a refusal is raised **before** the strategy runs, and a parser only ever sees
an answer. `@mcp-abap-adt/adt-clients` does this in `search`, and a unit test
asserts the parser is not called at all — the assertion is on the *absence of the
call*, because a test that only checked the throw would pass while the parser ran
first and produced whatever it produced.

So:

```typescript
getWhereUsed(params: IGetWhereUsedParams): Promise<IWhereUsedListResult>;
getWhereUsed<T>(params: IGetWhereUsedParams, parse: (data: unknown) => T): Promise<T>;
```

`includeRawXml` disappears with it: a boolean asking for a different result shape
is a strategy written as a flag, and it can only offer the shapes somebody
thought of.

**Not changed now, deliberately.** `IAdtUtilities` ships `getWhereUsedList`
returning `IWhereUsedListResult`, which already returns a contract — the part
that matters. What is left is a parameter set carrying three fields no request
carries, and a flag doing a strategy's job. That is worth correcting when
somebody needs it, not worth a third breaking release in two days to rename a
member whose result is already right. This decision is recorded so the next
member is built this way and this one converges when it is touched.

**Why this is not a licence to strip every parameter.** The test is whether the
parameter names something the *endpoint* needs, not whether it is convenient.
`maxItemCount` on `getAllTypes` is a query parameter and stays. A parameter that
never appears in the request, and exists to compute one that does, is the
implementation's.

**Against.** Union both parameter sets on the one member — `scopeXml` *and* the
three flags — so no caller loses a convenience. Rejected: it puts three fields in
the contract that no request carries, and every implementation of the contract
must then provide a scope-building convenience it may have no reason to have. A
contract that describes a convenience has made it mandatory.

**How to catch it.** A field of a contract's parameter type that you cannot point
to in the request the member issues. If it is computed into another field, it
belongs to the implementation that computes it.

**Open, and named rather than assumed.** Nine members still answer a parsed shape
with no strategy — `search`, `getAllTypes`, `fetchNodeStructure`,
`getPackageContentsList`, `getPackageHierarchy`, `getInactiveObjects`,
`getIncludesList`, `listFunctionModules`, `listFunctionGroupIncludes`. If
"document by default, parsed by strategy" is the general rule rather than the
answer where two members contended for one endpoint, all nine reverse — and
`IRepositoryNodeContents`, shipped in 27.0.0, becomes a strategy's return type
rather than a contract's. That is a decision about the whole surface, not a
detail of this one, and it is not taken here.

## 18. The answer goes back whole; the consumer decides its shape

**The problem.** Two questions kept being answered by looking at one consumer.
What should a member return? What counts as informative enough when SAP refuses?
Both were being settled by opening `mcp-abap-adt` and seeing what it does with
the result.

That is not design, and it is measurably not even a check. Verifying decision 17
that way meant compiling that consumer's source against a build seven majors
ahead of the version it is on — a run whose "zero errors" says nothing about the
change, because its code was written for a different library.

**Decided.** The library's duty is the same in every situation: give back what
SAP said, completely and in a form somebody can analyse. It does not decide what
any caller will do with it, and it is not tuned to what one caller happens to
need.

Two halves, and they are the same principle:

- **Errors are never shaped away.** A refusal carries the server's own message,
  the document untouched, the classification the server gave it, the response it
  arrived on, and **the request that produced it**. That last one is not
  decoration: `delete()` issues two calls and `create()` six, and "object is
  locked" means a different thing depending on which of them asked. A caller
  cannot analyse what they cannot locate.
- **Volume and form are the consumer's, through a strategy.** This is what makes
  the first half affordable. The library does not have to guess how much of a
  large answer anyone wants, or in what shape — a strategy is where the caller
  says so (decisions 5, 14, 17). Without it the library would be choosing on
  their behalf and calling the choice a contract.

  Concretely, where a member answers with XML there is no single right amount to
  keep: one caller wants a compact projection, another the fuller structure,
  another the document untouched to pass on. All three are legitimate and none is
  the library's to pick, so the member returns its contract by default and takes
  a parser from anyone who wants otherwise.

  The two halves are asymmetric on purpose. The **result** has a form the caller
  may choose. The **error** does not: there is one right amount of a refusal, and
  it is all of it.

**What this rules out.** "Consumer X does not use that field, so leave it out."
"Consumer X parses it this way, so return that." A consumer is evidence about
*what a document contains* — the parsers this package's shapes were lifted from
are exactly that, and good evidence. It is not evidence about what the contract
should promise, because the next consumer has not been written.

**And a strategy is still not a place a refusal can hide.** The two halves meet
here: the consumer chooses the shape of an *answer*, and whether the request was
refused is not theirs to shape. The refusal is raised before any strategy runs.

**How to catch it.** A decision justified by what one consumer does with a
result. A field left out because nobody currently reads it — that is decision 11
about *members*, and it does not extend to withholding what the server said.

**What would change it.** Nothing here. Which members take a strategy is still
decided one at a time, on whether the caller must control the volume.

## 19. Direction: the default implementation answers, and strategies say how

**Not yet decided — recorded while it is being designed**, because the last three
decisions were each re-derived from scratch when the case came up again.

**Where this comes from.** Decisions 13 to 18 each fixed one consequence of the
same thing: `IAdtResponse` used as a result. Name the result (13), stop the
envelope leaking into atoms (16), stop it being the default (17), stop a refusal
being reported as an answer (18). Six decisions, one cause. **Once the envelopes
are gone the rest gets simpler**, and this is what the shape looks like without
them.

**The proposal.** A contract member's default implementation returns SAP's
answer, applying whatever strategies the consumer supplied. There are two things
that can come back and they are not the same thing, so the contract says both:

- what to do with a **result**;
- what to do with an **error**;

or one strategy over the answer as a whole, where a caller wants to handle both
in one place. The member's job is to obtain the answer; the strategies say what
form it takes on the way out.

**What it settles that today's shape does not.**

Today the library decides how a failure is delivered: `AdtExceptionDocumentError`
is thrown, and a caller who would rather branch than catch has no say. That is
the library choosing on the caller's behalf — the thing decision 18 forbids for
*results* while still doing it for *errors*. An error strategy makes the two
symmetric: what comes back is the caller's choice, what comes back **is
complete** is not.

It also removes the last reason for an envelope. `IAdtResponse` survives in
contracts because a member sometimes has to hand over "everything, I cannot say
what you need". A strategy is the caller saying what they need, so the envelope
has nothing left to do.

**Settled, so the next member is built this way rather than guessed at.**

1. **Without a strategy, a refusal still throws.** An error strategy makes
   masking possible again, and it should be — but not free. With the throw as the
   default, a silent failure takes a deliberately written handler, where today it
   took a forgotten one. The whole class of defect this decision descends from
   was masking nobody chose; keeping the safe path as the path of least effort is
   what stops it returning.
2. **Completeness is not the strategy's to decide.** A strategy receives the
   refusal **whole** — the server's message, the document untouched, the ADT
   classification, the response, and the request that produced it. What it does
   with that is the consumer's business. The line is exact: the library answers
   for having handed over everything, the consumer for what they did with it.
3. **Strategies arrive as one options object, never as positional parameters.**
   `{ onResult?, onError? }`. Hanging a second signature on each member was tried
   across 23 of them and reverted: it cost every implementer two signatures per
   method and moved the result's meaning to the call site. An object adds one
   parameter however many strategies there turn out to be, and leaves room for a
   third without touching anything.

4. **Two methods, on the result contract itself.** A result can be a normal
   answer or an error, and the contract says so rather than pretending one of
   them does not happen: it exposes both, one accessor each.

   ```typescript
   interface IAdtOutcome<TResult, TError> {
     result(): TResult;
     error(): TError;
   }
   ```

   The alternative — one strategy over the answer, leaving the branch implicit —
   was the cheaper way in and is not what this takes. A type that admits only the
   happy answer pushes the other one somewhere the compiler cannot see, which is
   the whole family of defects decisions 13 to 18 came from, restated as a type.
   Here the caller cannot reach a result without the contract having told them an
   error is a thing that exists.

   The strategy injected into an implementation then says what to do with each,
   and **"what to do" includes deciding what an error is**:

   - the **error strategy** decides *how a failure is recognised* and *what the
     consumer is handed when one is*;
   - the **result strategy** decides *how the result is returned*.

   The first half is the part easy to miss, and it is the more important one. A
   library that decides what counts as an error has decided for every consumer at
   once, and it will be wrong for some of them: an empty answer is not always a
   failure, a document this library cannot read may be one the consumer can, and
   a refusal may be exactly the answer a caller was probing for.

   What the library still owes, and cannot delegate, is **completeness**: the
   strategy is handed everything that came back, so a consumer deciding
   "this is not an error for me" is making a decision rather than being kept in
   the dark. Decision 18 stands unchanged — what comes back is the caller's
   choice, what comes back *whole* is not.

   Where the library ships defaults today — a refusal throws, an unreadable
   answer throws — those are the **default strategies**, not the law. They exist
   because failing loudly is the safe behaviour for a caller who has not said
   otherwise, and they are replaceable once the strategies land.

   **The library ships a set of them, and that is what makes this usable.** A
   consumer who wants a different amount of the answer should not have to write a
   parser to get it. Three families:

   | family | what it decides | shipped |
   |---|---|---|
   | result | how much of the result comes back | full · medium · brief |
   | error | how much of a failure comes back | full · medium · brief |
   | error detection | what counts as a failure at all | the default rules, replaceable |

   The third has no "amount" axis because it answers a different question, and it
   is the one a library cannot ship a single answer for — hence it being a
   strategy rather than a rule.

   **Writing your own is not a fallback.** Picking a shipped strategy is the
   ordinary case, but there are two reasons to write one and both are first-class:

   - **a representation none of the shipped ones give.** Full, medium and brief
     are three points on one axis, and a consumer may want a different shape
     altogether — a projection, a flattening, the document passed through
     untouched to something else.
   - **a different judgement about what is a failure.** This is the one that
     cannot be anticipated. A caller probing whether an object exists is *asking*
     the question "does this exist" — a "not found" from SAP is the answer they
     came for, and treating it as an error would be the library overruling the
     only party who knows what the call was for. The same applies in reverse: a
     consumer may want an empty result treated as a failure, because in their
     workflow an empty answer means something went wrong upstream.

   That second reason is why error detection is a strategy at all rather than a
   rule with options. The library's shipped rules are a sensible default, not a
   definition.

   **And this is where the envelope finally has nothing left to do.** The one
   case it exists for is a caller who wants everything, raw, and will judge it
   themselves. Under strategies that caller is served without the contract
   naming an envelope at all: a result strategy that hands back the full answer
   as it came, and an error strategy that recognises nothing — so the analysis
   and the handling are entirely theirs.

   ```typescript
   const raw = await utils.getWhereUsed(params, {
     onResult: (answer) => answer,   // everything, as SAP sent it
     onError: () => undefined,       // nothing is a failure here; I will judge
   });
   ```

   That is the same behaviour `Promise<IAdtResponse>` gave, arrived at by the
   caller asking for it rather than by every caller being given it. The
   difference is not cosmetic: with the envelope in the contract, every consumer
   pays for one consumer's need and no member can name its result. With a
   strategy, the member states a contract and the caller who wants the raw answer
   says so at the call site — visibly, and only for themselves.

   The responsibility moves with it. An error strategy that recognises nothing is
   a consumer deciding to do their own analysis; that is a decision at the call
   site, in their code, not silence from a library that never told them. That is
   the line decision 18 draws, and it is what makes this safe: masking stays
   possible, and stays theirs.

   Two consequences worth stating now, before any of it is built. The shipped
   strategies are **named contracts**, not loose functions: a consumer selects one
   and a different implementation of the same member must honour the same names,
   or "brief" means whatever each implementation felt like. And **"full" is not
   the same as the envelope** — it is the complete result *stated as a contract*,
   which is what decision 13 has been about all along.

**Which package carries what.** This lands mostly here, because the contracts are
here — and the split follows the rule this package already lives by: a name a
consumer depends on is a contract, an implementation of it is behaviour.

| | `@mcp-abap-adt/interfaces` | `@mcp-abap-adt/adt-clients` |
|---|---|---|
| the outcome type (`result()` / `error()`) | the contract | — |
| the strategy names — full · medium · brief | the contracts, so every implementation honours the same names | — |
| the error-detection strategy | the contract | the default rules |
| the shipped strategies themselves | — | the behaviour |
| what a member returns without one | stated at the member | the default |

The middle row is the reason the names cannot live in `adt-clients`: a consumer
who asks for "brief" and swaps in their own implementation must get brief, and
that only holds if the name is a contract both sides read. A name shipped only by
one implementation is a convention, and conventions drift.

`AdtSAPError` and `AdtParseError` are the same question and are **not** answered
here. They are classes in `adt-clients` today, thrown by default strategies. If a
consumer is to catch them across implementations, what they catch has to be a
contract — and if only the default strategies throw them, they can stay where
they are. That depends on the outcome type's shape, which is still open.

**The shape this takes, and it resolves the question above.**

The outcome is not a new type beside `IAdtResponse` — it is what `IAdtResponse`
becomes. Two methods, and a concrete implementation supplies each:

```typescript
interface IAdtResponse<TResult> {
  getResult(): TResult;
  getError(): /* the failure, or empty */;
}
```

An implementation is then built from two strategies, one behind each method. In
`adt-clients` that is where full · medium · brief live, and where a consumer's own
goes: the strategy *is* the implementation of that method, not an argument the
method consults.

Three things fall out of this, and they are why it is better than passing
strategies to the member.

**The open question dissolves.** Nothing throws at the member. A member returns
its outcome, always, and `getError()` is empty when there is no error. The safe
default survives as a property of the *default implementation* of `getResult()`:
it raises when an error is present, so a caller who ignores failures still fails
loudly, and a caller who wants to branch asks `getError()` first. Throwing was
never a property of the member — that was the confusion.

**No member signature changes.** A member still returns one thing. What changes
is what that thing is, and the migration is a type acquiring meaning rather than
94 signatures being rewritten. Members already returning `Promise<IAdtResponse>`
are not each a separate correction; they are the same correction once.

**The generic stops being decoration.** Decision 14 measured `IAdtResponse<T>`'s
type parameter as never supplied — the generic exists and has never carried a
type. Here it is the point: `IAdtResponse<ISearchResult[]>` is an outcome whose
result is the hits. What decision 14 recorded as an unused pass-through was the
right idea with nothing behind it yet.

**Two shapes, and they are mutually exclusive.**

**A — two methods.** `getResult()` and `getError()`. Nothing throws; a caller
branches. The "this is not an error for me" case is natural: `getError()` answers
something the caller ignores.

**B — one method, and errors are thrown.** If a failure is delivered as an
exception, `getError()` has nothing to answer — a failure never returns, so the
method would exist to say "no" on every successful call. It comes out, and the
contract is one method.

B is not the poorer option, and it is worth saying why, because the two methods
looked like the more careful design. **The error-detection strategy still does
its whole job under B.** A consumer for whom "not found" is the answer they came
for configures detection to not recognise it, and then `getResult()` simply
returns it — they never write a `catch`. Detection is what serves that case, not
the branch, and A gets the same result by a longer road.

What B costs is a caller who wants to inspect a failure *and* carry on: under A
that is a method call, under B it is a `try`/`catch`, which is control flow by
exception. What A costs is a check at every call site for the common case where
there is no error, and a second method every implementation must supply whether
or not it has anything to put there.

**Decided: B.** One method, failures as exceptions, and the detection strategy
carrying the "not an error for me" case.

Four reasons, in the order they weigh:

1. **The case that motivated `getError()` is served without it.** Detection
   decides whether there is a failure at all; a consumer who says "not found is
   my answer" gets it back from `getResult()` and writes no `catch`. A branch
   would be a second way to reach the same place.
2. **`getError()` answers "no" on almost every call.** A member that is empty for
   the overwhelming majority of uses, and that every implementation must supply
   regardless, is what decision 11 refuses.
3. **The library already behaves this way.** `AdtSAPError` and `AdtParseError`
   are thrown today. B makes the strategies an explanation of behaviour that
   exists; A would make the current behaviour a special case of a shape nothing
   implements yet.
4. **One method keeps the outcome a result.** `IAdtResponse<ISearchResult[]>`
   reads as "an answer carrying hits". With two it reads as a container to be
   interrogated, which is what this whole line of decisions has been getting away
   from.

**The cost, accepted rather than argued away.** A caller who wants to inspect a
failure and carry on writes `try`/`catch`, which is control flow by exception.
That is the price, and it is paid by the rarer case: the common ones are "give me
the answer" and "this is not a failure for me", and neither needs a catch.

**Still open.**

- **Where an implementation is chosen.** Per call, per handler, or at client
  construction. Per call is the most flexible and the noisiest; at construction is
  the quietest and cannot vary between two calls that want different amounts.
- **Whether `AdtSAPError` and `AdtParseError` become contracts.** They are
  `adt-clients` classes thrown by default implementations today. If a consumer is
  to recognise a failure across implementations, what they recognise has to be
  named here.
- **Migration.** Member by member. Nothing forces the atoms to move together.

**What would change it.** Building it. Until then this section exists so the
questions above are answered once rather than re-litigated per member.
