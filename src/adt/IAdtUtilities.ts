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
 * | `/packages/*` with the node structure it walks | {@link IAdtPackageBrowsing} |
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
 * Three more were removed rather than shipped: `searchObjects`, `getWhereUsed`
 * and `getPackageContents` each had their contract sitting beside them —
 * `search`, `getWhereUsedList`, `getPackageContentsList` — so the raw member was
 * the envelope leaking into an atom, not a capability anyone needed.
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
 * the named-item list {@link INamedItem} already describes, and
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

import type { INamedItem } from '../execution/ITraceScheduling';
import type { IReadOptions } from '../shared/IReadOptions';
import type { IAdtResponse } from './IAdtResponse';
import type {
  AdtObjectType,
  AdtSourceObjectType,
  IGetDiscoveryParams,
  IGetSqlQueryParams,
  IGetTableContentsParams,
  IGetVirtualFoldersContentsParams,
  IGetWhereUsedListParams,
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
 * One child level: an object type, and the node id holding objects of it.
 *
 * `SEU_ADT_OBJECT_TYPE_INFO` pairs the two, and the pair is the unit. An id on
 * its own answers "there is more below" and nothing else — the caller cannot ask
 * for the includes of a program, because which id holds `PROG/I` is exactly what
 * was dropped.
 *
 * `OBJECT_TYPE_LABEL` is in the document and deliberately not here: it is parsed
 * twice in `mcp-abap-adt` and read **zero** times, so it is a display string
 * nobody displays. Counted rather than assumed, because the field this interface
 * originally lost was lost by measuring which fields a parser *reads* instead of
 * which a caller *uses*. If a caller needs the label, it is added then — from a
 * capture, with the parse.
 */
export interface IRepositoryNodeChild {
  objectType: string;
  nodeId: string;
}

/**
 * What one level of the repository tree answers with.
 *
 * `childNodes` is what makes the walk possible: what is below, and how to ask
 * for it. A result without it would force the caller back to the raw document,
 * which is the coupling this contract removes — and a result carrying only the
 * ids does the same thing more quietly, which is what 26.2.0 shipped.
 */
export interface IRepositoryNodeContents {
  objects: IRepositoryObjectNode[];
  childNodes: IRepositoryNodeChild[];
}

/**
 * `/sap/bc/adt/repository/informationsystem/*` — everything ADT answers about
 * *where* something is: what exists, what uses it, and what the repository will
 * show under a filter.
 */
export interface IAdtInformationSystem<
  TSearch = ISearchResult[],
  TWhereUsed = IWhereUsedListResult,
  TTypes = INamedItem[],
> {
  /**
   * Objects matching a query.
   *
   * One signature. Until 30.0.0 a second overload took
   * `parse: (data: unknown) => T` so a caller could keep the document — a
   * recorded hit list runs to 473 rows and 1.3MB, with nested references
   * {@link ISearchResult} deliberately does not carry. That reading is still
   * available and is now chosen the way every other reading is: an
   * {@link IResultStrategy} given to the implementation, with `TSearch`
   * following it.
   *
   * Decision 20 — choice is offered by injection, never by more contract — and
   * decision 22, which says where the injection happens. A per-call argument is
   * a second signature every implementer pays for whether or not their callers
   * use it.
   */
  search(criteria: ISearchObjectsParams): Promise<IAdtResponse<TSearch>>;

  /** Where an object is used, parsed into references. */
  getWhereUsedList(
    params: IGetWhereUsedListParams,
  ): Promise<IAdtResponse<TWhereUsed>>;

  /** The scope document a where-used run is filtered by. */
  getWhereUsedScope(
    params: IGetWhereUsedScopeParams,
  ): Promise<IAdtResponse<string>>;

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
  ): Promise<IAdtResponse<string>>;

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
  ): Promise<IAdtResponse<TTypes>>;
}

/**
 * `/sap/bc/adt/repository/nodestructure` and `/objectstructure` — the tree, and
 * one object's place in it.
 */
export interface IAdtRepositoryStructure<TNode = IRepositoryNodeContents> {
  /**
   * Children of a node: the objects it holds, and the nodes below it.
   *
   * Both halves come from one document — `SEU_ADT_REPOSITORY_OBJ_NODE` entries
   * and the `SEU_ADT_OBJECT_TYPE_INFO` pairs a caller walks next — and a
   * consumer needs both to traverse, which is why the result names them rather
   * than handing back the envelope. Lifted from a traversal running in
   * `mcp-abap-adt`.
   *
   * The child half is pairs, not ids: see {@link IRepositoryNodeChild} for why
   * an id on its own cannot answer the question a walk asks.
   *
   * **`withShortDescriptions` reaches the wire, so it is a parameter** (decision
   * 17). What no *result* has ever carried is a description — every parser that
   * has read this document reads exactly the four identity fields
   * {@link IRepositoryObjectNode} names. A consumer who needs one supplies an
   * {@link IResultStrategy} that reads it, which is what `TNode` is for;
   * inventing a `description?: string` field nobody has captured is what
   * decision 1 forbids.
   *
   * **What this is for.** The node structure asked for as itself — a class's
   * includes, a program's parts, a node walked by hand. What a package holds is
   * asked of {@link IAdtPackageBrowsing}; that an implementation may come
   * through this same resource to answer it is invisible from outside, as it
   * should be.
   */
  fetchNodeStructure(
    parentType: string,
    parentName: string,
    options?: IGetNodeContentsOptions,
  ): Promise<IAdtResponse<TNode>>;

