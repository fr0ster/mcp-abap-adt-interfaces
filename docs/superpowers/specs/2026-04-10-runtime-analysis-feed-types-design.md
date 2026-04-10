# Runtime Analysis Interfaces and Feed Types

**Issue:** #4
**Date:** 2026-04-10

## Context

`@mcp-abap-adt/adt-clients` (branch `feature/feed-reader-extensions`) is being refactored to use domain objects for runtime operations. New interfaces and types need to live in `@mcp-abap-adt/interfaces` per ecosystem architecture rules.

## Design

### File structure

```
src/
├── runtime/
│   └── types.ts              # Data types for runtime analysis domain
├── feeds/
│   ├── types.ts              # Data types for feeds domain
│   └── IFeedRepository.ts    # Feed repository interface (methods)
└── index.ts                  # Re-exports for new modules
```

Data types go in `types.ts`; interfaces with methods get their own files — consistent with existing patterns (e.g. `IAdtObject.ts`).

### Runtime module (`src/runtime/types.ts`)

- `IRuntimeAnalysisObject` — marker type (`object`) for all runtime analysis domain objects. These are NOT `IAdtObject` (not CRUD) — they represent runtime analysis/monitoring capabilities.
- `IListableRuntimeObject<TOptions = void>` — generic listable runtime object. Each domain supplies its own options type. Has a `list(options?: TOptions): Promise<IAdtResponse>` method. Imports `IAdtResponse` from `../connection/IAbapConnection`.

### Feeds module — data types (`src/feeds/types.ts`)

Feed-level types:
- `IFeedQueryOptions` — query parameters: `user?`, `maxResults?`, `from?` (YYYYMMDDHHMMSS), `to?` (YYYYMMDDHHMMSS)
- `IFeedEntry` — generic feed entry: `id`, `title`, `updated`, `link`, `content`, `author?`, `category?`

System message types:
- `ISystemMessageEntry` — `id`, `title`, `text`, `severity`, `validFrom`, `validTo`, `createdBy`

Gateway error types:
- `IGatewayErrorEntry` — basic error: `type`, `shortText`, `transactionId`, `package`, `applicationComponent`, `dateTime`, `username`, `client`, `requestKind`
- `IGatewayErrorDetail extends IGatewayErrorEntry` — detailed error with nested objects: `serviceInfo`, `errorContext`, `sourceCode`, `callStack`
- `IGatewayException` — `type`, `text`, `raiseLocation`, `attributes?`
- `ICallStackEntry` — `number`, `event`, `program`, `name`, `line`
- `ISourceCodeLine` — `number`, `content`, `isError`

### Feeds module — repository interface (`src/feeds/IFeedRepository.ts`)

`IFeedRepository` — methods for feed access:
- `list(): Promise<IAdtResponse>`
- `variants(): Promise<IAdtResponse>`
- `dumps(options?: IFeedQueryOptions): Promise<IFeedEntry[]>`
- `systemMessages(options?: IFeedQueryOptions): Promise<IFeedEntry[]>`
- `gatewayErrors(options?: IFeedQueryOptions): Promise<IFeedEntry[]>`
- `byUrl(feedUrl: string, options?: IFeedQueryOptions): Promise<IFeedEntry[]>`

Imports `IAdtResponse` from `../connection/IAbapConnection`, and `IFeedQueryOptions`/`IFeedEntry` from `./types`.

### Exports (`src/index.ts`)

All new types re-exported via `export type` from `index.ts`, grouped under `// Runtime domain` and `// Feeds domain` comments, following existing section pattern.

## After publishing

Update `@mcp-abap-adt/adt-clients` (branch `feature/feed-reader-extensions`) to import these types from `@mcp-abap-adt/interfaces` instead of local definitions.
