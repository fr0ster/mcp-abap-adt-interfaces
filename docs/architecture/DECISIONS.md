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
`ITraceReading`), combined per object.

> **Extended by decision 23 (30.0.0).** "Combined" now means combined by the
> consumer, at the point of use, and never by one contract extending another —
> which this decision permitted and 23 does not. `ITraceReadingWithParser`, named
> here as one of the atoms, is gone with the per-call parsers (decision 22).

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

> **Mechanism superseded by decision 22 (30.0.0); the decision itself stands.**
> Big XML is still the consumer's to parse, and they still keep a type. What
> changed is *where they say so*: the reader is given to the implementation when
> it is constructed, not passed at the call. Every `(parse)` argument named below
> — `readWith`, `listNodes(parse)`, `search(criteria, parse)` — was removed, and
> the "Shape note" about method-versus-overload is moot with neither.

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

> **Both members are gone as of 30.0.0** — decision 22 removed every per-call
> parser. The decision keeps its force, and gained a second illustration: the
> symmetry `listWith` was proposed for arrived by making the reading a property
> of the implementation, where it costs no member at all.

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

> Throughout decisions 13 to 16 below, `IAdtResponse` means the **transport
> frame** — `data`, `status`, `headers`. That is what the name meant when they
> were written. Since 28.0.0 the frame is `IAdtWireResponse` and `IAdtResponse`
> is the answer a member gives, which is the correction these decisions argued
> for. Read the older text with the old meaning; renaming it here would make the
> arguments unreadable, since the whole point of several is that one name was
> doing two jobs.

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
`getWhereUsedList` and `getPackageContents` all answer "an identified object in
the repository", through types that extend it. (`getPackageContentsList` and
`getPackageHierarchy` were the two members named here until 30.0.0 collapsed them
into one — the illustration is unchanged by that, which is itself the point: the
essence was one all along.)

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

> **Read with decision 22 (30.0.0).** The examples below are the shapes that
> existed when this was written; `listNodes(parse)` and every other per-call
> parser are gone, and the strategy is given to the implementation instead. The
> argument this decision makes — that the envelope's type parameter is transport
> pass-through and not a place to receive a strategy — is untouched by that, and
> is why the strategy went to the implementation rather than into `IAdtResponse`.

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

> **Where the strategy lives was settled later, by decision 22 (30.0.0):** in the
> implementation, chosen once, not in an argument at the call. The paragraph
> below describes it as `listNodes(parse)` / `readWith` because those were what
> existed when this was written; both are gone. What survives unchanged is the
> rule this decision is about — a second member per reading is never the answer.
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

**Open, and named rather than assumed.** Eight members still answer a parsed
shape with no strategy — `search`, `getAllTypes`, `fetchNodeStructure`,
`getPackageContentsList`, `getPackageHierarchy`, `getIncludesList`,
`listFunctionModules`, `listFunctionGroupIncludes`. `getInactiveObjects` left
that list in adt-clients 18.0.0, and how it left is the measurement that matters
here: it makes **one** request, so an `IResultStrategy` — which is handed one
answer — could type it. The three package and where-used members make several
and assemble one shape from all of them, which no strategy of that shape can
express; whether they should be reachable another way is the part still open. If
"document by default, parsed by strategy" is the general rule rather than the
answer where two members contended for one endpoint, all nine reverse — and
`IRepositoryNodeContents`, shipped in 27.0.0, becomes a strategy's return type
rather than a contract's. That is a decision about the whole surface, not a
detail of this one, and it is not taken here.

> **Taken in 30.0.0 by decision 22, and completed in 31.0.0.** Every member that
> answers a parsed shape carries the reading as a type parameter of its
> interface. 30.0.0 gave those parameters defaults — the shape the member
> answered before — so that a consumer who named nothing was unmoved; 31.0.0 took
> the defaults out with the shapes themselves, because a default is a claim about
> what a reading produces and belongs where the reading does. The nine did not
> "reverse": the parsed shape stopped being the only option, and then stopped
> being the contract's to name. Two of them, `getPackageContentsList` and
> `getPackageHierarchy`, turned out to be one member, which decision 16 had said
> all along.

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

  The two halves are asymmetric on purpose, and the asymmetry is about **where**
  the completeness is owed, not about whether a caller may shape a failure.

  | | what the strategy is handed | what the consumer ends up with |
  |---|---|---|
  | result | the answer | their choice |
  | error | **the refusal, whole — always** | their choice |

  The library's obligation is on the left column and is absolute: a strategy is
  never handed a summarised, filtered or partly-read failure, because a consumer
  cannot decide about what they were not shown. The right column is theirs, for
  errors as much as for results — a caller who asks for a one-line failure is
  making a decision, not being deprived of one.

  What this forbids is the library deciding the right column *for* them. That is
  what "there is one right amount of a refusal" was reaching for and said too
  broadly: it is one right amount **into the strategy**. Out of it, brief is as
  legitimate as full.

**What this rules out.** "Consumer X does not use that field, so leave it out."
"Consumer X parses it this way, so return that." A consumer is evidence about
*what a document contains* — the parsers this package's shapes were lifted from
are exactly that, and good evidence. It is not evidence about what the contract
should promise, because the next consumer has not been written.

**What each strategy is given, and when.** Two things can be true when a member
finishes: an answer arrived, or it did not. They are different inputs and the
protocol has to say so, or "the strategies are handed the answer" is a promise
that cannot be kept the first time a host is unreachable.

```
no answer                                answer
   │                                        │
   │                          result strategy ── may throw
   │                                        │
   └──→ error strategy ←────────────────────┘
        (given: what there is —
         the transport failure, or
         the answer plus any exception
         the result strategy raised)
```

- **No answer** — unreachable host, refused connection, a transport error. The
  result strategy is not run: it reads answers, and there is nothing to read. The
  error strategy is run, and given the transport failure.
- **An answer** — the result strategy is run on it. Then the error strategy is
  run, and given **the answer and whatever the result strategy raised**.

That second half is what makes "every failure is delegated" true rather than
slogan. A parse failure happens inside the result strategy, so an error strategy
shown only the original answer could never classify it — and classifying it is
exactly the case that matters: a logon page is a session failure, and only
something looking at both the document and the parser's complaint can say so.

**The order of invocation is real, and it is not the thing that was rejected.**
The result strategy runs first when there is an answer. What was rejected is one
strategy *gating another's view* — deciding what the other is allowed to see.
Neither does that here: the result strategy sees the whole answer, the error
strategy sees the whole answer and more.

**What surfaces:**

| | condition | what the caller gets |
|---|---|---|
| 1 | the **error** strategy threw | that exception, as itself |
| 2 | the error strategy produced a failure | that failure, thrown |
| 3 | the **result** strategy threw and the error strategy produced nothing | that exception, as itself |
| 4 | there was no answer and the error strategy produced nothing | the transport failure |
| 5 | otherwise | the result |

**Why 1 is first.** An error strategy that throws is a bug in the consumer's own
error handling, and everything below depends on that code working. It surfaces
untranslated — a consumer's failing code must not be dressed up as a failure of
the system it was inspecting.

**Why 2 beats 3.** A result strategy throwing `AdtParseError` on a document that
is an ADT exception is a *symptom*: it found no hits because the answer is a
refusal. Surfacing "we could not read it" over "SAP said the object is locked"
reports our confusion in place of the server's reason, which is decision 18
inverted. And by then the error strategy has seen that exception too, so a
consumer who *wants* the parse failure to win says so by returning it.

**Why 3 exists.** The error strategy saw the answer and the exception and judged
neither a failure, and the result strategy still could not read the answer. That
is the honest "the answer was fine and I could not read it".

**Row 4 is the one place the library cannot delegate**, and it is worth being
plain about why. If nothing arrived and the consumer's strategy declines to call
that a failure, there is no result to return either — not because the library
overruled them, but because a result is made from an answer and there was none.
It is an absence, not a judgement.

