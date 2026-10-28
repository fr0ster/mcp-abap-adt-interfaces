/**
 * The ADT object types the library serves, one table per release variant.
 *
 * **The library's declaration, written by hand.** Each table names the APIs —
 * the client's factories — the library offers on that release, and for each
 * API its kind, its collection and its codes; for each code, its parent, the
 * longest name accepted, the operations performed there and the corpus case
 * that lists the code on the release. The compiler holds code to these tables;
 * the conformance check in `@mcp-abap-adt/adt-clients` holds the tables to the
 * releases' recorded `typestructure` and `discovery` answers.
 *
 * **What is not here is not served.** A code no release lists (`INTF/IF`,
 * `STRU/DT`, `TTYP/DF`, `DOMA/DM`, `BDEF/BD`, `FUGR/FC`, bare `FUNC`, …) is
 * in no table, so it is no {@link AdtTypeCode}. An API whose every member a
 * variant refuses is absent from that variant's table.
 *
 * Constants and types only: the tables are `as const` and `satisfies` the
 * entry shape of `IAdtTypeTable.ts`, and everything below them is derived.
 */

import type {
  AdtApiName,
  AdtApiTable,
  AdtCheckedTable,
  AdtOperation,
  IAdtCodelessApiEntry,
} from './IAdtTypeTable';

/**
 * What the library serves on **S/4HANA 2025 on-premise**, API by API.
 *
 * The library has no on-premise or cloud branch; the two tables differ where
 * the releases do — `SRVD/SRV` takes 40 characters here and 30 on ABAP
 * cloud, and a program or an include is created, changed and run only here.
 */
