# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [8.0.0] - 2026-09-23

### Added

- **The SAP header groups live with the headers they group** —
  `SAP_CONNECTION_HEADERS`, `UAA_HEADERS`, `PRESERVED_HEADERS`, and the
  `ISessionState`, `ISessionStorage` and `ITokenProviderResult` contracts.

  All six were declared in the `@mcp-abap-adt/interfaces` facade, which
  declares no header name of its own: it imported all eighteen from here to
  build the groups, and `ITokenProviderResult` imported `IConnectionConfig`
  from here too. A grouping one package away from what it groups, and a token
  result one package away from the token contracts. They are beside
  `ISessionStore` and `ITokenProvider` now.

  Each carried *"No package imports this; it is removed in the next major"*,
  and the premise held — nothing under development imports them. They moved
  rather than being deleted because where they belong is not in doubt, and a
  grouping is cheap to keep and expensive to reinvent.

### Removed

- **BREAKING: the three proxy routing headers leave** —
  `HEADER_BTP_DESTINATION`, `HEADER_MCP_DESTINATION` and `HEADER_MCP_URL` are
  in `@mcp-abap-adt/interfaces-network` `1.1.0`, together with
  `PROXY_ROUTING_HEADERS`, which groups exactly those three.

  Nothing about them is ABAP: they name where a proxy sends a request, and
  that package already held the MCP session headers beside them. Holding them
  here bound anyone reading a routing header — `mcp-abap-adt-header-validator`
  and `cloud-llm-hub` both do — to this contract's release rate.

- **`PROXY_MODIFIED_HEADERS` is gone and has no new home.** It grouped
  `HEADER_AUTHORIZATION`, declared in `-network`, with three SAP names declared
  here, and neither package may import the other (the dependency graph in
  `tools/check-graph.js`). A set spanning both domains belongs to whoever
  composes them — a proxy — and nothing under development imported it.

## [7.0.0] - 2026-09-23

### Added

