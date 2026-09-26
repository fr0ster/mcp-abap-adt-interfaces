/**
 * The cross-cutting ADT operations, split by the resource families ADT itself
 * has — not by which of them a particular system refuses.
 *
 * `AdtUtils` in `@mcp-abap-adt/adt-clients` is one class with 28 public methods,
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
 * | `/activation`, `/deletion` | {@link IAdtGroupLifecycle} |
 * | `/datapreview/*` | {@link IAdtDataPreview} |
 * | `/discovery` | {@link IAdtDiscovery} |
 * | the per-type resources — `oo`, `programs`, `ddic`, `functions`, `enhancements` | {@link IAdtObjectAccess} |
 *
 * Deliberately *not* the grain a measurement suggested. When this split was
 * chosen, the one legacy implementation refused exactly `getSqlQuery`,
 * `getTableContents` and `getTransaction` — which would have given three atoms
 * and a bag of 28. Those refusals fall **inside** these families rather than
 * defining them, so architecture and observation agree; observation is simply
 * narrower, and a contract split by who refuses what is a contract that changes
 * shape with the next system.
 *
 * Removing `getTransaction` made that concrete rather than theoretical. The
 * legacy implementation now refuses two members, and **both are
 * {@link IAdtDataPreview}** — a whole family, refused whole, which is what a
 * split along ADT's resources predicts and a split along refusals could not have
 * known in advance. Had the atoms been drawn from the observation, one of the
 * three would have evaporated when its member did.
 *
 * A few members compute a string and issue no request — `supportsSourceCode`,
 * `getObjectSourceUri`, `modifyWhereUsedScope`. They stay with the family whose
 * requests they prepare, because a consumer replacing that family needs them to
 * build the same call.
 *
 * ## The gap, named rather than papered over
 *
 * **Every member states its result.** Twelve of the twenty-five answered
 * `IAdtWireResponse` — the transport envelope, which every method could name and
 * which told a consumer only that a request happened. They now answer the
 * document their endpoint produced, and parsing it is the consumer's (decision
 * 5). The other thirteen already stated what the caller gets.
 *
 * Counted as **members**, not signatures: `search` has two, because one endpoint
 * is one member (decision 16) and the second signature is the strategy, not a
 * second capability. A parser that counts signatures reports 26 and is not
 * wrong about anything except the word.
 *
 *
 * Six were removed because nobody calls them — `getTypeInfo`, `getTransaction`,
 * `getBdef`, `getEnhancements`, `getEnhancementSpot`, `getEnhancementImpl`. Every
 * mention of them across the sibling repositories was their own doc comment.
 * The question was never which result they promise, but why they were in a
 * contract; three of them were a second door to a handler that was already
 * there — `getBdef` to `getBehaviorDefinition().read()`, `getEnhancementImpl`
 * and `getEnhancementSpot` to `getEnhancement()` — and the other three named
 * resources nothing else reaches. Deleted in `@mcp-abap-adt/adt-clients` with
 * those three endpoints recorded, so a typed handler can be built where one is
 * wanted rather than a generic member kept in case one is.
 *
 * Two were closed from evidence rather than measurement: `getAllTypes` answers
 * the named-item list a trace catalogue answers with, and
 * `fetchNodeStructure` answers objects plus the typed child nodes to walk next.
 * Both shapes were lifted from parsers that have been reading those documents in
 * `mcp-abap-adt` against real systems — code that works is evidence; a shape
 * nobody has read is not.
 *
 * Evidence is not the same as being finished. `fetchNodeStructure` first shipped
 * carrying the ids alone, which cannot say *which* node holds a given type, and
 * 27.0.0 is that correction — found by a consumer trying to walk with it.
 *
 * The twelve are left as they are, deliberately. Closing them means naming what
 * each endpoint sends, and 12 shapes would have to be named,
 * and nothing but a capture can name them, which decision 1 forbids. **A strategy does not close them
 * either** — handing the caller a parser makes the caller decide what comes
 * back, and the point of a contract is that the consumer is not rewritten when
 * the implementation changes. Strategy and result contract are different planes;
 * an attempt to use one for the other cost every implementer two signatures per
 * method before it was reverted.
 *
 * So they close one at a time, on captures. Until then this file states what a
 * consumer gets for 13 members and admits the gap for 12, which is the honest
 * shape of the thing rather than a finished one.
 */

