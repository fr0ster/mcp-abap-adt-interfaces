// Compile-only assertions. If these stop compiling, the types regressed.

import type { IAdtResponse } from '../connection/IAbapConnection';
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
import type {
  INamedItem,
  ITraceRequest,
  ITraceRequestEntry,
  ITraceScheduling,
} from '../execution/ITraceScheduling';

/**
 * Scheduling, satisfied once and reused by both executors below.
 *
 * Spelled out rather than cast, because the point of the assertion is that a
 * consumer's own runner can satisfy it.
 */
const scheduling: ITraceScheduling = {
  listObjectTypes: async (): Promise<INamedItem[]> => [],
  listProcessTypes: async (): Promise<INamedItem[]> => [],
  requestTrace: async (request: ITraceRequest): Promise<string> => {
    void request.processTypeId;
    return 'r1';
  },
  listRequests: async (): Promise<ITraceRequestEntry[]> => [],
  getRequestsByUri: async (uri: string): Promise<ITraceRequestEntry[]> => {
    void uri;
    return [];
  },
  scheduleTrace: async (): Promise<string> => 'r2',
};

const response: IAdtResponse = {
  data: '',
  status: 200,
  statusText: 'OK',
  headers: {},
};

// Published so a consumer can substitute its own runner — a real implementation,
// not our ClassExecutor, must satisfy this shape exactly.
const _class: IClassExecutor = {
  ...scheduling,
  run: async (target: IClassExecutionTarget): Promise<IAdtResponse> => {
    void target.className;
    return response;
  },
  runWithProfiler: async (
    target: IClassExecutionTarget,
    options: IClassExecuteWithProfilerOptions,
  ): Promise<IAdtResponse> => {
    void target.className;
    void options.profilerId;
    return response;
  },
  runWithProfiling: async (
    target: IClassExecutionTarget,
    options?: IClassExecuteWithProfilingOptions,
  ): Promise<IClassExecuteWithProfilingResult> => {
    void target.className;
    void options?.profilerParameters;
    // No `traceId` here, and the assertion below proves it is refused rather
    // than merely absent.
    return { response, profilerId: 'p1' };
  },
};
void _class;

// A run promises no trace. This is the whole point of the executor change: the
// trace is written asynchronously, so a result that named one was lying about
// timing that the caller then built retries around.
const _classResult: IClassExecuteWithProfilingResult = {
  response,
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
const _program: IProgramExecutor = {
  ...scheduling,
  run: async (target: IProgramExecutionTarget): Promise<IAdtResponse> => {
    void target.programName;
    return response;
  },
  runWithProfiler: async (
    target: IProgramExecutionTarget,
    options: IProgramExecuteWithProfilerOptions,
  ): Promise<IAdtResponse> => {
    void target.programName;
    void options.profilerId;
    return response;
  },
  runWithProfiling: async (
    target: IProgramExecutionTarget,
    options?: IProgramExecuteWithProfilingOptions,
  ): Promise<IProgramExecuteWithProfilingResult> => {
    void target.programName;
    void options?.profilerParameters;
    return { response, profilerId: 'p2' };
  },
};
void _program;
