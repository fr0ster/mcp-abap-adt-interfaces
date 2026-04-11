# Runtime Domain Object Interfaces Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 13 runtime domain interfaces and their option types to `@mcp-abap-adt/interfaces`, making it the canonical source for runtime contracts consumed by `@mcp-abap-adt/adt-clients`.

**Architecture:** Update base types in `src/runtime/types.ts` to support typed discriminators (`IRuntimeAnalysisObject<TKind>`, `IListableRuntimeObject<TResult, TOptions, TKind>`). Create one file per domain entity in `src/runtime/`. Re-export everything from `src/index.ts`. This is a type-only package — no runtime code.

**Tech Stack:** TypeScript 5.9, Biome linter, CommonJS output

**Spec:** `docs/superpowers/specs/2026-04-11-runtime-domain-interfaces-design.md`

---

### Task 1: Update base types in types.ts

**Files:**
- Modify: `src/runtime/types.ts`

- [ ] **Step 1: Update IRuntimeAnalysisObject to support typed discriminator**

Replace the entire content of `src/runtime/types.ts` with:

```typescript
/**
 * Runtime Analysis Domain Types
 *
 * Base interfaces for all runtime analysis/monitoring capabilities.
 * Uses typed discriminators for type narrowing.
 */

/**
 * Base interface for all runtime analysis domain objects.
 * Uses a generic discriminator field for type narrowing.
 *
 * @template TKind - Literal string type for discriminator (default: string)
 */
export interface IRuntimeAnalysisObject<TKind extends string = string> {
  readonly kind: TKind;
}

/**
 * Generic listable runtime object.
 * Each domain supplies its own result, options, and kind types.
 *
 * @template TResult - The type returned by list()
 * @template TOptions - Query options type (default: undefined = no options)
 * @template TKind - Literal string type for discriminator (default: string)
 */
export interface IListableRuntimeObject<
  TResult,
  TOptions = undefined,
  TKind extends string = string,
> extends IRuntimeAnalysisObject<TKind> {
  list(options?: TOptions): Promise<TResult>;
}
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit`
Expected: No errors (existing code uses default generic = backwards compatible)

- [ ] **Step 3: Commit**

```bash
git add src/runtime/types.ts
git commit -m "feat: add typed discriminator to IRuntimeAnalysisObject and IListableRuntimeObject (#6)"
```

---

### Task 2: Create IDebugger.ts (debugger domain)

**Files:**
- Create: `src/runtime/IDebugger.ts`

- [ ] **Step 1: Create the file with all option types and interfaces**

Create `src/runtime/IDebugger.ts` with:

