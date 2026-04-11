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
