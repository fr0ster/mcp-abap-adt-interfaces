// Compile-only assertions. If these stop compiling, the types regressed.
//
// Two things are held here. The entry shape refuses a wrong field — a misspelt
// key, an operation outside the vocabulary, an API the client has no factory
// for, a release the corpus has no case for — so a table cannot say something
// its type does not mean. And the tables' projections are written out as the
// inventory recorded them: what each variant serves, per API, per code and per
// operation. A table edit that changes what a variant serves changes one of
// these, on purpose, in the same commit.

import type {
  ADT_TYPES_BASIS_740,
  ADT_TYPES_CLOUD,
  ADT_TYPES_ONPREM,
  AdtApi,
  AdtApiWith,
  AdtObjectKind,
  AdtParentedTypeCode,
  AdtSourceTypeCode,
  AdtTypeCode,
  AdtTypeCodeOf,
  AdtTypeCodeWith,
} from '../adt/AdtTypeTables';
import type { AdtApiTable, AdtCheckedTable } from '../adt/IAdtTypeTable';

type Assert<T extends true> = T;
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

// ── The entry shape refuses a wrong field ───────────────────────────────────

const _good = {
  class: {
    kind: 'class',
    collection: '/sap/bc/adt/oo/classes',
    codes: {
      'CLAS/OC': {
        main: 'CLAS',
        parent: null,
        nameMaxLength: 30,
        operations: ['read'],
        evidence: 'system-description-s4-2025--07-typestructure',
      },
    },
  },
} as const satisfies AdtApiTable<'s4-2025'>;
void _good;

const _misspeltField = {
  class: {
    kind: 'class',
    collection: '/sap/bc/adt/oo/classes',
    codes: {
      'CLAS/OC': {
        main: 'CLAS',
        parent: null,
        // @ts-expect-error the field is `nameMaxLength`
        nameMaxLen: 30,
        operations: ['read'],
        evidence: 'system-description-s4-2025--07-typestructure',
      },
    },
  },
} as const satisfies AdtApiTable<'s4-2025'>;
void _misspeltField;

const _unknownOperation = {
  class: {
    kind: 'class',
    collection: '/sap/bc/adt/oo/classes',
    codes: {
      'CLAS/OC': {
        main: 'CLAS',
        parent: null,
        nameMaxLength: 30,
        // @ts-expect-error `reed` is not an operation of the vocabulary
        operations: ['reed'],
        evidence: 'system-description-s4-2025--07-typestructure',
      },
    },
  },
} as const satisfies AdtApiTable<'s4-2025'>;
void _unknownOperation;

const _noOperation = {
  class: {
    kind: 'class',
    collection: '/sap/bc/adt/oo/classes',
    codes: {
      'CLAS/OC': {
        main: 'CLAS',
        parent: null,
        nameMaxLength: 30,
        // @ts-expect-error a code the library serves has at least one operation
        operations: [],
        evidence: 'system-description-s4-2025--07-typestructure',
      },
    },
  },
} as const satisfies AdtApiTable<'s4-2025'>;
void _noOperation;

const _unknownApi = {
  // @ts-expect-error the client has no `getView()` factory
  view: {
    kind: 'view',
    collection: '/sap/bc/adt/ddic/views',
    codes: {},
    parent: null,
    operations: ['read'],
    evidence: 'system-description-s4-2025--07-typestructure',
  },
} as const satisfies AdtApiTable<'s4-2025'>;
void _unknownApi;

const _otherRelease = {
  class: {
    kind: 'class',
    collection: '/sap/bc/adt/oo/classes',
    codes: {
      'CLAS/OC': {
        main: 'CLAS',
        parent: null,
        nameMaxLength: 30,
        operations: ['read'],
        // @ts-expect-error an on-premise table cites the on-premise case
        evidence: 'system-description-basis-740--07-typestructure',
      },
    },
  },
} as const satisfies AdtApiTable<'s4-2025'>;
void _otherRelease;

