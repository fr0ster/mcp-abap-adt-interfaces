/**
 * What is inside an ABAP trace: the three views, transcribed.
 *
 * Every name below is one read off a real trace — one trace, all three views,
 * all answering `200`. Nothing here is designed; where a measurement stopped,
 * so does this file, and it says where.
 *
 * The three are not interchangeable in cost: the same trace served roughly
 * 300KB of `hitlist`, 1.3MB of `statements` and under a kilobyte of
 * `dbAccesses`. `statements` is not a thing to fetch casually, and a caller
 * that wants "the slow parts" wants `hitlist`.
 *
 * They are meant to be cross-referenced: a statement's `hitlistAnchor` points
 * at a hitlist entry's `proceduralEntryAnchor`.
 *
 * XML carries text and nothing else, so the numeric members here are the parse
 * a reader is expected to perform, not a claim about the wire. The *names* are
 * transcription; the types are the obvious reading of what they count.
 */

/**
 * A program named by a trace row.
 *
 * `adtcore:*` attributes plus `byteCodeOffset` — the position within the
 * compiled unit, which is why a row can point into a program rather than only
 * at it.
 */
export interface ITraceProgramRef {
  name: string;
  type: string;
  uri: string;
  context?: string;
  byteCodeOffset?: number;
  /** Present on a statement's calling program: a query URI, not a plain URI. */
  objectReferenceQuery?: string;
}

/**
 * `trc:grossTime` and `trc:traceEventNetTime`.
 *
 * Declared because both elements were seen on every row, and typed `unknown`
 * because their attributes were NOT transcribed — unlike
 * {@link IAbapTraceAccessTime}, which was. Inventing four plausible attribute
 * names here would be indistinguishable, to a consumer, from four measured
 * ones, and this contract exists because that had already happened elsewhere.
 *
 * A consumer that needs these narrows them and, better, sends the measurement.
 */
export type ITraceTiming = unknown;

/** One row of the hit list. */
export interface IAbapTraceHitListEntry {
  /** Position in the top-down ordering, which is not `index`. */
  topDownIndex?: number;
  index: number;
  hitCount?: number;
  stackCount?: number;
  recursionDepth?: number;
  description?: string;
  /** What a statement's `hitlistAnchor` refers to. */
  proceduralEntryAnchor?: string;
  callingProgram?: ITraceProgramRef;
  calledProgram?: ITraceProgramRef;
  grossTime?: ITraceTiming;
}

/** `trc:hitlist`. */
export interface IAbapTraceHitList {
  entries: IAbapTraceHitListEntry[];
}

/** One traced statement. */
export interface IAbapTraceStatement {
  id: string;
  index: number;
  callLevel?: number;
  text?: string;
  variable?: string;
  package?: string;
  component?: string;
  componentDescription?: string;
  /** Points at a hit list entry's `proceduralEntryAnchor`. */
  hitlistAnchor?: string;
  isProcedureLike?: boolean;
  callingProgram?: ITraceProgramRef;
  grossTime?: ITraceTiming;
  traceEventNetTime?: ITraceTiming;
}

/** `trc:statements` — the large one. */
export interface IAbapTraceStatements {
  statements: IAbapTraceStatement[];
}

/**
 * `trc:accessTime`. Measured, unlike the other two timing elements.
 *
 * `total` splits into `applicationServer` and `database`, and
 * `ratioOfTraceTotal` says how much of the whole trace this one access was —
 * which is the number that finds the offender without reading every row.
 */
export interface IAbapTraceAccessTime {
  total?: number;
  applicationServer?: number;
  database?: number;
  ratioOfTraceTotal?: number;
}

/** One database access. */
export interface IAbapTraceDbAccess {
  index: number;
  tableName?: string;
  /** The SQL, as the trace recorded it. */
  statement?: string;
  type?: string;
  totalCount?: number;
  /** Served from the buffer rather than the database. */
  bufferedCount?: number;
  accessTime?: IAbapTraceAccessTime;
}

/** `trc:dbAccesses`. */
export interface IAbapTraceDbAccesses {
  accesses: IAbapTraceDbAccess[];
}