export const ADT_TYPES_ONPREM = {
  class: {
    kind: 'class',
    collection: '/sap/bc/adt/oo/classes',
    codes: {
      'CLAS/OC': {
        parent: null,
        nameMaxLength: 30,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'updateMetadata',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'deletionCheck',
          'delete',
          'transport',
          'readEnhancementElements',
          'readEnhancementOptions',
          'activateTestClasses',
          'run',
          'profile',
          'unitTestRun',
          'unitTestRunSync',
          'unitTestStatus',
          'unitTestResult',
        ],
        evidence: 'system-description-s4-2025--07-typestructure',
      },
    },
  },
  interface: {
    kind: 'interface',
    collection: '/sap/bc/adt/oo/interfaces',
    codes: {
      'INTF/OI': {
        parent: null,
        nameMaxLength: 30,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'updateMetadata',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'deletionCheck',
          'delete',
          'transport',
        ],
        evidence: 'system-description-s4-2025--07-typestructure',
      },
    },
  },
  program: {
    kind: 'program',
    collection: '/sap/bc/adt/programs/programs',
    codes: {
      'PROG/P': {
        parent: null,
        nameMaxLength: 40,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'updateMetadata',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'deletionCheck',
          'delete',
          'transport',
          'readEnhancementElements',
          'readEnhancementOptions',
          'run',
          'profile',
          'unitTestRun',
          'unitTestRunSync',
          'unitTestStatus',
          'unitTestResult',
        ],
        evidence: 'system-description-s4-2025--07-typestructure',
      },
    },
  },
  include: {
    kind: 'include',
    collection: '/sap/bc/adt/programs/includes',
    codes: {
      'PROG/I': {
        parent: null,
        nameMaxLength: 40,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'lock',
          'unlock',
          'activate',
          'validate',
          'deletionCheck',
          'delete',
          'readEnhancementElements',
          'readEnhancementOptions',
        ],
        evidence: 'system-description-s4-2025--07-typestructure',
      },
    },
  },
  functionGroup: {
    kind: 'function_group',
    collection: '/sap/bc/adt/functions/groups',
    codes: {
      'FUGR/F': {
        parent: null,
        nameMaxLength: 26,
        operations: [
          'create',
          'readMetadata',
          'updateMetadata',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'deletionCheck',
          'delete',
          'transport',
          'readEnhancementElements',
          'readEnhancementOptions',
          'unitTestRun',
          'unitTestRunSync',
          'unitTestStatus',
          'unitTestResult',
        ],
        evidence: 'system-description-s4-2025--07-typestructure',
      },
    },
  },
  functionModule: {
    kind: 'function_module',
    collection: '/sap/bc/adt/functions/groups',
    codes: {
      'FUGR/FF': {
        parent: 'functionGroup',
        nameMaxLength: 30,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'updateMetadata',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'deletionCheck',
          'delete',
          'transport',
          'unitTestRun',
          'unitTestRunSync',
          'unitTestStatus',
          'unitTestResult',
        ],
        evidence: 'system-description-s4-2025--07-typestructure',
      },
    },
  },
  functionInclude: {
    kind: 'function_include',
    collection: '/sap/bc/adt/functions/groups',
    codes: {
      'FUGR/I': {
        parent: 'functionGroup',
        nameMaxLength: 30,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'updateMetadata',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'deletionCheck',
          'delete',
        ],
        evidence: 'system-description-s4-2025--07-typestructure',
      },
    },
  },
  package: {
    kind: 'package',
    collection: '/sap/bc/adt/packages',
    codes: {
      'DEVC/K': {
        parent: null,
        nameMaxLength: 30,
        operations: [
          'create',
          'readMetadata',
          'updateMetadata',
          'lock',
          'unlock',
          'check',
          'validate',
          'deletionCheck',
          'delete',
          'transport',
        ],
        evidence: 'system-description-s4-2025--07-typestructure',
      },
    },
  },
  ddl: {
    kind: 'ddl',
    collection: '/sap/bc/adt/ddic/ddl/sources',
    codes: {
      'DDLS/DF': {
        parent: null,
        nameMaxLength: 30,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'updateMetadata',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'deletionCheck',
          'delete',
          'transport',
          'checkCdsTestDoubles',
        ],
        evidence: 'system-description-s4-2025--07-typestructure',
      },
    },
  },
  table: {
    kind: 'table',
    collection: '/sap/bc/adt/ddic/tables',
    codes: {
      'TABL/DT': {
        parent: null,
        nameMaxLength: 16,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'deletionCheck',
          'delete',
          'transport',
        ],
        evidence: 'system-description-s4-2025--07-typestructure',
      },
    },
  },
  structure: {
    kind: 'structure',
    collection: '/sap/bc/adt/ddic/structures',
    codes: {
      'TABL/DS': {
        parent: null,
        nameMaxLength: 30,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'deletionCheck',
          'delete',
          'transport',
        ],
        evidence: 'system-description-s4-2025--07-typestructure',
      },
    },
  },
  appendStructure: {
    kind: 'structure',
    collection: '/sap/bc/adt/ddic/structures',
    codes: {
      'TABL/DS': {
        parent: null,
        nameMaxLength: 30,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'deletionCheck',
          'delete',
          'transport',
        ],
        evidence: 'system-description-s4-2025--07-typestructure',
      },
    },
  },
  tableType: {
    kind: 'table_type',
    collection: '/sap/bc/adt/ddic/tabletypes',
    codes: {
      'TTYP/DA': {
        parent: null,
        nameMaxLength: 30,
        operations: [
          'create',
          'readMetadata',
          'updateMetadata',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'deletionCheck',
          'delete',
          'transport',
        ],
        evidence: 'system-description-s4-2025--07-typestructure',
      },
    },
  },
  domain: {
    kind: 'domain',
    collection: '/sap/bc/adt/ddic/domains',
    codes: {
      'DOMA/DD': {
        parent: null,
        nameMaxLength: 30,
        operations: [
          'create',
          'readMetadata',
          'updateMetadata',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'deletionCheck',
          'delete',
          'transport',
        ],
        evidence: 'system-description-s4-2025--07-typestructure',
      },
    },
  },
  dataElement: {
    kind: 'data_element',
    collection: '/sap/bc/adt/ddic/dataelements',
    codes: {
      'DTEL/DE': {
        parent: null,
        nameMaxLength: 30,
        operations: [
          'create',
          'readMetadata',
          'updateMetadata',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'deletionCheck',
          'delete',
          'transport',
        ],
        evidence: 'system-description-s4-2025--07-typestructure',
      },
    },
  },
  accessControl: {
    kind: 'access_control',
    collection: '/sap/bc/adt/acm/dcl/sources',
    codes: {
      'DCLS/DL': {
        parent: null,
        nameMaxLength: 30,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'deletionCheck',
          'delete',
          'transport',
        ],
        evidence: 'system-description-s4-2025--07-typestructure',
      },
    },
  },
  behaviorDefinition: {
    kind: 'behavior_definition',
    collection: '/sap/bc/adt/bo/behaviordefinitions',
    codes: {
      'BDEF/BDO': {
        parent: null,
        nameMaxLength: 30,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'deletionCheck',
          'delete',
          'transport',
        ],
        evidence: 'system-description-s4-2025--07-typestructure',
      },
    },
  },
  behaviorImplementation: {
    kind: 'class',
    collection: '/sap/bc/adt/oo/classes',
    codes: {
      'CLAS/OC': {
        parent: null,
        nameMaxLength: 30,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'deletionCheck',
          'delete',
          'transport',
        ],
        evidence: 'system-description-s4-2025--07-typestructure',
      },
    },
  },
  metadataExtension: {
    kind: 'metadata_extension',
    collection: '/sap/bc/adt/ddic/ddlx/sources',
    codes: {
      'DDLX/EX': {
        parent: null,
        nameMaxLength: 40,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'deletionCheck',
          'delete',
          'transport',
        ],
        evidence: 'system-description-s4-2025--07-typestructure',
      },
    },
  },
  serviceDefinition: {
    kind: 'service_definition',
    collection: '/sap/bc/adt/ddic/srvd/sources',
    codes: {
      'SRVD/SRV': {
        parent: null,
        nameMaxLength: 40,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'deletionCheck',
          'delete',
          'transport',
        ],
        evidence: 'system-description-s4-2025--07-typestructure',
      },
    },
  },
  serviceBinding: {
    kind: 'service_binding',
    collection: '/sap/bc/adt/businessservices/bindings',
    codes: {
      'SRVB/SVB': {
        parent: null,
        nameMaxLength: 40,
        operations: [
          'create',
          'read',
          'readMetadata',
          'update',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'deletionCheck',
          'delete',
          'transport',
          'getServiceBindingTypes',
          'getServiceGroup',
        ],
        evidence: 'system-description-s4-2025--07-typestructure',
      },
    },
  },
  scalarFunction: {
    kind: 'scalar_function',
    collection: '/sap/bc/adt/ddic/dsfd/sources',
    codes: {
      'DSFD/SCF': {
        parent: null,
        nameMaxLength: 26,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'deletionCheck',
          'delete',
          'transport',
        ],
        evidence: 'system-description-s4-2025--07-typestructure',
      },
    },
  },
  scalarFunctionImplementation: {
    kind: 'scalar_function_implementation',
    collection: '/sap/bc/adt/ddic/dsfi',
    codes: {
      'DSFI/SFI': {
        parent: null,
        nameMaxLength: 40,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'updateMetadata',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'deletionCheck',
          'delete',
          'transport',
        ],
        evidence: 'system-description-s4-2025--07-typestructure',
      },
    },
  },
  transformation: {
    kind: 'transformation',
    collection: '/sap/bc/adt/xslt/transformations',
    codes: {
      'XSLT/VT': {
        parent: null,
        nameMaxLength: 30,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'deletionCheck',
          'delete',
          'transport',
        ],
        evidence: 'system-description-s4-2025--07-typestructure',
      },
    },
  },
  messageClass: {
    kind: 'message_class',
    collection: '/sap/bc/adt/messageclass',
    codes: {
      'MSAG/N': {
        parent: null,
        nameMaxLength: 20,
        operations: [
          'create',
          'readMetadata',
          'updateMetadata',
          'lock',
          'unlock',
          'validate',
          'deletionCheck',
          'delete',
        ],
        evidence: 'system-description-s4-2025--07-typestructure',
      },
    },
  },
  messageClassMessage: {
    kind: 'message_class_message',
    collection: '/sap/bc/adt/messageclass',
    codes: {
      'MSAG/NN': {
        parent: null,
        nameMaxLength: 3,
        operations: ['create', 'read', 'readMetadata', 'update', 'delete'],
        evidence: 'system-description-s4-2025--07-typestructure',
      },
    },
  },
  featureToggle: {
    kind: 'feature_toggle',
    collection: '/sap/bc/adt/sfw/featuretoggles',
    codes: {
      'FTG2/FT': {
        parent: null,
        nameMaxLength: 30,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'updateMetadata',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'deletionCheck',
          'delete',
          'switchOn',
          'switchOff',
          'getRuntimeState',
          'checkState',
        ],
        evidence: 'system-description-s4-2025--07-typestructure',
      },
    },
  },
  authorizationField: {
    kind: 'authorization_field',
    collection: '/sap/bc/adt/aps/iam/auth',
    codes: {
      AUTH: {
        parent: null,
        nameMaxLength: 30,
        operations: [
          'create',
          'readMetadata',
          'updateMetadata',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'deletionCheck',
          'delete',
        ],
        evidence: 'system-description-s4-2025--07-typestructure',
      },
    },
  },
  enhancement: {
    kind: 'enhancement',
    collection: '/sap/bc/adt/enhancements',
    codes: {
      'ENHO/XHH': {
        parent: null,
        nameMaxLength: 30,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'updateMetadata',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'deletionCheck',
          'delete',
          'transport',
        ],
        evidence: 'system-description-s4-2025--07-typestructure',
        collection: '/sap/bc/adt/enhancements/enhoxhh',
      },
      'ENHO/XHB': {
        parent: null,
        nameMaxLength: 30,
        operations: [
          'create',
          'readMetadata',
          'updateMetadata',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'deletionCheck',
          'delete',
          'transport',
        ],
        evidence: 'system-description-s4-2025--07-typestructure',
        collection: '/sap/bc/adt/enhancements/enhoxhb',
      },
      'ENHS/XSB': {
        parent: null,
        nameMaxLength: 30,
        operations: [
          'create',
          'readMetadata',
          'updateMetadata',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'deletionCheck',
          'delete',
          'transport',
        ],
        evidence: 'system-description-s4-2025--07-typestructure',
        collection: '/sap/bc/adt/enhancements/enhsxsb',
      },
    },
  },
  localTestClass: {
    kind: 'local_test_class',
    collection: '/sap/bc/adt/oo/classes',
    codes: {},
    parent: 'class',
    operations: [
      'read',
      'source',
      'readMetadata',
      'update',
      'lock',
      'unlock',
      'activate',
      'check',
      'validate',
      'versions',
      'delete',
      'transport',
    ],
    evidence: 'system-description-s4-2025--07-typestructure',
  },
  localTypes: {
    kind: 'local_types',
    collection: '/sap/bc/adt/oo/classes',
    codes: {},
    parent: 'class',
    operations: [
      'read',
      'source',
      'readMetadata',
      'update',
      'lock',
      'unlock',
      'activate',
      'check',
      'validate',
      'versions',
      'delete',
      'transport',
    ],
    evidence: 'system-description-s4-2025--07-typestructure',
  },
  localDefinitions: {
    kind: 'local_definitions',
    collection: '/sap/bc/adt/oo/classes',
    codes: {},
    parent: 'class',
    operations: [
      'read',
      'source',
      'readMetadata',
      'update',
      'lock',
      'unlock',
      'activate',
      'check',
      'validate',
      'versions',
      'delete',
      'transport',
    ],
    evidence: 'system-description-s4-2025--07-typestructure',
  },
  localMacros: {
    kind: 'local_macros',
    collection: '/sap/bc/adt/oo/classes',
    codes: {},
    parent: 'class',
    operations: [
      'read',
      'source',
      'readMetadata',
      'update',
      'lock',
      'unlock',
      'activate',
      'check',
      'validate',
      'versions',
      'delete',
      'transport',
    ],
    evidence: 'system-description-s4-2025--07-typestructure',
  },
  request: {
    kind: 'transport',
    collection: '/sap/bc/adt/cts/transportrequests',
    codes: {},
    parent: null,
    operations: [
      'create',
      'readMetadata',
      'updateMetadata',
      'deletionCheck',
      'delete',
      'list',
      'searchConfigurations',
      'readObjects',
      'readActionLog',
      'addObject',
      'removeObject',
      'moveObjects',
      'sortAndCompress',
      'createTask',
      'changeTaskType',
    ],
    evidence: 'system-description-s4-2025--07-typestructure',
  },
} as const satisfies AdtApiTable<'s4-2025'>;

