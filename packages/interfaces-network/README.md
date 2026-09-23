# @mcp-abap-adt/interfaces-network

Transport contracts, generic HTTP and MCP header names and network error codes for the MCP ABAP ADT packages.

## TL;DR

- Nothing here is SAP- or ADT-specific.
- Depends on nothing. Types and string constants; no implementation.
- Moved unchanged from `@mcp-abap-adt/interfaces` 44.0.0.

## Install

```bash
npm install @mcp-abap-adt/interfaces-network
```

## What it holds

| symbols | what |
|---|---|
| `IWebSocketTransport`, `IWebSocketConnectOptions`, `IWebSocketMessageEnvelope`, `IWebSocketMessageHandler`, `IWebSocketCloseInfo` | a realtime transport a connection can use |
| `NETWORK_ERROR_CODES`, `NetworkErrorCode` | the network failure vocabulary |
| `ITimeoutConfig` | timeouts a transport is configured with |
| `HEADER_AUTHORIZATION`, `HEADER_CONTENT_TYPE`, `HEADER_ACCEPT` | standard HTTP header names |
| `HEADER_SESSION_ID`, `HEADER_MCP_SESSION_ID`, `HEADER_X_MCP_SESSION_ID` | session header names |

| `HEADER_SAP_*`, `HEADER_UAA_*`, `HEADER_BTP_DESTINATION`, `HEADER_MCP_*` | SAP, UAA and proxy routing header names — here since 1.1.0 |
| `SAP_CONNECTION_HEADERS`, `UAA_HEADERS`, `PRESERVED_HEADERS`, `PROXY_ROUTING_HEADERS`, `PROXY_MODIFIED_HEADERS` | the groups over them |
| `IHttpWireResponse`, `IHttpHeaderValue` | what came off an HTTP connection, before anyone read it |

**Every HTTP header name is here**, whatever system it addresses. They were in
`@mcp-abap-adt/interfaces-adt` until its 8.0.0, on the reading that an `x-sap-*`
name is an SAP concern; it is a transport concern — a name says how a value
travels, not what it means — and nothing in the ADT contract ever used one.
`AUTH_TYPE_JWT` and its siblings stayed there: those are values a header
carries, not names of headers.

## Coming from `@mcp-abap-adt/interfaces`

Replace the package name in the import. The facade is **deleted** as of its 52.0.0, which was never published — npm still serves 51.0.0, with every symbol re-exported and deprecated, to anyone pinned to it. There is nothing further to move to: take the package that declares the name.

## Licence

`LGPL-3.0-only`.
