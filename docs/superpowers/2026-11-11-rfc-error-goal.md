# Goal: the connection contract types an RFC call's error

## Goal

A consumer that depends on `@mcp-abap-adt/interfaces-adt-connection`, and not on the
connection that implements it, can read which RFC failure ended a request from typed fields,
never from words. The package declares the RFC error's fields — `key`, `group`, `code` and
`codeString`, as the SAP NetWeaver RFC SDK reports them for a failed call — as one type, and
declares the error a connection throws, a type of its own, which carries them in a nested
`rfc` field beside its top-level `code`.

A connection that fails a request over RFC can then put the SDK's error on what it throws in a
shape every consumer of the contract agrees on, and a consumer such as the ADT strategies can
recognise a particular RFC failure (for example, the conversation closed by the other side)
by comparing a field.

## Invariants

- **Types and constants only.** The package gains interfaces, type aliases and, where a value
  set is closed, `as const` constants with the union derived from them. Nothing with a body: no
  function, no class, no type guard, no parser. Every new declaration compiles to nothing in
  `dist/index.js` except a constant.
- **Additive, a minor.** No existing type, field or constant changes meaning or shape;
  `ADT_SESSION_ERROR`, `AdtSessionErrorCode` and the meaning of a thrown error's top-level
  `code` (a session error code, or a Node network code) are untouched. Code written for 4.0.0
  — a connection that implements `IAbapConnection`, a consumer that catches its errors — compiles
  unchanged. The release is 4.1.0.
- **The `rfc` field is optional.** It is `?: T | undefined`: an error that did not come from an
  RFC call — every HTTP failure, every session error raised before anything was sent — carries
  none and still conforms.
- **Typed as the SDK states them.** `key`, `group`, `code` and `codeString` carry the SDK's
  `RFC_ERROR_INFO` values as `@mcp-abap-adt/sap-rfc-lite` hands them over. `group` and `code`
  are plain numbers and `key` a plain string — a free text the SDK fills. `codeString` is the
  name of the SDK's return code, typed by a closed list declared as a const array with its union
  derived from it, in the style of `@mcp-abap-adt/interfaces-adt`'s `ADT_CONNECTION_CAUSES`: it
  holds exactly the `RFC_RC` names the SDK's header `sapnwrfc.h` lists, every one of them and
  nothing else.
- **Every field readonly.** The error type and the RFC fields are read, never written, by a
  consumer; an implementation builds them whole.
- **Only fields, no text.** The `rfc` type holds the four fields and nothing that carries the
  SDK's or the system's words: no `message`, no ABAP message variables.
- **Exported from this package.** Every new name is exported from the package's index and
  placed in the repository's package map, so the surface and placement checks pass; nothing is
  re-exported from `@mcp-abap-adt/interfaces-adt`.
- **Pinned by compile-only checks.** A typecheck file under `src/__typechecks__/` holds each
  rule the types make: a listed value is accepted, an unlisted one refused, a list cannot be
  added to, an error without `rfc` conforms, an `rfc` with a field missing does not. Each check
  is load-bearing: breaking the rule it protects makes it fail to compile.
- **Published first.** The minor is published on the npm registry before
  `@mcp-abap-adt/connection` or the ADT strategies depend on it; neither builds against an
  unpublished copy, and no local link reaches a release.
- **The docs describe the new contract.** The package README lists the new names and what they
  are for; the CHANGELOG's 4.1.0 entry says what was added and that nothing a 4.0.0 consumer
  does changes.
- **No system named.** Nothing committed names an SAP system, a host, a client or a user; the
  SDK and its header are the only source cited for the values.

## Out of scope

- Putting the fields on the error: that is `@mcp-abap-adt/connection`'s, at the RFC wire.
- Reading them: recognising a terminated debugger, or any other failure, is the ADT strategies'
  and the clients'.
- The ABAP message fields of an `ABAPError` (`abapMsgClass`, `abapMsgType`, `abapMsgNumber`,
  `abapMsgV1`…`abapMsgV4`) and the SDK's message text.
- The `nodeRfcError` shape of `@mcp-abap-adt/sap-rfc-lite`, which carries no SDK fields.
- Any change to `IAbapConnection`'s methods, the capability atoms, or the HTTP error shape in
  `@mcp-abap-adt/interfaces-network`.
- `@mcp-abap-adt/interfaces-adt`'s `IAdtError`: whether a strategy's error also carries the RFC
  fields is a later decision of that package.