/**
 * What the library serves on **ABAP cloud** (measured on the BTP trial), API by
 * API. The same operations as {@link ADT_TYPES_ONPREM}, and this release's
 * name lengths, but for a program (`PROG/P`) and an include (`PROG/I`). The
 * cloud has none of one's own — its discovery gives neither collection an
 * `app:accept`, and the create is refused (`403`, S_DEVELOP) — so they list
 * what a delivered one answers (measured): the reads, the check, the versions,
 * the deletion check, the enhancement reads and, for a program, the ABAP Unit
 * runs. Its transport is `404`, and running or profiling it is refused.
 *
 * `create` is listed where the release's `typestructure` gives the code, or
 * its parent code, `CREATE` in `USER_AUTHORIZATIONS` — creatable given the
 * authorization: so a feature toggle (`FTG2/FT`) is not created here, and a
 * function include (`FUGR/I`) is, through its group (`FUGR/F`).
 */
export const ADT_TYPES_CLOUD = {
  class: {
    kind: 'class',
    collection: '/sap/bc/adt/oo/classes',
    codes: {
      'CLAS/OC': {
        parent: null,
        nameMaxLength: 30,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'updateMetadata',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'deletionCheck',
          'delete',
          'transport',
          'readEnhancementElements',
          'readEnhancementOptions',
          'activateTestClasses',
          'run',
          'profile',
          'unitTestRun',
          'unitTestRunSync',
          'unitTestStatus',
          'unitTestResult',
        ],
        evidence: 'system-description-abap-cloud--07-typestructure',
      },
    },
  },
  interface: {
    kind: 'interface',
    collection: '/sap/bc/adt/oo/interfaces',
    codes: {
      'INTF/OI': {
        parent: null,
        nameMaxLength: 30,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'updateMetadata',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'deletionCheck',
          'delete',
          'transport',
        ],
        evidence: 'system-description-abap-cloud--07-typestructure',
      },
    },
  },
  program: {
    kind: 'program',
    collection: '/sap/bc/adt/programs/programs',
    codes: {
      'PROG/P': {
        parent: null,
        nameMaxLength: 40,
        operations: [
          'read',
          'source',
          'readMetadata',
          'check',
          'versions',
          'deletionCheck',
          'readEnhancementElements',
          'readEnhancementOptions',
          'unitTestRun',
          'unitTestRunSync',
          'unitTestStatus',
          'unitTestResult',
        ],
        evidence: 'system-description-abap-cloud--07-typestructure',
      },
    },
  },
  include: {
    kind: 'include',
    collection: '/sap/bc/adt/programs/includes',
    codes: {
      'PROG/I': {
        parent: null,
        nameMaxLength: 40,
        operations: [
          'read',
          'source',
          'readMetadata',
          'deletionCheck',
          'readEnhancementElements',
          'readEnhancementOptions',
        ],
        evidence: 'system-description-abap-cloud--07-typestructure',
      },
    },
  },
  functionGroup: {
    kind: 'function_group',
    collection: '/sap/bc/adt/functions/groups',
    codes: {
      'FUGR/F': {
        parent: null,
        nameMaxLength: 26,
        operations: [
          'create',
          'readMetadata',
          'updateMetadata',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'deletionCheck',
          'delete',
          'transport',
          'readEnhancementElements',
          'readEnhancementOptions',
          'unitTestRun',
          'unitTestRunSync',
          'unitTestStatus',
          'unitTestResult',
        ],
        evidence: 'system-description-abap-cloud--07-typestructure',
      },
    },
  },
  functionModule: {
    kind: 'function_module',
    collection: '/sap/bc/adt/functions/groups',
    codes: {
      'FUGR/FF': {
        parent: 'functionGroup',
        nameMaxLength: 30,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'updateMetadata',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'deletionCheck',
          'delete',
          'transport',
          'unitTestRun',
          'unitTestRunSync',
          'unitTestStatus',
          'unitTestResult',
        ],
        evidence: 'system-description-abap-cloud--07-typestructure',
      },
    },
  },
  functionInclude: {
    kind: 'function_include',
    collection: '/sap/bc/adt/functions/groups',
    codes: {
      'FUGR/I': {
        parent: 'functionGroup',
        nameMaxLength: 30,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'updateMetadata',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'deletionCheck',
          'delete',
        ],
        evidence: 'system-description-abap-cloud--07-typestructure',
      },
    },
  },
  package: {
    kind: 'package',
    collection: '/sap/bc/adt/packages',
    codes: {
      'DEVC/K': {
        parent: null,
        nameMaxLength: 30,
        operations: [
          'create',
          'readMetadata',
          'updateMetadata',
          'lock',
          'unlock',
          'check',
          'validate',
          'deletionCheck',
          'delete',
          'transport',
        ],
        evidence: 'system-description-abap-cloud--07-typestructure',
      },
    },
  },
  ddl: {
    kind: 'ddl',
    collection: '/sap/bc/adt/ddic/ddl/sources',
    codes: {
      'DDLS/DF': {
        parent: null,
        nameMaxLength: 30,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'updateMetadata',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'deletionCheck',
          'delete',
          'transport',
          'checkCdsTestDoubles',
        ],
        evidence: 'system-description-abap-cloud--07-typestructure',
      },
    },
  },
  table: {
    kind: 'table',
    collection: '/sap/bc/adt/ddic/tables',
    codes: {
      'TABL/DT': {
        parent: null,
        nameMaxLength: 16,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'deletionCheck',
          'delete',
          'transport',
        ],
        evidence: 'system-description-abap-cloud--07-typestructure',
      },
    },
  },
  structure: {
    kind: 'structure',
    collection: '/sap/bc/adt/ddic/structures',
    codes: {
      'TABL/DS': {
        parent: null,
        nameMaxLength: 30,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'deletionCheck',
          'delete',
          'transport',
        ],
        evidence: 'system-description-abap-cloud--07-typestructure',
      },
    },
  },
  appendStructure: {
    kind: 'structure',
    collection: '/sap/bc/adt/ddic/structures',
    codes: {
      'TABL/DS': {
        parent: null,
        nameMaxLength: 30,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'deletionCheck',
          'delete',
          'transport',
        ],
        evidence: 'system-description-abap-cloud--07-typestructure',
      },
    },
  },
  tableType: {
    kind: 'table_type',
    collection: '/sap/bc/adt/ddic/tabletypes',
    codes: {
      'TTYP/DA': {
        parent: null,
        nameMaxLength: 30,
        operations: [
          'create',
          'readMetadata',
          'updateMetadata',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'deletionCheck',
          'delete',
          'transport',
        ],
        evidence: 'system-description-abap-cloud--07-typestructure',
      },
    },
  },
  domain: {
    kind: 'domain',
    collection: '/sap/bc/adt/ddic/domains',
    codes: {
      'DOMA/DD': {
        parent: null,
        nameMaxLength: 30,
        operations: [
          'create',
          'readMetadata',
          'updateMetadata',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'deletionCheck',
          'delete',
          'transport',
        ],
        evidence: 'system-description-abap-cloud--07-typestructure',
      },
    },
  },
  dataElement: {
    kind: 'data_element',
    collection: '/sap/bc/adt/ddic/dataelements',
    codes: {
      'DTEL/DE': {
        parent: null,
        nameMaxLength: 30,
        operations: [
          'create',
          'readMetadata',
          'updateMetadata',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'deletionCheck',
          'delete',
          'transport',
        ],
        evidence: 'system-description-abap-cloud--07-typestructure',
      },
    },
  },
  accessControl: {
    kind: 'access_control',
    collection: '/sap/bc/adt/acm/dcl/sources',
    codes: {
      'DCLS/DL': {
        parent: null,
        nameMaxLength: 30,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'deletionCheck',
          'delete',
          'transport',
        ],
        evidence: 'system-description-abap-cloud--07-typestructure',
      },
    },
  },
  behaviorDefinition: {
    kind: 'behavior_definition',
    collection: '/sap/bc/adt/bo/behaviordefinitions',
    codes: {
      'BDEF/BDO': {
        parent: null,
        nameMaxLength: 30,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'deletionCheck',
          'delete',
          'transport',
        ],
        evidence: 'system-description-abap-cloud--07-typestructure',
      },
    },
  },
  behaviorImplementation: {
    kind: 'class',
    collection: '/sap/bc/adt/oo/classes',
    codes: {
      'CLAS/OC': {
        parent: null,
        nameMaxLength: 30,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'deletionCheck',
          'delete',
          'transport',
        ],
        evidence: 'system-description-abap-cloud--07-typestructure',
      },
    },
  },
  metadataExtension: {
    kind: 'metadata_extension',
    collection: '/sap/bc/adt/ddic/ddlx/sources',
    codes: {
      'DDLX/EX': {
        parent: null,
        nameMaxLength: 40,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'deletionCheck',
          'delete',
          'transport',
        ],
        evidence: 'system-description-abap-cloud--07-typestructure',
      },
    },
  },
  serviceDefinition: {
    kind: 'service_definition',
    collection: '/sap/bc/adt/ddic/srvd/sources',
    codes: {
      'SRVD/SRV': {
        parent: null,
        nameMaxLength: 30,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'deletionCheck',
          'delete',
          'transport',
        ],
        evidence: 'system-description-abap-cloud--07-typestructure',
      },
    },
  },
  serviceBinding: {
    kind: 'service_binding',
    collection: '/sap/bc/adt/businessservices/bindings',
    codes: {
      'SRVB/SVB': {
        parent: null,
        nameMaxLength: 40,
        operations: [
          'create',
          'read',
          'readMetadata',
          'update',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'deletionCheck',
          'delete',
          'transport',
          'getServiceBindingTypes',
          'getServiceGroup',
        ],
        evidence: 'system-description-abap-cloud--07-typestructure',
      },
    },
  },
  scalarFunction: {
    kind: 'scalar_function',
    collection: '/sap/bc/adt/ddic/dsfd/sources',
    codes: {
      'DSFD/SCF': {
        parent: null,
        nameMaxLength: 26,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'deletionCheck',
          'delete',
          'transport',
        ],
        evidence: 'system-description-abap-cloud--07-typestructure',
      },
    },
  },
  scalarFunctionImplementation: {
    kind: 'scalar_function_implementation',
    collection: '/sap/bc/adt/ddic/dsfi',
    codes: {
      'DSFI/SFI': {
        parent: null,
        nameMaxLength: 40,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'updateMetadata',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'deletionCheck',
          'delete',
          'transport',
        ],
        evidence: 'system-description-abap-cloud--07-typestructure',
      },
    },
  },
  transformation: {
    kind: 'transformation',
    collection: '/sap/bc/adt/xslt/transformations',
    codes: {
      'XSLT/VT': {
        parent: null,
        nameMaxLength: 30,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'deletionCheck',
          'delete',
          'transport',
        ],
        evidence: 'system-description-abap-cloud--07-typestructure',
      },
    },
  },
  messageClass: {
    kind: 'message_class',
    collection: '/sap/bc/adt/messageclass',
    codes: {
      'MSAG/N': {
        parent: null,
        nameMaxLength: 20,
        operations: [
          'create',
          'readMetadata',
          'updateMetadata',
          'lock',
          'unlock',
          'validate',
          'deletionCheck',
          'delete',
        ],
        evidence: 'system-description-abap-cloud--07-typestructure',
      },
    },
  },
  messageClassMessage: {
    kind: 'message_class_message',
    collection: '/sap/bc/adt/messageclass',
    codes: {
      'MSAG/NN': {
        parent: null,
        nameMaxLength: 3,
        operations: ['create', 'read', 'readMetadata', 'update', 'delete'],
        evidence: 'system-description-abap-cloud--07-typestructure',
      },
    },
  },
  featureToggle: {
    kind: 'feature_toggle',
    collection: '/sap/bc/adt/sfw/featuretoggles',
    codes: {
      'FTG2/FT': {
        parent: null,
        nameMaxLength: 30,
        operations: [
          'read',
          'source',
          'readMetadata',
          'update',
          'updateMetadata',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'deletionCheck',
          'delete',
          'switchOn',
          'switchOff',
          'getRuntimeState',
          'checkState',
        ],
        evidence: 'system-description-abap-cloud--07-typestructure',
      },
    },
  },
  authorizationField: {
    kind: 'authorization_field',
    collection: '/sap/bc/adt/aps/iam/auth',
    codes: {
      AUTH: {
        parent: null,
        nameMaxLength: 30,
        operations: [
          'create',
          'readMetadata',
          'updateMetadata',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'deletionCheck',
          'delete',
        ],
        evidence: 'system-description-abap-cloud--07-typestructure',
      },
    },
  },
  enhancement: {
    kind: 'enhancement',
    collection: '/sap/bc/adt/enhancements',
    codes: {
      'ENHO/XHH': {
        parent: null,
        nameMaxLength: 30,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'updateMetadata',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'deletionCheck',
          'delete',
          'transport',
        ],
        evidence: 'system-description-abap-cloud--07-typestructure',
        collection: '/sap/bc/adt/enhancements/enhoxhh',
      },
      'ENHO/XHB': {
        parent: null,
        nameMaxLength: 30,
        operations: [
          'create',
          'readMetadata',
          'updateMetadata',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'deletionCheck',
          'delete',
          'transport',
        ],
        evidence: 'system-description-abap-cloud--07-typestructure',
        collection: '/sap/bc/adt/enhancements/enhoxhb',
      },
      'ENHS/XSB': {
        parent: null,
        nameMaxLength: 30,
        operations: [
          'create',
          'readMetadata',
          'updateMetadata',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'deletionCheck',
          'delete',
          'transport',
        ],
        evidence: 'system-description-abap-cloud--07-typestructure',
        collection: '/sap/bc/adt/enhancements/enhsxsb',
      },
    },
  },
  localTestClass: {
    kind: 'local_test_class',
    collection: '/sap/bc/adt/oo/classes',
    codes: {},
    parent: 'class',
    operations: [
      'read',
      'source',
      'readMetadata',
      'update',
      'lock',
      'unlock',
      'activate',
      'check',
      'validate',
      'versions',
      'delete',
      'transport',
    ],
    evidence: 'system-description-abap-cloud--07-typestructure',
  },
  localTypes: {
    kind: 'local_types',
    collection: '/sap/bc/adt/oo/classes',
    codes: {},
    parent: 'class',
    operations: [
      'read',
      'source',
      'readMetadata',
      'update',
      'lock',
      'unlock',
      'activate',
      'check',
      'validate',
      'versions',
      'delete',
      'transport',
    ],
    evidence: 'system-description-abap-cloud--07-typestructure',
  },
  localDefinitions: {
    kind: 'local_definitions',
    collection: '/sap/bc/adt/oo/classes',
    codes: {},
    parent: 'class',
    operations: [
      'read',
      'source',
      'readMetadata',
      'update',
      'lock',
      'unlock',
      'activate',
      'check',
      'validate',
      'versions',
      'delete',
      'transport',
    ],
    evidence: 'system-description-abap-cloud--07-typestructure',
  },
  localMacros: {
    kind: 'local_macros',
    collection: '/sap/bc/adt/oo/classes',
    codes: {},
    parent: 'class',
    operations: [
      'read',
      'source',
      'readMetadata',
      'update',
      'lock',
      'unlock',
      'activate',
      'check',
      'validate',
      'versions',
      'delete',
      'transport',
    ],
    evidence: 'system-description-abap-cloud--07-typestructure',
  },
  request: {
    kind: 'transport',
    collection: '/sap/bc/adt/cts/transportrequests',
    codes: {},
    parent: null,
    operations: [
      'create',
      'readMetadata',
      'updateMetadata',
      'deletionCheck',
      'delete',
      'list',
      'searchConfigurations',
      'readObjects',
      'readActionLog',
      'addObject',
      'removeObject',
      'moveObjects',
      'sortAndCompress',
      'createTask',
      'changeTaskType',
    ],
    evidence: 'system-description-abap-cloud--07-typestructure',
  },
} as const satisfies AdtApiTable<'abap-cloud'>;

