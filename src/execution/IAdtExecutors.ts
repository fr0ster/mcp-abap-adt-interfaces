/**
 * ADT program/class run executors — the contract a consumer calls.
 *
 * Declared here rather than in adt-clients because a consumer must import these
 * to use the executors at all, and the point of this package is that there is
 * one place to import from and one place to override.
 */

import type { IAdtWireResponse } from '../connection/IAbapConnection';
import type { IProfilerTraceParameters } from '../runtime/IProfiler';
import type { IAdtRunnable } from './IAdtRunnable';
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
export interface IClassExecuteWithProfilingResult<TRun = string> {
  /**
   * What the run itself answered.
   *
   * `IAdtWireResponse` until 30.0.0 — the transport envelope, carried inside a
   * result, which is the shape decision 15 removed from every other contract.
   * `TRun` is what the answer becomes, and it follows the result strategy the
   * implementation was constructed with.
   */
  run: TRun;
  profilerId: string;
}

/**
 * What a class executor is, spelled as the composition it is.
 *
 * Until 30.0.0 this extended `IExecutor` and `ITraceScheduling`. Inheritance
 * between contracts is what makes a surface un-composable: a consumer who wants
 * the run without the scheduling, or the scheduling without the run, has no way
 * to say so, and every implementation of the narrow thing is forced to provide
 * the wide one. An intersection says the same and lets either half stand alone.
 */
export type IClassExecutor<TRun = string> = IAdtRunnable<
  IClassExecutionTarget,
  TRun
> &
  IExecutor<
    IClassExecutionTarget,
    TRun,
    IClassExecuteWithProfilerOptions,
    IClassExecuteWithProfilingOptions,
    IClassExecuteWithProfilingResult<TRun>
  > &
  ITraceScheduling;

export interface IProgramExecutionTarget {
  programName: string;
}

export interface IProgramExecuteWithProfilerOptions {
  profilerId: string;
}

export interface IProgramExecuteWithProfilingOptions {
  profilerParameters?: IProfilerTraceParameters;
}

export interface IProgramExecuteWithProfilingResult<TRun = string> {
  /** What the run itself answered; see {@link IClassExecuteWithProfilingResult}. */
  run: TRun;
  profilerId: string;
  // traceId is NOT included — program execution is fire-and-forget.
  // Traces are written asynchronously by SAP after the program completes.
  // Use RuntimeListProfilerTraceFiles to poll for the trace after execution.
}

/** The program executor, composed the same way — see {@link IClassExecutor}. */
export type IProgramExecutor<TRun = string> = IAdtRunnable<
  IProgramExecutionTarget,
  TRun
> &
  IExecutor<
    IProgramExecutionTarget,
    TRun,
    IProgramExecuteWithProfilerOptions,
    IProgramExecuteWithProfilingOptions,
    IProgramExecuteWithProfilingResult<TRun>
  > &
  ITraceScheduling;