const _unknownParent = {
  functionModule: {
    kind: 'function_module',
    collection: '/sap/bc/adt/functions/groups',
    codes: {
      'FUGR/FF': {
        main: 'FUGR',
        // @ts-expect-error a parent is an API, by its factory name
        parent: 'FUGR/F',
        nameMaxLength: 30,
        operations: ['read'],
        evidence: 'system-description-s4-2025--07-typestructure',
      },
    },
  },
} as const satisfies AdtApiTable<'s4-2025'>;
void _unknownParent;

const _codedWithEntryOperations = {
  class: {
    kind: 'class',
    collection: '/sap/bc/adt/oo/classes',
    codes: {
      // A coded API states its operations per code: with operations on the
      // entry too, it reads as a codeless one, whose codes are none.
      // @ts-expect-error a codeless entry has no codes
      'CLAS/OC': {
        main: 'CLAS',
        parent: null,
        nameMaxLength: 30,
        operations: ['read'],
        evidence: 'system-description-s4-2025--07-typestructure',
      },
    },
    parent: null,
    operations: ['read'],
  },
} as const satisfies AdtApiTable<'s4-2025'>;
void _codedWithEntryOperations;

const _notACollection = {
  class: {
    kind: 'class',
    // @ts-expect-error a collection is an ADT path
    collection: 'oo/classes',
    codes: {
      'CLAS/OC': {
        main: 'CLAS',
        parent: null,
        nameMaxLength: 30,
        operations: ['read'],
        evidence: 'system-description-s4-2025--07-typestructure',
      },
    },
  },
} as const satisfies AdtApiTable<'s4-2025'>;
void _notACollection;

// A code's own collection is an ADT path too.
const _codeCollection = {
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
        // @ts-expect-error a code's collection is an ADT path
        collection: 'enhoxhh',
      },
    },
  },
} as const satisfies AdtApiTable<'s4-2025'>;
void _codeCollection;

// A codeless entry names its evidence: its parent's code's case, or the
// release's typestructure case for the transport request.
const _codelessWithoutEvidence = {
  // @ts-expect-error a codeless entry carries `evidence`
  localTestClass: {
    kind: 'local_test_class',
    collection: '/sap/bc/adt/oo/classes',
    codes: {},
    parent: 'class',
    operations: ['read'],
  },
} as const satisfies AdtApiTable<'s4-2025'>;
void _codelessWithoutEvidence;

const _codelessWithEvidence = {
  localTestClass: {
    kind: 'local_test_class',
    collection: '/sap/bc/adt/oo/classes',
    codes: {},
    parent: 'class',
    operations: ['read'],
    evidence: 'system-description-s4-2025--07-typestructure',
  },
} as const satisfies AdtApiTable<'s4-2025'>;
void _codelessWithEvidence;

// A coded entry names at least one code. `satisfies` cannot see an empty
// index signature, so `AdtCheckedTable` — what `IAdtTypeTables` takes every
// table as — refuses it.
const _codedWithoutCodes = {
  class: {
    kind: 'class',
    collection: '/sap/bc/adt/oo/classes',
    codes: {},
  },
} as const satisfies AdtApiTable<'s4-2025'>;
// @ts-expect-error a coded entry with no code
export type CodedWithoutCodes = AdtCheckedTable<typeof _codedWithoutCodes>;

export type CheckedTables = [
  AdtCheckedTable<typeof _good>,
  AdtCheckedTable<typeof _codelessWithEvidence>,
];

// ── Every parent is an API of its own table ─────────────────────────────────

type ParentsOf<T> = {
  [A in keyof T]: T[A] extends { readonly codes: infer C }
    ?
        | {
            [K in keyof C]: C[K] extends { readonly parent: infer P }
              ? P
              : never;
          }[keyof C]
        | (T[A] extends { readonly parent: infer P } ? P : never)
    : never;
}[keyof T];

