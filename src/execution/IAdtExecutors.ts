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
import type { ITraceScheduling } from './ITraceScheduling';

export interface IClassExecutionTarget {
  className: string;
}

export interface IClassExecuteWithProfilerOptions {
  profilerId: string;
}

/**
 * The three polling options are gone: a run does not wait for a trace, so
 * "where to look", "how many times" and "how long between tries" were asking
 * the caller to configure a search that no longer happens.
 */
export interface IClassExecuteWithProfilingOptions {
  profilerParameters?: IProfilerTraceParameters;
}

/**
 * A run reports what it did, not what SAP will write afterwards.
 *
 * `traceId` is gone because a run cannot promise a trace that may not exist
 * yet, may never exist, and may be read a week later; `traceRequestsResponse`
 * because it was measured to be the empty feed every time. Reading a trace is
 * `IProfiler.list()` and `read()`, whenever the caller is ready.
 *
 * This makes the class result identical to the program one, which was already
 * honest about exactly this — see the comment it has carried all along.
 */
export interface IClassExecuteWithProfilingResult {
  response: IAdtResponse;
  profilerId: string;
}

export interface IClassExecutor
  extends IExecutor<
      IClassExecutionTarget,
      IAdtResponse,
      IClassExecuteWithProfilerOptions,
      IClassExecuteWithProfilingOptions,
      IClassExecuteWithProfilingResult
    >,
    ITraceScheduling {}

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
    >,
    ITraceScheduling {}