  /** The parts one object is made of. */
  getObjectStructure(
    objectType: string,
    objectName: string,
  ): Promise<IAdtResponse<string>>;
}

/**
 * What a package holds.
 *
 * Its own atom rather than part of {@link IAdtRepositoryStructure}: a package is
 * a container ADT gives its own resource, and reading what is in one is a
 * question about that container — **not** about the tree an implementation
 * happens to walk to answer it. Which requests it issues, and to which resource,
 * is its business.
 *
 * **One member.** Until 30.0.0 there were two: `getPackageContentsList`,
 * answering `IPackageContentItem[]`, and `getPackageHierarchy`, answering
 * `IPackageHierarchyNode`. One question, two answers, and which one a caller got
 * was decided by the method name rather than by the caller. What the answer
 * becomes is now an {@link IResultStrategy}, injected into the implementation
 * once — a flat list, a tree, names and type codes alone, or the document
 * untouched. {@link IPackageContentItem} and {@link IPackageHierarchyNode}
 * survive as the shapes the shipped strategies return.
 *
 * **No `maxDepth`, no `includeSubpackages`.** Those described a walk the library
 * performed on the caller's behalf across many requests. A member answers one
 * read; a consumer holding a result with sub-package references walks them
 * itself, which is what every consumer of the old tree did anyway.
 */
export interface IAdtPackageBrowsing<TContents = IPackageContentItem[]> {
  getPackageContents(
    packageName: string,
    options?: IGetPackageContentsOptions,
  ): Promise<IAdtResponse<TContents>>;
}

/** What the request itself takes; `maxDepth` is deliberately not among them. */
export interface IGetPackageContentsOptions {
  withShortDescriptions?: boolean;
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
export interface IAdtGroupLifecycle<TInactive = IInactiveObjectsResponse> {
  /** Activate several objects in one request. */
  activateObjectsGroup(
    objects: IObjectReference[],
    preauditRequested?: boolean,
  ): Promise<IAdtResponse<string>>;

  /**
   * What is inactive right now.
   *
   * **No `includeRawXml`.** A boolean that changes what the result *is* is a
   * reading chosen at the call site, which is the shape decisions 16 and 20 rule
   * out — and it could offer exactly two readings, chosen by whoever wrote the
   * flag. `TInactive` spans the space instead, following the
   * {@link IResultStrategy} the implementation was constructed with.
   */
  getInactiveObjects(): Promise<IAdtResponse<TInactive>>;

  /** Whether a set can be deleted, asked before deleting it. */
  checkDeletionGroup(
    objects: IObjectReference[],
  ): Promise<IAdtResponse<string>>;

  /** Delete several objects in one request. */
  deleteObjectsGroup(
    objects: IObjectReference[],
    transportRequest?: string,
  ): Promise<IAdtResponse<string>>;
}

/** `/sap/bc/adt/datapreview/*` — reading data rather than definitions. */
export interface IAdtDataPreview {
  /** A freestyle SQL query. */
  getSqlQuery(params: IGetSqlQueryParams): Promise<IAdtResponse<string>>;

  /** The rows of one table. */
  getTableContents(
    params: IGetTableContentsParams,
  ): Promise<IAdtResponse<string>>;
}

/** `/sap/bc/adt/discovery` — what this system says it serves. */
export interface IAdtDiscovery {
  discovery(params?: IGetDiscoveryParams): Promise<IAdtResponse<string>>;
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
  ): Promise<IAdtResponse<string>>;

  /** Metadata of any object. */
  readObjectMetadata(
    objectType: AdtObjectType,
    objectName: string,
    functionGroup?: string,
    options?: IReadOptions,
  ): Promise<IAdtResponse<string>>;

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
  getInclude(includeName: string): Promise<IAdtResponse<string>>;

  /** The includes an object is built from. */
  getIncludesList(
    objectName: string,
    objectType: 'PROG/P' | 'PROG/I' | 'FUGR' | 'CLAS/OC',
    timeout?: number,
  ): Promise<IAdtResponse<string[]>>;

  /** The function modules of a group. */
  listFunctionModules(
    functionGroupName: string,
  ): Promise<IAdtResponse<string[]>>;

  /** The includes of a function group. */
  listFunctionGroupIncludes(
    functionGroupName: string,
  ): Promise<IAdtResponse<string[]>>;
}
