# Runtime Domain Object Interfaces — Design Spec

**Issue:** #6  
**Date:** 2026-04-11  
**Version target:** 6.0.0 (major — new public API surface)

## Goal

Add 13 domain object interfaces and ~27 option/type definitions for runtime analysis capabilities. These interfaces are consumed by `@mcp-abap-adt/adt-clients` (branch `feature/feed-reader-extensions`) so factory methods return interfaces, not concrete classes.

Follows from #4 (feed types added in 5.1.0).

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Option types source | Full definitions from `adt-clients` | Single source of truth, full type safety |
| IAbapDebugger structure | Monolithic, single interface | Sub-interfaces add complexity without benefit; grouping via comments |
| File organization | One file per domain entity | Matches `src/adt/` convention |
| Sub-debugger inheritance | All extend IRuntimeAnalysisObject | Each can be used independently with own `kind` |

## File Structure

```
src/runtime/
├── types.ts                 (exists — IRuntimeAnalysisObject, IListableRuntimeObject)
├── IDebugger.ts             (IDebugger, IAbapDebugger, IAmdpDebugger + 12 option types)
├── IMemorySnapshots.ts      (IMemorySnapshots + 4 option types)
├── IProfiler.ts             (IProfiler + 5 option types)
├── ICrossTrace.ts           (ICrossTrace + 1 option type)
├── ISt05Trace.ts            (ISt05Trace)
├── IApplicationLog.ts       (IApplicationLog + 2 option types)
├── IAtcLog.ts               (IAtcLog + 1 option type)
├── IDdicActivation.ts       (IDdicActivation + 1 option type)
├── IRuntimeDumps.ts         (IRuntimeDumps + 3 option types)
├── ISystemMessages.ts       (ISystemMessages — reuses IFeedQueryOptions)
└── IGatewayErrorLog.ts      (IGatewayErrorLog — reuses IFeedQueryOptions)
```

## Interface Definitions

### IDebugger.ts

#### Option Types

```typescript
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

export interface IDebuggerBatchPayload {
  boundary: string;
  body: string;
}

export type IAbapDebuggerStepMethod = 'stepInto' | 'stepOut' | 'stepContinue';

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
```

#### Interfaces

