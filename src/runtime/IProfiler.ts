import type {
  IAbapTraceDbAccesses,
  IAbapTraceHitList,
  IAbapTraceStatements,
} from './IAbapTrace';
import type {
  ITraceEntry,
  ITraceFamily,
  ITraceReading,
  ITraceReadingWithParser,
  ITraceView,
} from './ITrace';

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
 * The three views an ABAP trace offers, each with the options it accepts.
 *
 * The feed confirms them independently: every trace entry carries a link per
 * view, and the `statements` link advertises exactly the query parameters
 * {@link IProfilerTraceStatementsOptions} already published.
 */
export interface IAbapTraceViews {
  hitlist: ITraceView<
    IAbapTraceHitList,
    IProfilerTraceHitListOptions | undefined
  >;
  statements: ITraceView<
    IAbapTraceStatements,
    IProfilerTraceStatementsOptions | undefined
  >;
  dbAccesses: ITraceView<
    IAbapTraceDbAccesses,
    IProfilerTraceDbAccessesOptions | undefined
  >;
}

/**
 * The profiler: what traces exist, and what is inside one.
 *
 * Same name consumers import today; what changed is what it means. Everything
 * about *configuring* a measurement left — see `ITraceScheduling`, which the
 * executors compose in, because a request nobody fulfils is litter and its life
 * is bounded by the run.
 *
 * `getHitList` / `getStatements` / `getDbAccesses` are gone as separate members:
 * they were one operation with three names, and `read(traceId, view)` returns
 * the view's own type rather than a raw response every caller re-parses.
 */
export type IProfiler = ITraceFamily<
  'profiler',
  ITraceEntry,
  IProfilerListOptions
> &
  ITraceReading<IAbapTraceViews> &
  ITraceReadingWithParser<IAbapTraceViews>;