```typescript
import type { IAdtResponse } from '../connection/IAbapConnection';
import type { IMemorySnapshots } from './IMemorySnapshots';
import type { IRuntimeAnalysisObject } from './types';

// --- ABAP Debugger option types ---

export interface ILaunchDebuggerOptions {
  debuggingMode?: string;
  requestUser?: string;
  terminalId?: string;
  ideId?: string;
  timeout?: number;
  checkConflict?: boolean;
  isNotifiedOnConflict?: boolean;
}

export interface IStopDebuggerOptions {
  debuggingMode?: string;
  requestUser?: string;
  terminalId?: string;
  ideId?: string;
  checkConflict?: boolean;
  notifyConflict?: boolean;
}

export interface IGetDebuggerOptions {
  debuggingMode?: string;
  requestUser?: string;
  terminalId?: string;
  ideId?: string;
  checkConflict?: boolean;
}

export interface IGetSystemAreaOptions {
  offset?: number;
  length?: number;
  element?: string;
  isSelection?: boolean;
  selectedLine?: number;
  selectedColumn?: number;
  programContext?: string;
  filter?: string;
}

export interface IGetVariableAsCsvOptions {
  offset?: number;
  length?: number;
  filter?: string;
  sortComponent?: string;
  sortDirection?: string;
  whereClause?: string;
  c?: string;
}

export interface IGetVariableAsJsonOptions {
  offset?: number;
  length?: number;
  filter?: string;
  sortComponent?: string;
  sortDirection?: string;
  whereClause?: string;
  c?: string;
}

export interface IGetVariableValueStatementOptions {
  rows?: number;
  maxStringLength?: number;
  maxNestingLevel?: number;
  maxTotalSize?: number;
  ignoreInitialValues?: boolean;
  c?: string;
  lineBreakThreshold?: number;
}

export type IAbapDebuggerStepMethod = 'stepInto' | 'stepOut' | 'stepContinue';

// --- AMDP Debugger option types ---

export interface IStartAmdpDebuggerOptions {
  stopExisting?: boolean;
  requestUser?: string;
  cascadeMode?: string;
}

export interface IGetAmdpDataPreviewOptions {
  rowNumber?: number;
  colNumber?: number;
  sessionId?: string;
  debuggerId?: string;
  debuggeeId?: string;
  variableName?: string;
  schema?: string;
  provideRowId?: boolean;
  action?: string;
}

export interface IGetAmdpCellSubstringOptions {
  rowNumber?: number;
  columnName?: string;
  sessionId?: string;
  debuggerId?: string;
  debuggeeId?: string;
  variableName?: string;
  valueOffset?: number;
  valueLength?: number;
  schema?: string;
  action?: string;
}

// --- Interfaces ---

export interface IDebugger extends IRuntimeAnalysisObject<'debugger'> {
  getAbap(): IAbapDebugger;
  getAmdp(): IAmdpDebugger;
  getMemorySnapshots(): IMemorySnapshots;
}

export interface IAbapDebugger extends IRuntimeAnalysisObject<'abapDebugger'> {
  // Session management
  launch(options?: ILaunchDebuggerOptions): Promise<IAdtResponse>;
  stop(options?: IStopDebuggerOptions): Promise<IAdtResponse>;
  get(options?: IGetDebuggerOptions): Promise<IAdtResponse>;
  getMemorySizes(includeAbap?: boolean): Promise<IAdtResponse>;
  getSystemArea(
    systemarea: string,
    options?: IGetSystemAreaOptions,
  ): Promise<IAdtResponse>;

  // Breakpoints
  synchronizeBreakpoints(checkConflict?: boolean): Promise<IAdtResponse>;
  getBreakpointStatements(): Promise<IAdtResponse>;
  getBreakpointMessageTypes(): Promise<IAdtResponse>;
  getBreakpointConditions(): Promise<IAdtResponse>;
  validateBreakpoints(): Promise<IAdtResponse>;
  getVitBreakpoints(): Promise<IAdtResponse>;

  // Variables
  getVariableMaxLength(
    variableName: string,
    part: string,
    maxLength?: number,
  ): Promise<IAdtResponse>;
  getVariableSubcomponents(
    variableName: string,
    part: string,
    component?: string,
    line?: number,
  ): Promise<IAdtResponse>;
  getVariableAsCsv(
    variableName: string,
    part: string,
    options?: IGetVariableAsCsvOptions,
  ): Promise<IAdtResponse>;
  getVariableAsJson(
    variableName: string,
    part: string,
    options?: IGetVariableAsJsonOptions,
  ): Promise<IAdtResponse>;
  getVariableValueStatement(
    variableName: string,
    part: string,
    options?: IGetVariableValueStatementOptions,
  ): Promise<IAdtResponse>;

  // Actions & stack
  executeAction(action: string, value?: string): Promise<IAdtResponse>;
  getCallStack(): Promise<IAdtResponse>;

  // Watchpoints
  insertWatchpoint(
    variableName: string,
    condition?: string,
  ): Promise<IAdtResponse>;
  getWatchpoints(): Promise<IAdtResponse>;

  // Batch operations
  executeBatchRequest(requests: string): Promise<IAdtResponse>;
  executeStepBatch(
    stepMethod: IAbapDebuggerStepMethod,
  ): Promise<IAdtResponse>;
  stepIntoBatch(): Promise<IAdtResponse>;
  stepOutBatch(): Promise<IAdtResponse>;
  stepContinueBatch(): Promise<IAdtResponse>;
}

export interface IAmdpDebugger extends IRuntimeAnalysisObject<'amdpDebugger'> {
  start(options?: IStartAmdpDebuggerOptions): Promise<IAdtResponse>;
  resume(mainId: string): Promise<IAdtResponse>;
  terminate(mainId: string, hardStop?: boolean): Promise<IAdtResponse>;
  getDebuggee(
    mainId: string,
    debuggeeId: string,
  ): Promise<IAdtResponse>;
  getVariable(
    mainId: string,
    debuggeeId: string,
    varname: string,
    offset?: number,
    length?: number,
  ): Promise<IAdtResponse>;
  setVariable(
    mainId: string,
    debuggeeId: string,
    varname: string,
    setNull?: boolean,
  ): Promise<IAdtResponse>;
  lookup(
    mainId: string,
    debuggeeId: string,
    name?: string,
  ): Promise<IAdtResponse>;
  stepOver(mainId: string, debuggeeId: string): Promise<IAdtResponse>;
  stepContinue(
    mainId: string,
    debuggeeId: string,
  ): Promise<IAdtResponse>;
  getBreakpoints(mainId: string): Promise<IAdtResponse>;
  getBreakpointsLlang(mainId: string): Promise<IAdtResponse>;
  getBreakpointsTableFunctions(mainId: string): Promise<IAdtResponse>;
  getDataPreview(
    options?: IGetAmdpDataPreviewOptions,
  ): Promise<IAdtResponse>;
  getCellSubstring(
    options?: IGetAmdpCellSubstringOptions,
  ): Promise<IAdtResponse>;
}
```

