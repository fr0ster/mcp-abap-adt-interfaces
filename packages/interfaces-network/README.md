# @mcp-abap-adt/interfaces-network

Transport contracts, generic HTTP and MCP header names and network error codes for the MCP ABAP ADT packages.

## TL;DR

- **Nothing here is ADT-specific**, and that is checked rather than claimed: `ITimeoutConfig` left for `interfaces-adt` in 2.0.0 because its `csrf` field names an SAP operation, not a transport primitive.
- **Every HTTP header name** lives here, SAP's included — a header name says how a value travels, not what it means — with the five groups over them.
- `IHttpWireResponse` and `HttpError`: what came off an HTTP connection, and what a client throws. `IAdtWireResponse` in `interfaces-adt` extends the first.
- Depends on nothing. Types and string constants; no implementation.

## Install

```bash
npm install @mcp-abap-adt/interfaces-network
```

## What it holds

| symbols | what |
|---|---|
| `IWebSocketTransport`, `IWebSocketConnectOptions`, `IWebSocketMessageEnvelope`, `IWebSocketMessageHandler`, `IWebSocketCloseInfo` | a realtime transport a connection can use |
| `NETWORK_ERROR_CODES`, `NetworkErrorCode` | the network failure vocabulary |
| `HEADER_AUTHORIZATION`, `HEADER_CONTENT_TYPE`, `HEADER_ACCEPT` | standard HTTP header names |
| `HEADER_SESSION_ID`, `HEADER_MCP_SESSION_ID`, `HEADER_X_MCP_SESSION_ID` | session header names |

| `HEADER_SAP_*`, `HEADER_UAA_*`, `HEADER_BTP_DESTINATION`, `HEADER_MCP_*` | SAP, UAA and proxy routing header names — here since 1.1.0 |
| `SAP_CONNECTION_HEADERS`, `UAA_HEADERS`, `PRESERVED_HEADERS`, `PROXY_ROUTING_HEADERS`, `PROXY_MODIFIED_HEADERS` | the groups over them |
| `IHttpWireResponse`, `IHttpHeaderValue` | what came off an HTTP connection, before anyone read it |
| `HttpError` | what an HTTP client throws — here since 2.0.0 |

**Every HTTP header name is here**, whatever system it addresses. They were in
`@mcp-abap-adt/interfaces-adt` until its 8.0.0, on the reading that an `x-sap-*`
name is an SAP concern; it is a transport concern — a name says how a value
travels, not what it means — and nothing in the ADT contract ever used one.
`AUTH_TYPE_JWT` and its siblings stayed there: those are values a header
carries, not names of headers.

## Migrating to 2.0.0

One import moves, and it moves *out* of this package.

```ts
- import type { ITimeoutConfig } from '@mcp-abap-adt/interfaces-network';
+ import type { ITimeoutConfig } from '@mcp-abap-adt/interfaces-adt';
```

Its fields are `default`, `csrf` and `long`: fetching a CSRF token is an SAP
operation rather than a transport primitive, and `long` is a client's policy for
a long-polling read, so the type named operations this package does not have. Its
one consumer, `mcp-abap-connection`, takes `interfaces-adt` already.

Nothing else changed, and `HttpError` arrived from `interfaces-adt` 9.0.0 — so a
consumer that took it from there repoints that import here.

## Coming from `@mcp-abap-adt/interfaces`

Replace the package name in the import. The facade is **deleted** as of its 52.0.0, which was never published — npm still serves 51.0.0, with every symbol re-exported and deprecated, to anyone pinned to it. There is nothing further to move to: take the package that declares the name.

## Licence

`LGPL-3.0-only`.
