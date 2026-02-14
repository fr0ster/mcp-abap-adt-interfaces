import type { IAdtResponse } from '../connection/IAbapConnection';

/**
 * Generic execution contract for executable ADT entities.
 */
export interface IExecutor<
  TTarget,
  TResult = IAdtResponse,
  TRunWithProfilerOptions = unknown,
  TRunWithProfilingOptions = unknown,
  TRunWithProfilingResult = unknown,
> {
  run(target: TTarget): Promise<TResult>;
  runWithProfiler(
    target: TTarget,
    options: TRunWithProfilerOptions,
  ): Promise<TResult>;
  runWithProfiling(
    target: TTarget,
    options?: TRunWithProfilingOptions,
  ): Promise<TRunWithProfilingResult>;
}