**How to catch it.** A decision justified by what one consumer does with a
result. A field left out because nobody currently reads it — that is decision 11
about *members*, and it does not extend to withholding what the server said.

**What would change it.** Nothing here. Which members take a strategy is still
decided one at a time, on whether the caller must control the volume.

## 19. The default implementation answers, and strategies say how

**Decided.** Written incrementally while it was being settled, which is why the
reasoning below reaches some conclusions and then supersedes them — each
supersession is marked. Recorded this way on purpose: the last three decisions
were each re-derived from scratch when the case came round again, and a record
that shows only the answer teaches nobody why the near-misses were near.

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

1. **Completeness is not the strategy's to decide.** A strategy receives the
   refusal **whole** — the server's message, the document untouched, the ADT
   classification, the response, and the request that produced it. What it does
   with that is the consumer's business. The line is exact: the library answers
   for having handed over everything, the consumer for what they did with it.
2. **Strategies arrive as one options object, never as positional parameters.**
   `{ onResult?, onError? }`. Hanging a second signature on each member was tried
   across 23 of them and reverted: it cost every implementer two signatures per
   method and moved the result's meaning to the call site. An object adds one
   parameter however many strategies there turn out to be, and leaves room for a
   third without touching anything.

   > **Superseded below.** This answered "how are they passed *to a member*", and
   > the later decision is that they are not passed to a member at all — they are
   > chosen **at client construction**. What survives is the object form: the
   > client takes `{ onResult?, onError? }` rather than a positional
   > list. Every `member(params, options)` example in this section is the
   > superseded shape, kept because the reasoning that led away from it is worth
   > reading, and marked so nothing is implemented from it.

3. **Two methods, on the result contract itself.** A result can be a normal
   answer or an error, and the contract says so rather than pretending one of
   them does not happen: it exposes both, one accessor each.

   ```typescript
   interface IAdtResponse<T> {
     getResult(): IAdtResult<T>;
     getError(): IAdtError;
   }
   ```

   > Written first as `IAdtOutcome<TResult, TError>` with bare type parameters —
   > my sketch, not the design. **Both halves are contracts**, `IAdtResult` and
   > `IAdtError`, which is the whole point: a free type parameter offers a choice
   > and takes the contract away with it, since an implementation returning
   > `number` and one returning a named shape are not interchangeable.

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

   Where the library fails loudly today — a refusal, an unreadable answer — that
   is the **default strategies' judgement**, not the law. Failing loudly is the
   safe behaviour for a caller who has not said otherwise, and both are replaced
   by supplying a strategy that judges differently.

   How each *arrives* matters, and the composition above is exact about it. The
   default error strategy **returns** an `AdtSAPError` — a verdict, which the
   composer then throws. It does not throw one itself: a strategy throwing is row
   1 of that table, a bug in the strategy, and a routine SAP refusal is not a bug.
   `AdtParseError` is the other kind: a result strategy that genuinely could not
   read the answer throws, and that is row 3.

   **The library ships a set of them, and that is what makes this usable.** A
   consumer who wants a different amount of the answer should not have to write a
   parser to get it. Two families:

   | family | what it decides | shipped |
   |---|---|---|
   | result | whether there is a result, and how much of it comes back | full · medium · brief |
   | error | whether there is a failure, and how much of it comes back | full · medium · brief |

   **Two strategies, not three.** An earlier draft listed error *detection* as a
   third family and the configuration sketch above carried a separate
   `detectError`. Both are superseded: recognising a failure is the error
   strategy's own analysis, not a stage in front of it.

   That follows from decision 18's shape rather than being a separate choice. If
   both strategies see the whole answer — the error strategy plus whatever the
   result strategy raised — and each analyses it, then "is this a failure" is a
   question the error strategy answers by looking — and a
   third strategy answering it first would be the gate that decision 18 rejects.
   Symmetrically, "is there a result here" is the result strategy's to answer.

   So the client takes `{ onResult?, onError? }`. Three names would have implied
   three injection points and an order between them.

   The middle row is not in tension with decision 18, and the distinction is the
   one that decision draws in its own table: what the **strategy is handed** is
   always the whole refusal; what the **consumer ends up with** is what they
   asked for. "brief" shortens the second, never the first. A strategy that has
   been given less than everything cannot be a consumer's decision, because they
   were not shown what they were deciding about.

   Detecting a failure has no "amount" axis, which is why it is not a third row:
   it is not a quantity of an answer but a judgement about one, and it belongs to
   the error strategy that makes it. What the library ships as full · medium ·
   brief are shapes; what it ships as *default detection rules* is one
   implementation's judgement, replaceable by supplying a different `onError`.

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

   That second reason is why detection lives inside a replaceable strategy rather
   than in a rule with options. The library's shipped detection is one sensible
   judgement, not a definition, and a consumer who disagrees supplies an `onError`
   that judges differently.

   Where that judgement *happens* is decision 18's answer, and it is not a stage
   in front of anything: both see the whole answer, neither filtered by the other,
   and each does its own analysis — decision 18 sets out exactly what each is
   given, including the case where no answer arrived at all. Recognising a failure is the error strategy's own
   analysis, not a gate the result strategy waits behind — which is what lets one
   consumer read a
   result and a diagnostic out of the same document, and another ignore failures
   altogether.

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
| the error strategy, detection included | the contract | the default judgement |
| the shipped strategies themselves | — | the behaviour |
| what a member returns without one | stated at the member | the default |

The middle row is the reason the names cannot live in `adt-clients`: a consumer
who asks for "brief" and swaps in their own implementation must get brief, and
that only holds if the name is a contract both sides read. A name shipped only by
one implementation is a convention, and conventions drift.

`AdtSAPError` and `AdtParseError` are the same question and are **not** answered
here. They are classes in `adt-clients` today: the default error strategy
*returns* an `AdtSAPError` for the composer to throw, and a result strategy that
cannot read the answer *throws* an `AdtParseError`. Both reach a caller as
exceptions; only the second is thrown by the strategy itself.

If a consumer is to recognise them across implementations, what they recognise
has to be a contract — and if only the shipped strategies produce them, they can
stay where they are. That depends on the outcome type's shape, which is still
open.

**The shape this takes, and it resolves the question above.**

The outcome is not a new type beside `IAdtResponse` — it is what `IAdtResponse`
becomes. Two methods, and a concrete implementation supplies each:

> **The `undefined` halves went in 31.0.0.** Each interface declares only its own
> method now, so reaching either requires narrowing and a forgotten check is a
> type error rather than a sentinel. The block below is the shape as proposed
> here, kept for the reasoning.

```typescript
interface IAdtSuccess<TResult extends IAdtResult<unknown>> {
  readonly ok: true;  getResult(): TResult;    getError(): undefined;
}
interface IAdtFailure<TError extends IAdtError = IAdtError> {
  readonly ok: false; getResult(): undefined;  getError(): TError;
}

type IAdtResponse<
  TResult extends IAdtResult<unknown>,
  TError extends IAdtError = IAdtError,
> = IAdtSuccess<TResult> | IAdtFailure<TError>;
```

**Both halves are parameters, and both are constrained to their contract.** This
is the newest of these decisions and the one least likely to be guessed from the
others, so it is stated rather than implied.

An earlier form fixed the error half at `IAdtError`, and that left an
implementation with no way to describe what it actually returns — the opposite of
"swap in your own". A `retryAfter` an implementation genuinely provides was
invisible to every caller, including the ones using that implementation on
purpose:

```typescript
interface ThrottledError extends IAdtError { readonly retryAfter: number }

declare const throttled: IAdtResponse<IAdtResult<ISearchResult[]>, ThrottledError>;

throttled.getError().retryAfter;   // this implementation offers more
anyFailure(throttled);             // and the base contract reads it unchanged
```

**This is not the free `TError` rejected above, and the constraint is the whole
difference.** A free parameter lets an implementation answer `number` and two
implementations of one member stop being interchangeable. `extends IAdtError`
lets a caller read **more** than the contract where their implementation offers
more, and never less — which is what substitution means (decision 13).

