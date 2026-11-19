/**
 * Shared types for cross-cutting ADT operations
 */

import type { AdtSearchType, AdtSearchTypeOf } from './AdtSearchTypes';
import type {
  AdtCodeOf,
  AdtCodeWith,
  AdtModernVariant,
  AdtParentedTypeCode,
  AdtTypeCode,
  AdtVariant,
} from './AdtTypeTables';
import type { AdtGroupOnlyCode, AdtUtilityCodeWith } from './AdtUtilityCodes';
import type { TextElementsWhereUsedContainer } from './IAdtTextElements';

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
 * What a group operation is given, per object.
 *
 * A **request** parameter, which is why it survived 31.0.0 while the result
 * shapes left: `activateObjectsGroup`, `checkDeletionGroup` and
 * `deleteObjectsGroup` take these, and a consumer cannot call them without the
 * type. It extended `IAdtObjectHit` — a result shape — until 31.0.0 and now
 * states its own fields, which are the ones the request carries.
 *
 * **Since 21.0.0 its `type` is an {@link AdtTypeCode}**, and it is generic in
 * the code: `IObjectReference<'FUGR/FF'>` — any code with a parent API —
 * requires `parentName`. The condition is not distributive, so the default,
 * every code at once, leaves `parentName` optional: a reference built from a
 * code known only as `AdtTypeCode` compiles, and an interface can extend it.
 * A union of one member per code would do neither — it exceeds the 25
 * combinations TypeScript checks an object literal against.
 *
 * **Since 22.0.0 `C` may be a group-only code** (`IObjectReference<'VIEW/DV'>`):
 * the constraint is wider, the default is not, so `IObjectReference` alone is
 * what it was in 21.0.0.
 */
export type IObjectReference<
  C extends AdtTypeCode | AdtGroupOnlyCode = AdtTypeCode,
> = {
  /** Object name, `adtcore:name`. */
  name: string;
  /** ADT object type code, e.g. `'CLAS/OC'`: a code of the tables. */
  type: C;
  /** ADT URI of the object, `adtcore:uri`, where the caller knows it. */
  uri?: string;
} & ([C] extends [AdtParentedTypeCode]
  ? {
      /** The parent object's name: the function group of `FUGR/FF`. */
      parentName: string;
    }
  : {
      /** Owning object, where the reference is to a part of one. */
      parentName?: string;
    });

/**
 * Search objects parameters
 */
export interface ISearchObjectsParams {
  query: string;
  /**
   * Restrict the search to one name of the release's object types list
   * (`AdtSearchType`, any release's): a main type (`'DEVC'`, `'TABL'`), an
   * alias of one code (`'STRU'`: `TABL/DS` only) or a group
   * (`'ABAP_TEST_COCKPIT'`). Not a code: one that is no item's `type` widens
   * or empties the search silently (see `ADT_SEARCH_TYPES_ONPREM`). A
   * variant's own names are {@link IAdtSearchObjectsParamsOf}.
   */
  objectType?: AdtSearchType;
  maxResults?: number;
}

/**
 * The search parameters of variant `V`: the filter takes only the names every
 * variant of `V` takes ({@link AdtSearchTypeOf}) — on 7.40 the eleven measured
 * there, so `STRU`, which answers nothing on 7.40, does not compile.
 */
export interface IAdtSearchObjectsParamsOf<V extends AdtVariant>
  extends ISearchObjectsParams {
  objectType?: AdtSearchTypeOf<V>;
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
 * The text elements' codes where-used does not serve, per variant — measured
 * 2026-11-19, read-only. SAP's handler (`CL_RIS_ADT_RES_REFERENCES`) resolves
 * any URI and refuses no type: for a type the RIS metadata names no
 * referencing types for, it answers `200` with no result and "Where-Used List
 * is not supported for &1" (Code). So:
 *
 * - `CLAS/OCX`: not served, on premise and on the cloud — "Where-Used List is
 *   not supported for Text Element: Class." (measured on both);
 * - `PROG/PX`: served on premise and on the cloud —
 *   `/sap/bc/adt/textelements/programs/{name}` resolves to `PROG/PX` (on
 *   premise the scope offers `PROG/P` and `PROG/PS`; on the cloud, for the
 *   delivered `RSPARAM` and `%SCPRCPROF`, 200 with `globalType="PROG/PX"`);
 *   a function group's text elements resolve to `PROG/PX` too (measured on
 *   premise), so they are found through it.
 */