**Note:** This file imports `IMemorySnapshots` from `./IMemorySnapshots` which doesn't exist yet. The TypeScript compiler will report this error until Task 3 creates that file. This is expected — the full build will pass after all files are created.

- [ ] **Step 2: Commit**

```bash
git add src/runtime/IDebugger.ts
git commit -m "feat: add IDebugger, IAbapDebugger, IAmdpDebugger interfaces (#6)"
```

---

### Task 3: Create IMemorySnapshots.ts

**Files:**
- Create: `src/runtime/IMemorySnapshots.ts`

- [ ] **Step 1: Create the file**

Create `src/runtime/IMemorySnapshots.ts` with:

```typescript
import type { IAdtResponse } from '../connection/IAbapConnection';
import type { IListableRuntimeObject } from './types';

export interface IMemorySnapshotsListOptions {
  user?: string;
  originalUser?: string;
}

export interface ISnapshotRankingListOptions {
  maxNumberOfObjects?: number;
  excludeAbapType?: string[];
  sortAscending?: boolean;
  sortByColumnName?: string;
  groupByParentType?: boolean;
}

export interface ISnapshotChildrenOptions {
  maxNumberOfObjects?: number;
  sortAscending?: boolean;
  sortByColumnName?: string;
}

export interface ISnapshotReferencesOptions {
  maxNumberOfReferences?: number;
}

export interface IMemorySnapshots
  extends IListableRuntimeObject<
    IAdtResponse,
    IMemorySnapshotsListOptions,
    'memorySnapshots'
  > {
  getById(snapshotId: string): Promise<IAdtResponse>;
  getOverview(snapshotId: string): Promise<IAdtResponse>;
  getRankingList(
    snapshotId: string,
    options?: ISnapshotRankingListOptions,
  ): Promise<IAdtResponse>;
  getChildren(
    snapshotId: string,
    parentKey: string,
    options?: ISnapshotChildrenOptions,
  ): Promise<IAdtResponse>;
  getReferences(
    snapshotId: string,
    objectKey: string,
    options?: ISnapshotReferencesOptions,
  ): Promise<IAdtResponse>;
  getDeltaOverview(uri1: string, uri2: string): Promise<IAdtResponse>;
  getDeltaRankingList(
    uri1: string,
    uri2: string,
    options?: ISnapshotRankingListOptions,
  ): Promise<IAdtResponse>;
  getDeltaChildren(
    uri1: string,
    uri2: string,
    parentKey: string,
    options?: ISnapshotChildrenOptions,
  ): Promise<IAdtResponse>;
  getDeltaReferences(
    uri1: string,
    uri2: string,
    objectKey: string,
    options?: ISnapshotReferencesOptions,
  ): Promise<IAdtResponse>;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/runtime/IMemorySnapshots.ts
git commit -m "feat: add IMemorySnapshots interface (#6)"
```