`TError` defaults to `IAdtError`, so a member adding nothing writes
`IAdtResponse<IAdtResult<ISearchResult[]>>` and no more.

Shipped in 28.0.0, and two things about it were settled by building it rather
than by writing it down here first.

**A union, not one shape with two optional halves.** Two independently-optional
methods let an implementation answer both or neither, and checking one narrows
nothing — so "a caller cannot reach a result without being told an error exists"
was a sentence in a comment rather than a thing the compiler did. `ok` exists
because TypeScript cannot narrow an object from what a method returns.

**Both halves are named contracts**, `IAdtResult<T>` and `IAdtError`. They do not
vary the same way, and that difference is real rather than an inconsistency: an
error strategy varies the *fullness of `IAdtError`*, which has two required fields
and five optional; a result strategy varies **`T` itself**, through the strategy
overload, because a result contract like `ISearchResult` has required fields and
cannot be returned half-filled.

What `IAdtResult` must not hold is the transport frame. A `response` field was in
its first draft and put `status`, `headers` and `data` back inside every result
under one more layer of nesting — this decision's own words are that `full` is
the complete result *stated as a contract*, not the envelope returning.

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

**Every member signature changes, and I predicted otherwise.** The thought was
that a member still returns one thing, so the migration would be a type acquiring
meaning rather than signatures being rewritten. That was wrong once the halves
became contracts: `Promise<ISearchResult[]>` became
`Promise<IAdtResponse<IAdtResult<ISearchResult[]>>>`, and 28.0.0 rewrote all 22
asynchronous members of `IAdtUtilities` plus 784 call sites in `adt-clients`.

Kept rather than corrected away, because the mistake is instructive: "the type
acquires meaning" is what a rename does, and this was never a rename. The moment
both halves of an answer are named contracts, every signature that returns an
answer says so.

**The generic stops being decoration.** Decision 14 measured `IAdtResponse<T>`'s
type parameter as never supplied — the generic exists and has never carried a
type. Here it is the point: `IAdtResponse<IAdtResult<ISearchResult[]>>` is an
answer whose result is the hits. What decision 14 recorded as an unused pass-through was the
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
looked like the more careful design. **The error strategy's own detection still
does that whole job under B.** A consumer for whom "not found" is the answer they came
for configures detection to not recognise it, and then `getResult()` simply
returns it — they never write a `catch`. Detection is what serves that case, not
the branch, and A gets the same result by a longer road.

What B costs is a caller who wants to inspect a failure *and* carry on: under A
that is a method call, under B it is a `try`/`catch`, which is control flow by
exception. What A costs is a check at every call site for the common case where
there is no error, and a second method every implementation must supply whether
or not it has anything to put there.

> **Superseded. A is what is built** — `getResult()` and `getError()` on a
> discriminated union, shipped in 28.0.0. B below was my conclusion after being
> asked to pick one, not the design being described to me; the design has two
> methods, and it is the one that governs.
>
> Reading them side by side afterwards, A is also the stronger of the two on its
> own terms, and the reason is one B cannot answer. **An exception is invisible to
> the type system.** Nothing makes a caller catch it, nothing tells them it exists,
> and the failure path is discovered at run time by whoever is unlucky. The union
> makes handling compulsory at compile time: `answer.getResult()` does not
> type-check until the caller has asked which half they hold. That is the same
> argument this whole line of decisions rests on — a type that admits only the
> happy answer pushes the other where the compiler cannot see it — and B was that
> shape wearing an exception.
>
> What B got right survives untouched: the error strategy's own detection carries
> the "not an error for me" case, and a consumer who says a "not found" is their
> answer receives it as a result. That never depended on how a failure is
> delivered.
>
> The argument for B, kept because it was not silly:

**Decided: B.** One method, failures as exceptions, and the error strategy's own
detection carrying the "not an error for me" case.

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
4. **One method keeps the outcome a result.** `IAdtResponse<IAdtResult<ISearchResult[]>>`
   reads as "an answer carrying hits". With two it reads as a container to be
   interrogated, which is what this whole line of decisions has been getting away
   from.

**The cost, accepted rather than argued away.** A caller who wants to inspect a
failure and carry on writes `try`/`catch`, which is control flow by exception.
That is the price, and it is paid by the rarer case: the common ones are "give me
the answer" and "this is not a failure for me", and neither needs a catch.

**The rest, decided.**

**Where an implementation is chosen: at client construction.** Not per call. A
call site says what it wants done, not how answers are shaped — that is a
property of the client a consumer built, and putting it in every call would put
the same argument in every call.

The cost is real and accepted: two calls through one client cannot want different
amounts. The way out is a **second client**, and it is cheap because a client is
not a connection — both are constructed over the same `IAbapConnection`, so
wanting brief answers in one place and full ones in another costs an object, not
a session. That distinction matters: multiplying sessions is not acceptable,
multiplying clients is nothing.

**`AdtSAPError` and `AdtParseError` stay in `adt-clients`. This package gets no
classes.** A contract says what a thing is and how to work with it; a class is
one way of being that thing. The moment this package ships a class, a consumer
depends on an implementation through the door meant for contracts, and "swap in
your own" stops being true for that piece.

So the split is the same as everywhere else here: the **shape** of a failure is
named here, and the classes that are it live in `adt-clients` — which is where a
consumer takes them from, `instanceof` and all.

The consequence, stated rather than left to be discovered: a consumer who swaps
in a different implementation of a member recognises a failure **structurally**,
by the shape this package names, not with `instanceof`. That is the cost of not
shipping classes, and it is the right way round — `instanceof` is a convenience
for the common case of using the shipped implementation, not the mechanism the
contract rests on.

**Constants are not classes, and they stay.** The package ships 17 runtime
values that are not classes — `AUTH_TYPE_PASSWORD`, `TOKEN_PROVIDER_ERROR_CODES`,
`TRANSPORT_SEARCH_CONFIGURATIONS_URL` and the rest. The no-classes rule does not
reach them, and reading it that widely would be reading it wrong.

The line is what the thing *is*. A constant is a value the contract **names**:
`'password'` is the authorisation type, and a consumer writing their own
implementation needs the same string or they are speaking a different protocol.
A class is a **way of doing** something, and shipping one hands a consumer an
implementation through the door meant for contracts.

So: after the classes leave, this package ships zero classes and 17 constants,
and that is the intended state rather than a step toward none.

**Pre-existing debt, named because this decision makes it visible.**
`AdtOperationError` and `TransportSearchConfigurationMissing` are classes in this
package today. They predate this rule and contradict it. Not corrected here —
both are thrown across package boundaries and moving them is a breaking change on
its own timetable — but they are not precedent, and nothing new joins them.

**Migration: member by member.** Nothing forces the atoms to move together, and
nothing should — each member converges when it is next touched, which is how the
where-used correction in decision 17 is already scheduled.

### What this removes, which is the measure of whether it was worth it

`AdtOperationError` does not move to `adt-clients` with the others. **It stops
existing.** Measured across the packages: 20 throws, **zero** `instanceof`
anywhere, and of its five fields only `code` is ever read — by a consumer, off an
`unknown`, which the compiler does not check. Two of the five are
`originalError?: unknown` and `checkResult?: unknown`: the envelope again, in the
error plane, a container for everything from which a caller can type nothing out.

Its 20 throws are three unrelated things wearing one name, and each has a home
that says more:

| what it actually was | example | where it goes |
|---|---|---|
| SAP refused | a 404/406 caught around a versions read | `AdtSAPError` — with the document and the request |
| the answer lacked a field we need | "the run resource carried no `runs:status`" | `AdtParseError` |
| the caller's argument is wrong | "`maximumVerdicts` must be a positive integer" | not an ADT failure at all |