interface ITextElementsWhereUsedRefused {
  readonly onprem: 'CLAS/OCX';
  readonly cloud: 'CLAS/OCX';
  readonly basis740: never;
}

/** The codes of {@link ITextElementsWhereUsedRefused} on any variant of `V`. */
type TextElementsWhereUsedRefused<V extends AdtVariant> = {
  [W in V]: ITextElementsWhereUsedRefused[W];
}[V];

/**
 * The codes an untyped where-used parameter may name: every code but
 * `CLAS/OCX`, which no system serves (measured, see
 * {@link ITextElementsWhereUsedRefused}).
 */
type WhereUsedTypeCode = Exclude<AdtTypeCode, 'CLAS/OCX'>;

/**
 * Which object a `PROG/PX` where-used names, and so its address: `PROG/PX` is
 * the text elements of a program (`/sap/bc/adt/textelements/programs/{name}`)
 * and of a function group (`/sap/bc/adt/textelements/functiongroups/{name}`) —
 * both resolve to `PROG/PX` and both are served (measured on premise; a
 * program's on the cloud too). The table keeps one collection per code, so
 * the parameter says which.
 *
 * `object_type` and `container` are `readonly`: they are the discriminant
 * and the address it decides, and a built value is not re-coded.
 *
 * Required with `PROG/PX`, refused with any other code: a one-member union
 * per code would split past TypeScript's 25 combinations, so it is one
 * object over all of `C` joined with "is `PROG/PX` with a container, or
 * another code without one", as {@link IAdtCodedReference} is.
 */
type WhereUsedContainer<C> = [Extract<C, 'PROG/PX'>] extends [never]
  ? { readonly container?: never }
  :
      | {
          readonly object_type: 'PROG/PX';
          readonly container: TextElementsWhereUsedContainer;
        }
      | {
          readonly object_type: Exclude<C, 'PROG/PX'>;
          readonly container?: never;
        };

/**
 * Where-used scope parameters (Step 1: get available object types).
 * `PROG/PX` names its `container` (required); no other code takes one.
 */
export type IGetWhereUsedScopeParams<
  C extends WhereUsedTypeCode | AdtGroupOnlyCode = WhereUsedTypeCode,
> = {
  object_name: string;
  readonly object_type: C;
} & WhereUsedContainer<C>;

/**
 * Where-used parameters (Step 2: execute search). `PROG/PX` names its
 * `container` (required); no other code takes one.
 */
export type IGetWhereUsedParams<
  C extends WhereUsedTypeCode | AdtGroupOnlyCode = WhereUsedTypeCode,
> = {
  object_name: string;
  readonly object_type: C;
  /**
   * Optional: scope XML from getWhereUsedScope() with user-modified selections.
   * When omitted, the search runs unscoped (SAP's default scope) — getWhereUsed()
   * does NOT fetch a scope itself, so it works on systems that do not expose the
   * /usageReferences/scope sub-resource.
   */
  scopeXml?: string;
} & WhereUsedContainer<C>;

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
  objectSearchPattern?: string | undefined;
  preselection?: IVirtualFoldersPreselection[] | undefined;
  facetOrder?: string[] | undefined;
  withVersions?: boolean | undefined;
  ignoreShortDescriptions?: boolean | undefined;
}

// ── What each group operation is given (22.0.0) ─────────────────────────────
//
// `IObjectReference[]` admits any code: a message class to an activation, a
// function module without its group. These are the codes each operation
// sends, intersected over the variants of `V` (the default modern variant
// gets what both newer tables serve), and the references built from them.

