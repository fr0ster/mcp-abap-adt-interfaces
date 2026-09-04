/**
 * Execution is three capabilities, composed — not one contract that inherits.
 *
 * This file held one claim for two releases: that extracting `IAdtRunnable` out
 * of `IExecutor` changed nothing an implementation or a caller could see. It
 * held, and then 30.0.0 broke it deliberately in two ways, both asserted below
 * rather than quietly dropped.
 *
 * `run` answers `IAdtResponse` now, so an implementation written against the old
 * shape no longer fits. And `IExecutor` is gone: it bundled two capabilities and
 * inherited a third, which made "runs a class" and "profiles a class" one thing
 * an implementer had to take whole. What replaced it is three atoms and an
 * intersection where a runner has all three.
 *
 * Proved load-bearing 2026-08-14: making `options` required in `IAdtRunnable`
 * makes `_ExecutorRunTakesExactlyTarget` fail with TS2344, and reverting that
 * one edit makes it pass again.
 */

import type { IAdtResponse } from '../adt/IAdtResponse';
import type { IAdtWireResponse } from '../connection/IAbapConnection';
import type {
  IAdtRunnable,
  IRunnableWithProfiler,
  IRunnableWithProfiling,
} from '../execution/IAdtRunnable';

type Assert<T extends true> = T;
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

/** The three methods `IExecutor` declared before it was taken apart. */
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

/** What a runner with all three capabilities is now: an intersection. */
type Executor = IAdtRunnable<{ name: string }, IAdtWireResponse> &
  IRunnableWithProfiler<{ name: string }, IAdtWireResponse, { id: string }> &
  IRunnableWithProfiling<{ name: string }, { y: 2 }, { x: 1 }>;

type Before = ExecutorBefore<
  { name: string },
  IAdtWireResponse,
  { id: string },
  { x: 1 },
  { y: 2 }
>;

/**
 * The 30.0.0 break, stated as a fact rather than left to be discovered.
 *
 * An implementation answering a bare result no longer satisfies the contract,
 * because every member answers {@link IAdtResponse} — a caller is made to ask
 * whether there was a failure before reading a value. Both directions are
 * asserted so that a later edge back towards the old shape fails here rather
 * than in a consumer.
 */
export type _OldImplementationNoLongerFits = Assert<
  Before extends Executor ? false : true
>;

export type _NewContractIsNotTheOldOne = Assert<
  Executor extends Before ? false : true
>;

/** Each atom is one method, with nothing else smuggled into it. */
export type _RunnableIsOneMethod = Assert<
  Equal<keyof IAdtRunnable<unknown, unknown>, 'run'>
>;

export type _ProfilerAtomIsOneMethod = Assert<
  Equal<
    keyof IRunnableWithProfiler<unknown, unknown, unknown>,
    'runWithProfiler'
  >
>;

export type _ProfilingAtomIsOneMethod = Assert<
  Equal<
    keyof IRunnableWithProfiling<unknown, unknown, unknown>,
    'runWithProfiling'
  >
>;

/**
 * The parameter list is identical, not merely assignable.
 *
 * Mutual `extends` does not see an added optional parameter — `[t]` and
 * `[t, o?]` are assignable both ways — so a consumer reading
 * `Parameters<IAdtRunnable['run']>`, or building a wrapper from tuple types,
 * would have seen a signature change that every other assertion here called
 * unchanged. Found in review of PR #36.
 */
export type _ExecutorRunTakesExactlyTarget = Assert<
  Equal<Parameters<Executor['run']>, [target: { name: string }]>
>;

/** And a flavour that has options still declares them. */
export type _RunnableKeepsItsOptions = Assert<
  Equal<
    Parameters<
      IAdtRunnable<{ name: string }, IAdtWireResponse, { deep: true }>['run']
    >,
    [target: { name: string }, options?: { deep: true }]
  >
>;

/**
 * A runner that only runs is a legitimate implementation.
 *
 * This is what the inheritance cost: under `IExecutor extends IAdtRunnable`,
 * anything that could be run had to answer for profiling as well. An ATC run
 * and a unit-test run are exactly the shapes that could not.
 */
interface OnlyRuns {
  run(target: { name: string }): Promise<IAdtResponse<IAdtWireResponse>>;
}
export type _RunOnlyIsRunnable = Assert<
  OnlyRuns extends IAdtRunnable<{ name: string }, IAdtWireResponse>
    ? true
    : false
>;
export type _RunOnlyIsNotAProfiler = Assert<
  OnlyRuns extends Executor ? false : true
>;

/** And a profiler-only implementation is one too, which was unsayable before. */
interface OnlyProfiles {
  runWithProfiler(
    target: { name: string },
    options: { id: string },
  ): Promise<IAdtResponse<IAdtWireResponse>>;
}
export type _ProfilerOnlyIsSayable = Assert<
  OnlyProfiles extends IRunnableWithProfiler<
    { name: string },
    IAdtWireResponse,
    { id: string }
  >
    ? true
    : false
>;
