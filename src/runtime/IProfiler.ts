/**
 * What a profiler run is asked for — the options, and nothing else.
 *
 * `IProfiler` itself was a **named composition** naming concrete readings:
 * `ITraceFamily<'profiler'> & ITraceListing<IAbapTraceEntry, …> &
 * ITraceReading<IAbapTraceViews> & ITraceDeletion`. The composition and the
 * shapes in it left in 31.0.0 — a composition of atoms with an implementation's
 * readings is that implementation's, and `adt-clients` declares it. The atoms it
 * was made of stayed, in `ITrace.ts`, along with the view machinery a caller
 * needs to implement `read`.
 *
 * What is below is the request side: what a caller passes when scheduling or
 * reading a trace. Decision 24 — the contract carries what is needed to use it
 * or replace it.
 */

export interface IProfilerListOptions {
  user?: string;
}

/**
 * What to measure.
 *
 * This is an argument to a *run*, not to a read, which is why it travels with
 * scheduling rather than staying on the reading surface.
 */
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