/**
 * The codes a group activation activates on every variant of `V`: those whose
 * API lists `activate`, and the utility codes listing `groupActivation`
 * (`VIEW/DV`; `DEVC/K` on the newer releases, unmeasured).
 */
export type AdtGroupActivationCode<V extends AdtVariant = AdtModernVariant> =
  | AdtCodeWith<V, 'activate'>
  | AdtUtilityCodeWith<V, 'groupActivation'>;

/** The codes a group deletion check asks about: those listing `deletionCheck`. */
export type AdtGroupDeletionCheckCode<V extends AdtVariant = AdtModernVariant> =
  AdtCodeWith<V, 'deletionCheck'>;

/**
 * The codes a group deletion deletes: those listing `delete`, but a message of
 * a message class (`MSAG/NN`), which has no address of its own — it is a row
 * of its class — and the utility codes listing `groupDeletion` (`VIEW/DV`).
 */
export type AdtGroupDeletionCode<V extends AdtVariant = AdtModernVariant> =
  | Exclude<AdtCodeWith<V, 'delete'>, 'MSAG/NN'>
  | AdtUtilityCodeWith<V, 'groupDeletion'>;

/**
 * The codes where-used is asked of: every code of `V` but a function include,
 * whose group the where-used request has no field for, a message class
 * message, which has no address of its own, and the text elements' codes SAP
 * does not serve there ({@link ITextElementsWhereUsedRefused}: `CLAS/OCX`,
 * measured); and the utility codes
 * listing `whereUsed` (`VIEW/DV`).
 */
export type AdtWhereUsedCode<V extends AdtVariant = AdtModernVariant> =
  | Exclude<
      AdtCodeOf<V>,
      'FUGR/I' | 'MSAG/NN' | TextElementsWhereUsedRefused<V>
    >
  | AdtUtilityCodeWith<V, 'whereUsed'>;

/**
 * A reference to one of the codes `C`, with `parentName` required for each
 * code that has a parent API (`FUGR/FF`, `FUGR/I`) and optional for the rest.
 *
 * Per code, but not as a union of one member per code: TypeScript relates an
 * object literal whose `type` is itself a union to such a union only up to 25
 * combinations, and a code set runs past it. So it is one reference over all
 * of `C`, joined with "names its parent, or is a code without one" — a literal
 * naming `parentName` matches the first without the `type` being split, and
 * one without it must have a code of the second.
 */
export type IAdtCodedReference<C extends AdtTypeCode | AdtGroupOnlyCode> = [
  Extract<C, AdtParentedTypeCode>,
] extends [never]
  ? IObjectReference<C>
  : IObjectReference<C> &
      ({ parentName: string } | { type: Exclude<C, AdtParentedTypeCode> });

/** What `activateObjectsGroup` is given, per object, on variant `V`. */
export type IAdtGroupActivationReference<
  V extends AdtVariant = AdtModernVariant,
> = IAdtCodedReference<AdtGroupActivationCode<V>>;

/** What `checkDeletionGroup` is given, per object, on variant `V`. */
export type IAdtGroupDeletionCheckReference<
  V extends AdtVariant = AdtModernVariant,
> = IAdtCodedReference<AdtGroupDeletionCheckCode<V>>;

/** What `deleteObjectsGroup` is given, per object, on variant `V`. */
export type IAdtGroupDeletionReference<
  V extends AdtVariant = AdtModernVariant,
> = IAdtCodedReference<AdtGroupDeletionCode<V>>;

/** What where-used is given on variant `V`. */
export type IAdtWhereUsedParamsOf<V extends AdtVariant = AdtModernVariant> =
  IGetWhereUsedParams<AdtWhereUsedCode<V>>;

/** What the where-used scope is given on variant `V`. */
export type IAdtWhereUsedScopeParamsOf<
  V extends AdtVariant = AdtModernVariant,
> = IGetWhereUsedScopeParams<AdtWhereUsedCode<V>>;