---

### Task 4: Create IProfiler.ts

**Files:**
- Create: `src/runtime/IProfiler.ts`

- [ ] **Step 1: Create the file**

Create `src/runtime/IProfiler.ts` with:

```typescript
import type { IAdtResponse } from '../connection/IAbapConnection';
import type { IListableRuntimeObject } from './types';

export interface IProfilerListOptions {
  user?: string;
}

export interface IProfilerTraceParameters {
  allMiscAbapStatements?: boolean;
  allProceduralUnits?: boolean;
  allInternalTableEvents?: boolean;
  allDynproEvents?: boolean;
  description?: string;
  aggregate?: boolean;
  explicitOnOff?: boolean;
  withRfcTracing?: boolean;
  allSystemKernelEvents?: boolean;
  sqlTrace?: boolean;
  allDbEvents?: boolean;
  maxSizeForTraceFile?: number;
  amdpTrace?: boolean;
  maxTimeForTracing?: number;
}

export interface IProfilerTraceHitListOptions {
  withSystemEvents?: boolean;
}

export interface IProfilerTraceStatementsOptions {
  id?: number;
  withDetails?: boolean;
  autoDrillDownThreshold?: number;
  withSystemEvents?: boolean;
}

export interface IProfilerTraceDbAccessesOptions {
  withSystemEvents?: boolean;
}

export interface IProfiler
  extends IListableRuntimeObject<
    IAdtResponse,
    IProfilerListOptions,
    'profiler'
  > {
  getParameters(): Promise<IAdtResponse>;
  getParametersForCallstack(): Promise<IAdtResponse>;
  getParametersForAmdp(): Promise<IAdtResponse>;
  createParameters(
    options?: IProfilerTraceParameters,
  ): Promise<IAdtResponse>;
  getHitList(
    traceIdOrUri: string,
    options?: IProfilerTraceHitListOptions,
  ): Promise<IAdtResponse>;
  getStatements(
    traceIdOrUri: string,
    options?: IProfilerTraceStatementsOptions,
  ): Promise<IAdtResponse>;
  getDbAccesses(
    traceIdOrUri: string,
    options?: IProfilerTraceDbAccessesOptions,
  ): Promise<IAdtResponse>;
  listRequests(): Promise<IAdtResponse>;
  getRequestsByUri(uri: string): Promise<IAdtResponse>;
  listObjectTypes(): Promise<IAdtResponse>;
  listProcessTypes(): Promise<IAdtResponse>;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/runtime/IProfiler.ts
git commit -m "feat: add IProfiler interface (#6)"
```

---

### Task 5: Create ICrossTrace.ts, ISt05Trace.ts

**Files:**
- Create: `src/runtime/ICrossTrace.ts`
- Create: `src/runtime/ISt05Trace.ts`

- [ ] **Step 1: Create ICrossTrace.ts**

Create `src/runtime/ICrossTrace.ts` with:

```typescript
import type { IAdtResponse } from '../connection/IAbapConnection';
import type { IListableRuntimeObject } from './types';

export interface IListCrossTracesOptions {
  traceUser?: string;
  actCreateUser?: string;
  actChangeUser?: string;
}

export interface ICrossTrace
  extends IListableRuntimeObject<
    IAdtResponse,
    IListCrossTracesOptions,
    'crossTrace'
  > {
  getById(
    traceId: string,
    includeSensitiveData?: boolean,
  ): Promise<IAdtResponse>;
  getRecords(traceId: string): Promise<IAdtResponse>;
  getRecordContent(
    traceId: string,
    recordNumber: number,
  ): Promise<IAdtResponse>;
  getActivations(): Promise<IAdtResponse>;
}
```

- [ ] **Step 2: Create ISt05Trace.ts**

Create `src/runtime/ISt05Trace.ts` with:

```typescript
import type { IAdtResponse } from '../connection/IAbapConnection';
import type { IRuntimeAnalysisObject } from './types';

export interface ISt05Trace
  extends IRuntimeAnalysisObject<'st05Trace'> {
  getState(): Promise<IAdtResponse>;
  getDirectory(): Promise<IAdtResponse>;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/runtime/ICrossTrace.ts src/runtime/ISt05Trace.ts
git commit -m "feat: add ICrossTrace and ISt05Trace interfaces (#6)"
```

---

### Task 6: Create IApplicationLog.ts, IAtcLog.ts, IDdicActivation.ts

**Files:**
- Create: `src/runtime/IApplicationLog.ts`
- Create: `src/runtime/IAtcLog.ts`
- Create: `src/runtime/IDdicActivation.ts`

- [ ] **Step 1: Create IApplicationLog.ts**

Create `src/runtime/IApplicationLog.ts` with:

```typescript
import type { IAdtResponse } from '../connection/IAbapConnection';
import type { IRuntimeAnalysisObject } from './types';

export interface IGetApplicationLogObjectOptions {
  corrNr?: string;
  lockHandle?: string;
  version?: string;
  accessMode?: string;
  action?: string;
}

export interface IGetApplicationLogSourceOptions {
  corrNr?: string;
  lockHandle?: string;
  version?: string;
}

export interface IApplicationLog
  extends IRuntimeAnalysisObject<'applicationLog'> {
  getObject(
    objectName: string,
    options?: IGetApplicationLogObjectOptions,
  ): Promise<IAdtResponse>;
  getSource(
    objectName: string,
    options?: IGetApplicationLogSourceOptions,
  ): Promise<IAdtResponse>;
  validateName(objectName: string): Promise<IAdtResponse>;
}
```

- [ ] **Step 2: Create IAtcLog.ts**

Create `src/runtime/IAtcLog.ts` with:

```typescript
import type { IAdtResponse } from '../connection/IAbapConnection';
import type { IRuntimeAnalysisObject } from './types';

export interface IGetCheckFailureLogsOptions {
  displayId?: string;
  objName?: string;
  objType?: string;
  moduleId?: string;
  phaseKey?: string;
}

export interface IAtcLog extends IRuntimeAnalysisObject<'atcLog'> {
  getCheckFailureLogs(
    options?: IGetCheckFailureLogsOptions,
  ): Promise<IAdtResponse>;
  getExecutionLog(executionId: string): Promise<IAdtResponse>;
}
```

- [ ] **Step 3: Create IDdicActivation.ts**

Create `src/runtime/IDdicActivation.ts` with:

```typescript
import type { IAdtResponse } from '../connection/IAbapConnection';
import type { IRuntimeAnalysisObject } from './types';

export interface IGetActivationGraphOptions {
  objectName?: string;
  objectType?: string;
  logName?: string;
}

export interface IDdicActivation
  extends IRuntimeAnalysisObject<'ddicActivation'> {
  getGraph(
    options?: IGetActivationGraphOptions,
  ): Promise<IAdtResponse>;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/runtime/IApplicationLog.ts src/runtime/IAtcLog.ts src/runtime/IDdicActivation.ts
git commit -m "feat: add IApplicationLog, IAtcLog, IDdicActivation interfaces (#6)"
```