/**
 * What the library serves on **SAP_BASIS 7.40 SP04**, API by API.
 *
 * An API every member of which the legacy client refuses is absent, not
 * empty: `table`, `structure`, `domain`, `package` and the rest of the RAP and
 * DDIC objects 7.40 does not serve through ADT. An operation the legacy
 * client refuses — `deletionCheck`, `transport`, `run`, `profile` — is absent
 * from its code.
 */
export const ADT_TYPES_BASIS_740 = {
  class: {
    kind: 'class',
    collection: '/sap/bc/adt/oo/classes',
    codes: {
      'CLAS/OC': {
        parent: null,
        nameMaxLength: 30,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'delete',
          'readEnhancementElements',
          'readEnhancementOptions',
          'activateTestClasses',
          'unitTestRun',
          'unitTestRunSync',
        ],
        evidence: 'system-description-basis-740--07-typestructure',
      },
    },
  },
  interface: {
    kind: 'interface',
    collection: '/sap/bc/adt/oo/interfaces',
    codes: {
      'INTF/OI': {
        parent: null,
        nameMaxLength: 30,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'delete',
        ],
        evidence: 'system-description-basis-740--07-typestructure',
      },
    },
  },
  program: {
    kind: 'program',
    collection: '/sap/bc/adt/programs/programs',
    codes: {
      'PROG/P': {
        parent: null,
        nameMaxLength: 40,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'delete',
          'readEnhancementElements',
          'readEnhancementOptions',
          'unitTestRun',
          'unitTestRunSync',
        ],
        evidence: 'system-description-basis-740--07-typestructure',
      },
    },
  },
  include: {
    kind: 'include',
    collection: '/sap/bc/adt/programs/includes',
    codes: {
      'PROG/I': {
        parent: null,
        nameMaxLength: 40,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'lock',
          'unlock',
          'activate',
          'validate',
          'delete',
          'readEnhancementElements',
          'readEnhancementOptions',
        ],
        evidence: 'system-description-basis-740--07-typestructure',
      },
    },
  },
  functionGroup: {
    kind: 'function_group',
    collection: '/sap/bc/adt/functions/groups',
    codes: {
      'FUGR/F': {
        parent: null,
        nameMaxLength: 26,
        operations: [
          'create',
          'readMetadata',
          'updateMetadata',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'delete',
          'readEnhancementElements',
          'readEnhancementOptions',
          'unitTestRun',
          'unitTestRunSync',
        ],
        evidence: 'system-description-basis-740--07-typestructure',
      },
    },
  },
  functionModule: {
    kind: 'function_module',
    collection: '/sap/bc/adt/functions/groups',
    codes: {
      'FUGR/FF': {
        parent: 'functionGroup',
        nameMaxLength: 30,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
          'delete',
          'unitTestRunSync',
        ],
        evidence: 'system-description-basis-740--07-typestructure',
      },
    },
  },
  functionInclude: {
    kind: 'function_include',
    collection: '/sap/bc/adt/functions/groups',
    codes: {
      'FUGR/I': {
        parent: 'functionGroup',
        nameMaxLength: 30,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'updateMetadata',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'versions',
        ],
        evidence: 'system-description-basis-740--07-typestructure',
      },
    },
  },
  ddl: {
    kind: 'ddl',
    collection: '/sap/bc/adt/ddic/ddl/sources',
    codes: {
      'DDLS/DF': {
        parent: null,
        nameMaxLength: 30,
        operations: [
          'create',
          'read',
          'source',
          'readMetadata',
          'update',
          'lock',
          'unlock',
          'activate',
          'check',
          'validate',
          'delete',
        ],
        evidence: 'system-description-basis-740--07-typestructure',
      },
    },
  },
  messageClass: {
    kind: 'message_class',
    collection: '/sap/bc/adt/messageclass',
    codes: {
      'MSAG/N': {
        parent: null,
        nameMaxLength: 20,
        operations: [
          'create',
          'readMetadata',
          'lock',
          'unlock',
          'validate',
          'delete',
        ],
        evidence: 'system-description-basis-740--07-typestructure',
      },
    },
  },
  messageClassMessage: {
    kind: 'message_class_message',
    collection: '/sap/bc/adt/messageclass',
    codes: {
      'MSAG/NN': {
        parent: null,
        nameMaxLength: 3,
        operations: ['create', 'read', 'readMetadata', 'update', 'delete'],
        evidence: 'system-description-basis-740--07-typestructure',
      },
    },
  },
  localTestClass: {
    kind: 'local_test_class',
    collection: '/sap/bc/adt/oo/classes',
    codes: {},
    parent: 'class',
    operations: [
      'read',
      'source',
      'readMetadata',
      'update',
      'lock',
      'unlock',
      'activate',
      'check',
      'validate',
      'versions',
      'delete',
    ],
    evidence: 'system-description-basis-740--07-typestructure',
  },
  localTypes: {
    kind: 'local_types',
    collection: '/sap/bc/adt/oo/classes',
    codes: {},
    parent: 'class',
    operations: [
      'read',
      'source',
      'readMetadata',
      'update',
      'lock',
      'unlock',
      'activate',
      'check',
      'validate',
      'versions',
      'delete',
    ],
    evidence: 'system-description-basis-740--07-typestructure',
  },
  localDefinitions: {
    kind: 'local_definitions',
    collection: '/sap/bc/adt/oo/classes',
    codes: {},
    parent: 'class',
    operations: [
      'read',
      'source',
      'readMetadata',
      'update',
      'lock',
      'unlock',
      'activate',
      'check',
      'validate',
      'versions',
      'delete',
    ],
    evidence: 'system-description-basis-740--07-typestructure',
  },
  localMacros: {
    kind: 'local_macros',
    collection: '/sap/bc/adt/oo/classes',
    codes: {},
    parent: 'class',
    operations: [
      'read',
      'source',
      'readMetadata',
      'update',
      'lock',
      'unlock',
      'activate',
      'check',
      'validate',
      'versions',
      'delete',
    ],
    evidence: 'system-description-basis-740--07-typestructure',
  },
  request: {
    kind: 'transport',
    collection: '/sap/bc/cts/transportrequests',
    codes: {},
    parent: null,
    operations: ['readMetadata', 'list'],
    evidence: 'system-description-basis-740--07-typestructure',
  },
} as const satisfies AdtApiTable<'basis-740'>;

