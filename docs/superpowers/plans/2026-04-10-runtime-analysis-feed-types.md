# Runtime Analysis Interfaces and Feed Types — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add runtime analysis and feed domain interfaces/types to `@mcp-abap-adt/interfaces` (issue #4).

**Architecture:** Three new files in two new domain folders (`src/runtime/`, `src/feeds/`). Data types in `types.ts`, method-bearing interface in `IFeedRepository.ts`. All re-exported through `src/index.ts`.

**Tech Stack:** TypeScript 5.9, Biome linter, no test framework (pure type-only package — verification via `tsc --noEmit` and `biome check`).

**Spec:** `docs/superpowers/specs/2026-04-10-runtime-analysis-feed-types-design.md`

---

### Task 1: Create runtime types

**Files:**
- Create: `src/runtime/types.ts`

- [ ] **Step 1: Create `src/runtime/types.ts`**

```typescript
/**
 * Runtime Analysis Domain Types
 *
 * These types represent runtime analysis/monitoring capabilities.
 * They are NOT IAdtObject (not CRUD).
 */

/**
 * Base interface for all runtime analysis domain objects.
 * Uses a discriminator field for type narrowing.
 */
export interface IRuntimeAnalysisObject {
  readonly kind: string;
}

/**
 * Generic listable runtime object.
 * Each domain supplies its own result and options types.
 *
 * @template TResult - The type returned by list()
 * @template TOptions - Query options type (default: undefined = no options)
 */
export interface IListableRuntimeObject<TResult, TOptions = undefined> {
  list(options?: TOptions): Promise<TResult>;
}
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Run linter**

Run: `npx biome check src/runtime/types.ts`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/runtime/types.ts
git commit -m "feat: add runtime analysis domain types (#4)"
```

---

### Task 2: Create feed data types

**Files:**
- Create: `src/feeds/types.ts`

- [ ] **Step 1: Create `src/feeds/types.ts`**

```typescript
/**
 * Feeds Domain Data Types
 *
 * Types for feed queries, entries, system messages, and gateway errors.
 */

/**
 * ABAP timestamp string in format YYYYMMDDHHMMSS.
 * Represents an ABAP timestamp in feed query/results payloads.
 * Omitted query values are excluded from serialization.
 */
export type IAbapTimestamp = string;

// --- Feed-level types ---

export interface IFeedQueryOptions {
  user?: string;
  maxResults?: number;
  from?: IAbapTimestamp;
  to?: IAbapTimestamp;
}

export interface IFeedEntry {
  id: string;
  title: string;
  updated: IAbapTimestamp;
  link: string;
  content: string;
  author?: string;
  category?: string;
}

export interface IFeedDescriptor {
  id: string;
  title: string;
  url: string;
  category?: string;
}

export interface IFeedVariant {
  id: string;
  title: string;
  url: string;
}

// --- System message types ---

export interface ISystemMessageEntry {
  id: string;
  title: string;
  text: string;
  severity: string;
  validFrom: IAbapTimestamp;
  validTo: IAbapTimestamp;
  createdBy: string;
}

// --- Gateway error types ---

export interface IGatewayErrorEntry {
  type: string;
  shortText: string;
  transactionId: string;
  package: string;
  applicationComponent: string;
  dateTime: IAbapTimestamp;
  username: string;
  client: string;
  requestKind: string;
}

export interface IGatewayErrorDetail extends IGatewayErrorEntry {
  serviceInfo: {
    namespace: string;
    serviceName: string;
    serviceVersion: string;
    groupId: string;
    serviceRepository: string;
    destination: string;
  };
  errorContext: {
    errorInfo: string;
    resolution: Record<string, string>;
    exceptions: IGatewayException[];
  };
  sourceCode: {
    lines: ISourceCodeLine[];
    errorLine: number;
  };
  callStack: ICallStackEntry[];
}

export interface IGatewayException {
  type: string;
  text: string;
  raiseLocation: string;
  attributes?: Record<string, string>;
}

export interface ICallStackEntry {
  number: number;
  event: string;
  program: string;
  name: string;
  line: number;
}

export interface ISourceCodeLine {
  number: number;
  content: string;
  isError: boolean;
}
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Run linter**

Run: `npx biome check src/feeds/types.ts`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/feeds/types.ts
git commit -m "feat: add feed domain data types (#4)"
```

