/**
 * The capability of being executed.
 *
 * One method, because that is the whole of the idea: a caller hands over what
 * to run and gets back what running it produced. Everything else an executing
 * handler may offer — profiling, or asking about a past run — is a different
 * capability with its own interface, not a wider version of this one.
 *
 * `IExecutor` extends this with its profiler variants, and a unit-test handler
 * declares it directly. There is deliberately no test-specific runnable: two
 * differently-shaped contracts for "this can be executed" would be two
 * vocabularies for one idea.
 */
export interface IAdtRunnable<TTarget, TResult, TOptions = never> {
  /**
   * Execute the target.
   *
   * @param target what to run — a program, a class, a list of test classes
   * @param options flavour-specific execution options, where the flavour has any
   */
  run(target: TTarget, options?: TOptions): Promise<TResult>;
}
