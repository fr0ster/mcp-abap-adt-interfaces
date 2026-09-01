/**
 * The cross-cutting ADT operations, split by the resource families ADT itself
 * has — not by which of them a particular system refuses.
 *
 * `AdtUtils` in `@mcp-abap-adt/adt-clients` is one class with 31 public methods,
 * handed out by `AdtClient.getUtils()` as itself. A concrete return is the one a
 * consumer cannot substitute, cannot compose with their own types, and cannot
 * have checked at the factory — see decision 12 here and decision 10 there.
 *
 * **The grain comes from ADT's own resource space**, read out of the endpoints
 * the implementation calls:
 *
 * | family | atom |
 * |---|---|
 * | `/repository/informationsystem/*` | {@link IAdtInformationSystem} |
 * | `/repository/nodestructure`, `/repository/objectstructure` | {@link IAdtRepositoryStructure} |
 * | `/packages/*` with the node structure it walks | {@link IAdtPackageBrowsing} |
 * | `/activation`, `/deletion` | {@link IAdtGroupLifecycle} |
 * | `/datapreview/*` | {@link IAdtDataPreview} |
 * | `/discovery` | {@link IAdtDiscovery} |
 * | the per-type resources — `oo`, `programs`, `ddic`, `functions`, `enhancements` | {@link IAdtObjectAccess} |
 *
 * Deliberately *not* the grain a measurement suggested. The one legacy
 * implementation refuses exactly `getSqlQuery`, `getTableContents` and
 * `getTransaction` — which would have given three atoms and a bag of 28. Those
 * refusals fall **inside** these families rather than defining them, so
 * architecture and observation agree; observation is simply narrower, and a
 * contract split by who refuses what is a contract that changes shape with the
 * next system.
 *
 * A few members compute a string and issue no request — `supportsSourceCode`,
 * `getObjectSourceUri`, `modifyWhereUsedScope`. They stay with the family whose
 * requests they prepare, because a consumer replacing that family needs them to
 * build the same call.
 *
 * ## What these atoms do not yet promise
 *
 * **A result is part of a contract, and 23 of the 31 members here do not state
 * one.** They answer `Promise<IAdtResponse>` — the transport envelope, which
 * every method could say and none of them says anything by saying. Eight state a
 * shape: `search`, `getWhereUsedList`, `getPackageContentsList`,
 * `getPackageHierarchy`, `getInactiveObjects`, and the three list readers.
 *
 * That is a gap, not a design. It is left open rather than filled because
 * decision 1 forbids the alternative: a plausible result type is
 * indistinguishable, to a consumer, from a measured one, and only two parsers
 * exist for the twenty-three — so twenty-one shapes would be invented.
 *
 * The way out is the one this package already uses for trace views: a measured
 * default result, and a `…With(parse)` overload handing the document to the
 * consumer untouched where the shape is not ours to fix. That is per-endpoint
 * work gated on captures, and it is what turns each of these members from a
 * capability into a contract.
 */

import type { IAdtResponse } from '../connection/IAbapConnection';
import type { IReadOptions } from '../shared/IReadOptions';
import type {
  AdtObjectType,
  AdtSourceObjectType,
  IGetDiscoveryParams,
  IGetPackageContentsListOptions,
  IGetPackageHierarchyOptions,
  IGetSqlQueryParams,
  IGetTableContentsParams,
  IGetVirtualFoldersContentsParams,
  IGetWhereUsedListParams,
  IGetWhereUsedParams,
  IGetWhereUsedScopeParams,
  IInactiveObjectsResponse,
  IObjectReference,
  IPackageContentItem,
  IPackageHierarchyNode,
  ISearchObjectsParams,
  ISearchResult,
  IWhereUsedListResult,
} from './IAdtShared';

/**
 * `/sap/bc/adt/repository/informationsystem/*` — everything ADT answers about
 * *where* something is: what exists, what uses it, and what the repository will
 * show under a filter.
 */
export interface IAdtInformationSystem {
  /** Objects matching a query, parsed. */
  search(criteria: ISearchObjectsParams): Promise<ISearchResult[]>;

  /** The same query, unparsed, for a consumer that reads it its own way. */
  searchObjects(params: ISearchObjectsParams): Promise<IAdtResponse>;

  /** Where an object is used — the raw answer. */
  getWhereUsed(params: IGetWhereUsedParams): Promise<IAdtResponse>;

  /** Where an object is used, parsed into references. */
  getWhereUsedList(
    params: IGetWhereUsedListParams,
  ): Promise<IWhereUsedListResult>;

  /** The scope document a where-used run is filtered by. */
  getWhereUsedScope(params: IGetWhereUsedScopeParams): Promise<IAdtResponse>;

  /**
   * That scope document, edited. Issues no request — it rewrites the XML the
   * call above returned, and belongs here because nothing else can use it.
   */
  modifyWhereUsedScope(
    scopeXml: string,
    options: {
      enableAll?: boolean;
      enableOnly?: string[];
      enable?: string[];
      disable?: string[];
    },
  ): string;

  /** The repository as folders, under a preselection. */
  getVirtualFoldersContents(
    params: IGetVirtualFoldersContentsParams,
  ): Promise<IAdtResponse>;

  /** The object types this system knows. */
  getAllTypes(
    maxItemCount?: number,
    name?: string,
    data?: string,
  ): Promise<IAdtResponse>;

