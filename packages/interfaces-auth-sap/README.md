# @mcp-abap-adt/interfaces-auth-sap

The SAP and BTP half of authentication: SAP system configuration, the UAA client, XSUAA and certificate loading. Everything authentication means anywhere else is [`interfaces-auth`](../interfaces-auth); the destination and the stores that hold it are [`interfaces-auth-broker`](../interfaces-auth-broker).

## TL;DR

- **The SAP system** — `ISapConfig`, `SapAuthType`, `SapConnectionType`.
- **The UAA client** — `IAuthorizationConfig`: the URL, client ID and secret a token is obtained and refreshed with.
- **BTP** — `AUTH_TYPE_XSUAA` and the `AuthType`/`AUTH_TYPES` union over all three: XSUAA is a BTP service, so a set that includes it describes what a *BTP* connection accepts.
- **Client certificates** — `ICertificateMaterialLoader`.
- **What a validator answers** — `IValidatedAuthConfig`, `AuthMethodPriority`, `IHeaderValidationResult`.
- **Not here since 2.0.0: the destination and its storage** — `IConnectionConfig`, `DestinationGrant`, `IConfig`, `ISessionStore`, `IServiceKeyStore`, `ITokenProviderResult` are [`interfaces-auth-broker`](../interfaces-auth-broker), and are not re-exported. Change the import path; nothing else changes (see [Migrating to 2.0.0](#migrating-to-200)).
- **`AUTH_TYPE_JWT` and `AUTH_TYPE_BASIC` are not here**, and are deliberately not re-exported: a bearer token and a user with a password mean the same thing off SAP, so they are in `interfaces-auth`, and forwarding is the duplication this family removed (decision 34).
- Depends on `@mcp-abap-adt/interfaces-auth` (`^1.2.0 || ^2.0.0 || ^3.0.0 || ^4.0.0` — nothing it uses changed in 2.0.0 or 3.0.0; 4.0.0 lets `ICertificateMaterial`'s optional fields hold `undefined`), and on nothing else — `interfaces-utils` reaches it through that package, for `ILogger`. `interfaces-auth-broker` depends on this package, for `IAuthorizationConfig`. Types and constants; no implementation.

## Install

```bash
npm install @mcp-abap-adt/interfaces-auth-sap
```

## Use

```typescript
import type { IAuthorizationConfig, ISapConfig } from '@mcp-abap-adt/interfaces-auth-sap';
import { AUTH_TYPE_XSUAA } from '@mcp-abap-adt/interfaces-auth-sap';
import { AUTH_TYPE_BASIC } from '@mcp-abap-adt/interfaces-auth';
```

Two packages in one file is the point: the union's SAP member and its generic members are declared where each is true.

## Migrating to 2.0.0

Six names moved, unchanged, to `@mcp-abap-adt/interfaces-auth-broker` 1.0.0: `IConnectionConfig`, `DestinationGrant`, `IConfig`, `ISessionStore`, `IServiceKeyStore`, `ITokenProviderResult`. Change the import path; nothing else changes.

```ts
- import type { IConnectionConfig, ISessionStore } from '@mcp-abap-adt/interfaces-auth-sap';
+ import type { IConnectionConfig, ISessionStore } from '@mcp-abap-adt/interfaces-auth-broker';
```

A store, the broker, or a server that builds one adds `interfaces-auth-broker@^1.0.0` and keeps this package at `^2.0.0` for `IAuthorizationConfig` and `ISapConfig`. A provider, a connection or a client that imports none of the six only raises its range. Why the split: decision 41 in `docs/architecture/DECISIONS.md`.

## What belongs here

**A contract whose own fields or values name something SAP or BTP owns** — an SAP system, a UAA client, XSUAA, an RFC connection — and not the destination or its storage, whose fields name the broker's port and which is [`interfaces-auth-broker`](../interfaces-auth-broker). That is decision 35 in `docs/architecture/DECISIONS.md`, and it is the whole rule — decision 41 is it applied to the two subjects 1.x held; the first accepting package does not decide it, because `auth-providers` accepts both halves.

The split was computed rather than judged: every file naming XSUAA, UAA or `sap-client` in its **code** — a comment mentioning ABAP proves nothing — closed transitively over its imports, so a file taking one of those types came with it. That is how `ITokenProviderResult` came here in 1.0.0: it is the result of authenticating an `IConnectionConfig`, and it left with it in 2.0.0.

Implementations are elsewhere — `@mcp-abap-adt/connection`, `mcp-abap-adt-auth-broker`, `-auth-stores`, `-auth-providers`.

## Where these contracts were

`@mcp-abap-adt/interfaces-adt`, until its 9.0.0. Three repositories imported 10, 7 and 17 names from that package and not one was an ADT contract, so they tracked the ADT contract's release rate to describe authentication. `@mcp-abap-adt/interfaces` re-exported them until 51.0.0, deprecated; that facade is deleted (decision 34).

## Licence

`LGPL-3.0-only`.
