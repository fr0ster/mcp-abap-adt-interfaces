/**
 * Configuring a measurement — the half that is not reading one.
 *
 * This is composed into `IClassExecutor` and `IProgramExecutor`, and
 * deliberately NOT put on `IExecutor` or `IAdtRunnable`: an ATC run and a unit
 * test run implement those too, and neither has any business answering for
 * trace parameters. Composed in, the capability is stated exactly where it is
 * true.
 *
 * The vocabulary is kept apart from the reading side on purpose. Scheduling
 * yields a *request id*; reading takes a *trace id*; they are different things
 * that were previously easy to confuse.
 */

import type { IProfilerTraceParameters } from '../runtime/IProfiler';

/** An entry of one of the two catalogues: a URI and what it means. */
export interface INamedItem {
  /** A URI, as the server writes it — not a short code. */
  name: string;
  description: string;
}

/**
 * A scheduled request, as the server stores it.
 *
 * Transcribed from a created entry: the identifier, the two catalogue choices
 * echoed back as the same URIs the catalogues hand out, and the link to the
 * trace file once a run has produced one — which is how a scheduled request is
 * connected to the trace it eventually yields.
 */
export interface ITraceRequestEntry {
  /** `atom:id` — the request's own URI. */
  id: string;
  /** `trc:requestIndex`. */
  index?: number;
  description?: string;
  /** `trc:expires`. A request that is never fulfilled does not live forever. */
  expiresAt?: string;
  isAggregated?: boolean;
  /** `trc:processTypeId`, a URI from `listProcessTypes()`. */
  processTypeId?: string;
  /** `trc:objectTypeId`, a URI from `listObjectTypes()`. */
  objectTypeId?: string;
  /** `trc:executions` — how many runs it may measure, and how many it has. */
  executions?: { maximal?: number; completed?: number };
  /** The trace this request produced, when it has produced one. */
  traceUri?: string;
}

/**
 * What to schedule.
 *
 * **The argument type is not settled by measurement.** What was measured is the
 * *stored* entry, not the *submitted* document, and no capture of the latter
 * exists. Whoever implements this reconstructs the body from the stored shape
 * and says so — the fields below are the stored choices, named as inputs.
 */
export interface ITraceRequest {
  /** A URI from {@link ITraceScheduling.listProcessTypes}. */
  processTypeId?: string;
  /** A URI from {@link ITraceScheduling.listObjectTypes}. */
  objectTypeId?: string;
  description?: string;
  /** How many runs this request may measure. */
  maximalExecutions?: number;
  parameters?: IProfilerTraceParameters;
}

export interface ITraceScheduling {
  /** What may be traced. The cloud flow reads these before choosing. */
  listObjectTypes(): Promise<INamedItem[]>;
  listProcessTypes(): Promise<INamedItem[]>;

  /**
   * Schedule a measurement.
   *
   * The catalogue URIs go here, not into the parameters document: a stored
   * request carries `trc:processTypeId` and `trc:objectTypeId` as exactly the
   * URIs the two readers above hand out.
   *
   * Resolves to the request id.
   */
  requestTrace(request: ITraceRequest): Promise<string>;

  /**
   * The schedule — what is queued, not what has been recorded.
   *
   * This collection is emptied by the runs that consume it, so an empty answer
   * means nothing is scheduled, NOT that the endpoint is dead. It serves
   * `application/atom+xml;type=feed` and answers anything else
   * `400 acceptHeaderMissing`, which reads like a missing header and is not.
   */
  listRequests(): Promise<ITraceRequestEntry[]>;

  /** The same schedule, read through the server's second, URI-keyed flavour. */
  getRequestsByUri(uri: string): Promise<ITraceRequestEntry[]>;

  /**
   * Configure a measurement from parameters alone, without the catalogues.
   *
   * Resolves to the request id, taken from the `Location` header — what the run
   * is GIVEN, not what it produces.
   */
  scheduleTrace(options?: IProfilerTraceParameters): Promise<string>;
}
