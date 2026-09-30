/**
 * Feeds Domain Data Types
 *
 * Types for feed queries, entries, system messages, and gateway errors.
 */

/**
 * ABAP timestamp string in format YYYYMMDDHHMMSS.
 * Represents an ABAP timestamp in feed query/results payloads.
 * Omitted query values are excluded from serialization.
 */
export type IAbapTimestamp = string;

// --- Feed-level types ---

export interface IFeedQueryOptions {
  user?: string;
  maxResults?: number;
  from?: IAbapTimestamp;
  to?: IAbapTimestamp;
  /**
   * The feed's `$query` expression, sent as given — built from the attributes
   * and operators the feed's descriptor declares, e.g.
   * `and ( equals ( user , X ) , contains ( runtimeError , Y ) )`.
   *
   * When it is present `user` is not turned into a query of its own: one feed
   * request carries one `$query`, so a caller filtering by user and by more puts
   * the user into this expression.
   */
  query?: string;
}

// --- System message types ---

// --- Gateway error types ---
