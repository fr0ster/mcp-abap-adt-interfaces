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

const response: IAdtResponse = {
  data: '',
  status: 200,
  statusText: 'OK',
  headers: {},
};

// Published so a consumer can substitute its own runner — a real implementation,
// not our ClassExecutor, must satisfy this shape exactly.
const _class: IClassExecutor = {
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
    void options?.maxTraceAttempts;
    return {
      response,
      profilerId: 'p1',
      traceId: 't1',
      traceRequestsResponse: response,
    };
  },
};
void _class;

// Same shape check for the program executor — no traceId in the profiling
// result, which is the one structural difference from the class executor.
const _program: IProgramExecutor = {
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