import type { IReadOptions } from '../shared/IReadOptions';
import type { IAdtAnalyseOptions, IAnalyse } from './IAdtObject';
import type { IAdtError, IAdtResponse } from './IAdtResponse';
import type {
  AdtObjectType,
  AdtSourceObjectType,
  IGetDiscoveryParams,
  IGetSqlQueryParams,
  IGetTableContentsParams,
  IGetVirtualFoldersContentsParams,
  IGetWhereUsedParams,
  IGetWhereUsedScopeParams,
  IObjectReference,
  ISearchObjectsParams,
} from './IAdtShared';

/**
 * `/sap/bc/adt/repository/informationsystem/*` — everything ADT answers about
 * *where* something is: what exists, what uses it, and what the repository will
 * show under a filter.
 *
 * **Four endpoints, so four atoms.** This was one interface until 40.0.0, and
 * bundling them meant an implementation that offered three of the four could
 * declare none of them. That is what happened: a where-used member that issued
 * *two* requests — the scope, then the search — left `adt-clients` under the
 * one-member-one-endpoint rule, and taking it out of a bundle would have
 * dropped `search` and the scope members with it, which are single requests and
 * staying.
 *
 * The composite below still exists and still means what it meant, so an
 * implementation offering all four writes one name.
 */
export interface IAdtInformationSystem<
  TSearch,
  TWhereUsed,
  TScope,
  TFolders,
  TTypes,
> extends IAdtObjectSearch<TSearch>,
    IAdtWhereUsed<TWhereUsed, TScope>,
    IAdtVirtualFolders<TFolders>,
    IAdtTypeCatalogue<TTypes> {}

/**
 * `/informationsystem/search` — objects matching a query.
 *
 * **Not `IAdtSearchable`.** That name was removed in 30.0.0 and meant something
 * else: an atom a per-object handler declared, which was wrong because
 * searching is not something an object does to itself. This is the information
 * system's own member, split out of the bundle so an implementation can offer
 * it without offering the where-used pair.
 */