export type ParentsResolve = [
  Assert<
    Equal<
      Exclude<
        ParentsOf<typeof ADT_TYPES_ONPREM>,
        keyof typeof ADT_TYPES_ONPREM | null
      >,
      never
    >
  >,
  Assert<
    Equal<
      Exclude<
        ParentsOf<typeof ADT_TYPES_CLOUD>,
        keyof typeof ADT_TYPES_CLOUD | null
      >,
      never
    >
  >,
  Assert<
    Equal<
      Exclude<
        ParentsOf<typeof ADT_TYPES_BASIS_740>,
        keyof typeof ADT_TYPES_BASIS_740 | null
      >,
      never
    >
  >,
];

// ── The projections, as the inventory recorded them ─────────────────────────

/** The APIs the two newer releases serve: every factory but `getUtils()`. */
type NewerApis =
  | 'class'
  | 'interface'
  | 'program'
  | 'include'
  | 'functionGroup'
  | 'functionModule'
  | 'functionInclude'
  | 'package'
  | 'ddl'
  | 'table'
  | 'structure'
  | 'appendStructure'
  | 'tableType'
  | 'domain'
  | 'dataElement'
  | 'accessControl'
  | 'behaviorDefinition'
  | 'behaviorImplementation'
  | 'metadataExtension'
  | 'serviceDefinition'
  | 'serviceBinding'
  | 'scalarFunction'
  | 'scalarFunctionImplementation'
  | 'transformation'
  | 'messageClass'
  | 'messageClassMessage'
  | 'featureToggle'
  | 'authorizationField'
  | 'enhancement'
  | 'localTestClass'
  | 'localTypes'
  | 'localDefinitions'
  | 'localMacros'
  | 'request';

/** What 7.40 serves: every other API is refused whole (`absentOnLegacy`). */
type Basis740Apis =
  | 'class'
  | 'interface'
  | 'program'
  | 'include'
  | 'functionGroup'
  | 'functionModule'
  | 'functionInclude'
  | 'ddl'
  | 'messageClass'
  | 'messageClassMessage'
  | 'localTestClass'
  | 'localTypes'
  | 'localDefinitions'
  | 'localMacros'
  | 'request';

type NewerCodes =
  | 'CLAS/OC'
  | 'INTF/OI'
  | 'PROG/P'
  | 'PROG/I'
  | 'FUGR/F'
  | 'FUGR/FF'
  | 'FUGR/I'
  | 'DEVC/K'
  | 'DDLS/DF'
  | 'TABL/DT'
  | 'TABL/DS'
  | 'TTYP/DA'
  | 'DOMA/DD'
  | 'DTEL/DE'
  | 'DCLS/DL'
  | 'BDEF/BDO'
  | 'DDLX/EX'
  | 'SRVD/SRV'
  | 'SRVB/SVB'
  | 'DSFD/SCF'
  | 'DSFI/SFI'
  | 'XSLT/VT'
  | 'MSAG/N'
  | 'MSAG/NN'
  | 'FTG2/FT'
  | 'AUTH'
  | 'ENHO/XHH'
  | 'ENHO/XHB'
  | 'ENHS/XSB';

type Basis740Codes =
  | 'CLAS/OC'
  | 'INTF/OI'
  | 'PROG/P'
  | 'PROG/I'
  | 'FUGR/F'
  | 'FUGR/FF'
  | 'FUGR/I'
  | 'DDLS/DF'
  | 'MSAG/N'
  | 'MSAG/NN';