```typescript
import type { IRuntimeAnalysisObject } from './types';
import type { IAdtResponse } from '../connection/IAbapConnection';
import type { IMemorySnapshots } from './IMemorySnapshots';

export interface IDebugger extends IRuntimeAnalysisObject {
  getAbap(): IAbapDebugger;
  getAmdp(): IAmdpDebugger;
  getMemorySnapshots(): IMemorySnapshots;
}

export interface IAbapDebugger extends IRuntimeAnalysisObject {
  // Session management
  launch(options?: ILaunchDebuggerOptions): Promise<IAdtResponse>;
  stop(options?: IStopDebuggerOptions): Promise<IAdtResponse>;
  get(options?: IGetDebuggerOptions): Promise<IAdtResponse>;
  getMemorySizes(includeAbap?: boolean): Promise<IAdtResponse>;
  getSystemArea(systemarea: string, options?: IGetSystemAreaOptions): Promise<IAdtResponse>;

  // Breakpoints
  synchronizeBreakpoints(checkConflict?: boolean): Promise<IAdtResponse>;
  getBreakpointStatements(): Promise<IAdtResponse>;
  getBreakpointMessageTypes(): Promise<IAdtResponse>;
  getBreakpointConditions(): Promise<IAdtResponse>;
  validateBreakpoints(): Promise<IAdtResponse>;
  getVitBreakpoints(): Promise<IAdtResponse>;

  // Variables
  getVariableMaxLength(variableName: string, part: string, maxLength?: number): Promise<IAdtResponse>;
  getVariableSubcomponents(variableName: string, part: string, component?: string, line?: number): Promise<IAdtResponse>;
  getVariableAsCsv(variableName: string, part: string, options?: IGetVariableAsCsvOptions): Promise<IAdtResponse>;
  getVariableAsJson(variableName: string, part: string, options?: IGetVariableAsJsonOptions): Promise<IAdtResponse>;
  getVariableValueStatement(variableName: string, part: string, options?: IGetVariableValueStatementOptions): Promise<IAdtResponse>;

  // Actions & stack
  executeAction(action: string, value?: string): Promise<IAdtResponse>;
  getCallStack(): Promise<IAdtResponse>;

  // Watchpoints
  insertWatchpoint(variableName: string, condition?: string): Promise<IAdtResponse>;
  getWatchpoints(): Promise<IAdtResponse>;

  // Batch operations
  executeBatchRequest(requests: string): Promise<IAdtResponse>;
  buildBatchPayload(requests: string[]): IDebuggerBatchPayload;
  buildStepWithStackBatchPayload(stepMethod: IAbapDebuggerStepMethod): IDebuggerBatchPayload;
  executeStepBatch(stepMethod: IAbapDebuggerStepMethod): Promise<IAdtResponse>;
  stepIntoBatch(): Promise<IAdtResponse>;
  stepOutBatch(): Promise<IAdtResponse>;
  stepContinueBatch(): Promise<IAdtResponse>;
}

export interface IAmdpDebugger extends IRuntimeAnalysisObject {
  start(options?: IStartAmdpDebuggerOptions): Promise<IAdtResponse>;
  resume(mainId: string): Promise<IAdtResponse>;
  terminate(mainId: string, hardStop?: boolean): Promise<IAdtResponse>;
  getDebuggee(mainId: string, debuggeeId: string): Promise<IAdtResponse>;
  getVariable(mainId: string, debuggeeId: string, varname: string, offset?: number, length?: number): Promise<IAdtResponse>;
  setVariable(mainId: string, debuggeeId: string, varname: string, setNull?: boolean): Promise<IAdtResponse>;
  lookup(mainId: string, debuggeeId: string, name?: string): Promise<IAdtResponse>;
  stepOver(mainId: string, debuggeeId: string): Promise<IAdtResponse>;
  stepContinue(mainId: string, debuggeeId: string): Promise<IAdtResponse>;
  getBreakpoints(mainId: string): Promise<IAdtResponse>;
  getBreakpointsLlang(mainId: string): Promise<IAdtResponse>;
  getBreakpointsTableFunctions(mainId: string): Promise<IAdtResponse>;
  getDataPreview(options?: IGetAmdpDataPreviewOptions): Promise<IAdtResponse>;
  getCellSubstring(options?: IGetAmdpCellSubstringOptions): Promise<IAdtResponse>;
}
```

### IMemorySnapshots.ts

```typescript
import type { IListableRuntimeObject } from './types';
import type { IAdtResponse } from '../connection/IAbapConnection';

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

export interface IMemorySnapshots extends IListableRuntimeObject<IAdtResponse, IMemorySnapshotsListOptions> {
  getById(snapshotId: string): Promise<IAdtResponse>;
  getOverview(snapshotId: string): Promise<IAdtResponse>;
  getRankingList(snapshotId: string, options?: ISnapshotRankingListOptions): Promise<IAdtResponse>;
  getChildren(snapshotId: string, parentKey: string, options?: ISnapshotChildrenOptions): Promise<IAdtResponse>;
  getReferences(snapshotId: string, objectKey: string, options?: ISnapshotReferencesOptions): Promise<IAdtResponse>;
  getDeltaOverview(uri1: string, uri2: string): Promise<IAdtResponse>;
  getDeltaRankingList(uri1: string, uri2: string, options?: ISnapshotRankingListOptions): Promise<IAdtResponse>;
  getDeltaChildren(uri1: string, uri2: string, parentKey: string, options?: ISnapshotChildrenOptions): Promise<IAdtResponse>;
  getDeltaReferences(uri1: string, uri2: string, objectKey: string, options?: ISnapshotReferencesOptions): Promise<IAdtResponse>;
}
```

### IProfiler.ts

