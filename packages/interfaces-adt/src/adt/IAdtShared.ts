/**
 * Shared types for cross-cutting ADT operations
 */

import type { AdtParentedTypeCode, AdtTypeCode } from './AdtTypeTables';

/**
 * An object as an answer named it: its type code when the tables know it, the
 * code as it came when they do not.
 *
 * A code read from ADT is looked up once, where it is read. A known one
 * reaches the consumer as `type`, typed; one the tables do not hold — a type
 * the library does not serve, a newer release's — is not dropped and not
 * forced into the union, but carried as `unknownType`, the text as ADT sent
 * it. The two are exclusive, so a consumer that switches on `type` has
 * handled every code it can act on.
 */
export type IAdtAnsweredObject =
  | { type: AdtTypeCode; unknownType?: never }
  | { unknownType: string; type?: never };

/**
 * The parent of a reference to a code that lives under one — `FUGR/FF` and
 * `FUGR/I` under their function group — is required; elsewhere it names an
 * owning object where there is one.
 */
type IObjectReferenceParent<C extends AdtTypeCode> =
  C extends AdtParentedTypeCode
    ? {
        /** The parent object's name: the function group of `FUGR/FF`. */
        parentName: string;
      }
    : {
        /** Owning object, where the reference is to a part of one. */
        parentName?: string;
      };

/**
 * What a group operation is given, per object.
 *
 * A **request** parameter, which is why it survived 31.0.0 while the result
 * shapes left: `activateObjectsGroup`, `checkDeletionGroup` and
 * `deleteObjectsGroup` take these, and a consumer cannot call them without the
 * type. It extended `IAdtObjectHit` — a result shape — until 31.0.0 and now
 * states its own fields, which are the ones the request carries.
 *
 * **Since 21.0.0 its `type` is an {@link AdtTypeCode}**, and a reference to a
 * code with a parent API (`FUGR/FF`, `FUGR/I`) requires `parentName`: one
 * member per code, so the requirement follows the code the caller wrote.
 */
export type IObjectReference = {
  [C in AdtTypeCode]: {
    /** Object name, `adtcore:name`. */
    name: string;
    /** ADT object type code, e.g. `'CLAS/OC'`: a code of the tables. */
    type: C;
    /** ADT URI of the object, `adtcore:uri`, where the caller knows it. */
    uri?: string;
  } & IObjectReferenceParent<C>;
}[AdtTypeCode];

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
  /**
   * The statement to run against `/datapreview/ddic`.
   *
   * **The column list is the caller's since 42.0.0.** This member used to read
   * `/datapreview/ddic/{name}/metadata` first, build
   * `SELECT T~A, T~B FROM T` out of every column it found, and post that — two
   * requests in one member, and a statement nobody outside could change. Read
   * the columns with `getTableColumns` and write the statement you want, or
   * write one that names no columns at all.
   *
   * **Required, and that is the point.** Optional here would compile for every
   * caller still written against the old member, and fail at runtime with no
   * statement to post. A major release is where a migration becomes a type
   * error instead of a surprise.
   */
  sql_query: string;
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