export type Projections = [
  Assert<Equal<AdtApi<'onprem'>, NewerApis>>,
  Assert<Equal<AdtApi<'cloud'>, NewerApis>>,
  Assert<Equal<AdtApi<'basis740'>, Basis740Apis>>,
  Assert<Equal<AdtTypeCodeOf<'onprem'>, NewerCodes>>,
  Assert<Equal<AdtTypeCodeOf<'cloud'>, NewerCodes>>,
  Assert<Equal<AdtTypeCodeOf<'basis740'>, Basis740Codes>>,
  Assert<Equal<AdtTypeCode, NewerCodes>>,
  Assert<Equal<AdtParentedTypeCode, 'FUGR/FF' | 'FUGR/I'>>,
  Assert<
    Equal<
      AdtSourceTypeCode,
      | 'CLAS/OC'
      | 'INTF/OI'
      | 'PROG/P'
      | 'PROG/I'
      | 'FUGR/F'
      | 'FUGR/FF'
      | 'FUGR/I'
      | 'DDLS/DF'
      | 'TABL/DT'
      | 'TABL/DS'
      | 'DCLS/DL'
      | 'BDEF/BDO'
      | 'DDLX/EX'
      | 'SRVD/SRV'
      | 'DSFD/SCF'
      | 'DSFI/SFI'
      | 'XSLT/VT'
      | 'FTG2/FT'
      | 'ENHO/XHH'
    >
  >,
  Assert<
    Equal<
      AdtObjectKind,
      | 'class'
      | 'interface'
      | 'program'
      | 'include'
      | 'function_group'
      | 'function_module'
      | 'function_include'
      | 'package'
      | 'ddl'
      | 'table'
      | 'structure'
      | 'table_type'
      | 'domain'
      | 'data_element'
      | 'access_control'
      | 'behavior_definition'
      | 'metadata_extension'
      | 'service_definition'
      | 'service_binding'
      | 'scalar_function'
      | 'scalar_function_implementation'
      | 'transformation'
      | 'message_class'
      | 'message_class_message'
      | 'feature_toggle'
      | 'authorization_field'
      | 'enhancement'
      | 'local_test_class'
      | 'local_types'
      | 'local_definitions'
      | 'local_macros'
      | 'transport'
    >
  >,
];

// 7.40 refuses every deletion check and every transport read
// (`noDeletionCheck`, `noTransportResource`), and runs and profiles nothing.
export type Basis740Refusals = [
  Assert<Equal<AdtApiWith<'basis740', 'deletionCheck'>, never>>,
  Assert<Equal<AdtApiWith<'basis740', 'transport'>, never>>,
  Assert<Equal<AdtApiWith<'basis740', 'run'>, never>>,
  Assert<Equal<AdtApiWith<'basis740', 'profile'>, never>>,
  Assert<Equal<AdtApiWith<'basis740', 'checkCdsTestDoubles'>, never>>,
  Assert<
    Equal<
      AdtApiWith<'basis740', 'updateMetadata'>,
      'functionGroup' | 'functionInclude'
    >
  >,
  Assert<
    Equal<
      AdtApiWith<'basis740', 'create'>,
      Exclude<
        Basis740Apis,
        | 'localTestClass'
        | 'localTypes'
        | 'localDefinitions'
        | 'localMacros'
        | 'request'
      >
    >
  >,
  Assert<Equal<AdtApiWith<'basis740', 'list'>, 'request'>>,
  // `getVersions` is measured refused on a 7.40 DDL (`legacyMeasuredRefusal`).
  Assert<
    Equal<
      AdtTypeCodeWith<'basis740', 'versions'>,
      'CLAS/OC' | 'INTF/OI' | 'PROG/P' | 'FUGR/FF' | 'FUGR/I'
    >
  >,
  // A function include's deletion is refused on 7.40; a message class's
  // document write too.
  Assert<
    Equal<
      AdtTypeCodeWith<'basis740', 'delete'>,
      | 'CLAS/OC'
      | 'INTF/OI'
      | 'PROG/P'
      | 'PROG/I'
      | 'FUGR/F'
      | 'FUGR/FF'
      | 'DDLS/DF'
      | 'MSAG/N'
      | 'MSAG/NN'
    >
  >,
];

