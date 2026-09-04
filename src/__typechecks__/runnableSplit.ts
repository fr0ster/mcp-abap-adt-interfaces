/**
 * `IAdtRunnable` is one method, and its arguments have never changed.
 *
 * The extraction from `IExecutor` was free, and this file held that claim: an
 * existing implementation and an existing caller saw exactly what they saw
 * before. **30.0.0 breaks it on purpose** — `run` answers `IAdtResponse` rather
 * than a bare result, so an implementation written against the old shape no
 * longer fits, and that is asserted below rather than quietly dropped.
 *
 * What did not change is the parameter list, and those assertions are the ones
 * still worth their weight: a consumer reading `Parameters<IExecutor['run']>`,
 * or building a wrapper from tuple types, is unaffected.
 *
 * Proved load-bearing 2026-08-14: making `options` required in `IAdtRunnable`
 * makes `_ExecutorRunTakesExactlyTarget` fail with TS2344, and reverting that
 * one edit makes it pass again.
 */

import type { IAdtResponse } from '../adt/IAdtResponse';
import type { IAdtWireResponse } from '../connection/IAbapConnection';
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

/**
 * The executor, composed rather than inherited.
 *
 * Until 30.0.0 `IExecutor` extended `IAdtRunnable`, so nobody could take the
 * profiler half without the run, or the run without the profiler. Minimal
 * contracts, composed where they are used, is what replaced that — and the
 * assertions below are about the composition, which is what a consumer holds.
 */
type Executor = IAdtRunnable<{ name: string }, IAdtWireResponse> &
  IExecutor<
    { name: string },
    IAdtWireResponse,
    { id: string },
    { x: 1 },
    { y: 2 }
  >;
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
 * because the contract now answers {@link IAdtResponse} — a caller is made to
 * ask whether there was a failure before reading a value, which is the whole
 * point of decision 20. Both directions are asserted so that a later edge back
 * towards the old shape fails here rather than in a consumer.
 */
export type _OldImplementationNoLongerFits = Assert<
  Before extends Executor ? false : true
>;

export type _NewContractIsNotTheOldOne = Assert<
  Executor extends Before ? false : true
>;

/** `run` alone is the atom, with nothing else smuggled into it. */
export type _RunnableIsOneMethod = Assert<
  Equal<keyof IAdtRunnable<unknown, unknown>, 'run'>
>;

/**
 * The parameter list is identical, not merely assignable.
 *
 * Mutual `extends` does not see an added optional parameter — `[t]` and
 * `[t, o?]` are assignable both ways — so a consumer reading
 * `Parameters<IExecutor['run']>`, or building a wrapper from tuple types, would
 * have seen a signature change that every other assertion here called
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

/** A type with only `run` satisfies the atom and not the executor. */
interface OnlyRuns {
  run(target: { name: string }): Promise<IAdtResponse<IAdtWireResponse>>;
}
export type _RunOnlyIsRunnable = Assert<
  OnlyRuns extends IAdtRunnable<{ name: string }, IAdtWireResponse>
    ? true
    : false
>;
export type _RunOnlyIsNotExecutor = Assert<
  OnlyRuns extends Executor ? false : true
>;
