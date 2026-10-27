// Compile-only assertions. If these stop compiling, the types regressed.
//
// The tables, recorded cell for cell: for every variant, every API, every code
// — its parent and its exact set of operations — as the I0 inventory records
// what the library serves. The equality is exact, so adding or removing one
// operation, or changing one parent, in a table fails here: the edit has to
// be made twice, on purpose. Cloud is asserted equal to on-premise except for
// one name length (`SRVD/SRV`). Name lengths and collections are not recorded
// here: the conformance check in `@mcp-abap-adt/adt-clients` holds them to the
// releases' recorded answers.

import type {
  ADT_TYPES_BASIS_740,
  ADT_TYPES_CLOUD,
  ADT_TYPES_ONPREM,
  AdtApiWithIn,
} from '../adt/AdtTypeTables';
import type { AdtOperations } from '../adt/IAdtTypeTable';

type Assert<T extends true> = T;
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

type OperationsOf<F> = F extends {
  readonly operations: readonly (infer O)[];
}
  ? O
  : never;

/** API → code → `{ parent, operations }`; a codeless API → its entry's. */
type Recorded<T> = {
  -readonly [A in keyof T]: T[A] extends {
    readonly operations: AdtOperations;
    readonly parent: infer P;
  }
    ? { parent: P; operations: OperationsOf<T[A]> }
    : T[A] extends { readonly codes: infer C }
      ? {
          -readonly [K in keyof C]: {
            parent: C[K] extends { readonly parent: infer P } ? P : never;
            operations: OperationsOf<C[K]>;
          };
        }
      : never;
};

/** A table with the named fields removed at every depth. */
type Without<T, F extends PropertyKey> = T extends readonly unknown[]
  ? T
  : T extends object
    ? { -readonly [K in keyof T as K extends F ? never : K]: Without<T[K], F> }
    : T;

