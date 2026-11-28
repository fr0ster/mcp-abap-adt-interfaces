// Compile-only assertions. If these stop compiling, the types regressed.
//
// The outline and navigation atoms, checked against hand-written objects:
// whether adt-clients' `AdtUtils` conforms is that package's own test.

import type { IAdtAnalyseOptions, IAnalyse } from '../adt/IAdtObject';
import type {
  IAdtError,
  IAdtResponse,
  IResultStrategy,
} from '../adt/IAdtResponse';
import type {
  AdtOutlineCode,
  IAdtNavigationTargetOptions,
  IAdtNavigationTargetReadable,
  IAdtObjectOutlineReadable,
  IUtilResults,
} from '../adt/IAdtUtilities';
import type { AdtReadVersion } from '../shared/IReadOptions';

declare const answer: IAdtResponse<string, IAdtError>;

// ---- The outline atom --------------------------------------------------

const _outline: IAdtObjectOutlineReadable<string> = {
  getObjectOutline(
    _objectType: AdtOutlineCode,
    _objectName: string,
    _options?: {
      version?: AdtReadVersion | undefined;
      accept?: string | undefined;
    } & IAdtAnalyseOptions,
  ) {
    return Promise.resolve(answer);
  },
};
void _outline;

// Every kind SAP serves an outline for is a code; another is not.
const _codes: AdtOutlineCode[] = [
  'CLAS/OC',
  'INTF/OI',
  'PROG/P',
  'PROG/I',
  'FUGR/F',
];
void _codes;
// @ts-expect-error a function module has no outline
const _module: AdtOutlineCode = 'FUGR/FF';
void _module;

// @ts-expect-error the atom's one member is required
const _noOutline: IAdtObjectOutlineReadable<string> = {};
void _noOutline;

const _wrongOutline: IAdtObjectOutlineReadable<string> = {
  // @ts-expect-error the object type is an outline code, not a number
  getObjectOutline(_objectType: number) {
    return Promise.resolve(answer);
  },
};
void _wrongOutline;

// ---- The navigation atom -----------------------------------------------

const _navigation: IAdtNavigationTargetReadable<string> = {
  getNavigationTarget(
    _uri: string,
    _options?: IAdtNavigationTargetOptions & IAdtAnalyseOptions,
  ) {
    return Promise.resolve(answer);
  },
};
void _navigation;

// The discovery template's parameters, and the caller's Accept.
const _options: IAdtNavigationTargetOptions = {
  filter: 'x',
  fullname: 'y',
  accept: 'application/xml',
};
void _options;
// @ts-expect-error the template has no such parameter
const _unknown: IAdtNavigationTargetOptions = { position: 1 };
void _unknown;

// @ts-expect-error the atom's one member is required
const _noNavigation: IAdtNavigationTargetReadable<string> = {};
void _noNavigation;

const _wrongNavigation: IAdtNavigationTargetReadable<string> = {
  // @ts-expect-error the uri is a string
  getNavigationTarget(_uri: number) {
    return Promise.resolve(answer);
  },
};
void _wrongNavigation;

// A caller's analyse reaches the answer's error type.
declare const atom: IAdtNavigationTargetReadable<string>;
declare const analyse: IAnalyse<IAdtError & { code: 'X' }>;
const _typed: Promise<IAdtResponse<string, IAdtError>> =
  atom.getNavigationTarget('/sap/bc/adt/x#type=PROG%2FPU;name=F', {
    analyse,
  });
void _typed;

// ---- The result slots --------------------------------------------------

declare const strategy: IResultStrategy<unknown>;
declare const results: Omit<IUtilResults, 'objectOutline' | 'navigationTarget'>;

// Both slots are optional: a set written before them still is one.
const _without: IUtilResults = results;
void _without;
const _with: IUtilResults = {
  ...results,
  objectOutline: strategy,
  navigationTarget: strategy,
};
void _with;
// @ts-expect-error a slot holds a result strategy
const _wrongSlot: IUtilResults = { ...results, navigationTarget: 'raw' };
void _wrongSlot;