```typescript
import type { IListableRuntimeObject } from './types';
import type { IAdtResponse } from '../connection/IAbapConnection';

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

export interface IProfiler extends IListableRuntimeObject<IAdtResponse, IProfilerListOptions> {
  getParameters(): Promise<IAdtResponse>;
  getParametersForCallstack(): Promise<IAdtResponse>;
  getParametersForAmdp(): Promise<IAdtResponse>;
  buildParametersXml(options?: IProfilerTraceParameters): string;
  createParameters(options?: IProfilerTraceParameters): Promise<IAdtResponse>;
  extractIdFromResponse(response: IAdtResponse): string | undefined;
  getDefaultParameters(): Omit<IProfilerTraceParameters, 'description'>;
  getHitList(traceIdOrUri: string, options?: IProfilerTraceHitListOptions): Promise<IAdtResponse>;
  getStatements(traceIdOrUri: string, options?: IProfilerTraceStatementsOptions): Promise<IAdtResponse>;
  getDbAccesses(traceIdOrUri: string, options?: IProfilerTraceDbAccessesOptions): Promise<IAdtResponse>;
  listRequests(): Promise<IAdtResponse>;
  getRequestsByUri(uri: string): Promise<IAdtResponse>;
  listObjectTypes(): Promise<IAdtResponse>;
  listProcessTypes(): Promise<IAdtResponse>;
}
```

### ICrossTrace.ts

```typescript
import type { IListableRuntimeObject } from './types';
import type { IAdtResponse } from '../connection/IAbapConnection';

export interface IListCrossTracesOptions {
  traceUser?: string;
  actCreateUser?: string;
  actChangeUser?: string;
}

export interface ICrossTrace extends IListableRuntimeObject<IAdtResponse, IListCrossTracesOptions> {
  getById(traceId: string, includeSensitiveData?: boolean): Promise<IAdtResponse>;
  getRecords(traceId: string): Promise<IAdtResponse>;
  getRecordContent(traceId: string, recordNumber: number): Promise<IAdtResponse>;
  getActivations(): Promise<IAdtResponse>;
}
```

### ISt05Trace.ts

```typescript
import type { IRuntimeAnalysisObject } from './types';
import type { IAdtResponse } from '../connection/IAbapConnection';

export interface ISt05Trace extends IRuntimeAnalysisObject {
  getState(): Promise<IAdtResponse>;
  getDirectory(): Promise<IAdtResponse>;
}
```

### IApplicationLog.ts

```typescript
import type { IRuntimeAnalysisObject } from './types';
import type { IAdtResponse } from '../connection/IAbapConnection';

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

export interface IApplicationLog extends IRuntimeAnalysisObject {
  getObject(objectName: string, options?: IGetApplicationLogObjectOptions): Promise<IAdtResponse>;
  getSource(objectName: string, options?: IGetApplicationLogSourceOptions): Promise<IAdtResponse>;
  validateName(objectName: string): Promise<IAdtResponse>;
}
```

### IAtcLog.ts

```typescript
import type { IRuntimeAnalysisObject } from './types';
import type { IAdtResponse } from '../connection/IAbapConnection';

export interface IGetCheckFailureLogsOptions {
  displayId?: string;
  objName?: string;
  objType?: string;
  moduleId?: string;
  phaseKey?: string;
}

export interface IAtcLog extends IRuntimeAnalysisObject {
  getCheckFailureLogs(options?: IGetCheckFailureLogsOptions): Promise<IAdtResponse>;
  getExecutionLog(executionId: string): Promise<IAdtResponse>;
}
```

### IDdicActivation.ts

```typescript
import type { IRuntimeAnalysisObject } from './types';
import type { IAdtResponse } from '../connection/IAbapConnection';

export interface IGetActivationGraphOptions {
  objectName?: string;
  objectType?: string;
  logName?: string;
}

export interface IDdicActivation extends IRuntimeAnalysisObject {
  getGraph(options?: IGetActivationGraphOptions): Promise<IAdtResponse>;
}
```

### IRuntimeDumps.ts

```typescript
import type { IListableRuntimeObject } from './types';
import type { IAdtResponse } from '../connection/IAbapConnection';

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

export interface IRuntimeDumps extends IListableRuntimeObject<IAdtResponse, IRuntimeDumpsListOptions> {
  listByUser(user?: string, options?: Omit<IRuntimeDumpsListOptions, 'query'>): Promise<IAdtResponse>;
  getById(dumpId: string, options?: IRuntimeDumpReadOptions): Promise<IAdtResponse>;
  buildIdPrefix(datetime: string, hostname: string, sysid: string, instance: string): string;
  buildUserQuery(user?: string): string | undefined;
}
```