// The newer releases: what a code does not do is as recorded as what it does.
export type NewerShapes = [
  // Only these execute and profile; `EXECUTE` and `PROFILE` are listed for
  // `FUGR/FF` too, which the library does not run.
  Assert<Equal<AdtTypeCodeWith<'onprem', 'run'>, 'CLAS/OC' | 'PROG/P'>>,
  Assert<Equal<AdtTypeCodeWith<'onprem', 'profile'>, 'CLAS/OC' | 'PROG/P'>>,
  Assert<
    Equal<
      AdtTypeCodeWith<'onprem', 'unitTestStatus'>,
      'CLAS/OC' | 'PROG/P' | 'FUGR/F' | 'FUGR/FF'
    >
  >,
  // `getEnhancement()` reads source for `ENHO/XHH` alone: `read` and `update`
  // throw before any request for the other two.
  Assert<
    Equal<
      AdtTypeCodeWith<'onprem', 'read'>,
      Exclude<
        NewerCodes,
        | 'DEVC/K'
        | 'TTYP/DA'
        | 'DOMA/DD'
        | 'DTEL/DE'
        | 'MSAG/N'
        | 'AUTH'
        | 'ENHO/XHB'
        | 'ENHS/XSB'
      >
    >
  >,
  Assert<
    Equal<
      AdtTypeCodeWith<'onprem', 'readEnhancementElements'>,
      'CLAS/OC' | 'PROG/P' | 'PROG/I' | 'FUGR/F'
    >
  >,
  // A program include, a function include, an authorization field, a feature
  // toggle and the two message class APIs have no transport read.
  Assert<
    Equal<
      AdtTypeCodeWith<'onprem', 'transport'>,
      Exclude<
        NewerCodes,
        'PROG/I' | 'FUGR/I' | 'AUTH' | 'FTG2/FT' | 'MSAG/N' | 'MSAG/NN'
      >
    >
  >,
  Assert<Equal<AdtApiWith<'onprem', 'switchOn'>, 'featureToggle'>>,
  Assert<Equal<AdtApiWith<'onprem', 'getServiceGroup'>, 'serviceBinding'>>,
  Assert<Equal<AdtApiWith<'onprem', 'activateTestClasses'>, 'class'>>,
  Assert<Equal<AdtApiWith<'onprem', 'checkCdsTestDoubles'>, 'ddl'>>,
];

// An enhancement code lives in its own collection, not its API's.
type EnhancementCodes<T> = T extends {
  readonly enhancement: { readonly codes: infer C };
}
  ? {
      [K in keyof C]: C[K] extends { readonly collection: infer P } ? P : never;
    }
  : never;

export type EnhancementCollections = [
  Assert<
    Equal<
      EnhancementCodes<typeof ADT_TYPES_ONPREM>,
      {
        readonly 'ENHO/XHH': '/sap/bc/adt/enhancements/enhoxhh';
        readonly 'ENHO/XHB': '/sap/bc/adt/enhancements/enhoxhb';
        readonly 'ENHS/XSB': '/sap/bc/adt/enhancements/enhsxsb';
      }
    >
  >,
  Assert<
    Equal<
      EnhancementCodes<typeof ADT_TYPES_CLOUD>,
      {
        readonly 'ENHO/XHH': '/sap/bc/adt/enhancements/enhoxhh';
        readonly 'ENHO/XHB': '/sap/bc/adt/enhancements/enhoxhb';
        readonly 'ENHS/XSB': '/sap/bc/adt/enhancements/enhsxsb';
      }
    >
  >,
];

// The two newer releases differ in a name length, not in what is served.
export type ServiceDefinitionLength = [
  Assert<
    Equal<
      (typeof ADT_TYPES_ONPREM)['serviceDefinition']['codes']['SRVD/SRV']['nameMaxLength'],
      40
    >
  >,
  Assert<
    Equal<
      (typeof ADT_TYPES_CLOUD)['serviceDefinition']['codes']['SRVD/SRV']['nameMaxLength'],
      30
    >
  >,
];
