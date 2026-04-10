/**
 * Runtime Analysis Domain Types
 *
 * These types represent runtime analysis/monitoring capabilities.
 * They are NOT IAdtObject (not CRUD).
 */

/**
 * Base interface for all runtime analysis domain objects.
 * Uses a discriminator field for type narrowing.
 */
export interface IRuntimeAnalysisObject {
  readonly kind: string;
}

/**
 * Generic listable runtime object.
 * Each domain supplies its own result and options types.
 *
 * @template TResult - The type returned by list()
 * @template TOptions - Query options type (default: undefined = no options)
 */
export interface IListableRuntimeObject<TResult, TOptions = undefined> {
  list(options?: TOptions): Promise<TResult>;
}
