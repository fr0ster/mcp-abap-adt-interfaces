// Compile-only assertions. If these stop compiling, the types regressed.
//
// A main type is the TADIR object type of a code (`'ENHO'` of `'ENHO/XHH'`).
// Every code entry states its own, and the table's type holds it to the key:
// a missing `main` fails the table's `satisfies`, a wrong one fails
// `AdtCheckedTable` — per key, so a main type of another code of the same
// table is refused too. Only the search filter takes a main type; a parameter
// that builds an address does not.

import type {
  AdtMainType,
  AdtMainTypeOfVariant,
  AdtTypeCode,
  CodesOfMain,
} from '../adt/AdtTypeTables';
import type { ISearchObjectsParams } from '../adt/IAdtShared';
import type {
  AdtApiTable,
  AdtCheckedTable,
  AdtMainTypeOf,
} from '../adt/IAdtTypeTable';
import type { IAdtRepositoryStructure } from '../adt/IAdtUtilities';

type Assert<T extends true> = T;
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

// ── Both directions of the relation ─────────────────────────────────────────

export type MainOfCode = [
  Assert<Equal<AdtMainTypeOf<'ENHO/XHH'>, 'ENHO'>>,
  Assert<Equal<AdtMainTypeOf<'DEVC/K'>, 'DEVC'>>,
  Assert<Equal<AdtMainTypeOf<'TABL/DS'>, 'TABL'>>,
  // A code with no `/` is its own main type.
  Assert<Equal<AdtMainTypeOf<'AUTH'>, 'AUTH'>>,
];

export type CodesOfAMain = [
  Assert<Equal<CodesOfMain<'ENHO'>, 'ENHO/XHB' | 'ENHO/XHH'>>,
  Assert<Equal<CodesOfMain<'ENHS'>, 'ENHS/XSB'>>,
  Assert<Equal<CodesOfMain<'TABL'>, 'TABL/DS' | 'TABL/DT'>>,
  Assert<Equal<CodesOfMain<'AUTH'>, 'AUTH'>>,
];

// `CodesOfMain<'ENHO'>` holds `ENHO/XHH` and not `ENHS/XSB`.
const _enhoHost: CodesOfMain<'ENHO'> = 'ENHO/XHH';
void _enhoHost;
// @ts-expect-error `ENHS/XSB` is a code of `ENHS`, not of `ENHO`
const _enhsSpot: CodesOfMain<'ENHO'> = 'ENHS/XSB';
void _enhsSpot;

// The main types are what the tables' codes state, recorded per variant.
type ModernMains =
  | 'AUTH'
  | 'BDEF'
  | 'CLAS'
  | 'DCLS'
  | 'DDLS'
  | 'DDLX'
  | 'DEVC'
  | 'DOMA'
  | 'DSFD'
  | 'DSFI'
  | 'DTEL'
  | 'ENHO'
  | 'ENHS'
  | 'FTG2'
  | 'FUGR'
  | 'INTF'
  | 'MSAG'
  | 'PROG'
  | 'SRVB'
  | 'SRVD'
  | 'TABL'
  | 'TTYP'
  | 'XSLT';

export type RecordedMains = [
  Assert<Equal<AdtMainTypeOfVariant<'onprem'>, ModernMains>>,
  Assert<Equal<AdtMainTypeOfVariant<'cloud'>, ModernMains>>,
  Assert<
    Equal<
      AdtMainTypeOfVariant<'basis740'>,
      'CLAS' | 'DDLS' | 'FUGR' | 'INTF' | 'MSAG' | 'PROG'
    >
  >,
  Assert<Equal<AdtMainType, ModernMains>>,
  // Every main type is the main type of a code, and the other way round.
  Assert<Equal<AdtMainTypeOf<AdtTypeCode>, AdtMainType>>,
];

// ── The search filter takes a main type; an address does not ───────────────

