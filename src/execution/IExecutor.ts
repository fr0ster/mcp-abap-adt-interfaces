import type { IAdtResponse } from '../adt/IAdtResponse';

import type { IAdtRunnable } from './IAdtRunnable';

/**
 * Generic execution contract for executable ADT entities.
 *
 * `run` comes from {@link IAdtRunnable}, which is the capability on its own;
 * this adds the profiler variants. The shape is unchanged by that split — an
 * implementation and a caller both see the same three methods.
 */
export interface IExecutor<
  TTarget,
  TResult = string,
  TRunWithProfilerOptions = unknown,
  TRunWithProfilingOptions = unknown,
  TRunWithProfilingResult = unknown,
> {
  runWithProfiler(
    target: TTarget,
    options: TRunWithProfilerOptions,
  ): Promise<IAdtResponse<TResult>>;
  runWithProfiling(
    target: TTarget,
    options?: TRunWithProfilingOptions,
  ): Promise<IAdtResponse<TRunWithProfilingResult>>;
}