`throwUnsupportedOperation` goes the same way and for a better reason: "this
operation is not supported for this object type" is what the **capability atoms**
say at compile time. A handler that cannot do versions does not declare
`IAdtVersionable`. Saying it again at run time is a leftover from before those
existed, and a fact the type system already carries does not need an exception.

**And the consumer pays for this once, not per change.** Moving to outcomes and
strategies is a rewrite of every call site regardless; the `.code` reads go with
that same pass. What is bought is uniformity — one way to obtain a result, two
named kinds of failure, and no per-member error taxonomy to learn. That is the
argument for removing it rather than relocating it: relocating keeps a third
vocabulary alive in a design whose point is that there are only two.

**What would change it.** Building it. Until then this section exists so the
questions above are answered once rather than re-litigated per member.

## 20. Choice is offered by injection, never by more contract

Decisions 3, 12 and 19 each state one half of how this package is meant to grow.
Put together they answer the question that keeps recurring — *a consumer needs
different behaviour; what do we add?* — and the answer is: usually nothing.

**Give the consumer a strategy to supply, not an interface to learn.** When
behaviour must vary, the variation is injected. Declaring a new type is the last
resort, not the first move: every type added is a symbol every implementation
must satisfy and every consumer must read, while an injected function costs
neither.

**The contract names the injection point and nothing about how it is filled.**
Defaults, per-object variants, and the inheritance that arranges them are the
implementing library's business. A contract that describes how a default is
composed has stopped being a contract.

**Reuse before declaring.** Before a shape is added, the existing ones are
checked. `IAdtError` already describes a failure and carries the raw answer and
the request; `IAdtWireResponse` is the untouched answer; `ILogger` is already
injected everywhere; and `parse: (data: unknown) => T` already establishes what a
strategy looks like here. A new name for something that exists is not a smaller
contract, it is a second one.

**Do not enumerate what a function already covers.** Fixed variants — sizes,
modes, levels — freeze someone's guess at the useful cases into the contract. A
function spans the space and does not need extending when the guess was wrong.

**Return the contract; do not throw.** This is what makes an implementation
replaceable without touching the consumer, which is the whole reason this package
exists. A thrown error is invisible to the compiler, so a consumer never learns
from the type that a failure path exists — and `@throws` in a contract forces
every implementation to invent a message, which is how a consumer ends up reading
a sentence the library composed instead of the one the server sent.

### Applied here

The seven capability atoms — creatable, readable, updatable, deletable,
validatable, checkable, activatable — answer
`IAdtResponse<IAdtResult<TState>>`. The state stays: a chain is seven requests,
and it is the only shape that names each one's answer separately. `errors[]`
leaves it, because an array of errors travelling beside a successful-looking
result is a failure the consumer is not required to notice.

The two strategies a handler takes — one for the result, one for errors — arrive
as optional functions on the `IAdtOperationOptions` handlers already accept. The
error one is given both the default's verdict and the raw answer, so a consumer
can overrule in either direction.

**Why the choice cannot be replaced by a better default.** ADT answers a request
for a missing object with 200 and an empty body rather than a refusal. The same
bytes mean opposite things depending on the caller: a read-modify-write must
treat empty as a failure, since writing back what it read erases the object,
while a listing must treat it as an empty list. Neither reading can be the
library's, which is what makes this an injection point rather than a fix.

## 21. A test asks the contract whether there was an error

Decision 9 says green is not proof. This says what a test must do instead, and it
follows from the contract rather than from testing taste.

**The verdict comes from the contract, not from the status code.** A test reads
`ok`, and takes the failure from `getError()` or the value from `getResult()`.
Asserting on a status is asserting on the channel: ADT answers a refusal inside a
200, answers a missing object with 200 and an empty body, and reports the real
outcome in a message whose severity — an `E` — is the only thing that decides.
A test that checks `status === 200` can pass while the server refused.

**Analysing our own code is not enough, and cannot be made enough.** Whether a
given answer is a failure is decided at run time, by a strategy reading the
document SAP actually sent. No inspection of our source settles it. So the tests
that matter run against a real system and assert on what came back.

**Both directions are asserted.** That an error is reported when SAP refused, and
that no error is reported when it did not. Only the first is usually written, and
a library that reports failures for everything would pass it.

**A test that did not run is not a test that passed.** Skips are printed, always
and unconditionally, so a suite reporting green states plainly which of its cases
executed. A silently skipped case reads as coverage that does not exist — and is
worse than a red one, because nobody goes looking for it.

## 22. The shape is injected into the implementation, not chosen at the call

Decision 16 says one endpoint is one contract member. Decision 20 says choice
arrives by injection. Neither says **where** the injection happens, and 29.0.0
shipped both answers at once: `search` took a per-call `parse`, the transport
tree took one too, and the capability atoms took their shapes from whatever
instantiated them.

**Decided.** Into the implementation, once. A member's result type is a type
parameter of its interface, defaulting to the shape it answers today; the
consumer supplies the strategy when they construct the implementation, and every
call through it answers that shape.

```typescript
type IResultStrategy<T> = (answer: IAdtWireResponse) => T;

interface IAdtPackageBrowsing<TContents = IPackageContentItem[]> {
  getPackageContents(name: string): Promise<IAdtResponse<TContents>>;
}
```

**Why not per call.** It is a second signature every implementer must provide,
whether or not their callers use it — tried across 23 members and reverted. It
also moves the result's meaning from the contract to the call site: two calls to
the same member in one program can then answer different things, and nothing in
the type says so.

**Why this is not a loss of flexibility.** A consumer wanting two shapes
constructs two implementations, which is one line, and each is honestly typed.
Measured against how these consumers actually work: a backup tool wants documents
whole for everything it touches, a script wants two fields from every read, an
MCP server picks by what its model is about to do. None changes its mind between
one call and the next.

**What the strategy is given.** The whole answer — status, headers, body —
because a reading may need any of it, and because `analyse`, the strategy on the
error axis, already takes the answer for the same reason. The two axes are
symmetric: one decides whether an answer is a failure at all, the other what a
non-failure becomes.

**What it is not given** is anything the implementation did on the way.
Preliminary requests — fetching a node id, a scope document, a token — are the
implementation's business and reach the consumer only as failures. A contract
states what is asked, never which requests were issued to answer it.

**Where a parameter is, and is not, needed.** Where a member answers the document
as it arrived, nothing is lost and no parameter is added. Where the contract
names a *parsed* shape, the document is gone unless a reading can be injected —
so those members carry the parameter. Above three distinct answers in one
interface the parameters travel together as a record, because
`IAdtService<A, B, C, D, E>` is a signature nobody can call.

**How to catch a violation.** A member taking a function that shapes its own
result. A boolean that switches what the result *is* (`includeRawXml`). Two
members whose implementations issue the same request.

## 23. Contracts are composed, never inherited

**The problem.** `IAdtServiceBinding` extended eight capability atoms.
`IAdtRequest` extended four. `IExecutor` extended `IAdtRunnable`, the runtime
contracts extended two shared bases, `ITraceFamily` carried a listing, and
`IRenewableCredential` extended the whole of `IAuthProvider` to add one method.

Inheritance also hides a second name for the same idea, which is how `IExecutor`
survived review twice: read as "the executor contract" it looks like a thing,
and read as its members it is `IAdtRunnable` twice over with different options.

**Decided.** No contract extends another. Each declares what is its own, and a
consumer spells the composition where they need it:

```typescript
type Requests = IAdtRequest & IAdtCreatable<ITransportConfig, string>;
```

**Why.** Inheritance decides for the composer what belongs together. A consumer
who wants the listing without the CRUD, or renewal without the whole provider,
has no way to say so, and every implementation of the narrow thing is forced to
provide the wide one — which is the same failure the wide composites had before
29.0.0, arriving through a different door. Minimal contracts, composed at the
point of use, is what this package is for: it is why a consumer can implement one
family and leave the rest.

**What this is not.** Data shapes are unaffected — a config extending a config,
or a detail entry extending its list entry, is not a contract deciding what an
implementer owes.