/**
 * A release variant: `onprem` is S/4HANA 2025 on-premise, `cloud` ABAP cloud,
 * `basis740` SAP_BASIS 7.40 SP04. Declared by the consumer, never detected.
 */
export type AdtVariant = 'onprem' | 'cloud' | 'basis740';

/**
 * A system of SAP_BASIS 7.50 or later, on premise or ABAP cloud — the variant
 * a client serves when none is named. Read with the intersecting helpers
 * below, it gets what **both** tables serve.
 */
export type AdtModernVariant = Exclude<AdtVariant, 'basis740'>;

/** The table of each variant, by its name. */
export interface IAdtTypeTables {
  readonly onprem: AdtCheckedTable<typeof ADT_TYPES_ONPREM>;
  readonly cloud: AdtCheckedTable<typeof ADT_TYPES_CLOUD>;
  readonly basis740: AdtCheckedTable<typeof ADT_TYPES_BASIS_740>;
}

type TableOf<V extends AdtVariant> = IAdtTypeTables[V];

type OperationsOf<F> = F extends {
  readonly operations: readonly (infer O)[];
}
  ? O
  : never;

type CodesOf<E> = E extends { readonly codes: infer C }
  ? keyof C & string
  : never;

type CodesWith<E, Op extends AdtOperation> = E extends {
  readonly codes: infer C;
}
  ? { [K in keyof C]: [Op] extends [OperationsOf<C[K]>] ? K : never }[keyof C] &
      string
  : never;

