/**
 * The shape of the ADT type tables — what one entry of `ADT_TYPES_ONPREM`,
 * `ADT_TYPES_CLOUD` or `ADT_TYPES_BASIS_740` may say, and the closed
 * vocabularies it says it in.
 *
 * **Types only.** The tables themselves are in `AdtTypeTables.ts`; this file
 * is what each of them `satisfies`, so a misspelt field, an operation outside
 * the vocabulary, an API the client has no factory for or a release the corpus
 * has no case for fails to compile at the table.
 */

/**
 * The client's factories, by name: `getClass()` is `class`, `getRequest()` is
 * `request`. A table is keyed by these, not by a type code, because one code
 * can serve two APIs (`CLAS/OC`: `class` and `behaviorImplementation`) and one
 * API several codes (`enhancement`: `ENHO/XHH`, `ENHO/XHB`, `ENHS/XSB`).
 *
 * `getUtils()` is not here: its members are group operations over the codes of
 * the variant, not an object of one type.
 */
export type AdtApiName =
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

/**
 * What the library does with an object of a code — the closed vocabulary every
 * entry draws from. Each names a member of the API's handler, or a pair of
 * members honoured or refused whole:
 *
 * | operation | member(s) |
 * |---|---|
 * | `create` | `create` |
 * | `read` | `read` |
 * | `source` | the object has a source the library reads: `read`, or a feature toggle's `readSource`. {@link AdtSourceTypeCode} is drawn from it |
 * | `readMetadata` | `readMetadata` |
 * | `update` | `update` |
 * | `updateMetadata` | `updateMetadata` |
 * | `lock`, `unlock` | `lock`, `unlock` |
 * | `activate` | `activate` |
 * | `check` | `check` |
 * | `validate` | `validate` |
 * | `versions` | `getVersions`, `getVersionSource` |
 * | `deletionCheck` | `checkDeletion` |
 * | `delete` | `delete` |
 * | `transport` | `readTransport` |
 * | `readEnhancementElements`, `readEnhancementOptions` | the enhancement host's two reads |
 * | `activateTestClasses` | a class's `activateTestClasses` |
 * | `checkCdsTestDoubles` | a DDL's `checkCdsTestDoubles` |
 * | `switchOn`, `switchOff`, `getRuntimeState`, `checkState` | a feature toggle's runtime |
 * | `getServiceBindingTypes`, `getServiceGroup` | a service binding's two reads beside its object |
 * | `list` … `changeTaskType` | a transport request's members of the same name |
 * | `run` | the executor's `run` |
 * | `profile` | the executor's `runWithProfiler` |
 * | `unitTestRun` | the ABAP Unit runner's `run` |
 * | `unitTestRunSync` | the ABAP Unit runner's `runSync` |
 * | `unitTestStatus` | the ABAP Unit runner's `getStatus` |
 * | `unitTestResult` | the ABAP Unit runner's `getResult` |
 */
export type AdtOperation =
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
  | 'transport'
  | 'readEnhancementElements'
  | 'readEnhancementOptions'
  | 'activateTestClasses'
  | 'checkCdsTestDoubles'
  | 'switchOn'
  | 'switchOff'
  | 'getRuntimeState'
  | 'checkState'
  | 'getServiceBindingTypes'
  | 'getServiceGroup'
  | 'list'
  | 'searchConfigurations'
  | 'readObjects'
  | 'readActionLog'
  | 'addObject'
  | 'removeObject'
  | 'moveObjects'
  | 'sortAndCompress'
  | 'createTask'
  | 'changeTaskType'
  | 'run'
  | 'profile'
  | 'unitTestRun'
  | 'unitTestRunSync'
  | 'unitTestStatus'
  | 'unitTestResult';

/**
 * The corpus case that shows a code on a release: the release's recorded
 * `POST /sap/bc/adt/repository/typestructure` answer. `R` is the release's
 * case prefix, so a table of one release cannot cite another's.
 */
export type AdtTypeEvidence<R extends string> =
  `system-description-${R}--07-typestructure`;

/** The operations of one code or one codeless entry: at least one. */
export type AdtOperations = readonly [AdtOperation, ...AdtOperation[]];