---

### Task 7: Create IRuntimeDumps.ts, ISystemMessages.ts, IGatewayErrorLog.ts

**Files:**
- Create: `src/runtime/IRuntimeDumps.ts`
- Create: `src/runtime/ISystemMessages.ts`
- Create: `src/runtime/IGatewayErrorLog.ts`

- [ ] **Step 1: Create IRuntimeDumps.ts**

Create `src/runtime/IRuntimeDumps.ts` with:

```typescript
import type { IAdtResponse } from '../connection/IAbapConnection';
import type { IListableRuntimeObject } from './types';

export type IRuntimeDumpReadView = 'default' | 'summary' | 'formatted';

export interface IRuntimeDumpsListOptions {
  query?: string;
  inlinecount?: 'allpages' | 'none';
  top?: number;
  skip?: number;
  orderby?: string;
  from?: string;
  to?: string;
}

export interface IRuntimeDumpReadOptions {
  view?: IRuntimeDumpReadView;
}

export interface IRuntimeDumps
  extends IListableRuntimeObject<
    IAdtResponse,
    IRuntimeDumpsListOptions,
    'runtimeDumps'
  > {
  listByUser(
    user?: string,
    options?: Omit<IRuntimeDumpsListOptions, 'query'>,
  ): Promise<IAdtResponse>;
  getById(
    dumpId: string,
    options?: IRuntimeDumpReadOptions,
  ): Promise<IAdtResponse>;
}
```

- [ ] **Step 2: Create ISystemMessages.ts**

Create `src/runtime/ISystemMessages.ts` with:

```typescript
import type { IAdtResponse } from '../connection/IAbapConnection';
import type { IFeedQueryOptions } from '../feeds/types';
import type { IListableRuntimeObject } from './types';

export interface ISystemMessages
  extends IListableRuntimeObject<
    IAdtResponse,
    IFeedQueryOptions,
    'systemMessages'
  > {
  getById(messageId: string): Promise<IAdtResponse>;
}
```

- [ ] **Step 3: Create IGatewayErrorLog.ts**

Create `src/runtime/IGatewayErrorLog.ts` with:

```typescript
import type { IAdtResponse } from '../connection/IAbapConnection';
import type { IFeedQueryOptions } from '../feeds/types';
import type { IListableRuntimeObject } from './types';

export interface IGatewayErrorLog
  extends IListableRuntimeObject<
    IAdtResponse,
    IFeedQueryOptions,
    'gatewayErrorLog'
  > {
  getById(errorType: string, errorId: string): Promise<IAdtResponse>;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/runtime/IRuntimeDumps.ts src/runtime/ISystemMessages.ts src/runtime/IGatewayErrorLog.ts
git commit -m "feat: add IRuntimeDumps, ISystemMessages, IGatewayErrorLog interfaces (#6)"
```

---

### Task 8: Add re-exports to index.ts

**Files:**
- Modify: `src/index.ts:197-201` (after existing runtime exports)

- [ ] **Step 1: Add runtime domain object exports**

In `src/index.ts`, find the existing runtime exports block:

```typescript
// Runtime domain
export type {
  IListableRuntimeObject,
  IRuntimeAnalysisObject,
} from './runtime/types';
```

Add the following immediately after it:

```typescript
// Runtime domain object interfaces
export type {
  IAbapDebugger,
  IAmdpDebugger,
  IDebugger,
} from './runtime/IDebugger';
export type {
  IAbapDebuggerStepMethod,
  IGetAmdpCellSubstringOptions,
  IGetAmdpDataPreviewOptions,
  IGetDebuggerOptions,
  IGetSystemAreaOptions,
  IGetVariableAsCsvOptions,
  IGetVariableAsJsonOptions,
  IGetVariableValueStatementOptions,
  ILaunchDebuggerOptions,
  IStartAmdpDebuggerOptions,
  IStopDebuggerOptions,
} from './runtime/IDebugger';
export type {
  IMemorySnapshots,
  IMemorySnapshotsListOptions,
  ISnapshotChildrenOptions,
  ISnapshotRankingListOptions,
  ISnapshotReferencesOptions,
} from './runtime/IMemorySnapshots';
export type {
  IProfiler,
  IProfilerListOptions,
  IProfilerTraceDbAccessesOptions,
  IProfilerTraceHitListOptions,
  IProfilerTraceParameters,
  IProfilerTraceStatementsOptions,
} from './runtime/IProfiler';
export type {
  ICrossTrace,
  IListCrossTracesOptions,
} from './runtime/ICrossTrace';
export type { ISt05Trace } from './runtime/ISt05Trace';
export type {
  IApplicationLog,
  IGetApplicationLogObjectOptions,
  IGetApplicationLogSourceOptions,
} from './runtime/IApplicationLog';
export type {
  IAtcLog,
  IGetCheckFailureLogsOptions,
} from './runtime/IAtcLog';
export type {
  IDdicActivation,
  IGetActivationGraphOptions,
} from './runtime/IDdicActivation';
export type {
  IRuntimeDumpReadOptions,
  IRuntimeDumpReadView,
  IRuntimeDumps,
  IRuntimeDumpsListOptions,
} from './runtime/IRuntimeDumps';
export type { ISystemMessages } from './runtime/ISystemMessages';
export type { IGatewayErrorLog } from './runtime/IGatewayErrorLog';
```

- [ ] **Step 2: Commit**

```bash
git add src/index.ts
git commit -m "feat: re-export runtime domain object interfaces from index (#6)"
```

---

### Task 9: Full build verification

**Files:** None (verification only)

- [ ] **Step 1: Run full build**

Run: `npm run build`
Expected: Clean exit with no errors (biome check + tsc)

- [ ] **Step 2: Run type-check only**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Verify all exports are accessible**

Create a temporary verification file `verify-exports.ts` in the project root:

```typescript
import type {
  IAbapDebugger,
  IAmdpDebugger,
  IApplicationLog,
  IAtcLog,
  ICrossTrace,
  IDebugger,
  IDdicActivation,
  IGatewayErrorLog,
  IMemorySnapshots,
  IProfiler,
  IRuntimeDumps,
  ISt05Trace,
  ISystemMessages,
} from './src/index';

// Verify discriminator types
type AssertDebuggerKind = IDebugger['kind'] extends 'debugger' ? true : never;
type AssertProfilerKind = IProfiler['kind'] extends 'profiler' ? true : never;

const _debuggerKind: AssertDebuggerKind = true;
const _profilerKind: AssertProfilerKind = true;
```

Run: `npx tsc --noEmit verify-exports.ts`
Expected: No errors — all types importable and discriminator literals work

- [ ] **Step 4: Delete verification file**

```bash
rm verify-exports.ts
```

- [ ] **Step 5: Bump version to 6.0.0**

In `package.json`, change `"version": "5.1.0"` to `"version": "6.0.0"`.

- [ ] **Step 6: Run final build**

Run: `npm run build`
Expected: Clean exit

- [ ] **Step 7: Commit version bump**

```bash
git add package.json
git commit -m "chore: bump version to 6.0.0 (major) (#6)"
```

---

### Task 10: Cleanup

**Files:**
- Delete: `docs/superpowers/specs/2026-04-11-runtime-domain-interfaces-design.md`
- Delete: `docs/superpowers/plans/2026-04-11-runtime-domain-interfaces.md`

- [ ] **Step 1: Remove spec and plan docs**

```bash
rm docs/superpowers/specs/2026-04-11-runtime-domain-interfaces-design.md
rm docs/superpowers/plans/2026-04-11-runtime-domain-interfaces.md
rm -rf docs/superpowers
```

- [ ] **Step 2: Commit cleanup**

```bash
git add -A docs/
git commit -m "docs: remove spec and plan after implementation (#6)"
```
