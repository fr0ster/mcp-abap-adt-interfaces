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