const _searchByMain: ISearchObjectsParams = {
  query: 'Z*',
  objectType: 'DEVC',
};
const _searchByCode: ISearchObjectsParams = {
  query: 'Z*',
  objectType: 'DEVC/K',
};
const _searchByNothing: ISearchObjectsParams = {
  query: 'Z*',
  // @ts-expect-error neither a code nor a main type of the tables
  objectType: 'NOPE',
};
void _searchByMain;
void _searchByCode;
void _searchByNothing;

type StructureObjectType = Parameters<
  IAdtRepositoryStructure<unknown, unknown>['getObjectStructure']
>[0];
const _structureByCode: StructureObjectType = 'TABL/DT';
void _structureByCode;
// @ts-expect-error `TABL` is `TABL/DT` or `TABL/DS`: an address takes a code
const _structureByMain: StructureObjectType = 'TABL';
void _structureByMain;

// ── The table's type requires `main`, and the key's own ─────────────────────

const _withMain = {
  enhancement: {
    kind: 'enhancement',
    collection: '/sap/bc/adt/enhancements',
    codes: {
      'ENHO/XHH': {
        main: 'ENHO',
        parent: null,
        nameMaxLength: 30,
        operations: ['read'],
        evidence: 'system-description-s4-2025--07-typestructure',
      },
      'ENHS/XSB': {
        main: 'ENHS',
        parent: null,
        nameMaxLength: 30,
        operations: ['read'],
        evidence: 'system-description-s4-2025--07-typestructure',
      },
    },
  },
} as const satisfies AdtApiTable<'s4-2025'>;
export type WithMain = AdtCheckedTable<typeof _withMain>;

const _withoutMain = {
  class: {
    kind: 'class',
    collection: '/sap/bc/adt/oo/classes',
    codes: {
      // @ts-expect-error every code states its main type
      'CLAS/OC': {
        parent: null,
        nameMaxLength: 30,
        operations: ['read'],
        evidence: 'system-description-s4-2025--07-typestructure',
      },
    },
  },
} as const satisfies AdtApiTable<'s4-2025'>;
void _withoutMain;

const _wrongMain = {
  enhancement: {
    kind: 'enhancement',
    collection: '/sap/bc/adt/enhancements',
    codes: {
      'ENHO/XHH': {
        main: 'ENHS',
        parent: null,
        nameMaxLength: 30,
        operations: ['read'],
        evidence: 'system-description-s4-2025--07-typestructure',
      },
    },
  },
} as const satisfies AdtApiTable<'s4-2025'>;
// @ts-expect-error `ENHO/XHH`'s main type is `ENHO`
export type WrongMain = AdtCheckedTable<typeof _wrongMain>;

// Per key: a main type the table holds, but of another code, is refused.
const _anotherCodesMain = {
  enhancement: {
    kind: 'enhancement',
    collection: '/sap/bc/adt/enhancements',
    codes: {
      'ENHO/XHH': {
        main: 'ENHO',
        parent: null,
        nameMaxLength: 30,
        operations: ['read'],
        evidence: 'system-description-s4-2025--07-typestructure',
      },
      'ENHS/XSB': {
        main: 'ENHO',
        parent: null,
        nameMaxLength: 30,
        operations: ['read'],
        evidence: 'system-description-s4-2025--07-typestructure',
      },
    },
  },
} as const satisfies AdtApiTable<'s4-2025'>;
// @ts-expect-error `ENHS/XSB`'s main type is `ENHS`, not its neighbour's
export type AnotherCodesMain = AdtCheckedTable<typeof _anotherCodesMain>;

// The code itself is not its main type.
const _codeAsMain = {
  structure: {
    kind: 'structure',
    collection: '/sap/bc/adt/ddic/structures',
    codes: {
      'TABL/DS': {
        main: 'TABL/DS',
        parent: null,
        nameMaxLength: 30,
        operations: ['read'],
        evidence: 'system-description-s4-2025--07-typestructure',
      },
    },
  },
} as const satisfies AdtApiTable<'s4-2025'>;
// @ts-expect-error `TABL/DS`'s main type is `TABL`
export type CodeAsMain = AdtCheckedTable<typeof _codeAsMain>;
