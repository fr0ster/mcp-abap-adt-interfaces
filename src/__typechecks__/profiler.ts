// Compile-only assertions. If these stop compiling, the types regressed.

import type { IAdtResponse } from '../connection/IAbapConnection';
import type {
  IProfiler,
  IProfilerListOptions,
  IProfilerTraceDbAccessesOptions,
  IProfilerTraceHitListOptions,
  IProfilerTraceParameters,
  IProfilerTraceStatementsOptions,
  ITraceFeedEntry,
} from '../runtime/IProfiler';

const response: IAdtResponse = {
  data: '',
  status: 200,
  statusText: 'OK',
  headers: {},
};

// A consumer may substitute its own profiler, so the whole contract has to be
// satisfiable by something that is not our Profiler.
const _profiler: IProfiler = {
  kind: 'profiler',
  list: async (options?: IProfilerListOptions): Promise<IAdtResponse> => {
    void options?.user;
    return response;
  },
  // The two that turn `list()` into something a caller can act on. Note the
  // return types: these are the only members of this contract that do NOT hand
  // back an unparsed IAdtResponse, and that is the whole point of them —
  // three methods below require a trace id and nothing else could produce one.
  listTraceIds: async (
    options?: IProfilerListOptions,
  ): Promise<ITraceFeedEntry[]> => {
    void options?.user;
    return [{ id: 'T1', writtenAt: '2026-08-27T09:00:00Z' }];
  },
  latestTraceId: async (
    options?: IProfilerListOptions,
  ): Promise<string | undefined> => {
    void options?.user;
    return 'T1';
  },
  getParameters: async (): Promise<IAdtResponse> => response,
  getParametersForCallstack: async (): Promise<IAdtResponse> => response,
  getParametersForAmdp: async (): Promise<IAdtResponse> => response,
  createParameters: async (
    options?: IProfilerTraceParameters,
  ): Promise<IAdtResponse> => {
    void options?.aggregate;
    return response;
  },
  getHitList: async (
    traceIdOrUri: string,
    options?: IProfilerTraceHitListOptions,
  ): Promise<IAdtResponse> => {
    void traceIdOrUri;
    void options?.withSystemEvents;
    return response;
  },
  getStatements: async (
    traceIdOrUri: string,
    options?: IProfilerTraceStatementsOptions,
  ): Promise<IAdtResponse> => {
    void traceIdOrUri;
    void options?.withDetails;
    return response;
  },
  getDbAccesses: async (
    traceIdOrUri: string,
    options?: IProfilerTraceDbAccessesOptions,
  ): Promise<IAdtResponse> => {
    void traceIdOrUri;
    void options?.withSystemEvents;
    return response;
  },
  listRequests: async (): Promise<IAdtResponse> => response,
  getRequestsByUri: async (uri: string): Promise<IAdtResponse> => {
    void uri;
    return response;
  },
  listObjectTypes: async (): Promise<IAdtResponse> => response,
  listProcessTypes: async (): Promise<IAdtResponse> => response,
};
void _profiler;

// The id a trace feed entry carries is what getHitList() and its siblings take.
const _entry: ITraceFeedEntry = { id: 'T1', writtenAt: '' };
void _profiler.getHitList(_entry.id);
