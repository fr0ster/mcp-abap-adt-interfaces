/**
 * Runtime Analysis Domain Types
 *
 * Base interfaces for all runtime analysis/monitoring capabilities.
 * Uses typed discriminators for type narrowing.
 */

/**
 * Base interface for all runtime analysis domain objects.
 * Uses a generic discriminator field for type narrowing.
 *
 * @template TKind - Literal string type for discriminator (default: string)
 */
export interface IRuntimeAnalysisObject<TKind extends string = string> {
  readonly kind: TKind;
}

/**
 * Generic listable runtime object.
 * Each domain supplies its own result, options, and kind types.
 *
 * @template TResult - The type returned by list()
 * @template TOptions - Query options type (default: undefined = no options)
 * @template TKind - Literal string type for discriminator (default: string)
 */
export interface IListableRuntimeObject<
  TResult,
  TOptions = undefined,
  TKind extends string = string,
> extends IRuntimeAnalysisObject<TKind> {
  list(options?: TOptions): Promise<TResult>;
}
