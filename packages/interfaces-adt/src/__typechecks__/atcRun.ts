// Compile-only assertions. If these stop compiling, the types regressed.

import type { IAdtResponse } from '../adt/IAdtResponse';
import type { IAdtRunnable } from '../execution/IAdtRunnable';
import type {
  AtcClassIncludeKind,
  AtcObjectType,
  IAtcFindings,
  IAtcObjectRef,
  IAtcRunOptions,
  IAtcRunStatusReadable,
  IAtcRunTarget,
} from '../runtime/IAtcRun';

/** What an implementation answers with when it succeeded. */
const answered = <T>(value: T): IAdtResponse<T> => ({
  ok: true,
  getResult: () => ({ value }),
});

// The shape a handler must satisfy: the runnable atom plus the two readers,
// spelled as an intersection because one getter has this set. A named
// composite would be a third name over types that already have one.
/** A consumer's own readings of what a run answers. */
interface MyRunResult {
  worklistId: string;
  runId?: string;
}
interface MyStatus {
  finished: boolean;
}

type AtcHandler = IAdtRunnable<IAtcRunTarget, MyRunResult, IAtcRunOptions> &
  IAtcRunStatusReadable<MyStatus> &
  IAtcFindings<string>;

const _handler: AtcHandler = {
  run: async (
    target: IAtcRunTarget,
    options?: IAtcRunOptions,
  ): Promise<IAdtResponse<MyRunResult>> => {
    void target.objects[0].objectType;
    void options?.wait;
    return answered({ worklistId: 'W', runId: 'R' });
  },
  getRunStatus: async (runId: string): Promise<IAdtResponse<MyStatus>> => {
    void runId;
    return answered({ finished: true });
  },
  getFindings: async (worklistId: string): Promise<IAdtResponse<string>> => {
    void worklistId;
    return answered('<atcworklist:worklist/>');
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

// The shape a run answers left this package in 31.0.0, and with it the
// assertions about its discriminated `waited` branch — they belong beside the
// implementation that builds it. What is asserted here is what stayed: the
// target a caller passes, the object types a URI can be built for, and that the
// runnable composes with the two readers.

// Every member of the union is a type a client can build a URI for. Adding one
// breaks exhaustive consumers — which is what this map is here to demonstrate.
const _uris: Record<AtcObjectType, string> = {
  class: '/sap/bc/adt/oo/classes/',
  interface: '/sap/bc/adt/oo/interfaces/',
  function_group: '/sap/bc/adt/functions/groups/',
  package: '/sap/bc/adt/packages/',
  ddl_source: '/sap/bc/adt/ddic/ddl/sources/',
  table: '/sap/bc/adt/ddic/tables/',
  behavior_definition: '/sap/bc/adt/bo/behaviordefinitions/',
  program: '/sap/bc/adt/programs/programs/',
  program_include: '/sap/bc/adt/programs/includes/',
  function_include: '/sap/bc/adt/functions/groups/{group}/includes/',
  class_include: '/sap/bc/adt/oo/classes/{class}/includes/{kind}',
};
void _uris;

// An include is addressed by what owns it, so each kind asks for its owner.
const _refs: IAtcObjectRef[] = [
  { objectType: 'program', objectName: 'ZREP' },
  { objectType: 'program_include', objectName: 'ZREP_TOP' },
  {
    objectType: 'function_include',
    objectName: 'LZFGTOP',
    functionGroup: 'ZFG',
  },
  {
    objectType: 'class_include',
    objectName: 'ZCL_X',
    includeKind: 'testclasses',
  },
];
void _refs;

// @ts-expect-error — a function include is addressed under its group
const _noGroup: IAtcObjectRef = {
  objectType: 'function_include',
  objectName: 'LZFGTOP',
};
void _noGroup;

// @ts-expect-error — a class include is addressed by its class and kind
const _noKind: IAtcObjectRef = {
  objectType: 'class_include',
  objectName: 'ZCL_X',
};
void _noKind;

const _kind: AtcClassIncludeKind = 'implementations';
void _kind;

// A consumer's own status is what the reader answers, and the contract says
// nothing about its fields — which is the point of it having left.
const _polling: MyStatus = { finished: false };
void _polling;