type RecordedNewer = {
  class: {
    'CLAS/OC': {
      parent: null;
      operations:
        | 'create'
        | 'read'
        | 'source'
        | 'readMetadata'
        | 'update'
        | 'lock'
        | 'unlock'
        | 'activate'
        | 'check'
        | 'validate'
        | 'versions'
        | 'deletionCheck'
        | 'delete'
        | 'transport'
        | 'readEnhancementElements'
        | 'readEnhancementOptions'
        | 'activateTestClasses'
        | 'run'
        | 'profile'
        | 'unitTestRun'
        | 'unitTestRunSync'
        | 'unitTestStatus'
        | 'unitTestResult';
    };
  };
  interface: {
    'INTF/OI': {
      parent: null;
      operations:
        | 'create'
        | 'read'
        | 'source'
        | 'readMetadata'
        | 'update'
        | 'lock'
        | 'unlock'
        | 'activate'
        | 'check'
        | 'validate'
        | 'versions'
        | 'deletionCheck'
        | 'delete'
        | 'transport';
    };
  };
  program: {
    'PROG/P': {
      parent: null;
      operations:
        | 'create'
        | 'read'
        | 'source'
        | 'readMetadata'
        | 'update'
        | 'lock'
        | 'unlock'
        | 'activate'
        | 'check'
        | 'validate'
        | 'versions'
        | 'deletionCheck'
        | 'delete'
        | 'transport'
        | 'readEnhancementElements'
        | 'readEnhancementOptions'
        | 'run'
        | 'profile'
        | 'unitTestRun'
        | 'unitTestRunSync'
        | 'unitTestStatus'
        | 'unitTestResult';
    };
  };
  include: {
    'PROG/I': {
      parent: null;
      operations:
        | 'create'
        | 'read'
        | 'source'
        | 'readMetadata'
        | 'update'
        | 'lock'
        | 'unlock'
        | 'activate'
        | 'validate'
        | 'deletionCheck'
        | 'delete'
        | 'readEnhancementElements'
        | 'readEnhancementOptions';
    };
  };
  functionGroup: {
    'FUGR/F': {
      parent: null;
      operations:
        | 'create'
        | 'readMetadata'
        | 'updateMetadata'
        | 'lock'
        | 'unlock'
        | 'activate'
        | 'check'
        | 'validate'
        | 'deletionCheck'
        | 'delete'
        | 'transport'
        | 'readEnhancementElements'
        | 'readEnhancementOptions'
        | 'unitTestRun'
        | 'unitTestRunSync'
        | 'unitTestStatus'
        | 'unitTestResult';
    };
  };
  functionModule: {
    'FUGR/FF': {
      parent: 'functionGroup';
      operations:
        | 'create'
        | 'read'
        | 'source'
        | 'readMetadata'
        | 'update'
        | 'lock'
        | 'unlock'
        | 'activate'
        | 'check'
        | 'validate'
        | 'versions'
        | 'deletionCheck'
        | 'delete'
        | 'transport'
        | 'unitTestRun'
        | 'unitTestRunSync'
        | 'unitTestStatus'
        | 'unitTestResult';
    };
  };
  functionInclude: {
    'FUGR/I': {
      parent: 'functionGroup';
      operations:
        | 'create'
        | 'read'
        | 'source'
        | 'readMetadata'
        | 'update'
        | 'updateMetadata'
        | 'lock'
        | 'unlock'
        | 'activate'
        | 'check'
        | 'validate'
        | 'versions'
        | 'deletionCheck'
        | 'delete';
    };
  };
  package: {
    'DEVC/K': {
      parent: null;
      operations:
        | 'create'
        | 'readMetadata'
        | 'updateMetadata'
        | 'lock'
        | 'unlock'
        | 'check'
        | 'validate'
        | 'deletionCheck'
        | 'delete'
        | 'transport';
    };
  };
  ddl: {
    'DDLS/DF': {
      parent: null;
      operations:
        | 'create'
        | 'read'
        | 'source'
        | 'readMetadata'
        | 'update'
        | 'lock'
        | 'unlock'
        | 'activate'
        | 'check'
        | 'validate'
        | 'versions'
        | 'deletionCheck'
        | 'delete'
        | 'transport'
        | 'checkCdsTestDoubles';
    };
  };
  table: {
    'TABL/DT': {
      parent: null;
      operations:
        | 'create'
        | 'read'
        | 'source'
        | 'readMetadata'
        | 'update'
        | 'lock'
        | 'unlock'
        | 'activate'
        | 'check'
        | 'validate'
        | 'versions'
        | 'deletionCheck'
        | 'delete'
        | 'transport';
    };
  };
  structure: {
    'TABL/DS': {
      parent: null;
      operations:
        | 'create'
        | 'read'
        | 'source'
        | 'readMetadata'
        | 'update'
        | 'lock'
        | 'unlock'
        | 'activate'
        | 'check'
        | 'validate'
        | 'versions'
        | 'deletionCheck'
        | 'delete'
        | 'transport';
    };
  };
  appendStructure: {
    'TABL/DS': {
      parent: null;
      operations:
        | 'create'
        | 'read'
        | 'source'
        | 'readMetadata'
        | 'update'
        | 'lock'
        | 'unlock'
        | 'activate'
        | 'check'
        | 'validate'
        | 'versions'
        | 'deletionCheck'
        | 'delete'
        | 'transport';
    };
  };
  tableType: {
    'TTYP/DA': {
      parent: null;
      operations:
        | 'create'
        | 'readMetadata'
        | 'updateMetadata'
        | 'lock'
        | 'unlock'
        | 'activate'
        | 'check'
        | 'validate'
        | 'versions'
        | 'deletionCheck'
        | 'delete'
        | 'transport';
    };
  };
  domain: {
    'DOMA/DD': {
      parent: null;
      operations:
        | 'create'
        | 'readMetadata'
        | 'updateMetadata'
        | 'lock'
        | 'unlock'
        | 'activate'
        | 'check'
        | 'validate'
        | 'deletionCheck'
        | 'delete'
        | 'transport';
    };
  };
  dataElement: {
    'DTEL/DE': {
      parent: null;
      operations:
        | 'create'
        | 'readMetadata'
        | 'updateMetadata'
        | 'lock'
        | 'unlock'
        | 'activate'
        | 'check'
        | 'validate'
        | 'deletionCheck'
        | 'delete'
        | 'transport';
    };
  };
  accessControl: {
    'DCLS/DL': {
      parent: null;
      operations:
        | 'create'
        | 'read'
        | 'source'
        | 'readMetadata'
        | 'update'
        | 'lock'
        | 'unlock'
        | 'activate'
        | 'check'
        | 'validate'
        | 'versions'
        | 'deletionCheck'
        | 'delete'
        | 'transport';
    };
  };
  behaviorDefinition: {
    'BDEF/BDO': {
      parent: null;
      operations:
        | 'create'
        | 'read'
        | 'source'
        | 'readMetadata'
        | 'update'
        | 'lock'
        | 'unlock'
        | 'activate'
        | 'check'
        | 'validate'
        | 'versions'
        | 'deletionCheck'
        | 'delete'
        | 'transport';
    };
  };
  behaviorImplementation: {
    'CLAS/OC': {
      parent: null;
      operations:
        | 'create'
        | 'read'
        | 'source'
        | 'readMetadata'
        | 'update'
        | 'lock'
        | 'unlock'
        | 'activate'
        | 'check'
        | 'validate'
        | 'versions'
        | 'deletionCheck'
        | 'delete'
        | 'transport';
    };
  };
  metadataExtension: {
    'DDLX/EX': {
      parent: null;
      operations:
        | 'create'
        | 'read'
        | 'source'
        | 'readMetadata'
        | 'update'
        | 'lock'
        | 'unlock'
        | 'activate'
        | 'check'
        | 'validate'
        | 'versions'
        | 'deletionCheck'
        | 'delete'
        | 'transport';
    };
  };
  serviceDefinition: {
    'SRVD/SRV': {
      parent: null;
      operations:
        | 'create'
        | 'read'
        | 'source'
        | 'readMetadata'
        | 'update'
        | 'lock'
        | 'unlock'
        | 'activate'
        | 'check'
        | 'validate'
        | 'versions'
        | 'deletionCheck'
        | 'delete'
        | 'transport';
    };
  };
  serviceBinding: {
    'SRVB/SVB': {
      parent: null;
      operations:
        | 'create'
        | 'read'
        | 'readMetadata'
        | 'update'
        | 'lock'
        | 'unlock'
        | 'activate'
        | 'check'
        | 'validate'
        | 'deletionCheck'
        | 'delete'
        | 'transport'
        | 'getServiceBindingTypes'
        | 'getServiceGroup';
    };
  };
  scalarFunction: {
    'DSFD/SCF': {
      parent: null;
      operations:
        | 'create'
        | 'read'
        | 'source'
        | 'readMetadata'
        | 'update'
        | 'lock'
        | 'unlock'
        | 'activate'
        | 'check'
        | 'validate'
        | 'versions'
        | 'deletionCheck'
        | 'delete'
        | 'transport';
    };
  };
  scalarFunctionImplementation: {
    'DSFI/SFI': {
      parent: null;
      operations:
        | 'create'
        | 'read'
        | 'source'
        | 'readMetadata'
        | 'update'
        | 'updateMetadata'
        | 'lock'
        | 'unlock'
        | 'activate'
        | 'check'
        | 'validate'
        | 'versions'
        | 'deletionCheck'
        | 'delete'
        | 'transport';
    };
  };
  transformation: {
    'XSLT/VT': {
      parent: null;
      operations:
        | 'create'
        | 'read'
        | 'source'
        | 'readMetadata'
        | 'update'
        | 'lock'
        | 'unlock'
        | 'activate'
        | 'check'
        | 'validate'
        | 'versions'
        | 'deletionCheck'
        | 'delete'
        | 'transport';
    };
  };
  messageClass: {
    'MSAG/N': {
      parent: null;
      operations:
        | 'create'
        | 'readMetadata'
        | 'updateMetadata'
        | 'lock'
        | 'unlock'
        | 'validate'
        | 'deletionCheck'
        | 'delete';
    };
  };
  messageClassMessage: {
    'MSAG/NN': {
      parent: null;
      operations: 'create' | 'read' | 'readMetadata' | 'update' | 'delete';
    };
  };
  featureToggle: {
    'FTG2/FT': {
      parent: null;
      operations:
        | 'create'
        | 'read'
        | 'source'
        | 'readMetadata'
        | 'update'
        | 'updateMetadata'
        | 'lock'
        | 'unlock'
        | 'activate'
        | 'check'
        | 'validate'
        | 'deletionCheck'
        | 'delete'
        | 'switchOn'
        | 'switchOff'
        | 'getRuntimeState'
        | 'checkState';
    };
  };
  authorizationField: {
    AUTH: {
      parent: null;
      operations:
        | 'create'
        | 'readMetadata'
        | 'updateMetadata'
        | 'lock'
        | 'unlock'
        | 'activate'
        | 'check'
        | 'validate'
        | 'deletionCheck'
        | 'delete';
    };
  };
  enhancement: {
    'ENHO/XHH': {
      parent: null;
      operations:
        | 'create'
        | 'read'
        | 'source'
        | 'readMetadata'
        | 'update'
        | 'updateMetadata'
        | 'lock'
        | 'unlock'
        | 'activate'
        | 'check'
        | 'validate'
        | 'versions'
        | 'deletionCheck'
        | 'delete'
        | 'transport';
    };
    'ENHO/XHB': {
      parent: null;
      operations:
        | 'create'
        | 'readMetadata'
        | 'updateMetadata'
        | 'lock'
        | 'unlock'
        | 'activate'
        | 'check'
        | 'validate'
        | 'versions'
        | 'deletionCheck'
        | 'delete'
        | 'transport';
    };
    'ENHS/XSB': {
      parent: null;
      operations:
        | 'create'
        | 'readMetadata'
        | 'updateMetadata'
        | 'lock'
        | 'unlock'
        | 'activate'
        | 'check'
        | 'validate'
        | 'versions'
        | 'deletionCheck'
        | 'delete'
        | 'transport';
    };
  };
  localTestClass: {
    parent: 'class';
    operations:
      | 'read'
      | 'source'
      | 'readMetadata'
      | 'update'
      | 'lock'
      | 'unlock'
      | 'activate'
      | 'check'
      | 'validate'
      | 'versions'
      | 'delete'
      | 'transport';
  };
  localTypes: {
    parent: 'class';
    operations:
      | 'read'
      | 'source'
      | 'readMetadata'
      | 'update'
      | 'lock'
      | 'unlock'
      | 'activate'
      | 'check'
      | 'validate'
      | 'versions'
      | 'delete'
      | 'transport';
  };
  localDefinitions: {
    parent: 'class';
    operations:
      | 'read'
      | 'source'
      | 'readMetadata'
      | 'update'
      | 'lock'
      | 'unlock'
      | 'activate'
      | 'check'
      | 'validate'
      | 'versions'
      | 'delete'
      | 'transport';
  };
  localMacros: {
    parent: 'class';
    operations:
      | 'read'
      | 'source'
      | 'readMetadata'
      | 'update'
      | 'lock'
      | 'unlock'
      | 'activate'
      | 'check'
      | 'validate'
      | 'versions'
      | 'delete'
      | 'transport';
  };
  request: {
    parent: null;
    operations:
      | 'create'
      | 'readMetadata'
      | 'updateMetadata'
      | 'deletionCheck'
      | 'delete'
      | 'list'
      | 'searchConfigurations'
      | 'readObjects'
      | 'readActionLog'
      | 'addObject'
      | 'removeObject'
      | 'moveObjects'
      | 'sortAndCompress'
      | 'createTask'
      | 'changeTaskType';
  };
};

