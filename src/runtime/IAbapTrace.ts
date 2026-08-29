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
import type { ITraceEntry, ITraceState } from './ITrace';

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
 * Typed from measurement at last. These were `unknown` in 22.0.0 and 23.0.0
 * because the elements had been seen on every row while their attributes had
 * never been captured — the earlier reads were summarised into a table and the
 * bodies discarded. A raw capture settles it: both carry exactly these two, in
 * both the hit list and the statements, with no variant anywhere in the
 * documents read.
 *
 * The **unit of `time` is not established.** The wire says `time="243"` and
 * nothing about what 243 is; `percentage` is of the trace total, which is what
 * makes a row comparable without knowing the unit. Naming it `timeMicros` would
 * be inventing the one thing the measurement did not give.
 */
export interface ITraceTiming {
  /** `time` — the raw figure, in whatever unit the system reports. */
  time: number;
  /** `percentage` of the trace total. */
  percentage: number;
}

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

/**
 * A trace as the `abaptraces` feed describes it.
 *
 * {@link ITraceEntry} is what *every* family can say; this is what the ABAP
 * profiler actually sends, and all of it is transcribed from one raw feed —
 * sixty entries, every field present in every one of them, none of it outside
 * `trc:extendedData`.
 *
 * The fields are required because the wire carried them without exception in
 * the sample. That is a claim, and this is where it is recorded so a later
 * system that omits one can be met by relaxing the type rather than by
 * guessing what happened.
 *
 * Units are deliberately not asserted. `runtime` reads `554` and the document
 * says nothing more; `size` reads `8`. Naming them `runtimeMicros` or
 * `sizeBytes` would add precision the measurement does not contain.
 */
export interface IAbapTraceEntry extends ITraceEntry {
  /** `trc:user`. Also available as `atom:author/atom:name`. */
  user: string;
  /** `trc:objectName` — the generated form, e.g. `ZCL_SOMETHING=========CP`. */
  objectName: string;
  /** `trc:state` — `R`/Finished on every entry read. */
  state: ITraceState;
  /** `trc:expiration`. The system deletes traces; this says when. */
  expiresAt: string;

  /** `trc:system` — the three-character system id. */
  system: string;
  /** `trc:client`. A string: a client is a code, and `010` is not `10`. */
  client: string;
  /** `trc:host` — the application server that recorded it. */
  host: string;

  /** `trc:size`. Unit unstated by the document. */
  size: number;
  /** `trc:runtime`, and the three figures it divides into. Unit unstated. */
  runtime: number;
  runtimeABAP: number;
  runtimeSystem: number;
  runtimeDatabase: number;

  /** `trc:isAggregated` — whether the measurement was aggregated. */
  isAggregated: boolean;
  /** `trc:amdpFileSize`. Zero on every entry read; the field is still there. */
  amdpFileSize: number;
}