  /** What one type is. */
  getTypeInfo(typeName: string): Promise<IAdtResponse>;

  /** A transaction, which the information system serves rather than a type resource. */
  getTransaction(transactionName: string): Promise<IAdtResponse>;
}

/**
 * `/sap/bc/adt/repository/nodestructure` and `/objectstructure` — the tree, and
 * one object's place in it.
 */
export interface IAdtRepositoryStructure {
  /** Children of a node. */
  fetchNodeStructure(
    parentType: string,
    parentName: string,
    nodeId?: string,
    withShortDescriptions?: boolean,
  ): Promise<IAdtResponse>;

  /** The parts one object is made of. */
  getObjectStructure(
    objectType: string,
    objectName: string,
  ): Promise<IAdtResponse>;
}

/**
 * `/sap/bc/adt/packages/*`, walked through the node structure.
 *
 * Its own atom rather than part of {@link IAdtRepositoryStructure}: a package is
 * a container ADT gives its own resource, and reading what is in one is a
 * question about that container, not about the tree it happens to be walked
 * with.
 */
export interface IAdtPackageBrowsing {
  /** What a package holds — the raw answer. */
  getPackageContents(packageName: string): Promise<IAdtResponse>;

  /** What a package holds, parsed. */
  getPackageContentsList(
    packageName: string,
    options?: IGetPackageContentsListOptions,
  ): Promise<IPackageContentItem[]>;

  /** A package and the packages under it. */
  getPackageHierarchy(
    packageName: string,
    options?: IGetPackageHierarchyOptions,
  ): Promise<IPackageHierarchyNode>;
}

/**
 * `/sap/bc/adt/activation` and `/sap/bc/adt/deletion` — operations ADT takes on
 * a set of objects at once, rather than on one.
 */
export interface IAdtGroupLifecycle {
  /** Activate several objects in one request. */
  activateObjectsGroup(
    objects: IObjectReference[],
    preauditRequested?: boolean,
  ): Promise<IAdtResponse>;

  /** What is inactive right now. */
  getInactiveObjects(options?: {
    includeRawXml?: boolean;
  }): Promise<IInactiveObjectsResponse>;

  /** Whether a set can be deleted, asked before deleting it. */
  checkDeletionGroup(objects: IObjectReference[]): Promise<IAdtResponse>;

  /** Delete several objects in one request. */
  deleteObjectsGroup(
    objects: IObjectReference[],
    transportRequest?: string,
  ): Promise<IAdtResponse>;
}

/** `/sap/bc/adt/datapreview/*` — reading data rather than definitions. */
export interface IAdtDataPreview {
  /** A freestyle SQL query. */
  getSqlQuery(params: IGetSqlQueryParams): Promise<IAdtResponse>;

  /** The rows of one table. */
  getTableContents(params: IGetTableContentsParams): Promise<IAdtResponse>;
}

/** `/sap/bc/adt/discovery` — what this system says it serves. */
export interface IAdtDiscovery {
  discovery(params?: IGetDiscoveryParams): Promise<IAdtResponse>;
}

/**
 * The per-type resources — `oo`, `programs`, `ddic`, `functions`,
 * `enhancements` — reached generically, by type and name.
 *
 * This is what a caller uses when the type is a value rather than a decision:
 * the typed handlers on `AdtClient` are for when it is known at the call site.
 */
export interface IAdtObjectAccess {
  /** Source of any object that has source. */
  readObjectSource(
    objectType: AdtSourceObjectType,
    objectName: string,
    functionGroup?: string,
    version?: 'active' | 'inactive',
    options?: IReadOptions,
  ): Promise<IAdtResponse>;

  /** Metadata of any object. */
  readObjectMetadata(
    objectType: AdtObjectType,
    objectName: string,
    functionGroup?: string,
    options?: IReadOptions,
  ): Promise<IAdtResponse>;

  /** Whether that type has source at all. Issues no request. */
  supportsSourceCode(objectType: AdtObjectType): boolean;

  /** The URI the source read would use. Issues no request. */
  getObjectSourceUri(
    objectType: AdtSourceObjectType,
    objectName: string,
    functionGroup?: string,
    version?: 'active' | 'inactive',
  ): string;

  /** A standalone include. */
  getInclude(includeName: string): Promise<IAdtResponse>;

  /** The includes an object is built from. */
  getIncludesList(
    objectName: string,
    objectType: 'PROG/P' | 'PROG/I' | 'FUGR' | 'CLAS/OC',
    timeout?: number,
  ): Promise<string[]>;

  /** The function modules of a group. */
  listFunctionModules(functionGroupName: string): Promise<string[]>;

  /** The includes of a function group. */
  listFunctionGroupIncludes(functionGroupName: string): Promise<string[]>;

  /** A behaviour definition. */
  getBdef(
    bdefName: string,
    version?: 'active' | 'inactive',
  ): Promise<IAdtResponse>;

  /** Enhancements of an object. */
  getEnhancements(
    objectName: string,
    objectType: 'program' | 'include' | 'class',
    context?: string,
  ): Promise<IAdtResponse>;

  /** An enhancement spot. */
  getEnhancementSpot(enhancementSpot: string): Promise<IAdtResponse>;

  /** One implementation within a spot. */
  getEnhancementImpl(
    enhancementSpot: string,
    enhancementName: string,
  ): Promise<IAdtResponse>;
}
