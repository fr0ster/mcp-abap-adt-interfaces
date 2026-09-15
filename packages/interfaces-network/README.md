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

The SAP and BTP header names (`HEADER_SAP_*`, `HEADER_UAA_*`, …) are in `@mcp-abap-adt/interfaces-adt`.

## Coming from `@mcp-abap-adt/interfaces`

Replace the package name in the import. The facade re-exports every symbol, deprecated, until its next major.

## Licence

`LGPL-3.0-only`.
