// Compile-only assertions. If these stop compiling, the types regressed.
//
// The point of this file is the refusals: an include and a program are
// different resources, measured — different root element, namespace,
// `adtcore:type` and accepted content type — so the types must not be
// interchangeable. If they were, a caller would build the wrong document and
// post it to a collection that does not accept it.

import type { IAdtContentTypes, IAdtHeaders } from '../adt/IAdtContentTypes';
import type {
  ICreateIncludeParams,
  IDeleteIncludeParams,
  IIncludeConfig,
  IIncludeState,
  IUpdateIncludeSourceParams,
} from '../adt/IAdtInclude';
import type { IProgramConfig } from '../adt/IAdtProgram';

/** A consumer's own include handler, spelled out rather than cast. */
interface IConsumerIncludeHandler {
  create(params: ICreateIncludeParams): Promise<IIncludeState>;
  updateSource(params: IUpdateIncludeSourceParams): Promise<IIncludeState>;
  delete(params: IDeleteIncludeParams): Promise<IIncludeState>;
}

const _handler: IConsumerIncludeHandler = {
  create: async (params) => {
    void params.includeName;
    void params.packageName;
    return { errors: [] } as IIncludeState;
  },
  updateSource: async (params) => {
    void params.sourceCode;
    return { errors: [] } as IIncludeState;
  },
  delete: async (params) => {
    void params.transportRequest;
    return { errors: [] } as IIncludeState;
  },
};
void _handler;

const _config: IIncludeConfig = {
  includeName: 'Z_SOME_INCLUDE',
  packageName: 'Z_SOME_PACKAGE',
  description: 'An include',
};
void _config;

// A program config is not an include config, and vice versa.
// @ts-expect-error a program config does not name an include
const _notAnInclude: IIncludeConfig = {
  programName: 'Z_SOME_PROGRAM',
} as IProgramConfig;
void _notAnInclude;

// @ts-expect-error an include config does not name a program
const _notAProgram: IProgramConfig = _config;
void _notAProgram;

// An include has no `programType`: that attribute is on the program document
// and nowhere in the include one.
// @ts-expect-error includes carry no program type
const _noProgramType: IIncludeConfig = { ..._config, programType: 'I' };
void _noProgramType;

// The create headers are the include's own, not the program's.
const _headers: Pick<IAdtContentTypes, 'includeCreate' | 'programCreate'> = {
  includeCreate: (): IAdtHeaders => ({
    accept: 'application/vnd.sap.adt.programs.includes.v2+xml',
    contentType: 'application/vnd.sap.adt.programs.includes.v2+xml',
  }),
  programCreate: (): IAdtHeaders => ({
    accept: 'application/vnd.sap.adt.programs.programs.v2+xml',
    contentType: 'application/vnd.sap.adt.programs.programs.v2+xml',
  }),
};
void _headers;