- **`ADT_TASK_TYPE` and `AdtTaskType`** — the task types CTS accepts, as a
  constant rather than a literal at each call site. `changeTaskType` declared
  them inline, `'S' | 'R' | 'X'`, which gave a consumer nothing to import: the
  implementation in `@mcp-abap-adt/adt-clients` had to repeat the union under a
  local name, and every caller had to repeat the letters.

  **The letters are SAP's, not a choice made here.** They were measured against
  BTP ABAP on 2026-09-23 by sending each one and reading the task back, and the
  constant carries what was refused too — `'Q'` ("You can only change the type
  of tasks in workbench requests") and `'K'`/`'W'`, which are request types.
  That belongs in the one place a consumer can import it from.

  It is **not** added to the `@mcp-abap-adt/interfaces` facade. Every symbol
  the facade re-exports is already marked *"@deprecated Import from
  @mcp-abap-adt/interfaces-adt"*; a new one there would be born deprecated.

  Both are exported from this package's entry point, and
  `__typechecks__/transportObjectActions.ts` imports them from there rather
  than from the file that declares them. That is not tidiness: the first
  version of this change declared them and forgot the re-export, so the import
  the paragraph above tells a consumer to write did not resolve and
  `ADT_TASK_TYPE` was `undefined` in the built package. Nothing caught it —
  `check-surface.js` reads the facade, and these two are deliberately not
  there. Found in review.

### Changed

- **`changeTaskType` takes `AdtTaskType`** instead of the inline union. **Not
  a break.** The alias is those same three values and TypeScript compares
  types structurally, so a call passing `'S'` compiles and so does a
  declaration that spells the union out — the two are mutually assignable.
  This entry called it breaking and said such a declaration would stop
  compiling; both were wrong, caught in review. What makes 7.0.0 a major is
  the removal below.

### Removed

- **BREAKING: `source` leaves six configs** — `IDomainConfig`,
  `IDataElementConfig`, `IPackageConfig`, `ITableTypeConfig`,
  `IFunctionGroupConfig` and `ITransportConfig`.

  **The contract said where a write's body goes twice, and differently.**
  `IAdtUpdatable.update` and `IAdtMetadataUpdatable.updateMetadata` document
  `options` as "`source` for the body"; each of the 26 configs that carried a
  `source` said the caller "reads the document … and passes it here". An implementation honouring one made the
  other a lie — `adt-clients` read the config only, so the call the atom
  documents sent `undefined` and wrote nothing. Its repair reads both channels
  with the options winning and says in a comment that choosing between them is
  the contract's job; that repair is on its `main` and not released, so no
  published version of it has ever honoured the atom's sentence.

  It is one channel now, and the split is not arbitrary. Measured across the 26
  configs that declared a `source`, and the implementations in `adt-clients`
  that read them: the field has exactly one reader besides the write, and that
  is `check`/`validate`, which compile a source the server does not hold yet
  and have no options channel to take it from. Six of the 26 lose the field
  here; 20 keep it. None of the six has such a member — `domain` passes
  `undefined` where the source would go, `dataElement` sends none, `tableType`
  validates a description, and `package`, `functionGroup` and
  `transportRequest` have neither. Nothing read their `source` but the write.

  `IAuthorizationFieldConfig` is in the same position and is deliberately
  **not** in the count: it never declared a `source`, so it is outside the 26
  and has nothing to lose here.

  The configs that keep it are the ones whose `check` or `validate` compiles
  it. `IAdtOperationOptions.source` now says this outright.

  **Migrating.** A write that passed the body in the config moves it to the
  options; a call that already passed it there is unaffected.

  ```diff
  - await domain.updateMetadata({ domainName, source: edited }, { lockHandle });
  + await domain.updateMetadata({ domainName }, { source: edited, lockHandle });
  ```

  A `check` or `validate` keeps passing its source in the config — that is the
  reader the field is left for.

  Not deprecated first: decision 30 — an implementation-only shape leaves at a
  major.

## [6.0.0] - 2026-09-23

> Recorded as **decision 32** in `docs/architecture/DECISIONS.md` — why the
> payload is a string this package passes through rather than a document it
> models, and why a create does not take one. It withdraws the half of decision
> 31 that called for a typed document model.

### Changed

- **BREAKING: one name for what a write sends.** The payload field carried
  eleven names across 35 fields — `sourceCode` in 15 configs, `document` in 6,
  `ddlCode` and `ddlSource` for the same thing in neighbouring files,
  `testClassCode` beside `testClassSource`. It is **`source`** in all 29 configs
  that had exactly one.

  `adt-clients` is a cut of endpoints, and a write is a write: for a class the
  payload is ABAP text, for a domain it is the object's XML document. What those
  XML look like belongs in documentation, not in a type — the library does not
  demand a particular ABAP body either, and the consumer is the one who knows
  what they are writing.

  **The options carried the same split, and it was worse.** `IAdtOperationOptions`
  had `sourceCode` *and* `xmlContent`, divided by what the body happened to
  contain — ABAP text for a class, an XML document for a domain — which asked
  the caller to classify a payload this library never reads. Both are now
  `source`. `IAdtCreateOptions` refuses that field, and `IAdtCreatable.create`
  excludes it from the config: **source is for the write, and a create does not
  take one.**

  `IInterfaceConfig` is renamed with the rest. It is declared as a type alias
  rather than an interface, so the first pass missed it — and so did 4.0.0's
  config clean-up, which is why it still carried `sessionId` and `onLock`. Both
  are gone with this.

  Five fields keep their names because they are not this type's payload:
  `IClassConfig`'s `testClassCode`, `localTypesCode`, `definitionsCode` and
  `macrosCode` address four other resources, each of which already has its own
  config, and `IBehaviorImplementationConfig.implementationCode` is a second
  payload for a second endpoint. They belong to per-operation inputs —
  **decision 31** — and are left for that pass rather than flattened here.

### Removed

- **BREAKING: `datatype`, `length` and `decimals` leave `IDomainConfig` again**,
  a day after 4.1.0 put them back. The measurement that justified them stands —
  a POST carrying `doma:content/doma:typeInformation` is answered `201`, the
  document reads back `CHAR`/`000010`, the activation is clean — but the route
  changed: decision 31 puts the object's shape in the document and has the
  create post a shell, which is what the server's own POST answer documents
  (`version="inactive"`, all three groups present and empty).

  Not deprecated first: a field the implementation does not send is the defect
  3.0.0 and 4.0.0 spent themselves removing, and the fields are a day old with
  no importer anywhere under `~/prj`.

## [5.0.0] - 2026-09-23 — never published, superseded by 6.0.0

> **Never published.** 6.0.0 was tagged before this version reached the
> registry, so npm goes 4.1.0 → 6.0.0 and everything below arrived there. A
> consumer looking for `changeTaskType` wants **6.0.0 or later**, not this.

### Changed

- **BREAKING: `IAdtTransportObjectActions` takes a sixth type parameter**,
  `TTaskType`, for the member below.

### Added

- **`changeTaskType`** — a task is created without a type, and the call that
  creates it cannot supply one.

  Measured against BTP ABAP, 2026-09-23: `tm:type` on a `newtask` is accepted
  and ignored, and every task on that system — including ones created long
  before this package existed — reads back as `Unclassified`. CTS assigns the
  type when the first object lands; a caller who wants it sooner asks here.

  The type is declared as `'S' | 'R' | 'X'` rather than `string`, because the
  values a caller would otherwise reach for are refused: `'Q'` is a
  customizing type — *"You can only change the type of tasks in workbench
  requests"* — and `'K'`/`'W'` are REQUEST types, answered as unknown.
  Declaring the three that work is what stops a caller learning the other
  three from a `400`.

  Addressed at the TASK, like `removeObject`: that is where the listing
  offers the action. And like every action here, the answer says the document
  was understood — a read is what shows the type.

## [4.1.0] - 2026-09-22

### Added

- **`datatype`, `length` and `decimals` return to `IDomainConfig`.** They left in
  4.0.0 because the create accepted them and did not send them; they came back
  once the endpoint was measured to carry them — a POST with
  `doma:content/doma:typeInformation` answered `201`, the document read back
  `CHAR`/`000010`, and the activation reported no messages, beside a domain
  created without a type which could not be activated at all (`DO(251) Data type
  ' ' does not exist`). Cloud trial, and on-premise was not covered.

  The other five that left in 4.0.0 — `conversion_exit`, `lowercase`,
  `sign_exists`, `value_table`, `fixed_values` — stayed out, unmeasured.

  > Withdrawn again in the next major: decision 31 routes the object's shape
  > through the document, so a create carrying `doma:content` is a deviation
  > from the flow this library follows. The measurement stands; the route
  > changed.

## [4.0.0] - 2026-09-22

### Removed

- **46 fields leave 16 `IXxxConfig` types** — the types a consumer writes
  against. Each was checked against the implementation: whether it is read at
  all, now that 3.0.0 had made the compiler strip every line forwarding a field
  into a parameter object that ignored it.

  Two were worse than a dropped value. **`onLock` was declared on nine types and
  invoked on one** — a callback promising a call that never came; `IIncludeConfig`
  keeps it, because `AdtInclude` really does invoke it. **`sessionId` was
  declared on five and read by none**, the low-level locks it was meant for
  taking a parameter named `_sessionId`.

  The rest never reached the wire: `IDomainConfig` lost the eight that say what a
  domain is, `IDataElementConfig` its type name and four labels,
  `IStructureConfig` its `fields` and `includes` (a structure is built from its
  `ddlCode`), `IFunctionModuleConfig` a `packageName` a module takes from its
  group, `ITableTypeConfig` the row-type kind, access type and primary-key pair.

### Changed

- All 16 changed declarations are recorded in `tools/surface-changed.json` **with
  the shape each is expected to have now**, so the baseline check still guards
  them. Listing the name alone would have retired the check for those symbols.

## [3.0.0] - 2026-09-22

### Removed

- **84 `ICreate*Params` / `IUpdate*Params` types leave the contract.** They are
  the argument shapes of the functions that build ADT requests, and a search of
  every dependent repository found them imported by nobody. Twelve parameter
  types that *are* used stay: four imported by the MCP server, eight named in the
  signature of a capability interface this package exports.

  Being nobody's contract had a measurable cost: **85 of their fields were
  ignored by the very code that took them.** A domain created with
  `datatype: 'CHAR', length: 10` came back with `<doma:datatype/>` empty and SAP
  refused to activate it. Whether a field is honoured is decided one repository
  away, which is where these shapes now live.

  Two causes, both left by earlier releases of the consumer: `activate?: boolean`
  from the chains removed in `adt-clients` 18.0.0, declared in seven interfaces
  and read nowhere; and every `IUpdate*Params` field past the name and the
  transport, from the read-modify-write updates removed in 19.0.0.

### Changed

- `ICreateDataElementParams` loses seventeen fields — the type, the length and
  every label — and its new declaration is recorded in
  `tools/surface-changed.json`.
- **The surface guards learnt the difference between retired and lost.**
  `tools/surface-removed.txt` declares each removal with its reason, the way
  `surface-added.txt` declares an addition; `check-surface.js`,
  `check-packed.js` and `check-deprecated.js` all read it.
  `baseline-44.0.0.json` is untouched: it is the proof that the split preserved
  44.0.0, and a regenerated proof proves nothing. Recorded as **decision 30**.

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