**What was deleted rather than kept.** `IExecutor`, `IRuntimeAnalysisObject` and
`IListableRuntimeObject` existed only to be inherited or to bundle. With nothing extending
them they had no readers, so they went; each runtime contract now declares its
own `kind` and its own `list`, which is a line each and leaves them
self-contained.

## 24. The contract carries what is needed to use it or replace it — nothing else

**Decided by the maintainer, 2026-09-04.** An architectural principle, not a ruling
on the case that surfaced it.

A consumer needs two things from this package and no third: enough to **use** an
implementation of these contracts, and enough to **replace** one with their own.
That is member signatures, the parameters a request takes, `IAdtResponse`,
`IAdtError`, `IResultStrategy` and the constants those name.

**What a reading builds out of a document is the implementation's.**
`@mcp-abap-adt/adt-clients` ships strategies; the shapes they return are its own,
and a consumer who replaces it declares theirs. A result type here is not needed
to use the library — a caller reads it off whatever their implementation answers
— and it is not needed to replace it, since a replacement returns its own.

**Why this is a boundary and not a preference.** Declaring every result shape
here, and every field of them required, is how a contract package becomes a schema
catalogue: each shape is a symbol every implementation must satisfy and every
consumer must read, and required fields make it worse — they oblige a producer to
supply what its own source may not carry. Decision 3 says capabilities are minimal
atoms; this is the same rule applied to the data those atoms answer with.

**The case that surfaced it, kept because it is exact.**
`IPackageContentItem.packageName` is **required**. The node-structure document
does not carry the parent package's identity — the implementation's parser
receives it as a separate argument, from the request. So the type this package
declares, and defaults `IAdtPackageBrowsing<TContents>` to, is one no honest
strategy can build: a strategy sees the answer, and the name is not in it. A shape
declared here outlived the knowledge of where its fields come from, which is
precisely what a contract package cannot afford.

**Answered in 31.0.0: they left.** Sixty-three exported symbols, all of them
result shapes or the parts those were built from —
`IPackageContentItem`, `IPackageHierarchyNode`, `IRepositoryNodeContents`,
`ISearchResult`, `IWhereUsedListResult`, `ITransportTree` and its nodes, the feed
entries, `INamedItem`, `IObjectVersion`, the abapGit results, `IAtcRunResult`,
`IFeatureToggleRuntimeState` and the rest — and the package went from 409 exported
symbols to 346, sixty-three fewer, with nothing added.

**Including the parts they were built from.** A review found the nested shapes
still exported after their parents left — the feature-toggle levels, the
gateway-error internals, the whole ABAP-trace family.

**A named composition is not a result shape.** `IProfiler` was removed with them
and put back: it is `ITraceFamily & ITraceListing & ITraceReading &
ITraceDeletion`, and a consumer needs it both to type a profiler and to implement
one. Publishing it costs one symbol; removing it costs every consumer the same
intersection, spelled by hand and re-derived when an atom changes. It takes its
readings as parameters — `IProfiler<TEntry, TViews>` — like `IClassExecutor` and
`ICrossTrace`. **The line is the shapes, not the compositions.**

**The defaults left with them**, and that is the same rule rather than a second
one: a default is a claim about what a reading produces, so it belongs where the
reading does. `IAdtPackageBrowsing<TContents>` has no default and names no shape;
an implementation says what it answers, and a consumer holds whatever their
implementation gave them. The question "should the default be the document, then"
dissolves — the contract has no opinion to state.

**What stayed, and the line it draws.** `IObjectReference` did, because
`activateObjectsGroup`, `checkDeletionGroup` and `deleteObjectsGroup` take it: a
caller cannot make the call without it. It used to extend `IAdtObjectHit` — a
result shape — and now states its own fields. That is the test in practice: not
"is this data about ADT" but "is it needed to make the call or to satisfy the
signature".

**How to catch a violation.** A type declared here that no member signature needs
in order to be called or implemented. A required field whose value comes from the
request rather than the answer.

## 25. A failure names its own type; the contract does not grow a field per case

**The problem.** A consumer reading ADT's own message identifiers wanted them off
a failure. SAP puts them there — every `<exc:exception>` carries
`T100KEY-ID`/`T100KEY-NO` in its `<properties>`, and an activation checklist
carries a `<t100Key>` — and `IAdtError` has nowhere to put them. The obvious move
was to add a field.

**Why not.** The next caller wants a severity, the one after wants a job handle,
and each is right about their own case. A contract that grows a field per special
case ends up describing every caller's situation badly. And the information is
already in the answer: `response.data` is the document, whole.

**The decision.** The failure half is parameterised and the parameter flows.
`IAdtFailure<TError extends IAdtError>` had carried it since the union existed,
and it arrived nowhere, because `IAdtOperationOptions.analyse` pinned its return
to `IAdtError`. So a consumer's richer failure came back narrowed and they cast —
the one thing a parameterised failure exists to prevent.

`IAnalyse<E>` is the strategy, `IAdtOperationOptions<E>` carries `E` from it to
`getError()`, and the caller declares whatever their own failure is:

```typescript
interface IT100Failure extends IAdtError {
  readonly t100: { msgid: string; msgno: string };
}
const t100: IAnalyse<IT100Failure> = (verdict, answer) => …;

const answer = await client.getClass().activate(config, { analyse: t100 });
if (!answer.ok) answer.getError().t100;   // typed, no cast
```

**The asymmetry that stays.** The verdict handed *in* is `IAdtError` — the
library's own, built before any strategy is consulted. Only what comes back is
the caller's. A strategy cannot be handed a failure of a type it invented,
because nothing but the strategy makes those.

**Read with decision 20.** Choice is offered by injection, never by more
contract; this is that rule applied to the failure half, which had been the half
still asking for fields.

**Parameterising the options is half of it.** A member that takes
`IAdtOperationOptions<E>` and answers `IAdtResponse<T>` drops `E` on the way
out, and the caller is back to casting — the first version of this did exactly
that, and the check written for it declared its answer by hand rather than
asking a member, so it passed while the promise did not hold. All nine
capability members are parameterised, and the check calls them.

**A type argument has to be earned.** One generic signature per member is not
enough: `activate<IT100Failure>(config)` with no strategy type-checks and
promises a failure nothing will produce, because the member falls back to its own
default reading and answers an `IAdtError`. Reading the richer field compiles and
finds nothing. So each member has two call signatures — the parameterised one
requires `analyse`, and the plain one is what everything else gets.

**How to catch a violation.** A new optional field on `IAdtError` that serves one
kind of caller. A member whose options are not parameterised, or whose return is
not — so a strategy's type stops at the call site. A member whose parameterised
signature does not require the strategy. A type-level check that declares the
answer instead of obtaining it from a member.

## 26. A contract lives in the package that accepts it

**The problem.** `@mcp-abap-adt/interfaces` was one version line for every
contract. By 44.0.0 it had 108 versions and 41 majors, 28 of them after
2026-08-15, and almost all of that churn was ADT. Then `llm-agent` needed to
accept `IAuthProvider` and an access-check contract, which the hub accepts too.
Depending on this package for them would have tied `llm-agent` to every ADT
major. Import size was never the issue: the package is types and 51 constants.

**The decision.** A contract lives where it is **accepted** — a parameter, a
field or a return typed by it — not where it is implemented. One accepting
package owns it. Several accepting packages on the SAP side share
`@mcp-abap-adt/interfaces-adt` (or `-utils`, by what it is). Contracts accepted
across families go to `@mcp-abap-adt/interfaces-auth`, `-network` or `-utils`.
What nobody accepts is not moved; it stays in the `@mcp-abap-adt/interfaces`
facade, deprecated, and leaves with its next major (decision 11).

**The unit that moves is the file.** Evidence is gathered per exported symbol,
from parsed import statements across every dependent repository, not from name
searches: a name search missed exports whose file is named differently and
credited packages that declare a same-named type of their own. A file moves when
any export is imported, or is composed by a contract that moves — which is why
`auth/AuthType.ts`, imported by nobody, moved with `IValidatedAuthConfig`.

