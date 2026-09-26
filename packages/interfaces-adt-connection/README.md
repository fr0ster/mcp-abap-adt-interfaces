# @mcp-abap-adt/interfaces-adt-connection

The ABAP connection contract: what an ADT request is sent through, and what
comes back off the wire. Types and one constant; no implementation.

```bash
npm install @mcp-abap-adt/interfaces-adt-connection
```

| symbol | what it is |
|---|---|
| `IAbapConnection` | a connection an ADT request is made through: `makeAdtRequest`, connect/disconnect, the session type |
| `IAbapRequestOptions` | what one request carries |
| `IAdtWireResponse` | the answer as it came off the wire — extends `IHttpWireResponse` from `interfaces-network` with the headers ADT sends |
| `ISessionLifecycleAware`, `ICriticalSection`, `IRequestProfiling`, `IDeferredResponseConnection` | the connection's capability atoms — a connection honours the ones it can |
| `ADT_SESSION_ERROR` / `AdtSessionErrorCode` | what a session failure is called |
| `ITimeoutConfig` | the deadlines a caller gives a connection: `default`, `csrf`, `long` |

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
