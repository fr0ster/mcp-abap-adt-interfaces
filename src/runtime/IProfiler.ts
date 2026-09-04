import type {
  ITraceDeletion,
  ITraceEntry,
  ITraceFamily,
  ITraceListing,
  ITraceReading,
  ITraceView,
} from './ITrace';

/**
 * The profiler: what a run left behind, and what a caller passes to ask for it.
 *
 * `IProfiler` is a **composition of atoms**, and it stayed — a consumer needs it
 * to type a profiler and to implement one, and making each of them spell the
 * intersection by hand is the bloat decision 24 is against, not the bloat it is
 * about. What left in 31.0.0 are the concrete readings it used to name:
 * `IAbapTraceEntry`, `IAbapTraceViews` and the view shapes. They arrive as type
 * parameters now, with **no defaults**, exactly as {@link IClassExecutor} and
 * {@link ICrossTrace} take theirs.
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

/**
 * A profiler, composed.
 *
 * `TEntry` is what its listing answers per trace; `TViews` maps each view name
 * to the reading that view performs. Both are the implementation's — this
 * package says a profiler lists, reads and deletes, and says nothing about what
 * a hit list looks like.
 *
 * ```typescript
 * type MyProfiler = IProfiler<MyTraceEntry, { hitlist: ITraceView<MyHitList> }>;
 * ```
 */
export type IProfiler<
  TEntry extends ITraceEntry,
  TViews extends { [K in keyof TViews]: ITraceView<unknown, unknown> },
> = ITraceFamily<'profiler'> &
  ITraceListing<TEntry, IProfilerListOptions> &
  ITraceReading<TViews> &
  ITraceDeletion;