---

### Task 3: Create feed repository interface

**Files:**
- Create: `src/feeds/IFeedRepository.ts`

- [ ] **Step 1: Create `src/feeds/IFeedRepository.ts`**

```typescript
/**
 * Feed Repository Interface
 *
 * Domain-facing interface for feed access.
 * All methods return domain types (no raw IAdtResponse).
 */

import type {
  IFeedDescriptor,
  IFeedEntry,
  IFeedQueryOptions,
  IFeedVariant,
  IGatewayErrorDetail,
  IGatewayErrorEntry,
  ISystemMessageEntry,
} from './types';

export interface IFeedRepository {
  list(): Promise<IFeedDescriptor[]>;
  variants(): Promise<IFeedVariant[]>;
  dumps(options?: IFeedQueryOptions): Promise<IFeedEntry[]>;
  systemMessages(options?: IFeedQueryOptions): Promise<ISystemMessageEntry[]>;
  gatewayErrors(options?: IFeedQueryOptions): Promise<IGatewayErrorEntry[]>;
  gatewayErrorDetail(feedUrl: string): Promise<IGatewayErrorDetail>;
}
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Run linter**

Run: `npx biome check src/feeds/IFeedRepository.ts`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/feeds/IFeedRepository.ts
git commit -m "feat: add IFeedRepository interface (#4)"
```

---

### Task 4: Add re-exports to index.ts

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Add runtime domain exports**

Add after the `// Execution domain` / `export type { IExecutor }` line (line 176) and before the `// Headers domain` comment (line 177):

```typescript
// Feeds domain
export type {
  IAbapTimestamp,
  ICallStackEntry,
  IFeedDescriptor,
  IFeedEntry,
  IFeedQueryOptions,
  IFeedVariant,
  IGatewayErrorDetail,
  IGatewayErrorEntry,
  IGatewayException,
  ISourceCodeLine,
  ISystemMessageEntry,
} from './feeds/types';
export type { IFeedRepository } from './feeds/IFeedRepository';
```

- [ ] **Step 2: Add feeds domain exports**

Add before the `// Feeds domain` block just inserted (i.e. between `IExecutor` export and the new feeds block):

```typescript
// Runtime domain
export type {
  IListableRuntimeObject,
  IRuntimeAnalysisObject,
} from './runtime/types';
```

The final order in `index.ts` around that area should be:

```typescript
export type { IExecutor } from './execution/IExecutor';
// Feeds domain
export type {
  IAbapTimestamp,
  ICallStackEntry,
  IFeedDescriptor,
  IFeedEntry,
  IFeedQueryOptions,
  IFeedVariant,
  IGatewayErrorDetail,
  IGatewayErrorEntry,
  IGatewayException,
  ISourceCodeLine,
  ISystemMessageEntry,
} from './feeds/types';
export type { IFeedRepository } from './feeds/IFeedRepository';
// Headers domain
export * from './Headers';
```

And at the end of the file (after the Validation domain exports):

```typescript
// Runtime domain
export type {
  IListableRuntimeObject,
  IRuntimeAnalysisObject,
} from './runtime/types';
```

Note: `index.ts` exports are sorted alphabetically by domain comment. "Feeds" goes between "Execution" and "Headers"; "Runtime" goes after "Validation" (end of file) since there is no domain starting with a letter after R that exists yet. Alternatively, Biome's `organizeImports` may reorder — follow whatever the linter produces.

- [ ] **Step 3: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Run linter and auto-fix ordering**

Run: `npx biome check --write src/index.ts`
Expected: no errors (may reorder exports)

- [ ] **Step 5: Full build**

Run: `npm run build`
Expected: clean build, `dist/` contains all new declaration files

- [ ] **Step 6: Commit**

```bash
git add src/index.ts
git commit -m "feat: re-export runtime and feed types from index (#4)"
```