type RecordedBasis740 = {
  class: {
    'CLAS/OC': {
      parent: null;
      operations:
        | 'create'
        | 'read'
        | 'source'
        | 'readMetadata'
        | 'update'
        | 'lock'
        | 'unlock'
        | 'activate'
        | 'check'
        | 'validate'
        | 'versions'
        | 'delete'
        | 'readEnhancementElements'
        | 'readEnhancementOptions'
        | 'activateTestClasses'
        | 'unitTestRun'
        | 'unitTestRunSync';
    };
  };
  interface: {
    'INTF/OI': {
      parent: null;
      operations:
        | 'create'
        | 'read'
        | 'source'
        | 'readMetadata'
        | 'update'
        | 'lock'
        | 'unlock'
        | 'activate'
        | 'check'
        | 'validate'
        | 'versions'
        | 'delete';
    };
  };
  program: {
    'PROG/P': {
      parent: null;
      operations:
        | 'create'
        | 'read'
        | 'source'
        | 'readMetadata'
        | 'update'
        | 'lock'
        | 'unlock'
        | 'activate'
        | 'check'
        | 'validate'
        | 'versions'
        | 'delete'
        | 'readEnhancementElements'
        | 'readEnhancementOptions'
        | 'unitTestRun'
        | 'unitTestRunSync';
    };
  };
  include: {
    'PROG/I': {
      parent: null;
      operations:
        | 'create'
        | 'read'
        | 'source'
        | 'readMetadata'
        | 'update'
        | 'lock'
        | 'unlock'
        | 'activate'
        | 'validate'
        | 'delete'
        | 'readEnhancementElements'
        | 'readEnhancementOptions';
    };
  };
  functionGroup: {
    'FUGR/F': {
      parent: null;
      operations:
        | 'create'
        | 'readMetadata'
        | 'updateMetadata'
        | 'lock'
        | 'unlock'
        | 'activate'
        | 'check'
        | 'validate'
        | 'delete'
        | 'readEnhancementElements'
        | 'readEnhancementOptions'
        | 'unitTestRun'
        | 'unitTestRunSync';
    };
  };
  functionModule: {
    'FUGR/FF': {
      parent: 'functionGroup';
      operations:
        | 'create'
        | 'read'
        | 'source'
        | 'readMetadata'
        | 'update'
        | 'lock'
        | 'unlock'
        | 'activate'
        | 'check'
        | 'validate'
        | 'versions'
        | 'delete'
        | 'unitTestRunSync';
    };
  };
  functionInclude: {
    'FUGR/I': {
      parent: 'functionGroup';
      operations:
        | 'create'
        | 'read'
        | 'source'
        | 'readMetadata'
        | 'update'
        | 'updateMetadata'
        | 'lock'
        | 'unlock'
        | 'activate'
        | 'check'
        | 'validate'
        | 'versions';
    };
  };
  ddl: {
    'DDLS/DF': {
      parent: null;
      operations:
        | 'create'
        | 'read'
        | 'source'
        | 'readMetadata'
        | 'update'
        | 'lock'
        | 'unlock'
        | 'activate'
        | 'check'
        | 'validate'
        | 'delete';
    };
  };
  messageClass: {
    'MSAG/N': {
      parent: null;
      operations:
        | 'create'
        | 'readMetadata'
        | 'lock'
        | 'unlock'
        | 'validate'
        | 'delete';
    };
  };
  messageClassMessage: {
    'MSAG/NN': {
      parent: null;
      operations: 'create' | 'read' | 'readMetadata' | 'update' | 'delete';
    };
  };
  localTestClass: {
    parent: 'class';
    operations:
      | 'read'
      | 'source'
      | 'readMetadata'
      | 'update'
      | 'lock'
      | 'unlock'
      | 'activate'
      | 'check'
      | 'validate'
      | 'versions'
      | 'delete';
  };
  localTypes: {
    parent: 'class';
    operations:
      | 'read'
      | 'source'
      | 'readMetadata'
      | 'update'
      | 'lock'
      | 'unlock'
      | 'activate'
      | 'check'
      | 'validate'
      | 'versions'
      | 'delete';
  };
  localDefinitions: {
    parent: 'class';
    operations:
      | 'read'
      | 'source'
      | 'readMetadata'
      | 'update'
      | 'lock'
      | 'unlock'
      | 'activate'
      | 'check'
      | 'validate'
      | 'versions'
      | 'delete';
  };
  localMacros: {
    parent: 'class';
    operations:
      | 'read'
      | 'source'
      | 'readMetadata'
      | 'update'
      | 'lock'
      | 'unlock'
      | 'activate'
      | 'check'
      | 'validate'
      | 'versions'
      | 'delete';
  };
  request: {
    parent: null;
    operations: 'readMetadata' | 'list';
  };
};

