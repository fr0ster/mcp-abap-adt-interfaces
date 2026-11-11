# @mcp-abap-adt/interfaces-adt-connection

The ABAP connection contract: what an ADT request is sent through, and what
comes back off the wire. Types and two constants; no implementation.

```bash
npm install @mcp-abap-adt/interfaces-adt-connection
```

| symbol | what it is |
|---|---|
| `IAbapConnection` | a connection an ADT request is made through: `makeAdtRequest`, connect/disconnect, the session type. Since 4.0.0 `getBaseUrl()` answers `Promise<string \| undefined>`: `undefined` for a connection with no HTTP origin (RFC), so a caller narrows before using it — see the CHANGELOG's migration note |
| `IAbapRequestOptions` | what one request carries |
| `IAdtWireResponse` | the answer as it came off the wire — extends `IHttpWireResponse` from `interfaces-network` with the headers ADT sends. Since 2.0.0 its `data` is `unknown` unless the caller names the type (`makeAdtRequest<string>(…)`); it was `any` — see the CHANGELOG's migration note |
| `ISessionLifecycleAware`, `ICriticalSection`, `IRequestProfiling`, `IDeferredResponseConnection` | the connection's capability atoms — a connection honours the ones it can |
| `ADT_SESSION_ERROR` / `AdtSessionErrorCode` | what a session failure is called |
| `IAbapConnectionError` | the error a connection throws, as a consumer reads it: `code` — a session error code or a Node network code — and, for a failed RFC call, `rfc`. Narrow a caught value to it; never read the message. Since 4.1.0 |
| `IRfcErrorInfo`, `RFC_RCS` / `RfcReturnCodeName` | what the RFC SDK said about a failed call: `key` (free text), `group` and `code` (numbers), `codeString` — the return code's name, one of the SDK's `RFC_RC` names. Since 4.1.0 |
| `ITimeoutConfig` | the deadlines a caller gives a connection: `default`, `csrf`, `long` |

A caught value is `unknown`: the consumer narrows it with its own check (it comes from outside
the type system) and then reads it by this type, never by a cast:

```typescript
function closedByPartner(error: IAbapConnectionError): boolean {
  return error.rfc?.codeString === 'RFC_CLOSED';
}
```

## Why this package exists

**It moves on its own schedule.** These four files were
`interfaces-adt/src/connection/` until `interfaces-adt` 11.0.0. The object
contracts beside them had three majors in one day — 9, 10 and 11 — and none
touched the connection; yet every one of them made the connector
(`@mcp-abap-adt/connection`) either release to follow or install a second copy
of the contract beside `adt-clients`. Two copies of one interface do not compare
equal in TypeScript, so that shows up as errors that read as impossible.

The subject is still ADT — `makeAdtRequest`, the stateful session, CSRF — so it
does not belong in `interfaces-network`, whose rule is that nothing there is
ADT-specific (decision 35). What separated it is the release rate (decision 38
in the repository's `docs/architecture/DECISIONS.md`).

## Who depends on it

- **A connector** — the implementation of `IAbapConnection` — depends on this
  alone, and no longer on the object contracts.
- **`@mcp-abap-adt/interfaces-adt`** stands on it: its strategies are handed an
  `IAdtWireResponse`. It does **not** re-export these names; import them from
  here (decision 34).

Depends on `@mcp-abap-adt/interfaces-network`, and nothing else.

## Licence

`LGPL-3.0-only`.