/** What a table says about one code of an API. */
export interface IAdtCodeFacts<R extends string> {
  /**
   * The API the object lives under, as the release's `PARENT_OBJECT_TYPE`
   * names its code; `null` where that element is empty.
   */
  readonly parent: AdtApiName | null;
  /** The longest name the library accepts — at most `OBJNAME_MAXLENGTH`. */
  readonly nameMaxLength: number;
  /** What the library does there. */
  readonly operations: AdtOperations;
  /** The corpus case that lists the code on this release. */
  readonly evidence: AdtTypeEvidence<R>;
  /**
   * The collection this code's resource lives in, where it is not its API's:
   * `getEnhancement()` addresses `ENHO/XHH` under
   * `/sap/bc/adt/enhancements/enhoxhh` and `ENHS/XSB` under `…/enhsxsb`.
   * Absent, the code lives in the entry's `collection`.
   */
  readonly collection?: AdtCollection;
}

/** An ADT collection: the resource path an API's objects live under. */
export type AdtCollection = `/sap/bc/${string}`;

/**
 * An API the library addresses by its own codes. Each code carries its own
 * facts, because one API's codes differ: `getEnhancement()` reads source for
 * `ENHO/XHH` and not for `ENHO/XHB`.
 */
export interface IAdtCodedApiEntry<R extends string> {
  /** The object's kind, in the tools' one vocabulary (`snake_case`). */
  readonly kind: Lowercase<string>;
  /**
   * The collection its resource lives in. An API addressed under a parent
   * names the parent's collection.
   */
  readonly collection: AdtCollection;
  /** At least one: {@link AdtCheckedTable} refuses an empty one. */
  readonly codes: { readonly [code: string]: IAdtCodeFacts<R> };
  readonly parent?: never;
  readonly operations?: never;
  readonly evidence?: never;
}

/**
 * An API reached only through a parent, or through a resource of its own, with
 * no type code the library sends for it: the local class includes, the
 * transport request. Its facts stand on the entry, and `codes` is empty.
 */
export interface IAdtCodelessApiEntry<R extends string> {
  readonly kind: Lowercase<string>;
  readonly collection: AdtCollection;
  readonly codes: { readonly [code: string]: never };
  readonly parent: AdtApiName | null;
  readonly operations: AdtOperations;
  /**
   * The corpus case behind the entry: the one that lists its parent's code
   * (a local include's `CLAS/OC`), or, for the transport request, the
   * release's `typestructure` case.
   */
  readonly evidence: AdtTypeEvidence<R>;
}

/**
 * One entry of a table.
 *
 * The order is for the diagnostics, not the meaning: with no discriminant
 * field, TypeScript reports a wrong field against the last member that fits as
 * well as any, and a coded entry is the common case — so a misspelt field of a
 * code is reported at that field.
 */
export type AdtApiEntry<R extends string> =
  | IAdtCodelessApiEntry<R>
  | IAdtCodedApiEntry<R>;

/**
 * What a table `satisfies`: an entry per API the variant serves, and no other
 * key. An API the variant does not serve is absent, not empty.
 */
export type AdtApiTable<R extends string> = {
  readonly [A in AdtApiName]?: AdtApiEntry<R>;
};

/** The APIs of a table that state their facts per code but name no code. */
type AdtEmptyCodedApis<T> = {
  [A in keyof T]: T[A] extends { readonly operations: AdtOperations }
    ? never
    : T[A] extends { readonly codes: infer C }
      ? [keyof C] extends [never]
        ? A
        : never
      : never;
}[keyof T];

/**
 * A table whose every coded entry names at least one code — what
 * `IAdtTypeTables` takes each table as. `satisfies` cannot see that an index
 * signature is empty, so this constraint does: a coded entry with
 * `codes: {}` fails it at the table's name, asking for a code.
 */
export type AdtCheckedTable<
  T extends AdtApiTable<string> & {
    readonly [A in AdtEmptyCodedApis<T>]: {
      readonly codes: { readonly 'at least one code': IAdtCodeFacts<string> };
    };
  },
> = T;
