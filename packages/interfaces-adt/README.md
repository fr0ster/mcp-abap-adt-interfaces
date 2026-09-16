# @mcp-abap-adt/interfaces-adt

ADT contracts, the ABAP and Cloud ALM connections, and SAP/BTP configuration and authentication contracts.

## TL;DR

- Everything a package on the SAP side accepts: ADT object operations, runtime analysis, execution, feeds, services, the ABAP and Cloud ALM connections, SAP/BTP configuration, token providers, session and service-key stores, header validation, and the SAP/BTP header names.
- Depends on `@mcp-abap-adt/interfaces-auth` and `@mcp-abap-adt/interfaces-utils` only. Types and constants; no implementation.
- Moved unchanged from `@mcp-abap-adt/interfaces` 44.0.0. Most majors of that package came from these contracts; this package now carries them alone.

## Install

```bash
npm install @mcp-abap-adt/interfaces-adt
```

## What it holds

| directory | what |
|---|---|
| `adt/`, `runtime/`, `execution/`, `feeds/`, `service/`, `shared/` | the ADT contracts: capability atoms, object types, `IAdtResponse`, runtime analysis, execution |
| `connection/` | `IAbapConnection`, `IAbapRequestOptions`, the connection capability atoms, `ICalmConnection`, `CalmService` |
| `sap/`, `auth/` | `ISapConfig`, `IConnectionConfig`, `IAuthorizationConfig`, `IConfig`, `IAuthorizationStrategy`, the callback-server contracts, `ICertificateMaterialLoader`, `AuthTypeEnum` |
| `token/`, `session/`, `serviceKey/`, `store/` | token providers and refreshers, stores and their error codes |
| `validation/`, `Headers.ts` | header validation; `HEADER_SAP_*`, `HEADER_UAA_*`, `HEADER_BTP_DESTINATION`, `HEADER_MCP_DESTINATION`, `HEADER_MCP_URL`, `AUTH_TYPES`, `AuthType` |

The contract rules — what a member answers, how a strategy is supplied, how a contract is built — are in [`docs/architecture/ARCHITECTURE.md`](../../docs/architecture/ARCHITECTURE.md). Domain-by-domain documentation with examples stays in the [`@mcp-abap-adt/interfaces` README](../interfaces/README.md); the contracts it describes are these.

## Coming from `@mcp-abap-adt/interfaces`

Replace the package name in the import. The facade re-exports every symbol, deprecated, until its next major.

## Licence

`LGPL-3.0-only`.
