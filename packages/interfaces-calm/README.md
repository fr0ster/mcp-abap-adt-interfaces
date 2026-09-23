# @mcp-abap-adt/interfaces-calm

Contracts for **SAP Cloud ALM** HTTP APIs. Types only — no implementation, no
runtime dependency beyond the HTTP frame it borrows.

```bash
npm install @mcp-abap-adt/interfaces-calm
```

| symbol | what it is |
|---|---|
| `ICalmConnection` | the minimal connection a Cloud ALM caller needs: `getServiceUrl(service)` and a request method |
| `CalmService` / `CALM_SERVICES` | the services a URL can be resolved for, as a constant and the union over it |
| `ICalmRequestOptions` | what one call may carry, including which service it addresses |
| `ICalmResponse` | what a call answers — the HTTP frame, unchanged |

## Why this package exists

**Cloud ALM is not ABAP.** These five contracts lived in
`@mcp-abap-adt/interfaces-adt` until its 8.0.0, and one line was what held them
there:

```ts
export type ICalmResponse<T, D> = IAdtWireResponse<T, D>;
```

An alias of an *ADT* type. So `mcp-calm-client` and `mcp-calm-server` depended
on the fastest-moving contract in the family to describe a service with nothing
to do with ADT — they were pinned to facade major 7 while the ADT contract
passed 50.

That line was itself the misplacement: `IAdtWireResponse` is a plain HTTP frame
named after one protocol on top of HTTP. It is `IHttpWireResponse` in
[`@mcp-abap-adt/interfaces-network`](../interfaces-network) now, which is this
package's only dependency.

## Migrating from `@mcp-abap-adt/interfaces-adt`

```diff
- import type { ICalmConnection, ICalmResponse } from '@mcp-abap-adt/interfaces-adt';
+ import type { ICalmConnection, ICalmResponse } from '@mcp-abap-adt/interfaces-calm';
```

Same names, same shapes. Nothing about the contracts changed in the move.

## Licence

LGPL-3.0-only. `LICENSE` is the LGPL text and `COPYING` the GPL it refers to;
both ship with the package.