**Why not the alternatives.**
- *One package, fewer majors.* The churn is real ADT work; slowing it to spare
  other families inverts the cost.
- *A package per folder.* Folders are how the code is filed, not who depends on
  it; `auth/` alone holds both SAP-specific configuration and the cross-family
  `IAuthProvider`.
- *Contracts inside implementation packages* (`ILogger` in
  `@mcp-abap-adt/logger`). A package accepting the contract would pull the
  implementation and its peers (`pino`) with it, and "use your own
  implementation" stops being true (§1).

**What keeps it true.** `tools/check-graph.js` fails an import the graph does
not allow; `tools/check-surface.js` fails a symbol in the wrong package or a
facade that lost one; `tools/check-packed.js` proves the facade and the packages
resolve to the same declarations once installed from npm.

**What would change it.** A second family that accepts most of
`interfaces-adt`: then the split is along the wrong line, and the family
boundary should be redrawn.

**One of the two cited acceptors turned out not to be one, and the rule is what
found that out.** The problem statement above names `llm-agent` as accepting
"`IAuthProvider` and an access-check contract, which the hub accepts too". The
access-check half is no longer true. llm-agent settled, on 2026-09-20, that every
provider in it is a **client** of an outside service: a client proves who it is
and judges nobody, because nothing calls it, so it performs no authorization at
request time and accepts no policy function. Authorization there happens when an
instance is constructed for one caller, by narrowing what that instance can
address — which is addressing, not permission. An earlier draft of its design had
a `createFor(identity, check)` on a RAG provider; that is deleted, and with it
llm-agent's only reason to accept an access check.

So `AccessCheck<R>` has **one** acceptor, cloud-llm-hub, and by this decision one
accepting package owns its contract: it stays in the hub and does not enter
`interfaces-auth`. `IAuthProvider` is unaffected — it is accepted across
families and its placement stands. Nothing about the decision changes; applying
it to a corrected fact simply produced a different answer, which is what a rule
is for. Should a second repository later accept the same shape, that is when it
moves up, and not before.

llm-agent's own record: `docs/ARCHITECTURE.md` principle 8; the reasoning is in
`docs/superpowers/specs/2026-09-16-auth-contracts-design.md` §1.4, §4.4 and §5.

Spec: `docs/superpowers/specs/2026-09-15-interfaces-split-design.md`.

## 27. One mechanism brings its own error codes; it does not widen a shared set

**The problem.** Contracts for validating a SAML assertion needed a code for
"the assertion was refused". `TOKEN_PROVIDER_ERROR_CODES` was already there, it
already held `VALIDATION_ERROR` for a misconfiguration, and adding one member
was a two-line diff. That is what the first revision of #87 did.

**Why not.** That set describes what can go wrong with ANY token provider, and
the facade re-exports it, so every consumer of every mechanism sees every member.
SAML is one way in among several — client credentials, authorization code, basic,
JWT bearer, certificate. A consumer exhaustively handling `TokenProviderErrorCode`
would gain a case that cannot occur on its path, and would gain another with each
mechanism that followed. The shared set stops describing token provision and
starts being the union of every mechanism anyone implemented.

**The decision.** A mechanism or layer declares its own
`<AREA>_ERROR_CODES` / `<Area>ErrorCode` pair in the folder that owns it, and the
shared set keeps only what is shared. `ASSERTION_ERROR_CODES` in `auth/` holds
`ASSERTION_VALIDATION_ERROR`; `TOKEN_PROVIDER_ERROR_CODES` is unchanged. This is
not a new shape: `STORE_ERROR_CODES` and `NETWORK_ERROR_CODES` are the same rule
already applied, which is why the narrow set needed no argument beyond following
them.

**Read with decision 25.** There, a failure does not grow a field per case; here,
a set of codes does not grow a member per mechanism. Same instinct — one more
special case is always the small diff — and the same answer: the special case
declares its own thing.

**What keeps it true.** `npm run check:surface` compares every declaration and
every constant value against the 44.0.0 baseline, so widening a shared set fails
the check by name: the first revision failed with `declaration changed` and
`value changed` on `TOKEN_PROVIDER_ERROR_CODES`, and the narrow set left all 381
symbols and 51 constant values matching. A baseline diff appearing in a PR that
only adds contracts is the signal that something shared was widened.

**What would change it.** A code that genuinely belongs to token provision
itself, not to one way of doing it — an exhaustion or refusal every provider can
hit. That belongs in the shared set, and regenerating the baseline for it is the
documented path (§7 item 5), not a workaround.

PR: #87.

## 28. A release publishes what changed, from the tree the tag names

**The problem.** Publishing `interfaces-adt` 1.1.0 meant publishing one changed
package out of five. The documented procedure — publish all five in dependency
order — produced four `You cannot publish over the previously published versions`
errors around the one publish that mattered, and ran every package's
`prepublishOnly`, which is the full `npm run check`, five times for one release.

**Why not.** A class of errors that is always expected is a class nobody reads.
The fifth line, the one that is a real failure, looks exactly like the four that
are not. That is not a style complaint: the same habit hid a stale metadata cache
minutes later, when `npm view` answered `1.0.0` for a package that had just
published `1.1.0` and `npm pack` of the new version failed — both indistinguishable
from a publish that silently did not happen.

**The decision.** `npm run release:publish` asks the registry what it serves,
publishes only the versions missing from it, in the dependency order of the
`workspaces` array, runs `npm run check` once, and afterwards asks the registry
whether it serves each version before publishing anything that depends on it.
A clean run with nothing pending says so and exits 0; there is no expected-failure
output to filter.

**What is published is the tree the tag names.** Not "a tree whose tag is an
ancestor of `HEAD`": a commit made after the tag can change a package without
bumping its version, and the tarball would then carry content that version never
had. `HEAD` must equal the tag's tree, compared over the whole repository rather
than an enumerated set of build-affecting paths — such a list would need the root
`tsconfig`s, `tools/`, and every package `tsc -b` links through, and would be
wrong by omission. All five tags of the 45.0.0 release point at one commit, so
this is how a release here was already made.

**A prerelease never lands on `latest`.** Both dist-tag guards ask whether the
publish *targets* `latest` — an absent `--tag` or an explicit `--tag=latest` — and
version order is SemVer, from the same library npm uses, not string order:
`localeCompare` ranks `1.0.0-beta.1` above `1.0.0`, which refuses a legitimate
stable release and admits a beta to the stable line.

**What keeps it true.** `npm run check:publish` (§7 item 9) runs the publish path
against throwaway repositories with a fake `npm` first on `PATH`. Its own history
is the argument for it: the suite passed on a checkout where the dependency it
needed was not installed, resolving a stray `semver` from an ancestor of the
temporary directory; a version assertion compared the installed copy with itself;
a probe file stood in for the script under test. Three green assertions, nothing
asserted.

**So a check that has never failed is an assumption.** Every case here was made
to fail on purpose before it was trusted — a stub dependency, a redirected
`require`, a weakened isolation rule — and each must fail alone, leaving its
neighbours green, or it is pinning something other than what it names.

**Isolation is a rule about names, not a list of them.** Git takes configuration
through `GIT_CONFIG_GLOBAL`, through `GIT_CONFIG_COUNT` with numbered
`GIT_CONFIG_KEY_n`/`GIT_CONFIG_VALUE_n`, through `GIT_CONFIG_PARAMETERS`, and can
be pointed at another repository with `GIT_DIR`/`GIT_WORK_TREE`. Each was measured
to hide an untracked file from `git status --porcelain`, so each could blind the
dirty-tree guard. Nothing named `GIT_*` is inherited; the few needed are set
explicitly.

**What would change it.** CI arriving on this repository, which would move the
gate off `prepublishOnly` and out of one operator's shell. Or a release that
genuinely spans several commits, which the whole-tree comparison forbids by
design — the answer there is to tag the commit that is published, not to loosen
the comparison.