/** Whether one code of the entry — or a codeless entry — lists all of `Op`. */
type EntryHas<E, Op extends AdtOperation> =
  E extends IAdtCodelessApiEntry<string>
    ? [Op] extends [OperationsOf<E>]
      ? true
      : false
    : [CodesWith<E, Op>] extends [never]
      ? false
      : true;

type ParentedCodesOf<E> = E extends { readonly codes: infer C }
  ? {
      [K in keyof C]: C[K] extends { readonly parent: null } ? never : K;
    }[keyof C] &
      string
  : never;

/**
 * The APIs — the client's factories — variant `V` serves. For a union of
 * variants this is already the intersection: `keyof` a union of tables names
 * the APIs every one of them holds.
 */
export type AdtApi<V extends AdtVariant> = keyof TableOf<V>;

/**
 * The type codes variant `V` serves.
 *
 * **Union semantics within the shared APIs.** For a union of variants it
 * reads the tables as one union table: the APIs every one of them serves
 * (`keyof` a union), and for those the codes *any* of them lists.
 * {@link AdtCodeOf} is the intersection.
 */
export type AdtTypeCodeOf<V extends AdtVariant> = {
  [A in AdtApi<V>]: CodesOf<TableOf<V>[A]>;
}[AdtApi<V>];

/** Every type code of any table. A code no table names is not one. */
export type AdtTypeCode = { [V in AdtVariant]: AdtTypeCodeOf<V> }[AdtVariant];

