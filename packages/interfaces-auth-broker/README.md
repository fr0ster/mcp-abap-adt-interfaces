# @mcp-abap-adt/interfaces-auth-broker

The broker's port: what a destination states — its connection settings, how it
renews its credential — and the stores that hold it. Types only; no
implementation.

```bash
npm install @mcp-abap-adt/interfaces-auth-broker
```

| symbol | what it is |
|---|---|
| `IConnectionConfig` | a destination's connection settings, as a store hands them to the broker: `serviceUrl`, `sapClient`, `language`, the credential (`authorizationToken`, `username`/`password`, `sessionCookies`), `authType`, `grantType`, `expiresAt`, and the settings a grant needs — SNC (`snc*`), OIDC (`oidc*`) and the SAML IdP's trust (`saml*`) |
| `DestinationGrant` | how a destination obtains a new credential: the UAA, OIDC and SAML grants, or `'none'` — handed over, not renewed |
| `IConfig` | `Partial<IAuthorizationConfig> & Partial<IConnectionConfig>` — what a session store loads and saves |
| `ISessionStore` | loads, saves and updates a destination's session |
| `IServiceKeyStore` | reads a destination's service key as authorization and connection settings |
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
