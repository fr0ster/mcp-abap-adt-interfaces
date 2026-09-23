# @mcp-abap-adt/interfaces-utils

Logging contracts, and the shapes that belong to no one system, for the MCP ABAP ADT packages.

## TL;DR

- `ILogger` — what a component logs through. `LogLevel` — the levels.
- `XmlNode` — what an XML parser hands back for one node. Here since 1.1.0: it was in `interfaces-adt` until that package's 9.0.0, and a parser's output shape is not an ADT contract whatever the document contains.
- Depends on nothing. Types and one enum; no implementation.
- The logging pair moved unchanged from `@mcp-abap-adt/interfaces` 44.0.0.

## Install

```bash
npm install @mcp-abap-adt/interfaces-utils
```

## Use

```typescript
import type { ILogger, XmlNode } from '@mcp-abap-adt/interfaces-utils';
import { LogLevel } from '@mcp-abap-adt/interfaces-utils';
```

An implementation (`DefaultLogger`, `PinoLogger`) is in `@mcp-abap-adt/logger`, not here.

## Coming from `@mcp-abap-adt/interfaces`

Replace the package name in the import. The facade is **deleted** as of its 52.0.0, which was never published — npm still serves 51.0.0, with both symbols re-exported and deprecated, to anyone pinned to it. `mcp-abap-adt-logger` imports exactly these two and is pinned to a facade major in the thirties; this package has had one release.

## Licence

`LGPL-3.0-only`.