export interface IAdtObjectSearch<TSearch> {
  /**
   * Objects matching a query.
   *
   * One signature. Until 30.0.0 a second overload took
   * `parse: (data: unknown) => T` so a caller could keep the document — a
   * recorded hit list runs to 473 rows and 1.3MB, with nested references
   * a parsed hit list deliberately does not carry. That reading is still
   * available and is now chosen the way every other reading is: an
   * {@link IResultStrategy} given to the implementation, with `TSearch`
   * following it.
   *
   * Decision 20 — choice is offered by injection, never by more contract — and
   * decision 22, which says where the injection happens. A per-call argument is
   * a second signature every implementer pays for whether or not their callers
   * use it.
   */
  search<E extends IAdtError>(
    criteria: ISearchObjectsParams,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TSearch, E>>;
  search(
    criteria: ISearchObjectsParams,
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TSearch>>;
}

/**
 * `/informationsystem/usageReferences` and its `scope` sub-resource.
 *
 * **Two requests, two members, and the caller joins them.** A run that wants a
 * narrowed scope fetches the scope document, edits it, and passes it to the
 * search. There is no member that does all three: the order, and what to do
 * when the `scope` sub-resource is absent — some systems answer it `404` — are
 * decisions that belong to whoever is asking, not to a client that would have
 * to guess a fallback.
 */
export interface IAdtWhereUsed<TWhereUsed, TScope> {
  /** Where an object is used. One request. */
  getWhereUsed<E extends IAdtError>(
    params: IGetWhereUsedParams,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TWhereUsed, E>>;
  getWhereUsed(
    params: IGetWhereUsedParams,
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TWhereUsed>>;

  /** The scope document a where-used run is filtered by. */
  getWhereUsedScope<E extends IAdtError>(
    params: IGetWhereUsedScopeParams,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TScope, E>>;
  getWhereUsedScope(
    params: IGetWhereUsedScopeParams,
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TScope>>;

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
}

/** `/informationsystem/virtualfolders` — the repository as folders. */
export interface IAdtVirtualFolders<TFolders> {
  /** The repository as folders, under a preselection. */
  getVirtualFoldersContents<E extends IAdtError>(
    params: IGetVirtualFoldersContentsParams,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TFolders, E>>;
  getVirtualFoldersContents(
    params: IGetVirtualFoldersContentsParams,
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TFolders>>;
}

/** `/informationsystem/objecttypes` — the types this system knows. */
export interface IAdtTypeCatalogue<TTypes> {
  /**
   * The object types this system knows.
   *
   * `nameditem:namedItemList` — the same document a trace catalogue serves from
   * a different resource, so an implementation that reads one reads the other.
   * Measured against real systems rather than invented; the shape itself is the
   * implementation's since 31.0.0.
   */
  getAllTypes<E extends IAdtError>(
    maxItemCount: number | undefined,
    name: string | undefined,
    data: string | undefined,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TTypes, E>>;
  getAllTypes(
    maxItemCount?: number,
    name?: string,
    data?: string,
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TTypes>>;
}

/**
 * `/sap/bc/adt/repository/nodestructure` and `/objectstructure` — the tree, and
 * one object's place in it.
 */
export interface IAdtRepositoryStructure<TNode, TObjectStructure> {
  /**
   * Children of a node: the objects it holds, and the nodes below it.
   *
   * Both halves come from one document — `SEU_ADT_REPOSITORY_OBJ_NODE` entries
   * and the `SEU_ADT_OBJECT_TYPE_INFO` pairs a caller walks next — and a
   * consumer needs both to traverse, which is why the result names them rather
   * than handing back the envelope. Lifted from a traversal running in
   * `mcp-abap-adt`.
   *
   * The child half is pairs, not ids: an id on its own cannot answer "which node
   * holds the includes", which is the question a walk asks. That is a property
   * an implementation's reading must keep — the shape that used to state it left
   * in 31.0.0.
   *
   * **`withShortDescriptions` reaches the wire, so it is a parameter** (decision
   * 17). What no *result* has ever carried is a description — every parser that
   * has read this document reads exactly four identity fields. A consumer who
   * needs a description supplies an
   * {@link IResultStrategy} that reads it, which is what `TNode` is for;
   * inventing a `description?: string` field nobody has captured is what
   * decision 1 forbids.
   *
   * **What this is for.** The node structure asked for as itself — a class's
   * includes, a program's parts, a package's contents, a node walked by hand.
   * It answers one level; walking further is the caller's, one call per level,
   * because a member that walked could never be given a reading.
   */
  fetchNodeStructure<E extends IAdtError>(
    parentType: string,
    parentName: string,
    options: IGetNodeContentsOptions &
      IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TNode, E>>;
  fetchNodeStructure(
    parentType: string,
    parentName: string,
    options?: IGetNodeContentsOptions & IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TNode>>;

  /** The parts one object is made of. */
  getObjectStructure<E extends IAdtError>(
    objectType: string,
    objectName: string,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TObjectStructure, E>>;
  getObjectStructure(
    objectType: string,
    objectName: string,
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TObjectStructure>>;
}

/**
 * What the node-structure request itself takes.
 *
 * `node_id` selects a sub-node of the parent; without it the server answers the
 * parent's own level. Both reach the wire (decision 17), which is why they are
 * here and a traversal depth is not.
 */
export interface IGetNodeContentsOptions {
  nodeId?: string;
  withShortDescriptions?: boolean;
}

/**
 * `/sap/bc/adt/activation` and `/sap/bc/adt/deletion` — operations ADT takes on
 * a set of objects at once, rather than on one.
 */
export interface IAdtGroupLifecycle<
  TInactive,
  TActivation,
  TRun,
  TResults,
  TDeletionCheck,
  TDeletion,
> {
  /** Activate several objects in one request. */
  activateObjectsGroup<E extends IAdtError>(
    objects: IObjectReference[],
    preauditRequested: boolean | undefined,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TActivation, E>>;
  activateObjectsGroup(
    objects: IObjectReference[],
    preauditRequested?: boolean,
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TActivation>>;

  /**
   * What an activation run is doing — `/activation/runs/{runId}`.
   *
   * One request. `withLongPolling` reaches the wire — the server holds the
   * request open rather than answering at once — so it is a parameter, not a
   * reading (decision 17). Which value of `runs:status` ends a wait is the
   * caller's to decide, and how long to wait is theirs to write.
   */
  getActivationRun<E extends IAdtError>(
    runId: string,
    options: { withLongPolling?: boolean } & IAdtAnalyseOptions<E> & {
        analyse: IAnalyse<E>;
      },
  ): Promise<IAdtResponse<TRun, E>>;
  getActivationRun(
    runId: string,
    options?: { withLongPolling?: boolean } & IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TRun>>;

  /** What that run produced — `/activation/results/{runId}`. */
  getActivationResults<E extends IAdtError>(
    runId: string,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TResults, E>>;
  getActivationResults(
    runId: string,
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TResults>>;

  /**
   * What is inactive right now.
   *
   * **No `includeRawXml`.** A boolean that changes what the result *is* is a
   * reading chosen at the call site, which is the shape decisions 16 and 20 rule
   * out — and it could offer exactly two readings, chosen by whoever wrote the
   * flag. `TInactive` spans the space instead, following the
   * {@link IResultStrategy} the implementation was constructed with.
   */
  getInactiveObjects<E extends IAdtError>(
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TInactive, E>>;
  getInactiveObjects(
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TInactive>>;

  /** Whether a set can be deleted, asked before deleting it. */
  checkDeletionGroup<E extends IAdtError>(
    objects: IObjectReference[],
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TDeletionCheck, E>>;
  checkDeletionGroup(
    objects: IObjectReference[],
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TDeletionCheck>>;

  /** Delete several objects in one request. */
  deleteObjectsGroup<E extends IAdtError>(
    objects: IObjectReference[],
    transportRequest: string | undefined,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TDeletion, E>>;
  deleteObjectsGroup(
    objects: IObjectReference[],
    transportRequest?: string,
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TDeletion>>;
}

/** `/sap/bc/adt/datapreview/*` — reading data rather than definitions. */
export interface IAdtDataPreview<TQuery, TColumns, TContents> {
  /** A freestyle SQL query. */
  getSqlQuery<E extends IAdtError>(
    params: IGetSqlQueryParams,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TQuery, E>>;
  getSqlQuery(
    params: IGetSqlQueryParams,
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TQuery>>;

  /** The rows of one table. */
  /**
   * The columns a DDIC entity has — `/datapreview/ddic/{name}/metadata`.
   *
   * One request. It exists because the member below no longer makes it: the
   * statement is the caller's, and this is where they learn what they may name
   * in it.
   */
  getTableColumns<E extends IAdtError>(
    tableName: string,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TColumns, E>>;
  getTableColumns(
    tableName: string,
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TColumns>>;

  /**
   * Rows from a DDIC entity — `/datapreview/ddic`.
   *
   * One request: the statement in `params.sql_query` is posted as given. Until
   * 42.0.0 this read the entity's metadata first and built the statement from
   * every column it found, which is a choice the caller could not reach.
   */
  getTableContents<E extends IAdtError>(
    params: IGetTableContentsParams,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TContents, E>>;
  getTableContents(
    params: IGetTableContentsParams,
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TContents>>;
}

/** `/sap/bc/adt/discovery` — what this system says it serves. */
export interface IAdtDiscovery<TDiscovery> {
  discovery<E extends IAdtError>(
    params: IGetDiscoveryParams | undefined,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TDiscovery, E>>;
  discovery(
    params?: IGetDiscoveryParams,
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TDiscovery>>;
}

/**
 * The per-type resources — `oo`, `programs`, `ddic`, `functions`,
 * `enhancements` — reached generically, by type and name.
 *
 * This is what a caller uses when the type is a value rather than a decision:
 * the typed handlers on `AdtClient` are for when it is known at the call site.
 */
export interface IAdtObjectAccess<TSource, TMetadata, TInclude> {
  /** Source of any object that has source. */
  readObjectSource<E extends IAdtError>(
    objectType: AdtSourceObjectType,
    objectName: string,
    functionGroup: string | undefined,
    version: 'active' | 'inactive' | undefined,
    options: IReadOptions & IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TSource, E>>;
  readObjectSource(
    objectType: AdtSourceObjectType,
    objectName: string,
    functionGroup?: string,
    version?: 'active' | 'inactive',
    options?: IReadOptions & IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TSource>>;

  /** Metadata of any object. */
  readObjectMetadata<E extends IAdtError>(
    objectType: AdtObjectType,
    objectName: string,
    functionGroup: string | undefined,
    options: IReadOptions & IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TMetadata, E>>;
  readObjectMetadata(
    objectType: AdtObjectType,
    objectName: string,
    functionGroup?: string,
    options?: IReadOptions & IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TMetadata>>;

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
  getInclude<E extends IAdtError>(
    includeName: string,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TInclude, E>>;
  getInclude(
    includeName: string,
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TInclude>>;

  /*
   * `getIncludesList`, `listFunctionModules` and `listFunctionGroupIncludes`
   * were here until 41.0.0.
   *
   * Each was a walk: read the object's node structure, find the child type's
   * node id, read that node. Two requests, so no `IResultStrategy` could ever
   * be given for one — a strategy takes a single answer — and the shape of the
   * list was fixed at `string[]` for everyone.
   *
   * `fetchNodeStructure` in {@link IAdtRepositoryStructure} is the step they
   * were built from. It is one request, it has a reading, and a caller composes
   * the two calls in the order and the shape they want.
   *
   * The five members above stay: each is one request, or none at all.
   */
}
