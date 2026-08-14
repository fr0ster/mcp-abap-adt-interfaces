/**
 * `IAdtRunnable` is extracted from `IExecutor` without changing its shape.
 *
 * The claim this file exists to hold: an existing executor implementation and an
 * existing caller both see exactly what they saw before the split. If that ever
 * stops being true, the extraction stopped being free and the change needs a
 * migration note rather than a paragraph saying none is needed.
 *
 * Proved load-bearing 2026-08-14: making `options` required in `IAdtRunnable`
 * makes `_CallerLosesNothing` fail with TS2344, and reverting that one edit
 * makes it pass again.
 */

import type { IAdtResponse } from '../connection/IAbapConnection';
import type { IAdtRunnable } from '../execution/IAdtRunnable';
import type { IExecutor } from '../execution/IExecutor';

type Assert<T extends true> = T;
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

/** The three methods `IExecutor` declared before `run` moved to an atom. */
interface ExecutorBefore<
  TTarget,
  TResult,
  TProfilerOpts,
  TProfilingOpts,
  TProfilingResult,
> {
  run(target: TTarget): Promise<TResult>;
  runWithProfiler(target: TTarget, options: TProfilerOpts): Promise<TResult>;
  runWithProfiling(
    target: TTarget,
    options?: TProfilingOpts,
  ): Promise<TProfilingResult>;
}

type Executor = IExecutor<
  { name: string },
  IAdtResponse,
  { id: string },
  { x: 1 },
  { y: 2 }
>;
type Before = ExecutorBefore<
  { name: string },
  IAdtResponse,
  { id: string },
  { x: 1 },
  { y: 2 }
>;

/** An implementation written against the old shape still satisfies the new one. */
export type _OldImplementationStillFits = Assert<
  Before extends Executor ? true : false
>;

/** And a caller holding the new type still gets everything the old one gave. */
export type _CallerLosesNothing = Assert<
  Executor extends Before ? true : false
>;

/** `run` alone is the atom, with nothing else smuggled into it. */
export type _RunnableIsOneMethod = Assert<
  Equal<keyof IAdtRunnable<unknown, unknown>, 'run'>
>;

/** A type with only `run` satisfies the atom and not the executor. */
interface OnlyRuns {
  run(target: { name: string }): Promise<IAdtResponse>;
}
export type _RunOnlyIsRunnable = Assert<
  OnlyRuns extends IAdtRunnable<{ name: string }, IAdtResponse> ? true : false
>;
export type _RunOnlyIsNotExecutor = Assert<
  OnlyRuns extends Executor ? false : true
>;
