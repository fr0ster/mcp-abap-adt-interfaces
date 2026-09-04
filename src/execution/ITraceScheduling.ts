/**
 * Configuring a measurement — the half that is not reading one.
 *
 * This is composed into `IClassExecutor` and `IProgramExecutor`, and
 * deliberately NOT put on `IAdtRunnable` or the profiler atoms: an ATC run and a unit
 * test run implement those too, and neither has any business answering for
 * trace parameters. Composed in, the capability is stated exactly where it is
 * true.
 *
 * The vocabulary is kept apart from the reading side on purpose. Scheduling
 * yields a *request id*; reading takes a *trace id*; they are different things
 * that were previously easy to confuse.
 */

import type { IAdtResponse } from '../adt/IAdtResponse';
import type { IProfilerTraceParameters } from '../runtime/IProfiler';

// Deliberately NOT here: an operation that submits a trace request.
//
// The stored entry above IS measured; the *submitted* document is not, and no
// capture of one exists. A published `requestTrace(request)` would tell a
// consumer that its argument's fields are the wire shape — that `{}` is a valid
// body, that `description` is the element name the server reads — on the
// strength of having read the response. A doc comment saying "not settled" does
// not stop that; only not shipping the method does.
//
// It is additive in a minor release the moment a capture exists.

export interface ITraceScheduling<TTypes, TRequests, TScheduled> {
  /** What may be traced. The cloud flow reads these before choosing. */
  listObjectTypes(): Promise<IAdtResponse<TTypes>>;
  listProcessTypes(): Promise<IAdtResponse<TTypes>>;

  /**
   * The schedule — what is queued, not what has been recorded.
   *
   * This collection is emptied by the runs that consume it, so an empty answer
   * means nothing is scheduled, NOT that the endpoint is dead. It serves
   * `application/atom+xml;type=feed` and answers anything else
   * `400 acceptHeaderMissing`, which reads like a missing header and is not.
   */
  listRequests(): Promise<IAdtResponse<TRequests>>;

  /** The same schedule, read through the server's second, URI-keyed flavour. */
  getRequestsByUri(uri: string): Promise<IAdtResponse<TRequests>>;

  /**
   * Configure a measurement from parameters alone, without the catalogues.
   *
   * Resolves to the request id, taken from the `Location` header — what the run
   * is GIVEN, not what it produces.
   */
  scheduleTrace(
    options?: IProfilerTraceParameters,
  ): Promise<IAdtResponse<TScheduled>>;
}
