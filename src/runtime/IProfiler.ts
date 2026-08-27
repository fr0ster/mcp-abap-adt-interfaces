import type { IAdtResponse } from '../connection/IAbapConnection';
import type { IListableRuntimeObject } from './types';

export interface IProfilerListOptions {
  user?: string;
}

export interface IProfilerTraceParameters {
  allMiscAbapStatements?: boolean;
  allProceduralUnits?: boolean;
  allInternalTableEvents?: boolean;
  allDynproEvents?: boolean;
  description?: string;
  aggregate?: boolean;
  explicitOnOff?: boolean;
  withRfcTracing?: boolean;
  allSystemKernelEvents?: boolean;
  sqlTrace?: boolean;
  allDbEvents?: boolean;
  maxSizeForTraceFile?: number;
  amdpTrace?: boolean;
  maxTimeForTracing?: number;
}

export interface IProfilerTraceHitListOptions {
  withSystemEvents?: boolean;
}

export interface IProfilerTraceStatementsOptions {
  id?: number;
  withDetails?: boolean;
  autoDrillDownThreshold?: number;
  withSystemEvents?: boolean;
}

export interface IProfilerTraceDbAccessesOptions {
  withSystemEvents?: boolean;
}

/**
 * One trace in the feed: which trace it is, and when it was written.
 *
 * `writtenAt` is the entry's own timestamp, empty when it carries none. It is
 * here because position in the feed does not mean age — measured on an on-prem
 * system, the feed's first entries were minutes old while its last were eight
 * days older, so a caller that took "the first one" got a trace chosen at
 * random as far as it was concerned.
 */
export interface ITraceFeedEntry {
  id: string;
  writtenAt: string;
}

export interface IProfiler
  extends IListableRuntimeObject<
    IAdtResponse,
    IProfilerListOptions,
    'profiler'
  > {
  getParameters(): Promise<IAdtResponse>;
  getParametersForCallstack(): Promise<IAdtResponse>;
  getParametersForAmdp(): Promise<IAdtResponse>;
  createParameters(options?: IProfilerTraceParameters): Promise<IAdtResponse>;
  getHitList(
    traceIdOrUri: string,
    options?: IProfilerTraceHitListOptions,
  ): Promise<IAdtResponse>;
  getStatements(
    traceIdOrUri: string,
    options?: IProfilerTraceStatementsOptions,
  ): Promise<IAdtResponse>;
  getDbAccesses(
    traceIdOrUri: string,
    options?: IProfilerTraceDbAccessesOptions,
  ): Promise<IAdtResponse>;
  /**
   * The traces `list()` returns, as ids rather than as a document.
   *
   * `list()` answers with an Atom feed, and every consumer that wanted a trace
   * out of it had to parse XML — a job that belongs here once rather than in
   * each of them. Nothing else in this contract can produce a trace id, while
   * three of its methods require one.
   */
  listTraceIds(options?: IProfilerListOptions): Promise<ITraceFeedEntry[]>;

  /**
   * The id of the most recently written trace, or undefined when there is none.
   *
   * Newest by timestamp, not by position in the feed.
   *
   * This answers "what is newest", which is NOT "what did my run just produce".
   * SAP writes traces asynchronously, so a caller that needs its own trace
   * notes the ids from `listTraceIds()` before running and polls for one that
   * is new. `getRequestsByUri()` does not serve that purpose: a trace REQUEST
   * is consumed by the run that fulfils it, and measured on-prem the feed came
   * back empty for the very object that had just been traced.
   */
  latestTraceId(options?: IProfilerListOptions): Promise<string | undefined>;

  listRequests(): Promise<IAdtResponse>;
  getRequestsByUri(uri: string): Promise<IAdtResponse>;
  listObjectTypes(): Promise<IAdtResponse>;
  listProcessTypes(): Promise<IAdtResponse>;
}
