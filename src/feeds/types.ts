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
}

// --- System message types ---

// --- Gateway error types ---

export interface IGatewayException {
  type: string;
  text: string;
  raiseLocation: string;
  attributes?: Record<string, string>;
}

export interface ICallStackEntry {
  number: number;
  event: string;
  program: string;
  name: string;
  line: number;
}

export interface ISourceCodeLine {
  number: number;
  content: string;
  isError: boolean;
}
