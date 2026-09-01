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
 * ## The gap, named rather than papered over
 *
 * **A result is part of the contract — decision 13 — and 18 of the 31
 * members here do not state one.** They answer `Promise<IAdtResponse>`: the transport
 * envelope, which every method could name and which tells a consumer only that
 * a request happened. The other 13 state what the caller gets — ten a
 * shape, three a string or a boolean.
 *
 * Three more were removed rather than shipped: `searchObjects`, `getWhereUsed`
 * and `getPackageContents` each had their contract sitting beside them —
 * `search`, `getWhereUsedList`, `getPackageContentsList` — so the raw member was
 * the envelope leaking into an atom, not a capability anyone needed.
 *
 * Two were closed from evidence rather than measurement: `getAllTypes` answers
 * the named-item list {@link INamedItem} already describes, and
 * `fetchNodeStructure` answers objects plus the ids to walk next. Both shapes
 * were lifted from parsers that have been reading those documents in
 * `mcp-abap-adt` against real systems — code that works is evidence; a shape
 * nobody has read is not.
 *
 * The twenty are left as they are, deliberately. Closing them means naming what
 * each endpoint sends, and 18 shapes would have to be named,
 * and nothing but a capture can name them, which decision 1 forbids. **A strategy does not close them
 * either** — handing the caller a parser makes the caller decide what comes
 * back, and the point of a contract is that the consumer is not rewritten when
 * the implementation changes. Strategy and result contract are different planes;
 * an attempt to use one for the other cost every implementer two signatures per
 * method before it was reverted.
 *
 * So they close one at a time, on captures. Until then this file states what a
 * consumer gets for 13 members and admits the gap for 18, which is the honest
 * shape of the thing rather than a finished one.
 */

import type { IAdtResponse } from '../connection/IAbapConnection';
import type { INamedItem } from '../execution/ITraceScheduling';
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
 * One object in a repository node, as `SEU_ADT_REPOSITORY_OBJ_NODE` carries it.
 *
 * The four fields are the ones a caller needs to identify and fetch the object;
 * a node the server sends without all four is not one, which is what the
 * traversal this was lifted from already assumed.
 */
export interface IRepositoryObjectNode {
  objectType: string;
  objectName: string;
  techName: string;
  objectUri: string;
}

/**
 * What one level of the repository tree answers with.
 *
 * `childNodeIds` is what makes the walk possible: the ids to ask for next. A
 * result without them would force the caller back to the raw document, which is
 * the coupling this contract removes.
 */
export interface IRepositoryNodeContents {
  objects: IRepositoryObjectNode[];
  childNodeIds: string[];
}

/**
 * `/sap/bc/adt/repository/informationsystem/*` — everything ADT answers about
 * *where* something is: what exists, what uses it, and what the repository will
 * show under a filter.
 */
export interface IAdtInformationSystem {
  /** Objects matching a query, parsed. */
  search(criteria: ISearchObjectsParams): Promise<ISearchResult[]>;

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

  /**
   * The object types this system knows.
   *
   * `nameditem:namedItemList`, which is the shape {@link INamedItem} already
   * names for trace catalogues — the same document served from a different
   * resource. Lifted from a parser that has been reading it in
   * `mcp-abap-adt` against real systems, rather than invented here.
   */
  getAllTypes(
    maxItemCount?: number,
    name?: string,
    data?: string,
  ): Promise<INamedItem[]>;

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
  /**
   * Children of a node: the objects it holds, and the nodes below it.
   *
   * Both halves come from one document — `SEU_ADT_REPOSITORY_OBJ_NODE` entries
   * and the `NODE_ID`s a caller walks next — and a consumer needs both to
   * traverse, which is why the result names them rather than handing back the
   * envelope. Lifted from a traversal running in `mcp-abap-adt`.
   */
  fetchNodeStructure(
    parentType: string,
    parentName: string,
    nodeId?: string,
    withShortDescriptions?: boolean,
  ): Promise<IRepositoryNodeContents>;

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