/**
 * The APIs of table `T` one code of which performs every operation of `Op` —
 * for a union of tables, **union semantics within the shared APIs**: an API
 * every table holds qualifies when one table's entry does (see
 * {@link AdtPerformingVariantsIn} for the intersecting question) —
 * or, for a codeless API, whose entry does. Operations spread across two codes
 * do not count: no single object of the API could be asked for all of them.
 */
export type AdtApiWithIn<T, Op extends AdtOperation> = {
  [A in keyof T]: EntryHas<T[A], Op> extends true ? A : never;
}[keyof T];

/**
 * {@link AdtApiWithIn} over variant `V`'s table — for a union of variants,
 * **union semantics within the shared APIs**: an API all of them serve
 * qualifies when one variant's table has it so.
 */
export type AdtApiWith<
  V extends AdtVariant,
  Op extends AdtOperation,
> = AdtApiWithIn<TableOf<V>, Op>;

/**
 * The codes of variant `V` whose facts list every operation of `Op` — for a
 * union of variants, **union semantics within the shared APIs**: a code of an
 * API all of them serve, listed with `Op` by any of them. {@link AdtCodeWith}
 * is the intersection.
 */
export type AdtTypeCodeWith<V extends AdtVariant, Op extends AdtOperation> = {
  [A in AdtApi<V>]: CodesWith<TableOf<V>[A], Op>;
}[AdtApi<V>];