**Amended 2026-09-21: the verification moved to the end.** As decided, the run
asked the registry whether it served each version *before* publishing anything
that depended on it. Three releases in two days ended on that wait: the first
package published, the read-through took longer than the timeout, the run
exited, and the second package was never attempted. Raising the timeout was
tried and was not the answer — the third stop happened at two minutes.

The wait bought nothing the next publish needed. `npm run check` runs once,
before any publish, over tarballs built here; it never reads the registry. And
`npm publish` uploads a tarball rather than resolving the ranges in the
manifest it uploads, so publishing B never asks whether A is served. The only
reader of those ranges is a consumer installing later, and their question is
whether A is on the registry at all — which one verification at the end answers
for every package at once.

So every package is published, then all of them are verified against one
shared budget. A version that is not being served by the end is named and the
run exits **2**, distinct from the **1** of a publish that failed, because
"published, not visible yet" and "not published" call for different next steps
and had been exiting identically.

Two consequences of the same lag had to be handled with it. **A refusal from
`npm publish` is a question, not a verdict**: the likeliest reason to meet one
is a re-run whose plan was built from a stale read, where the version is
published and npm says so by refusing it. Treating that as fatal would strand
the release one layer down, so the registry is asked, and a version it serves
is one with nothing left to do. **And a read that fails is not a read that
answers "no"**: only `E404` is an answer, and a timeout or a 5xx in the
verification loop came out as an unhandled throw — exit 1 with a stack trace,
on a release where every publish had succeeded. It is now a third state with
its own sentence wherever it is asked, including after a refusal, where
folding it into "the registry does not serve this version" would have reported
a finding nobody made.

**Every question put to the registry now goes through one budgeted helper.**
Three review rounds each found a different corner of the same mistake: a
decision taken on a single read of the thing that is known to lag — a refusal
called a failure, a publish called invisible, a re-run recommended into the
wall it was meant to avoid. Patching the corners one at a time was producing a
message with more branches than the logic behind it. So there is one way to
ask, it spends the budget before it concludes anything, and a caller gets
`true`, `false` or `null`. A refusal still stops the run, because the packages
after it depend on it — but only after the registry has been asked to the end
and still does not have the version.

The last of it is advice rather than behaviour, and it was wrong twice before
it was right: **"re-run" is only safe once the read path shows what this run
published.** Before that, those packages go back into the plan, npm refuses
them, and the run stops before whatever still needs publishing — the original
failure, reached through the message that was supposed to resolve it. So the
stop confirms what this run published before reporting, and names them in two
lists — visible, and not visible yet — with the command that settles the
second and what a re-run before then does. What the decision above keeps is its point:
a release is not finished until the registry is asked. What it loses is the
idea that asking should stand between two publishes.

**Read with decision 11.** What nobody accepts is not kept; the same instinct
applies to output nobody reads.

---

## 29. A contract does not permit a call that cannot work

**The problem.** `IAdtTransportObjectActions` shipped in `interfaces-adt`
1.2.0 with two optional parameters: the whole options argument of
`createTask`, and `position` on the entry `removeObject` takes. Both were
declared from captures of Eclipse ADT, and both were wrong. Measured against
an on-premise system on 2026-09-21, the call without `tm:targetuser` is
refused — `400 SCTS_ADT_MSG 009`, *"User  does not exist in the system (or
locked)"*, an empty name — and the call without `tm:position` answers `200`
with the usual echo document while removing nothing, 22 entries asked for and
22 still on the task afterwards.

**Why a capture cannot tell you.** It records what one client sent, not what
the server requires. Eclipse sends every attribute on every call, so no
capture of it can separate the load-bearing from the decorative. A contract
written from captures alone therefore makes optional exactly the fields that
are not, and nothing in a unit test over the captured documents can see it:
one failure needs a server, the other is success-shaped.

**The rule.** When a contract is written ahead of a server run, a parameter
whose necessity has not been measured is **required**, not optional. Being too
strict costs a caller one argument they might not have needed. Being too loose
costs them a call that type-checks, ships, and either throws or silently does
nothing — and a consumer holding the contract has no way to find out which,
because the contract is what they were given to trust. The asymmetry is the
whole argument: one error is visible at the call site, the other is invisible
until a server disagrees.

**It also means a required parameter needs a source.** `removeObject` requires
a position, so `readObjects` was added in the same major: a contract that
demands a value it offers no way to obtain sends the caller around the package
to assemble the request themselves, which is the layering these contracts
exist to prevent. A requirement and its source ship together or neither does.

**And the wrong shapes are written down.** `src/__typechecks__/` holds both
old calls as `@ts-expect-error`. A directive that stops erroring is itself an
error, so loosening either parameter again fails the build rather than
shipping — the same instinct as decision 28's "a check that has never failed
is an assumption", applied to a requirement instead of a guard.

**What would change it.** A measurement, which is the only thing that ever
should: a server that accepts the call without the attribute. Then the
parameter becomes optional, with the run that says so recorded beside it.

**Read with decision 24.** The contract carries what is needed to use it —
including, it turns out, the reading that produces an argument another member
insists on.

---

## 30. A shape only the implementation accepts leaves at a major, without a deprecation cycle

**The problem.** 96 `ICreate*Params` / `IUpdate*Params` types sat in the 44.0.0
surface. They are the argument shapes of the functions that build ADT requests,
and checking every dependent repository found four of them imported anywhere —
`ICreateDataElementParams`, `ICreateFunctionModuleParams`,
`IGetTableContentsParams`, `ISearchObjectsParams`, all by the MCP server. Eight
more appear in the signature of a capability interface this package exports.
The remaining 84 are accepted by nothing outside `@mcp-abap-adt/adt-clients`.

Being nobody's contract had a cost that was not theoretical: **85 of their
fields were ignored by the very code that took them**. A caller who created a
domain with `datatype: 'CHAR', length: 10` got `<doma:datatype/>` empty, and SAP
then refused to activate it — `DO(251) Data type ' ' does not exist`, measured
on a cloud trial on 2026-09-22. Nothing in this repository could have caught
that, because the fields are honoured, or not, one repository away.

**Decision 26 already answers where they belong**: a contract lives where it is
accepted, and these are accepted by the implementation alone. What it also says
is that a contract nobody accepts *stays in the facade, deprecated, and leaves
with its next major* — and that is the clause this entry amends, for this case.

**Decided.** They leave now, at a major, with no deprecation cycle. The 84 are
removed from `interfaces-adt` and from the facade in one release, and declared
in `tools/surface-removed.txt` so the removal is an act somebody signed rather
than a symbol quietly falling out of a package.

**Against.** Decision 26's own rule, and the machinery built for it —
`tools/check-deprecated.js` requires every 44.0.0 symbol to remain importable
from the facade and to report as deprecated, pointing at its new home.

**Why.** The deprecation clause exists to give a consumer a release in which
their import still works while they move it. There is no such consumer here:
these 84 are imported by nobody, which is the same evidence that says they are
not contracts. A deprecation cycle for an unused symbol buys no one time; it
only keeps the facade re-exporting a shape the split was meant to relocate, and
keeps the field-level lie alive for one more release in the one package that
cannot see it.

There is also no destination the facade could point at. Decision 26's mechanism
moves a contract between `interfaces-*` packages, and the accepting package here
is `adt-clients` — a consumer. The facade cannot re-export from it without
inverting the dependency, so "stay deprecated, pointing at your new package" has
nothing to name.

**What keeps it true.** `tools/surface-removed.txt` is read by
`check-surface.js`, `check-packed.js` and `check-deprecated.js`: a symbol that
disappears and is not written there still fails, and a name written there that
the facade still exports is reported as stale. Alongside it,
`tools/surface-changed.json` records the declaration a deliberately changed
symbol is expected to have **now** — not merely its name, which would have
retired the baseline check for that symbol forever.

