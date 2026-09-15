# @mcp-abap-adt/interfaces-utils

Logging contracts for the MCP ABAP ADT packages.

## TL;DR

- `ILogger` — what a component logs through. `LogLevel` — the levels.
- Depends on nothing. Types and one enum; no implementation.
- Moved unchanged from `@mcp-abap-adt/interfaces` 44.0.0.

## Install

```bash
npm install @mcp-abap-adt/interfaces-utils
```

## Use

```typescript
import type { ILogger } from '@mcp-abap-adt/interfaces-utils';
import { LogLevel } from '@mcp-abap-adt/interfaces-utils';
```

An implementation (`DefaultLogger`, `PinoLogger`) is in `@mcp-abap-adt/logger`, not here.

## Coming from `@mcp-abap-adt/interfaces`

Replace the package name in the import. The facade re-exports both symbols, deprecated, until its next major.

## Licence

`LGPL-3.0-only`.
