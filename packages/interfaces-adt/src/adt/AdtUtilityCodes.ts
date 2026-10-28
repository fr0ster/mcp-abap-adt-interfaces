/**
 * The codes the cross-cutting utilities take beyond the API tables, per
 * release variant: a code no API of the library serves, but that a group
 * operation or a repository read addresses (`VIEW/DV`), and a code whose API
 * a variant lacks or does not list the operation for, that a utility still
 * sends (`DEVC/K`).
 *
 * **Why a table of its own, not an API entry.** An entry in `ADT_TYPES_*`
 * makes a factory callable on that variant and an operation part of
 * `AdtOperation`. A package entry on 7.40 would gate `getPackage()` open
 * where every package member is refused, and a new operation word would
 * widen the closed vocabulary a 21.0.0 consumer maps exhaustively. These codes
 * belong to `getUtils()`, which is no entry (ruling R5), so they are typed
 * where its members read them.
 *
 * Constants and types only, like the API tables.
 */

import type { AdtTypeCode, AdtVariant } from './AdtTypeTables';
import type { AdtCollection, AdtTypeEvidence } from './IAdtTypeTable';

/** What a utility of `getUtils()` does with a code of these tables. */
export type AdtUtilityOperation =
  /** `activateObjectsGroup` */
  | 'groupActivation'
  /** `deleteObjectsGroup` */
  | 'groupDeletion'
  /** `getWhereUsed`, `getWhereUsedScope` */
  | 'whereUsed'
  /** `fetchNodeStructure` */
  | 'nodeStructure';

/** What a utility table says about one code. */
export interface IAdtUtilityCodeFacts<R extends string> {
  /** What the utilities do with it, at least one. */
  readonly operations: readonly [AdtUtilityOperation, ...AdtUtilityOperation[]];
  /**
   * Whether a live run measured these operations answered. `false` is a
   * request the library sends and nothing has proved.
   */
  readonly measured: boolean;
  /** The corpus case that lists the code on this release. */
  readonly evidence: AdtTypeEvidence<R>;
  /** The collection its objects are addressed under, where the code has no API. */
  readonly collection?: AdtCollection;
}

/** What a utility table `satisfies`. */
export type AdtUtilityCodeTable<R extends string> = {
  readonly [code: string]: IAdtUtilityCodeFacts<R>;
};

/**
 * On **S/4HANA 2025**: `VIEW/DV`, a DDIC database view, which group
 * activation, group deletion and where-used address under
 * `/sap/bc/adt/ddic/views` and no API serves; and `DEVC/K` in a group
 * activation, which the API table lists no `activate` for — sent, unmeasured.
 */
export const ADT_UTILITY_CODES_ONPREM = {
  'VIEW/DV': {
    operations: ['groupActivation', 'groupDeletion', 'whereUsed'],
    measured: false,
    evidence: 'system-description-s4-2025--07-typestructure',
    collection: '/sap/bc/adt/ddic/views',
  },
  'DEVC/K': {
    operations: ['groupActivation'],
    measured: false,
    evidence: 'system-description-s4-2025--07-typestructure',
  },
} as const satisfies AdtUtilityCodeTable<'s4-2025'>;

/** On **ABAP cloud**: the same as {@link ADT_UTILITY_CODES_ONPREM}. */
export const ADT_UTILITY_CODES_CLOUD = {
  'VIEW/DV': {
    operations: ['groupActivation', 'groupDeletion', 'whereUsed'],
    measured: false,
    evidence: 'system-description-abap-cloud--07-typestructure',
    collection: '/sap/bc/adt/ddic/views',
  },
  'DEVC/K': {
    operations: ['groupActivation'],
    measured: false,
    evidence: 'system-description-abap-cloud--07-typestructure',
  },
} as const satisfies AdtUtilityCodeTable<'abap-cloud'>;

/**
 * On **SAP_BASIS 7.40 SP04**: `VIEW/DV` as on the newer releases, and
 * `DEVC/K` in `fetchNodeStructure` — a package's contents are a node
 * structure of the package, measured served (the legacy `UtilsReaders`
 * cycle, `fetchNodeStructure('DEVC/K', '$TMP')`), though 7.40's API table has
 * no package entry.
 */
export const ADT_UTILITY_CODES_BASIS_740 = {
  'VIEW/DV': {
    operations: ['groupActivation', 'groupDeletion', 'whereUsed'],
    measured: false,
    evidence: 'system-description-basis-740--07-typestructure',
    collection: '/sap/bc/adt/ddic/views',
  },
  'DEVC/K': {
    operations: ['nodeStructure'],
    measured: true,
    evidence: 'system-description-basis-740--07-typestructure',
  },
} as const satisfies AdtUtilityCodeTable<'basis-740'>;

/** The utility table of each variant, by its name. */
export interface IAdtUtilityCodeTables {
  readonly onprem: typeof ADT_UTILITY_CODES_ONPREM;
  readonly cloud: typeof ADT_UTILITY_CODES_CLOUD;
  readonly basis740: typeof ADT_UTILITY_CODES_BASIS_740;
}

type UtilityCodesWithIn<T, Op extends AdtUtilityOperation> = {
  [C in keyof T]: T[C] extends {
    readonly operations: readonly (infer O)[];
  }
    ? [Op] extends [O]
      ? C
      : never
    : never;
}[keyof T] &
  string;

type VariantsWhereUtilityHas<C, Op extends AdtUtilityOperation> = {
  [W in AdtVariant]: C extends UtilityCodesWithIn<IAdtUtilityCodeTables[W], Op>
    ? W
    : never;
}[AdtVariant];

/**
 * The codes for which every variant of `V` lists utility operation `Op` —
 * intersecting, like `AdtCodeWith`: the default modern variant gets what both
 * newer tables list.
 */
export type AdtUtilityCodeWith<
  V extends AdtVariant,
  Op extends AdtUtilityOperation,
> = Extract<
  {
    [C in {
      [W in V]: UtilityCodesWithIn<IAdtUtilityCodeTables[W], Op>;
    }[V]]: [V] extends [VariantsWhereUtilityHas<C, Op>] ? C : never;
  }[{ [W in V]: UtilityCodesWithIn<IAdtUtilityCodeTables[W], Op> }[V]],
  AdtUtilityCode
>;

/** Every code a utility table holds: a code of the API tables, or a group-only one. */
export type AdtUtilityCode = AdtTypeCode | AdtGroupOnlyCode;

/**
 * The codes the utilities address that no API table holds — `VIEW/DV`. A
 * group-only code: it reaches a group operation or where-used, never a
 * factory.
 */
export type AdtGroupOnlyCode = Exclude<
  { [W in AdtVariant]: keyof IAdtUtilityCodeTables[W] }[AdtVariant],
  AdtTypeCode
>;

/** The group-only codes every variant of `V` lists. */
export type AdtGroupOnlyCodeOf<V extends AdtVariant> = {
  [C in AdtGroupOnlyCode]: [V] extends [
    {
      [W in AdtVariant]: C extends keyof IAdtUtilityCodeTables[W] ? W : never;
    }[AdtVariant],
  ]
    ? C
    : never;
}[AdtGroupOnlyCode];
