/**
 * ADT program/class run executors — the contract a consumer calls.
 *
 * Declared here rather than in adt-clients because a consumer must import these
 * to use the executors at all, and the point of this package is that there is
 * one place to import from and one place to override.
 */

import type { IAdtResponse } from '../connection/IAbapConnection';
import type { IProfilerTraceParameters } from '../runtime/IProfiler';
import type { IExecutor } from './IExecutor';

export interface IClassExecutionTarget {
  className: string;
}

export interface IClassExecuteWithProfilerOptions {
  profilerId: string;
}

export interface IClassExecuteWithProfilingOptions {
  profilerParameters?: IProfilerTraceParameters;
  traceLookupUris?: string[];
  /** Maximum number of polling attempts to find the trace (default: 5) */
  maxTraceAttempts?: number;
  /** Delay in ms between polling attempts (default: 2000) */
  traceRetryDelayMs?: number;
}

export interface IClassExecuteWithProfilingResult {
  response: IAdtResponse;
  profilerId: string;
  traceId: string;
  traceRequestsResponse: IAdtResponse;
}

export interface IClassExecutor
  extends IExecutor<
    IClassExecutionTarget,
    IAdtResponse,
    IClassExecuteWithProfilerOptions,
    IClassExecuteWithProfilingOptions,
    IClassExecuteWithProfilingResult
  > {}

export interface IProgramExecutionTarget {
  programName: string;
}

export interface IProgramExecuteWithProfilerOptions {
  profilerId: string;
}

export interface IProgramExecuteWithProfilingOptions {
  profilerParameters?: IProfilerTraceParameters;
}

export interface IProgramExecuteWithProfilingResult {
  response: IAdtResponse;
  profilerId: string;
  // traceId is NOT included — program execution is fire-and-forget.
  // Traces are written asynchronously by SAP after the program completes.
  // Use RuntimeListProfilerTraceFiles to poll for the trace after execution.
}

export interface IProgramExecutor
  extends IExecutor<
    IProgramExecutionTarget,
    IAdtResponse,
    IProgramExecuteWithProfilerOptions,
    IProgramExecuteWithProfilingOptions,
    IProgramExecuteWithProfilingResult
  > {}
