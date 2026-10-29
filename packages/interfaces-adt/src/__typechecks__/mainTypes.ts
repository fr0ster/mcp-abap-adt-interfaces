// Compile-only assertions. If these stop compiling, the types regressed.
//
// A main type is the TADIR object type of a code (`'ENHO'` of `'ENHO/XHH'`).
// Every code entry states its own, and the table's type holds it to the key:
// a missing `main` fails the table's `satisfies`, a wrong one fails
// `AdtCheckedTable` — per key, so a main type of another code of the same
// table is refused too. A parameter that builds an address takes a code, never
// a main type. The search filter takes neither a code nor a bare main type of
// its own: it takes a name of the release's object types list, and every main
// type of a variant's table is one of that variant's names.

import type {
  ADT_SEARCH_TYPES_ONPREM,
  AdtListedSearchType,
  AdtSearchType,
  AdtSearchTypeOf,
  AdtSearchTypeTable,
} from '../adt/AdtSearchTypes';
import type {
  AdtMainType,
  AdtMainTypeOfVariant,
  AdtTypeCode,
  CodesOfMain,
} from '../adt/AdtTypeTables';
import type {
  IAdtSearchObjectsParamsOf,
  ISearchObjectsParams,
} from '../adt/IAdtShared';
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

// ── The search filter takes the list's names; an address takes a code ────

const _searchByMain: ISearchObjectsParams = {
  query: 'Z*',
  objectType: 'DEVC',
};
const _searchByAlias: ISearchObjectsParams = {
  query: 'Z*',
  objectType: 'STRU',
};
const _searchByGroup: ISearchObjectsParams = {
  query: 'Z*',
  objectType: 'ABAP_TEST_COCKPIT',
};
const _searchByCode: ISearchObjectsParams = {
  query: 'Z*',
  // @ts-expect-error a code is no filter value: `STRU` is `TABL/DS`'s name
  objectType: 'TABL/DS',
};
const _searchByNothing: ISearchObjectsParams = {
  query: 'Z*',
  // @ts-expect-error no list holds the name
  objectType: 'NOPE',
};
void _searchByMain;
void _searchByAlias;
void _searchByGroup;
void _searchByCode;
void _searchByNothing;

// Per variant: S/4HANA 2025 and ABAP cloud take the alias and the group; 7.40
// answers them with nothing, so its filter refuses them.
const _modernAlias: IAdtSearchObjectsParamsOf<'onprem' | 'cloud'> = {
  query: 'Z*',
  objectType: 'STRU',
};
const _modernGroup: IAdtSearchObjectsParamsOf<'onprem' | 'cloud'> = {
  query: 'Z*',
  objectType: 'ABAP_TEST_COCKPIT',
};
const _basisMain: IAdtSearchObjectsParamsOf<'basis740'> = {
  query: 'Z*',
  objectType: 'TABL',
};
const _basisAlias: IAdtSearchObjectsParamsOf<'basis740'> = {
  query: 'Z*',
  // @ts-expect-error `STRU` answers no hits on 7.40
  objectType: 'STRU',
};
void _modernAlias;
void _modernGroup;
void _basisMain;
void _basisAlias;

// Every main type of a variant's table is a search name of that variant.
export type MainsAreSearchNames = [
  Assert<
    [AdtMainTypeOfVariant<'onprem'>] extends [AdtSearchTypeOf<'onprem'>]
      ? true
      : false
  >,
  Assert<
    [AdtMainTypeOfVariant<'cloud'>] extends [AdtSearchTypeOf<'cloud'>]
      ? true
      : false
  >,
  Assert<
    [AdtMainTypeOfVariant<'basis740'>] extends [AdtSearchTypeOf<'basis740'>]
      ? true
      : false
  >,
];

export type SearchNamesRecorded = [
  Assert<
    Equal<
      AdtSearchTypeOf<'basis740'>,
      | 'DEVC'
      | 'CLAS'
      | 'INTF'
      | 'PROG'
      | 'FUGR'
      | 'FUNC'
      | 'DDLS'
      | 'MSAG'
      | 'TABL'
      | 'ENHO'
      | 'ENHS'
    >
  >,
  Assert<Equal<(typeof ADT_SEARCH_TYPES_ONPREM)['STRU']['type'], 'TABL/DS'>>,
  Assert<Equal<(typeof ADT_SEARCH_TYPES_ONPREM)['TABL']['type'], 'TABL'>>,
  Assert<Equal<(typeof ADT_SEARCH_TYPES_ONPREM)['HOTA']['group'], true>>,
  Assert<'STRU' extends AdtSearchType ? true : false>,
];

// The entry shape: a listed name has a code or is a group, and cites its own
// release's list.
const _listedNeither = {
  // @ts-expect-error a listed name selects a code or is a group
  ZZZZ: { evidence: 'search-types-s4-2025--objecttypes' },
} as const satisfies AdtSearchTypeTable<AdtListedSearchType<'s4-2025'>>;
void _listedNeither;
const _listedElsewhere = {
  ZZZZ: {
    type: 'ZZZZ',
    // @ts-expect-error another release's list
    evidence: 'search-types-abap-cloud--objecttypes',
  },
} as const satisfies AdtSearchTypeTable<AdtListedSearchType<'s4-2025'>>;
void _listedElsewhere;

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