**What would change it.** A consumer outside this workspace importing one of
the 84. The search covered the repositories under `~/prj` and nothing else, so
that is the gap this decision is exposed to — the same caveat decision 26
records for its own evidence.

## 31. The contract holds the parameterised atom; the implementation holds its own input types

**The problem.** One `IXxxConfig` per object type serves every member of that
type's handler — ten for a domain, twelve for a class, fourteen for a table:
`validate`, `create`, `read`, `update`, `check`, `checkDeletion`, `delete`,
`activate`, `lock`, `unlock` and the version readers. Their inputs are not the
same input. Measured on the implementation, `AdtClass` reads from its config

- on `create`: `superclass`, `final`, `createProtected`, `classTemplate`,
  `packageName`, `masterLanguage`, `masterSystem`, `responsible`, `description`;
- on `update`: `sourceCode`, `definitionsCode`, `localTypesCode`,
  `macrosCode`, `testClassCode`.

The intersection is `className` and `transportRequest`. Two different inputs
wearing one type.

**What it cost, concretely.** A release spent asking, field by field, whether
each was dead — and the question turned out to be *unanswerable as posed*, because
a field is dead for one member and live for another. `IUpdatePackageParams` does
not read `superPackage`; `validate` and `create` do. Two sweeps over the same
files disagreed with each other, and the first one removed `description` from a
table type's *create* because it was dead on the *update* — caught in review, one
step from shipping an object described by its own name.

The type also has to explain itself in prose. `IDomainConfig` carries the
sentence *"the fields beside this one describe a create; on an update they are
not sent"*, which is a type telling the reader what it could have told the
compiler.

**Decided.** Two changes, and they are one change:

1. **Inputs are per operation, not per type.** `IDomainCreateConfig`,
   `IDomainUpdateConfig`, and so on — each carrying what its own endpoint
   accepts. This is what the capability atoms were already built for: every one
   of them takes its own `TConfig` — `IAdtCreatable<TConfig, TCreated>`,
   `IAdtUpdatable<TConfig, TUpdated>`, `IAdtMetadataUpdatable<…>`,
   `IAdtValidatable<…>` — and the implementation substitutes the same type into
   all the slots. Splitting does not fight the shape; it finally uses it.

2. **The contract holds the agnostic shape; the implementation holds its
   realisation.** `@mcp-abap-adt/interfaces-adt` keeps the parameterised atoms
   *and* the general input and result interfaces they are parameterised with —
   what any ADT create takes, what any write takes, what any of them answers.
   The concrete `IDomainCreateConfig` and its twenty-seven neighbours extend
   those and live in `@mcp-abap-adt/adt-clients`, beside the code that reads
   them.

   The agnostic layer is not a guess at what might be shared: it is already
   written out by hand, 39 times. Counted across the ADT configs,
   `transportRequest` appears in **34**, `description` in **31**,
   `packageName` in **27**, `masterLanguage` in 22, `masterSystem` and
   `responsible` in 9 each — and **not one of the 39 extends anything**. That
   repetition is the shape the contract should be holding.

   One thing resists it, and is recorded rather than solved: the object's own
   name. It is `className`, `includeName`, `tableName`,
   `serviceDefinitionName`, `scalarFunctionName` — a different field per type,
   so no agnostic base can carry it without renaming twenty-eight types. The
   cheapest reading is that the name stays the concrete type's business and the
   base carries only what surrounds it; normalising to `name` is a separate
   decision, and a larger one.

**Against.** Decision 26 — a contract lives where it is accepted — and the
principle that everything a consumer needs is in `interfaces`, so any
implementation can be swapped for their own.

**Why it does not contradict either.** The consumers already do it this way, and
the evidence is in their import statements. Counted across every repository
under `~/prj`: **58** imports of an `*Config` come from
`@mcp-abap-adt/adt-clients` — every ADT object config, the whole of the
backuper's traversal — and **55** come from `@mcp-abap-adt/interfaces`, all of
them auth or network (`IAuthorizationConfig`, `IConfig`, `IConnectionConfig`,
`ISapConfig`, `ITimeoutConfig`). `mcp-abap-adt-backup` has no dependency on
`@mcp-abap-adt/interfaces` at all: it declares `@mcp-abap-adt/adt-clients`
alone and writes `import type { IDomainConfig } from '@mcp-abap-adt/adt-clients'`.
So for the ADT configs the rule was already not being followed, and nobody
noticed because nothing broke — which is the definition of a rule that is not
load-bearing.

Swappability survives, and at the level where it belongs — it is the point of
the arrangement rather than a casualty of it. A consumer who replaces the
implementation pulls the same `interfaces` for the atoms **and for the agnostic
input shapes**, and their own package for the realisation: code written against
the general interface keeps working across implementations, and each
implementation adds what only it knows. Network and authentication already work
this way, in `interfaces-network` and `interfaces-auth`; the atom is what makes two implementations
interchangeable, and it is generic precisely so the config need not be shared.
What would not survive is a consumer's code being portable between two
implementations without change — and that is already untrue, since the
backuper's code is typed against `adt-clients`.

**What it buys.** The treadmill. Decision 26 was written because `interfaces`
had 108 versions and 41 majors, 28 of them ADT — and the ADT configs are the
churning part. On 2026-09-22 three majors of the contract shipped in one day for
changes that were entirely about what an ADT config holds; under this decision
they are one major of one package. The question "is this field dead" also becomes
decidable, and decidable by a script rather than by hand.

**What has to go with it.** A per-operation input is the place the document model
belongs, and without it the split delivers little: `IDomainUpdateConfig` would
hold `document?: string` and nothing else, which is the typing the library has
today — that is, none. Reading `XFELD`, `SPRAS` and a Z domain in both of its
states shows what the document holds and the type does not: `outputInformation`
with its own `length` (a `LANG(1)` shown as 2), `style`, `conversionExit`,
`signExists`, `lowercase`, `ampmFormat`; `valueInformation` with either a
`valueTableRef` — a reference with `uri`/`type`/`name`, not a string — **or**
`fixValues`, never both; and each `fixValue` with `position`, `low`, `high` and
`text`, where an empty `low` is a legitimate value. `IFixedValue` is
`{ low, text }`. A data element's document is the same story: four labels, each
with a `Length` **and** a `MaxLength`.

So the two land together, in one major, or not at all.

**What would change it.** A consumer typed against the atoms alone, with its own
configs, that needs to interoperate with `adt-clients` objects — then the
concrete configs are accepted in two places and decision 26 puts them back in
the contract. Nothing like that exists today.

## Open, and what would settle it

Not decisions. These are questions this repository has met and deliberately left
open, recorded here for the reason the preamble gives: so the next person can tell
an open question from an accident, and does not re-derive it. Each says what would
close it. They arrived from `2026-09-16-credential-contracts-design.md`, whose
design half moved to the `llm-agent` auth-contracts spec when that became the
single source of truth for the design; these three are about this repository's own
shape, not about that design.

- **The contracts nobody accepts.** `interfaces` 45.0.0 still carries what no
  package imports — the five header groups, `ISessionState`, `ISessionStorage`,
  `ITokenProviderResult` — each marked `@deprecated`. They leave with the facade's
  next major, together with the re-export (decision 11). **What would settle it:**
  that major. One caveat on the evidence — only repositories under `~/prj` were
  searched, so a consumer outside them would not have shown.

- **A separate `interfaces-sap`.** SAP/BTP configuration and authentication live in
  `interfaces-adt` because only the ABAP family accepts them (decision 26). If
  their release rate came to differ from ADT's as much as ADT's differs from the
  rest, they would deserve their own package. **What would settle it:** measured
  release cadence, not a guess — the same evidence decision 26 was made on.

- **`IAuthorizationStrategy`'s home.** It describes a generic interactive OAuth
  login but is accepted only by `auth-providers` today, so decision 26 keeps it in
  `interfaces-adt`. **What would settle it:** a package outside the SAP side
  accepting it, at which point it moves to `interfaces-auth`.
