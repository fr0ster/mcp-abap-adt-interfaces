# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.1] - 2026-09-22

### Changed

- **A measurement asserted in 2.0.0 is retracted.** The documentation for
  `readObjects` said a metadata read gets a representation carrying no
  `tm:abap_object`, because the request names no `Accept`, and that positions
  therefore could not be read from it however it was parsed.

  Measured against an on-premise system on 2026-09-22 — the same URL with
  `application/vnd.sap.adt.transportorganizer.v1+xml` and without it — the two
  answers are byte for byte identical: 95411 bytes and 166 `tm:abap_object`
  for a request, 55549 and 88 for a task. The header settles nothing.

  The member stays, because the reason it exists does: `removeObject` requires
  a position and nothing else here hands one back, which would leave a caller
  parsing a transport document for a `tm:position` themselves. What it
  promises is the answer — entries, each with its position as a value — and
  not how an implementation obtains them. A contract is no place to assert
  something about a wire that was not measured, and this one now says only
  what must come back.

  Documentation only; no type changed. `@mcp-abap-adt/adt-clients` corrected
  the same claim in its own comments and API reference on 2026-09-21.

## [2.0.0] - 2026-09-21

### Changed

- **BREAKING: `IAdtTransportObjectActions` takes a fifth type parameter**,
  `TObjects`, for the reading added below. Every implementation and every
  declared use names it.

- **BREAKING: `removeObject` requires `object.position`.** It took
  `IAbapObjectEntry` whole, where the field is optional, and the member took
  the whole type because nothing said the server needed it. It does. Measured
  against an on-premise system, 2026-09-21: 22 objects asked for by
  `pgmid`/`type`/`name` alone each answered `200` with the usual echo
  document, and re-reading the task found all 22 still on it. The same
  documents carrying `tm:position` — nothing else added — removed every one,
  22 down to 0, each confirmed by a re-read.

  The parameter is `IAbapObjectEntry & { position: string }` rather than a new
  type: the field belongs to the entry, and what changes is that this member
  insists on it. `addObject` still does not, because an entry that does not
  exist yet has no position.

- **BREAKING: `createTask` requires `targetUser`**, and the options argument
  with it. This shipped saying the server would decide whose task it is when
  `tm:targetuser` was absent. It does not: the call without the attribute was
  refused with `400 SCTS_ADT_MSG 009`, *"User  does not exist in the system
  (or locked)"* — two spaces, an empty name — and the same call carrying it
  answered 200 and a task number. Measured on the same run.

  Nothing below the caller can fill it in: `IAbapConnection` does not expose
  who is authenticated, and finding out costs a second request.

### Added

- **`readObjects`** — the objects a request or task holds, each with the
  `tm:position` that `removeObject` now needs.

  It is a separate member because it answers a separate thing: entries, each
  with its position as a value, where a metadata read answers a document.

  > **Retracted in 2.0.1.** This entry also claimed that a reader sending no
  > `Accept` cannot answer it however its result is parsed. That was measured
  > false the next day — the same URL with and without the header is byte for
  > byte identical. See the 2.0.1 entry above.

  Without it `removeObject` would require a value the package offers no way to
  obtain, leaving a caller to assemble the request themselves — the layering
  this package exists to prevent.

### Why a major so soon after 1.2.0

1.2.0 declared these members from captures of Eclipse and unit tests over the
documents it sent. Eclipse sends both attributes on every call, so nothing in
a capture could show that either was load-bearing. The first run against a
server found both. The contract is what was wrong, and a contract that permits
a call which cannot work is worse than one that forbids it: the old signatures
type-check today and fail — `createTask` at runtime, `removeObject` silently.

## [1.2.0] - 2026-09-21

### Added

- **`IAbapObjectEntry` — one entry in a transport request's object list**, as
  the CTS object directory holds it: `pgmid`, `type`, `name`, and optionally
  the description and the position within a task.

  **Not `IObjectReference`, though they look alike.** That one is ADT's
  vocabulary — its `type` is an ADT object type code such as `CLAS/OC`, and it
  carries a `uri` and a `parentName`. The object directory speaks another: a
  program id, a short type and a name, `R3TR FUGR ZMCP_BLD_FGR_H1`. Merging
  them would produce a type where half the fields are always wrong and `type`
  means one thing or the other depending on which member was called.

  A request parameter, which is why it is here — the same reason
  `IObjectReference` survived 31.0.0 while the result shapes left: a consumer
  cannot call a member that takes one without being able to name the type.

- **`IAdtTransportObjectActions<TRemoved, TAdded, TTask, TActionLog>`** —
  `removeObject`, `addObject`, `createTask` and `readActionLog`.

  A transport listing already answers every `atom:link` a request and its
  tasks carry — `release`, `addobject`, `changeowner`, `newtask` — so that a
  caller follows an href rather than assembling a URL. Handing over the
  addresses of operations while declaring nothing that performs one leaves the
  caller building `tm:root` documents by hand, which is the layering this
  package exists to prevent.

  What it costs to lack them, measured on an on-premise system: deleting an
  ABAP object does not free its name, because the object-directory entry stays
  on the request that carried it. Until it is detached a create of the same
  name is refused with `CTS_WBO_API 019` — even passing that same request as
  `corrNr` — and the ways out are releasing the whole request, shipping
  everything else in it, or SE09. Reported as fr0ster/mcp-abap-adt#221,
  implemented in fr0ster/mcp-abap-adt-clients#151.

  Four members and no composite: the order a caller uses them in, and what
  they do when `addObject` is refused, is theirs.

## [1.1.0] - 2026-09-19

### Added

- **`IAssertionValidator`** — establishes that a SAML assertion is genuine,
  addressed to the caller, currently valid, and answers a request that was
  actually made, rejecting by throwing with a reason naming the check that
  failed. Validation is a strategy, like everything else pluggable here: a
  consumer with a trust model this package cannot anticipate can replace it
  wholesale, while the shipped default (arriving in a later `auth-providers`
  release) verifies the signature and refuses anything it cannot place.
- **`AssertionContext`** — what a provider knows about the login an assertion
  is answering: the expected `InResponseTo`, the audience, the ACS URL, and an
  optional trusted issuer for a validator that establishes trust some other way.
- **`ValidatedAssertion`** — what a validated assertion yields: an expiry that
  is never later than either the assertion's own `Conditions` or the bearer
  confirmation that was accepted, identity fields, and both the raw wire
  response and the signed XML that verified — kept distinct because holding the
  former does not make every byte of it trustworthy.
- **`IAssertionReplayStore`** and **`AssertionReplayKey`** — remembers
  assertions so a replay is refused, keyed by issuer and assertion ID together,
  since an assertion ID is unique only within the identity provider that minted
  it.
- **`ASSERTION_ERROR_CODES`** and **`AssertionErrorCode`** — the codes an
  assertion validator refuses with, starting with `ASSERTION_VALIDATION_ERROR`.
  They are their own set rather than additions to `TOKEN_PROVIDER_ERROR_CODES`:
  that set describes what can go wrong with ANY token provider, and SAML is one
  authentication mechanism among several, so it must not widen a contract every
  provider shares. A mechanism brings its own codes, as the store and network
  layers already do. Existing declarations are therefore untouched, and
  `tools/baseline-44.0.0.json` needs no regeneration.

## [1.0.0] - 2026-09-16

### Added

- The package. Its contracts moved unchanged from `@mcp-abap-adt/interfaces`
  44.0.0, which re-exports them, deprecated, from 45.0.0. Why: decision 26 in
  `docs/architecture/DECISIONS.md`.
