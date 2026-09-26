/**
 * The capability of being executed.
 *
 * One method, because that is the whole of the idea: a caller hands over what
 * to run and gets back what running it produced. Everything else an executing
 * handler may offer — profiling, or asking about a past run — is a different
 * capability with its own interface, not a wider version of this one.
 *
 * The profiler variants are their own atoms below, composed beside this where a
 * runner also profiles; a unit-test handler declares this one alone. There is
 * deliberately no test-specific runnable: two differently-shaped contracts for
 * "this can be executed" would be two vocabularies for one idea — and no
 * inheritance either, which would decide for the composer that whoever runs
 * must also profile.
 */

import type { IAdtAnalyseOptions, IAnalyse } from '../adt/IAdtObject';
import type { IAdtError, IAdtResponse } from '../adt/IAdtResponse';

export interface IAdtRunnable<TTarget, TResult, TOptions = never> {
  /**
   * Execute the target.
   *
   * **There is always a second parameter now**, because every member takes the
   * error strategy with the call (decision 36). Until 10.0.0 it existed only for
   * a flavour with options: the default `TOptions = never` made the rest tuple
   * empty, so `run` took exactly one parameter. That trick answered "does this
   * flavour have options", and the question is gone — a flavour without options
   * still has `analyse` to be given. Its own options, where it has any, are
   * merged into the same object.
   *
   * @param target what to run — a program, a class, a list of test classes
   * @param options the flavour's execution options, where it has any, and
   *                `analyse` for the verdict
   */
  run<E extends IAdtError>(
    target: TTarget,
    options: ([TOptions] extends [never] ? unknown : TOptions) &
      IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TResult, E>>;
  run(
    target: TTarget,
    options?: ([TOptions] extends [never] ? unknown : TOptions) &
      IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TResult>>;
}

/**
 * Running the target with a profiler already recording.
 *
 * Its own atom rather than a member of a wider "executor": `IExecutor` bundled
 * this with {@link IRunnableWithProfiling} and inherited {@link IAdtRunnable} on
 * top, which made three capabilities into one thing an implementer had to take
 * whole. It was also a second name for an idea that already had one — a target,
 * some options, an answer — and decision 20 says a new name for something that
 * exists is not a smaller contract but a second one.
 *
 * @param target what to run
 * @param options which profiler is recording; required, since there is nothing
 *                to attach to without it
 */
export interface IRunnableWithProfiler<TTarget, TResult, TOptions> {
  runWithProfiler<E extends IAdtError>(
    target: TTarget,
    options: TOptions & IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TResult, E>>;
  runWithProfiler(
    target: TTarget,
    options: TOptions & IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TResult>>;
}

/**
 * Running the target and starting a measurement for it.
 *
 * Distinct from {@link IRunnableWithProfiler}: that one attaches to a profiler
 * the caller already has, this one asks for a trace to be taken, and it answers
 * differently — the run's own answer plus the profiler id it was recorded under.
 * Two capabilities, so two atoms; an implementation that offers one and not the
 * other says exactly that.
 */
export interface IRunnableWithProfiling<TTarget, TResult, TOptions> {
  runWithProfiling<E extends IAdtError>(
    target: TTarget,
    options: TOptions & IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TResult, E>>;
  runWithProfiling(
    target: TTarget,
    options?: TOptions & IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TResult>>;
}