export type RecordedTables = [
  Assert<Equal<Recorded<typeof ADT_TYPES_ONPREM>, RecordedNewer>>,
  Assert<Equal<Recorded<typeof ADT_TYPES_CLOUD>, RecordedNewer>>,
  Assert<Equal<Recorded<typeof ADT_TYPES_BASIS_740>, RecordedBasis740>>,
];

// Cloud is on-premise but for the evidence it cites and one name length.
export type CloudIsOnPremise = [
  Assert<
    Equal<
      Without<typeof ADT_TYPES_CLOUD, 'evidence' | 'nameMaxLength'>,
      Without<typeof ADT_TYPES_ONPREM, 'evidence' | 'nameMaxLength'>
    >
  >,
  Assert<
    Equal<
      Omit<Without<typeof ADT_TYPES_CLOUD, 'evidence'>, 'serviceDefinition'>,
      Omit<Without<typeof ADT_TYPES_ONPREM, 'evidence'>, 'serviceDefinition'>
    >
  >,
];

// `AdtApiWithIn` asks one code for every operation: spread across two codes,
// they do not make the API qualify.
type Spread = {
  readonly enhancement: {
    readonly kind: 'enhancement';
    readonly collection: '/sap/bc/adt/enhancements';
    readonly codes: {
      readonly 'ENHO/XHH': {
        readonly parent: null;
        readonly nameMaxLength: 30;
        readonly operations: readonly ['read'];
        readonly evidence: 'system-description-s4-2025--07-typestructure';
      };
      readonly 'ENHO/XHB': {
        readonly parent: null;
        readonly nameMaxLength: 30;
        readonly operations: readonly ['delete'];
        readonly evidence: 'system-description-s4-2025--07-typestructure';
      };
    };
  };
};

export type OneCodeHasAll = [
  Assert<Equal<AdtApiWithIn<Spread, 'read'>, 'enhancement'>>,
  Assert<Equal<AdtApiWithIn<Spread, 'delete'>, 'enhancement'>>,
  Assert<Equal<AdtApiWithIn<Spread, 'read' | 'delete'>, never>>,
];
