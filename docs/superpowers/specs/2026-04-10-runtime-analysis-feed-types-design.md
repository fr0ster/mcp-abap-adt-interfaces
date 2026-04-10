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

Data types go in `types.ts`; interfaces with methods get their own files — a readability choice for these new domains, not a strict repository-wide convention.

### Runtime module (`src/runtime/types.ts`)

- `IRuntimeAnalysisObject` — base interface for all runtime analysis domain objects with a `readonly kind: string` discriminator. These are NOT `IAdtObject` (not CRUD) — they represent runtime analysis/monitoring capabilities.
- `IListableRuntimeObject<TResult, TOptions = undefined>` — generic listable runtime object. Both result type and options type are parameterized. Has a `list(options?: TOptions): Promise<TResult>` method.

### Feeds module — data types (`src/feeds/types.ts`)

Timestamp alias:
- `IAbapTimestamp` — type alias for `string`, format `YYYYMMDDHHMMSS`. Represents SAP system-local time. Omitted values are excluded from query serialization.

Feed-level types:
- `IFeedQueryOptions` — query parameters: `user?`, `maxResults?`, `from?: IAbapTimestamp`, `to?: IAbapTimestamp`
- `IFeedEntry` — generic feed entry: `id`, `title`, `updated`, `link`, `content`, `author?`, `category?`
- `IFeedDescriptor` — feed metadata: `id`, `title`, `url`, `category?`
- `IFeedVariant` — feed variant metadata: `id`, `title`, `url`

System message types:
- `ISystemMessageEntry` — `id`, `title`, `text`, `severity`, `validFrom`, `validTo`, `createdBy`

Gateway error types:
- `IGatewayErrorEntry` — basic error: `type`, `shortText`, `transactionId`, `package`, `applicationComponent`, `dateTime`, `username`, `client`, `requestKind`
- `IGatewayErrorDetail extends IGatewayErrorEntry` — detailed error with nested objects: `serviceInfo`, `errorContext`, `sourceCode`, `callStack`
- `IGatewayException` — `type`, `text`, `raiseLocation`, `attributes?`
- `ICallStackEntry` — `number`, `event`, `program`, `name`, `line`
- `ISourceCodeLine` — `number`, `content`, `isError`

### Feeds module — repository interface (`src/feeds/IFeedRepository.ts`)

`IFeedRepository` — domain-facing interface for feed access. All methods return domain types (no raw `IAdtResponse`):
- `list(): Promise<IFeedDescriptor[]>`
- `variants(): Promise<IFeedVariant[]>`
- `dumps(options?: IFeedQueryOptions): Promise<IFeedEntry[]>`
- `systemMessages(options?: IFeedQueryOptions): Promise<ISystemMessageEntry[]>`
- `gatewayErrors(options?: IFeedQueryOptions): Promise<IGatewayErrorEntry[]>`
- `gatewayErrorDetail(feedUrl: string): Promise<IGatewayErrorDetail>`
- `byUrl(feedUrl: string, options?: IFeedQueryOptions): Promise<IFeedEntry[]>`

Imports all types from `./types`.

### Exports (`src/index.ts`)

All new types re-exported via `export type` from `index.ts`, grouped under `// Runtime domain` and `// Feeds domain` comments, following existing section pattern.

## After publishing

Update `@mcp-abap-adt/adt-clients` (branch `feature/feed-reader-extensions`) to import these types from `@mcp-abap-adt/interfaces` instead of local definitions.
