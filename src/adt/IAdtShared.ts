/**
 * Shared types for cross-cutting ADT operations
 */

export type AdtObjectTypeLower =
  | 'class'
  | 'clas/oc'
  | 'program'
  | 'prog/p'
  | 'interface'
  | 'intf/if'
  | 'functionmodule'
  | 'fugr/ff'
  | 'view'
  | 'ddls/df'
  | 'structure'
  | 'stru/dt'
  | 'table'
  | 'tabl/dt'
  | 'tabletype'
  | 'ttyp/df'
  | 'domain'
  | 'doma/dd'
  | 'dataelement'
  | 'dtel'
  | 'functiongroup'
  | 'fugr'
  | 'package'
  | 'devc/k';

export type AdtObjectType = AdtObjectTypeLower | Uppercase<AdtObjectTypeLower>;

export type AdtSourceObjectTypeLower =
  | 'class'
  | 'clas/oc'
  | 'program'
  | 'prog/p'
  | 'interface'
  | 'intf/if'
  | 'functionmodule'
  | 'fugr/ff'
  | 'view'
  | 'ddls/df'
  | 'structure'
  | 'stru/dt'
  | 'table'
  | 'tabl/dt'
  | 'tabletype'
  | 'ttyp/df';

export type AdtSourceObjectType =
  | AdtSourceObjectTypeLower
  | Uppercase<AdtSourceObjectTypeLower>;

/**
 * What a group operation is given, per object.
 *
 * A **request** parameter, which is why it survived 31.0.0 while the result
 * shapes left: `activateObjectsGroup`, `checkDeletionGroup` and
 * `deleteObjectsGroup` take these, and a consumer cannot call them without the
 * type. It extended `IAdtObjectHit` — a result shape — until 31.0.0 and now
 * states its own fields, which are the ones the request carries.
 */
export interface IObjectReference {
  /** Object name, `adtcore:name`. */
  name: string;
  /** ADT object type code, e.g. `'CLAS/OC'`. */
  type: string;
  /** ADT URI of the object, `adtcore:uri`, where the caller knows it. */
  uri?: string;
  /** Owning object, where the reference is to a part of one. */
  parentName?: string;
}

/**
 * Search objects parameters
 */
export interface ISearchObjectsParams {
  query: string;
  objectType?: string;
  maxResults?: number;
}

/**
 * SQL query parameters
 */
export interface IGetSqlQueryParams {
  sql_query: string;
  row_number?: number;
}

/**
 * Table contents parameters
 */
export interface IGetTableContentsParams {
  table_name: string;
  max_rows?: number;
}

/**
 * ADT discovery request parameters
 */
export interface IGetDiscoveryParams {
  requestId?: string;
  timeout?: number;
}

/**
 * Where-used scope parameters (Step 1: get available object types)
 */
export interface IGetWhereUsedScopeParams {
  object_name: string;
  object_type: string;
}

/**
 * Where-used parameters (Step 2: execute search)
 */
export interface IGetWhereUsedParams {
  object_name: string;
  object_type: string;
  /**
   * Optional: scope XML from getWhereUsedScope() with user-modified selections.
   * When omitted, the search runs unscoped (SAP's default scope) — getWhereUsed()
   * does NOT fetch a scope itself, so it works on systems that do not expose the
   * /usageReferences/scope sub-resource.
   */
  scopeXml?: string;
}

/**
 * Parameters for getWhereUsedList (parsed version)
 */
export interface IGetWhereUsedListParams {
  object_name: string;
  object_type: string;
  /**
   * If true, searches in all available object types (Eclipse 'select all' behavior)
   * Default: false (uses SAP default scope)
   */
  enableAllTypes?: boolean;
  /**
   * Restrict the result to ONLY these object types (e.g. ['TABL/DS', 'TABL/DT']) —
   * this is how you avoid getting 1000 classes back when you only want
   * structures/tables. Where the `/usageReferences/scope` sub-resource is
   * available the other types are deselected server-side (SAP never searches
   * them); where it is not (some S/4 releases 404 it) the search runs unscoped
   * and the filter is applied to the parsed references client-side instead — the
   * returned set is the same either way. Type names are the ADT global types
   * (e.g. 'CLAS/OC', 'STRU/DT'). Takes precedence over `enableAllTypes`. Ignored
   * if empty.
   */
  enableOnlyTypes?: string[];
  /**
   * Remove these object types from the default SAP scope, keeping the rest.
   * Applied on top of the default scope (or after `enableOnlyTypes`/`enableAllTypes`).
   */
  disableTypes?: string[];
}

/**
 * Virtual folders preselection entry
 */
export interface IVirtualFoldersPreselection {
  facet: string;
  values: string[];
}

/**
 * Virtual folders contents parameters
 */
export interface IGetVirtualFoldersContentsParams {
  objectSearchPattern?: string;
  preselection?: IVirtualFoldersPreselection[];
  facetOrder?: string[];
  withVersions?: boolean;
  ignoreShortDescriptions?: boolean;
}
