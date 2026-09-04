// Compile-only assertions. If these stop compiling, the types regressed.

import type { IAdtResponse } from '../adt/IAdtResponse';
import type {
  IClassExecuteWithProfilerOptions,
  IClassExecuteWithProfilingOptions,
  IClassExecuteWithProfilingResult,
  IClassExecutionTarget,
  IClassExecutor,
  IProgramExecuteWithProfilerOptions,
  IProgramExecuteWithProfilingOptions,
  IProgramExecuteWithProfilingResult,
  IProgramExecutionTarget,
  IProgramExecutor,
} from '../execution/IAdtExecutors';
import type { ITraceScheduling } from '../execution/ITraceScheduling';

/** A consumer's own readings — the contract declares none since 31.0.0. */
interface INamedItem {
  name: string;
}
interface ITraceRequestEntry {
  id: string;
}
type Scheduling = ITraceScheduling<INamedItem[], ITraceRequestEntry[], string>;

/**
 * Scheduling, satisfied once and reused by both executors below.
 *
 * Spelled out rather than cast, because the point of the assertion is that a
 * consumer's own runner can satisfy it.
 */
const answered = <T>(value: T): IAdtResponse<T> => ({
  ok: true,
  getResult: () => ({ value }),
});

const scheduling: Scheduling = {
  listObjectTypes: async (): Promise<IAdtResponse<INamedItem[]>> =>
    answered([]),
  listProcessTypes: async (): Promise<IAdtResponse<INamedItem[]>> =>
    answered([]),
  listRequests: async (): Promise<IAdtResponse<ITraceRequestEntry[]>> =>
    answered([]),
  getRequestsByUri: async (
    uri: string,
  ): Promise<IAdtResponse<ITraceRequestEntry[]>> => {
    void uri;
    return answered([]);
  },
  scheduleTrace: async (): Promise<IAdtResponse<string>> => answered('r2'),
};

const document = '<adtcore:objectReference/>';

// Published so a consumer can substitute its own runner — a real implementation,
// not our ClassExecutor, must satisfy this shape exactly.
const _class: IClassExecutor<
  string,
  INamedItem[],
  ITraceRequestEntry[],
  string
> = {
  ...scheduling,
  run: async (target: IClassExecutionTarget): Promise<IAdtResponse<string>> => {
    void target.className;
    return answered(document);
  },
  runWithProfiler: async (
    target: IClassExecutionTarget,
    options: IClassExecuteWithProfilerOptions,
  ): Promise<IAdtResponse<string>> => {
    void target.className;
    void options.profilerId;
    return answered(document);
  },
  runWithProfiling: async (
    target: IClassExecutionTarget,
    options?: IClassExecuteWithProfilingOptions,
  ): Promise<IAdtResponse<IClassExecuteWithProfilingResult<string>>> => {
    void target.className;
    void options?.profilerParameters;
    // No `traceId` here, and the assertion below proves it is refused rather
    // than merely absent.
    return answered({ run: document, profilerId: 'p1' });
  },
};
void _class;

// A run promises no trace. This is the whole point of the executor change: the
// trace is written asynchronously, so a result that named one was lying about
// timing that the caller then built retries around.
const _classResult: IClassExecuteWithProfilingResult<string> = {
  run: document,
  profilerId: 'p1',
  // @ts-expect-error a run result does not carry a trace id
  traceId: 't1',
};
void _classResult;

// The class and program profiling options are now the same shape — the three
// polling options were the only difference, and they described a search that no
// longer happens. Assignable both ways, which is what "identical" means here.
const _optionsAreTheSame: IProgramExecuteWithProfilingOptions =
  {} as IClassExecuteWithProfilingOptions;
const _andBack: IClassExecuteWithProfilingOptions =
  {} as IProgramExecuteWithProfilingOptions;
void _optionsAreTheSame;
void _andBack;

// The same shape check for the program executor, which also schedules.
const _program: IProgramExecutor<
  string,
  INamedItem[],
  ITraceRequestEntry[],
  string
> = {
  ...scheduling,
  run: async (
    target: IProgramExecutionTarget,
  ): Promise<IAdtResponse<string>> => {
    void target.programName;
    return answered(document);
  },
  runWithProfiler: async (
    target: IProgramExecutionTarget,
    options: IProgramExecuteWithProfilerOptions,
  ): Promise<IAdtResponse<string>> => {
    void target.programName;
    void options.profilerId;
    return answered(document);
  },
  runWithProfiling: async (
    target: IProgramExecutionTarget,
    options?: IProgramExecuteWithProfilingOptions,
  ): Promise<IAdtResponse<IProgramExecuteWithProfilingResult<string>>> => {
    void target.programName;
    void options?.profilerParameters;
    return answered({ run: document, profilerId: 'p2' });
  },
};
void _program;
