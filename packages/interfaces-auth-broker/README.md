# @mcp-abap-adt/interfaces-auth-broker

The broker's port: what a destination states — its connection settings, how it
renews its credential — and the stores that hold it. Types only; no
implementation.

```bash
npm install @mcp-abap-adt/interfaces-auth-broker
```

| symbol | what it is |
|---|---|
| `IConnectionConfig` | a destination's connection settings, as a store hands them to the broker: `serviceUrl`, `sapClient`, `language`, the credential (`authorizationToken`, `username`/`password`, `sessionCookies`), `authType`, `grantType`, `expiresAt`, what a stored secret is bound to (`issuedFor`, `issuedBy`), and the settings a grant needs — SNC (`snc*`), OIDC (`oidc*`) and the SAML IdP's trust (`saml*`) |
| `DestinationGrant` | how a destination obtains a new credential: the UAA, OIDC and SAML grants, or `'none'` — handed over, not renewed |
| `IConfig` | `Partial<IAuthorizationConfig> & Partial<IConnectionConfig>` — what a session store loads and saves |
| `ISessionStore` | loads, saves and updates a destination's session |
| `IServiceKeyStore` | reads a destination's service key as authorization and connection settings, and, optionally, its client certificate |
| `IClientCertificate` | a client certificate a service key carries: `uaaUrl`, `clientId`, `certificate`, `key`, `certUrl` — answered by the optional `IServiceKeyStore.getClientCertificate` |
| `ITokenProviderResult` | the result of authenticating a destination: its `IConnectionConfig` and a refresh token |

```typescript
import type { IConnectionConfig, ISessionStore } from '@mcp-abap-adt/interfaces-auth-broker';
import type { IAuthorizationConfig, ISapConfig } from '@mcp-abap-adt/interfaces-auth-sap';
```

## Why this package exists

**`interfaces-auth-sap` 1.x held two subjects.** One is the SAP system and the
UAA client — `ISapConfig`, `IAuthorizationConfig`, XSUAA, the certificate
loader — which a token provider, the ABAP connection and the ADT clients take.
The other is the destination and its storage, which only the stores, the
broker and the servers that build a broker import. The broker states what it
needs from a destination and the stores implement it: that is the broker's
port, and its fields name the destination, not the SAP system. A contract lives
in the package whose subject its own fields name (decision 35); decision 41 in
the repository's `docs/architecture/DECISIONS.md` records this split.

Kept apart, a release of the destination — new grant settings for the broker —
no longer asks every provider and connection to follow, and a change to the
SAP system's configuration no longer reaches the stores.

## For store authors: the secret's binding (1.1.0)

A session store keeps two strings beside the secret — `issuedFor`, the
canonical URI of the resource the secret was obtained for, and `issuedBy`, the
canonical URI of who issued it and to which client — written and cleared with
the secret. The broker (`@mcp-abap-adt/auth-broker` 4) uses a stored secret
only when both equal what the destination's means give, so a secret never goes
to another resource and a secret from another issuer is never used in place of
this one. **A custom `ISessionStore` (a database, a message log, a secret store)
must persist both fields**; one that drops them still type-checks, but the
broker then never uses its sessions — every process start logs in afresh, a
browser each time for an interactive grant. A key store never answers them.

## Where these contracts were

`@mcp-abap-adt/interfaces-auth-sap`, until its 2.0.0 — same names, same shapes;
only the package changed. Before that, `@mcp-abap-adt/interfaces-adt` until its
9.0.0. Not re-exported from `interfaces-auth-sap`: import them from here
(decision 34).

## Dependencies

Depends on `@mcp-abap-adt/interfaces-auth-sap` (`^2.0.0`), for
`IAuthorizationConfig` — the UAA client a store returns beside the connection
settings — and on nothing else. `interfaces-auth` and `interfaces-utils` reach
it through that package.

## Licence

`LGPL-3.0-only`.
