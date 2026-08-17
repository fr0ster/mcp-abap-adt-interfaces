// Compile-only assertions. If these stop compiling, the types regressed.

import type { IAdtResponse } from '../connection/IAbapConnection';
import type { IAdtRunnable } from '../execution/IAdtRunnable';
import type {
  AtcObjectType,
  IAtcFindings,
  IAtcRunOptions,
  IAtcRunResult,
  IAtcRunStatus,
  IAtcRunStatusReadable,
  IAtcRunTarget,
} from '../runtime/IAtcRun';

const response: IAdtResponse = {
  data: '',
  status: 200,
  statusText: 'OK',
  headers: {},
};

// The shape a handler must satisfy: the runnable atom plus the two readers,
// spelled as an intersection because one getter has this set. A named
// composite would be a third name over types that already have one.
type AtcHandler = IAdtRunnable<IAtcRunTarget, IAtcRunResult, IAtcRunOptions> &
  IAtcRunStatusReadable &
  IAtcFindings;

const _handler: AtcHandler = {
  run: async (
    target: IAtcRunTarget,
    options?: IAtcRunOptions,
  ): Promise<IAtcRunResult> => {
    void target.objects[0].objectType;
    void options?.wait;
    return { waited: false, worklistId: 'W', runId: 'R' };
  },
  getRunStatus: async (runId: string): Promise<IAtcRunStatus> => {
    void runId;
    return { status: 'finished', isFinished: true };
  },
  getFindings: async (worklistId: string): Promise<IAdtResponse> => {
    void worklistId;
    return response;
  },
};

// `options` is optional, so a caller may pass one argument. The handler must
// therefore treat it as absent rather than as `{}` — this call is what makes
// that a compile-time fact and not an intention.
void _handler.run({ objects: [{ objectType: 'class', objectName: 'ZCL_X' }] });
void _handler.run(
  { objects: [{ objectType: 'table', objectName: 'ZT_X' }] },
  { wait: true, maximumVerdicts: 500 },
);

// The target is a NON-EMPTY tuple. An empty array must not compile: "one or
// more" in a doc comment over a type admitting `[]` is a promise the compiler
// does not keep.
// @ts-expect-error — an empty object set would start a run over nothing
const _empty: IAtcRunTarget = { objects: [] };
void _empty;

// The result is discriminated on `waited`, and each branch carries only its
// own fields. Reading `runId` off the waiting branch must not compile.
declare const result: IAtcRunResult;
if (result.waited) {
  void result.findingStats;
  // @ts-expect-error — a waiting run answers with no run id
  void result.runId;
} else {
  void result.runId;
  // @ts-expect-error — a non-waiting run answers with an empty body
  void result.findingStats;
}
// `worklistId` is on BOTH branches, because it is what getFindings takes.
void result.worklistId;

// Every member of the union is a type this client can build a URI for. The
// two ABAP Cloud refuses to hold are absent, and adding either later breaks
// exhaustive consumers — which is what this map is here to demonstrate.
const _uris: Record<AtcObjectType, string> = {
  class: '/sap/bc/adt/oo/classes/',
  interface: '/sap/bc/adt/oo/interfaces/',
  function_group: '/sap/bc/adt/functions/groups/',
  package: '/sap/bc/adt/packages/',
  ddl_source: '/sap/bc/adt/ddic/ddl/sources/',
  table: '/sap/bc/adt/ddic/tables/',
  behavior_definition: '/sap/bc/adt/bo/behaviordefinitions/',
};
void _uris;

// @ts-expect-error — not confirmed anywhere: ABAP Cloud will not hold one
const _program: AtcObjectType = 'program';
void _program;

// A status may arrive without the worklist link, and must still be usable —
// this is the state polling exists for and the one nobody has captured.
const _polling: IAtcRunStatus = { status: 'running', isFinished: false };
void _polling;
