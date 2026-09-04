/**
 * The capability of being executed.
 *
 * One method, because that is the whole of the idea: a caller hands over what
 * to run and gets back what running it produced. Everything else an executing
 * handler may offer — profiling, or asking about a past run — is a different
 * capability with its own interface, not a wider version of this one.
 *
 * `IExecutor` is composed beside this where a runner also profiles, and a
 * unit-test handler declares this one alone. There is deliberately no
 * test-specific runnable: two differently-shaped contracts for "this can be
 * executed" would be two vocabularies for one idea — and no inheritance either,
 * which would decide for the composer that whoever runs must also profile.
 */
import type { IAdtResponse } from '../adt/IAdtResponse';

export interface IAdtRunnable<TTarget, TResult, TOptions = never> {
  /**
   * Execute the target.
   *
   * The second parameter exists only for a flavour that has options. With the
   * default `TOptions = never` the rest tuple is empty, so `run` takes exactly
   * one parameter — not one plus an `options?: undefined` that would show up in
   * `Parameters<…>`, break a wrapper built from tuple types, and quietly change
   * the signature of every executor that inherits this.
   *
   * @param target what to run — a program, a class, a list of test classes
   * @param args flavour-specific execution options, where the flavour has any
   */
  run(
    target: TTarget,
    ...args: [TOptions] extends [never] ? [] : [options?: TOptions]
  ): Promise<IAdtResponse<TResult>>;
}
