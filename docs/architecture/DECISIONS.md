# Decisions, and why

Every entry here is a choice that could reasonably have gone the other way. The
point is not the choice — it is the reasoning and the evidence, so that whoever
meets the question next can tell a decision from an accident, and can reopen one
without re-deriving it from scratch.

This file exists because that reasoning was scattered across commit messages, PR
bodies and code comments: findable only by someone who already knew what to look
for. Several decisions below were re-litigated more than once for exactly that
reason.

**Adding an entry.** One per decision, in the shape used below. Say what was
decided, what it was decided *against*, why, and what would change it. An entry
that cannot name what would overturn it is a preference, not a decision.

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

---

## 4. The library speaks ADT; it does not validate

**Decided.** Parsers map documents onto types. They do not judge whether SAP was
entitled to send what it sent.

**Against.** Guarding the wire — checking roots, rows, fields, containers,
values — so a malformed document is refused rather than mapped.

**Why.** The server is the authority on its own responses, and where a check is
genuinely needed ADT has an endpoint for it: `AdtInclude.validate()` posts to
`/includes/validation`. A library that also judges the wire accumulates claims
nobody measured, and each guard invites the next: one trace parser grew six
levels of them across eleven review rounds, including a validator that rejected
timestamps RFC 3339 explicitly permits. All of it was removed; the file went from
1020 lines to 343.

**Where the line runs.** If code answers *"was SAP entitled to send this?"* it
does not belong here. If it answers *"what do I do with what arrived?"* it does.
That is why `compareRecordedAt` survived the removal: comparing ISO timestamps
as strings is wrong across UTC offsets regardless of what SAP sends, and
`latestTraceId()` exists precisely to avoid taking a stale trace.

**A 200 with an empty body is a faithful "nothing".** ADT has 404 and it has
error payloads; when it uses neither, relaying emptiness is accurate. The known
hazard around empty reads belongs to the *update* path on editable objects,
where an empty read becomes the basis of a write that erases what was there. It
does not transfer to read-only views.

**Superseded within itself.** Earlier releases of the trace parser did validate.
This entry records why that was reversed rather than pretending it never
happened.

---

## 5. Big XML is the consumer's to parse

**Decided.** A plain default mapping, plus a way for the consumer to supply its
own reader and keep a type: `ITraceReadingWithParser.readWith()`,
`AdtRequest.listNodes(parse)`.

**Against.** Growing filtering and reshaping options on our side; or handing
back a raw response and telling the consumer to go untyped.

**Why.** Searching and filtering belong to the server, which has endpoints for
them. A consumer whose system answers in a shape our default does not fit needs
a type, not an escape hatch.

**Shape note.** `readWith` is a **method** and not an overload on `read`, and
that came from the compiler rather than from taste: `listNodes()` is an overload
on a concrete class nobody else implements, while `ITraceReading` is implemented
by consumers, and an overloaded method cannot be satisfied by an object literal.
The typecheck failed the moment it was tried.

---

## 6. Every returned shape has a name

**Decided.** No anonymous object types in a published contract. `ITraceState`,
`ITraceExecutions` exist even though they are two fields each.

**Against.** Inline `{ value: string; text: string }` where it is used.

**Why.** A contract is implemented by somebody else's class, and after
`implements` there has to be something to write. An anonymous type forces the
consumer to re-declare the same fields in its own code — the duplication this
package exists to remove.

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
and looks for one that is new. The waiting lives in the test helper, because
only the caller knows how long it is willing to wait.

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
runtime, so `scripts/print-trace-entry.ts` reads a live feed and names anything
that came back `undefined` — because a field the wire omits arrives as
`undefined` despite the type.

---

## 10. A guard that can be silenced is not a guard

**Decided.** Tools live under the same compiler as the code. `scripts/**/*` is
in both test tsconfigs.

**Against.** Adding files to the config one at a time, and reaching for
`as any` when a signature changes.

**Why.** Two renames — `adtType` → `type`, `is_package` → `isPackage` — went
unnoticed because nothing compiled the scripts, so at runtime they read
`undefined` and printed every package entry as a non-package: confidently, and in
silence. A tool that fails is better than one that lies. And when the scripts
were finally put under the compiler, four `(connection as any).reset()` calls
survived it — the cast telling the compiler to stop looking at precisely the API
that had been removed.