### ISystemMessages.ts

```typescript
import type { IListableRuntimeObject } from './types';
import type { IAdtResponse } from '../connection/IAbapConnection';
import type { IFeedQueryOptions } from '../feeds/types';

export interface ISystemMessages extends IListableRuntimeObject<IAdtResponse, IFeedQueryOptions> {
  getById(messageId: string): Promise<IAdtResponse>;
}
```

### IGatewayErrorLog.ts

```typescript
import type { IListableRuntimeObject } from './types';
import type { IAdtResponse } from '../connection/IAbapConnection';
import type { IFeedQueryOptions } from '../feeds/types';

export interface IGatewayErrorLog extends IListableRuntimeObject<IAdtResponse, IFeedQueryOptions> {
  getById(errorType: string, errorId: string): Promise<IAdtResponse>;
}
```

## Re-exports in index.ts

Add a new section after existing runtime exports:

```typescript
// Runtime domain object interfaces
export type { IDebugger, IAbapDebugger, IAmdpDebugger } from './runtime/IDebugger';
export type {
  ILaunchDebuggerOptions, IStopDebuggerOptions, IGetDebuggerOptions, IGetSystemAreaOptions,
  IGetVariableAsCsvOptions, IGetVariableAsJsonOptions, IGetVariableValueStatementOptions,
  IDebuggerBatchPayload, IStartAmdpDebuggerOptions,
  IGetAmdpDataPreviewOptions, IGetAmdpCellSubstringOptions,
} from './runtime/IDebugger';
export type { IAbapDebuggerStepMethod } from './runtime/IDebugger';

export type { IMemorySnapshots } from './runtime/IMemorySnapshots';
export type { IMemorySnapshotsListOptions, ISnapshotRankingListOptions, ISnapshotChildrenOptions, ISnapshotReferencesOptions } from './runtime/IMemorySnapshots';

export type { IProfiler } from './runtime/IProfiler';
export type { IProfilerListOptions, IProfilerTraceParameters, IProfilerTraceHitListOptions, IProfilerTraceStatementsOptions, IProfilerTraceDbAccessesOptions } from './runtime/IProfiler';

export type { ICrossTrace } from './runtime/ICrossTrace';
export type { IListCrossTracesOptions } from './runtime/ICrossTrace';

export type { ISt05Trace } from './runtime/ISt05Trace';

export type { IApplicationLog } from './runtime/IApplicationLog';
export type { IGetApplicationLogObjectOptions, IGetApplicationLogSourceOptions } from './runtime/IApplicationLog';

export type { IAtcLog } from './runtime/IAtcLog';
export type { IGetCheckFailureLogsOptions } from './runtime/IAtcLog';

export type { IDdicActivation } from './runtime/IDdicActivation';
export type { IGetActivationGraphOptions } from './runtime/IDdicActivation';

export type { IRuntimeDumps } from './runtime/IRuntimeDumps';
export type { IRuntimeDumpsListOptions, IRuntimeDumpReadOptions } from './runtime/IRuntimeDumps';
export type { IRuntimeDumpReadView } from './runtime/IRuntimeDumps';

export type { ISystemMessages } from './runtime/ISystemMessages';

export type { IGatewayErrorLog } from './runtime/IGatewayErrorLog';
```

## Totals

- **11 new files** in `src/runtime/`
- **13 interfaces** (IDebugger, IAbapDebugger, IAmdpDebugger, IMemorySnapshots, IProfiler, ICrossTrace, ISt05Trace, IApplicationLog, IAtcLog, IDdicActivation, IRuntimeDumps, ISystemMessages, IGatewayErrorLog)
- **24 option interfaces** (full field definitions from `adt-clients`)
- **3 type aliases** (IAbapDebuggerStepMethod, IRuntimeDumpReadView, IRuntimeDumpReadOptions)
- **40 new exports** in `index.ts`

## Verification

- `npm run build` must pass (biome check + tsc)
- All new types must be importable from package root