/**
 * Every kind of any table — the tools' one vocabulary for objects. A union
 * over all variants by design.
 */
export type AdtObjectKind = {
  [V in AdtVariant]: {
    [A in AdtApi<V>]: TableOf<V>[A] extends { readonly kind: infer K }
      ? K
      : never;
  }[AdtApi<V>];
}[AdtVariant];

/**
 * The codes, of any table, whose API reads a source there (`source`) — a union
 * over all variants by design. A variant's own, intersected for a union of
 * variants, is `AdtCodeWith<V, 'source'>`.
 */
export type AdtSourceTypeCode = {
  [V in AdtVariant]: AdtTypeCodeWith<V, 'source'>;
}[AdtVariant];

/**
 * The codes, of any table, that live under a parent API (`FUGR/FF` and
 * `FUGR/I` under `functionGroup`): a reference to one names its parent.
 */
export type AdtParentedTypeCode = {
  [V in AdtVariant]: {
    [A in AdtApi<V>]: ParentedCodesOf<TableOf<V>[A]>;
  }[AdtApi<V>];
}[AdtVariant];

// ── Intersecting helpers ────────────────────────────────────────────────────
//
// Each variant is read on its own table, and a code, an API or an operation
// counts for a union of variants only when every one of them has it. The
// default modern variant, `'onprem' | 'cloud'`, gets what both tables serve.

type CodesOfTable<T> = { [A in keyof T]: CodesOf<T[A]> }[keyof T];

type CodesWithInTable<T, Op extends AdtOperation> = {
  [A in keyof T]: CodesWith<T[A], Op>;
}[keyof T];

/** The variants, among `Tables`' keys, whose table lists code `C`. */
type VariantsListingIn<Tables, C> = {
  [W in keyof Tables]: C extends CodesOfTable<Tables[W]> ? W : never;
}[keyof Tables];

/** The variants, among `Tables`' keys, whose table lists `Op` for code `C`. */
type VariantsWhereCodeHasIn<Tables, C, Op extends AdtOperation> = {
  [W in keyof Tables]: C extends CodesWithInTable<Tables[W], Op> ? W : never;
}[keyof Tables];

/**
 * The variants, among `Tables`' keys, whose table serves API `A`. Each key is
 * read on its own table, so nothing distributes over a union of tables.
 */
export type AdtServingVariantsIn<Tables, A extends AdtApiName> = {
  [W in keyof Tables]: A extends keyof Tables[W] ? W : never;
}[keyof Tables];

/**
 * The variants, among `Tables`' keys, one code of whose API `A` lists every
 * operation of `Op` (or, for a codeless API, whose entry does).
 */
export type AdtPerformingVariantsIn<
  Tables,
  A extends AdtApiName,
  Op extends AdtOperation,
> = {
  [W in keyof Tables]: [A] extends [AdtApiWithIn<Tables[W], Op>] ? W : never;
}[keyof Tables];

/** The codes any table of `V` lists — the candidates, each table read alone. */
type CandidateCodes<Tables, V extends keyof Tables> = {
  [W in V]: CodesOfTable<Tables[W]>;
}[V];

/** The codes any table of `V` lists `Op` for, each table read alone. */
type CandidateCodesWith<
  Tables,
  V extends keyof Tables,
  Op extends AdtOperation,
> = { [W in V]: CodesWithInTable<Tables[W], Op> }[V];

/** The codes every table of `V` among `Tables` lists: the intersection. */
export type AdtCodeOfIn<Tables, V extends keyof Tables> = {
  [C in CandidateCodes<Tables, V>]: [V] extends [VariantsListingIn<Tables, C>]
    ? C
    : never;
}[CandidateCodes<Tables, V>];

/** The codes for which every table of `V` among `Tables` lists `Op`. */
export type AdtCodeWithIn<
  Tables,
  V extends keyof Tables,
  Op extends AdtOperation,
> = {
  [C in CandidateCodesWith<Tables, V, Op>]: [V] extends [
    VariantsWhereCodeHasIn<Tables, C, Op>,
  ]
    ? C
    : never;
}[CandidateCodesWith<Tables, V, Op>];

/**
 * The codes every variant of `V` lists — for the default modern variant, the
 * codes both newer tables list. The intersecting counterpart of
 * {@link AdtTypeCodeOf}.
 */
export type AdtCodeOf<V extends AdtVariant> = AdtCodeOfIn<IAdtTypeTables, V>;

/**
 * The codes for which every variant of `V` lists every operation of `Op` —
 * the intersecting counterpart of {@link AdtTypeCodeWith}.
 */
export type AdtCodeWith<
  V extends AdtVariant,
  Op extends AdtOperation,
> = AdtCodeWithIn<IAdtTypeTables, V, Op>;
