# @mcp-abap-adt/interfaces-auth

Credential and access contracts shared across the MCP ABAP ADT package families.

## TL;DR

- `IAuthProvider` — how a connection proves who it is. `IRenewableCredential` — a credential that can be renewed. `ICertificateMaterial` — loaded TLS client-certificate material.
- Depends on nothing. Types only; no implementation.
- Moved unchanged from `@mcp-abap-adt/interfaces` 44.0.0.

## Install

```bash
npm install @mcp-abap-adt/interfaces-auth
```

## Use

```typescript
import type {
  IAuthProvider,
  ICertificateMaterial,
  IRenewableCredential,
} from '@mcp-abap-adt/interfaces-auth';
```

`@mcp-abap-adt/connection` ships implementations (`BasicAuthProvider`, `TokenAuthProvider`, …); a consumer can write its own against this contract.

## What belongs here

Only contracts accepted by packages of more than one family (the ABAP family and `llm-agent` or the hub) and not SAP- or BTP-specific. SAP/BTP authentication configuration (`IAuthorizationConfig`, `IConnectionConfig`, token providers, stores) is in `@mcp-abap-adt/interfaces-adt`. New contracts join when their first accepting package exists (decision 11).

## Coming from `@mcp-abap-adt/interfaces`

Replace the package name in the import. The facade is **deleted** as of its 52.0.0, which was never published — npm still serves 51.0.0, with every symbol re-exported and deprecated, to anyone pinned to it. There is nothing further to move to: take the package that declares the name.

## Licence

`LGPL-3.0-only`.
