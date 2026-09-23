# @mcp-abap-adt/interfaces-auth-sap

The SAP and BTP half of authentication: SAP system configuration, service keys, destinations, UAA and XSUAA. Everything authentication means anywhere else is [`interfaces-auth`](../interfaces-auth).

## TL;DR

- **The SAP system** — `ISapConfig`, `SapAuthType`, `SapConnectionType`, `IConfig`, `IConnectionConfig` (it carries `sapClient`, a `serviceUrl` and an ABAP language).
- **BTP** — `AUTH_TYPE_XSUAA` and the `AuthType`/`AUTH_TYPES` union over all three: XSUAA is a BTP service, so a set that includes it describes what a *BTP* connection accepts.
- **What holds the credentials** — `IServiceKeyStore`, `ISessionStore`, `ITokenProviderResult`, `ICertificateMaterialLoader`, `IAuthorizationConfig`.
- **What a validator answers** — `IValidatedAuthConfig`, `AuthMethodPriority`, `IHeaderValidationResult`.
- **`AUTH_TYPE_JWT` and `AUTH_TYPE_BASIC` are not here**, and are deliberately not re-exported: a bearer token and a user with a password mean the same thing off SAP, so they are in `interfaces-auth`, and forwarding is the duplication this family removed (decision 34).
- Depends on `@mcp-abap-adt/interfaces-auth` and `@mcp-abap-adt/interfaces-utils`. Types and constants; no implementation.

## Install

```bash
npm install @mcp-abap-adt/interfaces-auth-sap
```

## Use

```typescript
import type { IConnectionConfig, ISapConfig } from '@mcp-abap-adt/interfaces-auth-sap';
import { AUTH_TYPE_XSUAA } from '@mcp-abap-adt/interfaces-auth-sap';
import { AUTH_TYPE_BASIC } from '@mcp-abap-adt/interfaces-auth';
```

Two packages in one file is the point: the union's SAP member and its generic members are declared where each is true.

## What belongs here

**A contract whose own fields or values name something SAP or BTP owns** — an SAP client, a service key, a destination, a UAA client, XSUAA, an RFC connection. That is decision 35 in `docs/architecture/DECISIONS.md`, and it is the whole rule; the first accepting package does not decide it, because `auth-providers` accepts both halves.

The split was computed rather than judged: every file naming XSUAA, UAA or `sap-client` in its **code** — a comment mentioning ABAP proves nothing — closed transitively over its imports, so a file taking one of those types came with it. That is how `ITokenProviderResult` is here: it is the result of authenticating an `IConnectionConfig`.

Implementations are elsewhere — `@mcp-abap-adt/connection`, `mcp-abap-adt-auth-broker`, `-auth-stores`, `-auth-providers`.

## Where these contracts were

`@mcp-abap-adt/interfaces-adt`, until its 9.0.0. Three repositories imported 10, 7 and 17 names from that package and not one was an ADT contract, so they tracked the ADT contract's release rate to describe authentication. `@mcp-abap-adt/interfaces` re-exported them until 51.0.0, deprecated; that facade is deleted (decision 34).

## Licence

`LGPL-3.0-only`.
