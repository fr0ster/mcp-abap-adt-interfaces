// Compile-only assertions. If these stop compiling, the types regressed.
//
// 22.0.0's additions beside 21.0.0's types: the intersecting helpers, the group-only codes and the
// utility code tables, the group references per operation and the typed group
// and where-used atoms, the type-structure atom. And, for each, that 21.0.0's
// types are what they were.

import type {
  AdtCodeOf,
  AdtCodeOfIn,
  AdtCodeWith,
  AdtCodeWithIn,
  AdtModernVariant,
  AdtPerformingVariantsIn,
  AdtServingVariantsIn,
  AdtTypeCode,
  AdtTypeCodeOf,
  AdtTypeCodeWith,
  AdtVariant,
  IAdtTypeTables,
} from '../adt/AdtTypeTables';
import type {
  AdtGroupOnlyCode,
  AdtGroupOnlyCodeOf,
  AdtUtilityCodeWith,
  IAdtUtilityCodeTables,
} from '../adt/AdtUtilityCodes';
import type { IAdtHeaders } from '../adt/IAdtContentTypes';
import type { IResultStrategy } from '../adt/IAdtResponse';
import type {
  AdtGroupActivationCode,
  AdtWhereUsedCode,
  IAdtGroupActivationReference,
  IAdtGroupDeletionCheckReference,
  IAdtGroupDeletionReference,
  IAdtWhereUsedParamsOf,
  IGetWhereUsedParams,
  IObjectReference,
} from '../adt/IAdtShared';
import type {
  IAdtGroupLifecycle,
  IAdtTypedGroupLifecycle,
  IAdtTypedWhereUsed,
  IAdtTypeStructure,
  IAdtWhereUsed,
  IUtilResults,
} from '../adt/IAdtUtilities';

type Assert<T extends true> = T;
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

// ── Intersecting helpers, on two synthetic tables ───────────────────────────

type Facts<Ops extends string> = {
  readonly parent: null;
  readonly nameMaxLength: 30;
  readonly operations: readonly Ops[];
  readonly evidence: 'system-description-s4-2025--07-typestructure';
};

type Two = {
  readonly a: {
    readonly class: {
      readonly kind: 'class';
      readonly collection: '/sap/bc/adt/oo/classes';
      readonly codes: { readonly 'CLAS/OC': Facts<'read' | 'delete'> };
    };
    readonly program: {
      readonly kind: 'program';
      readonly collection: '/sap/bc/adt/programs/programs';
      readonly codes: { readonly 'PROG/P': Facts<'read'> };
    };
  };
  readonly b: {
    readonly class: {
      readonly kind: 'class';
      readonly collection: '/sap/bc/adt/oo/classes';
      readonly codes: { readonly 'CLAS/OC': Facts<'read'> };
    };
    readonly interface: {
      readonly kind: 'interface';
      readonly collection: '/sap/bc/adt/oo/interfaces';
      readonly codes: { readonly 'INTF/OI': Facts<'read'> };
    };
  };
};

export type SyntheticIntersection = [
  // Both tables list only CLAS/OC.
  Assert<Equal<AdtCodeOfIn<Two, 'a' | 'b'>, 'CLAS/OC'>>,
  Assert<Equal<AdtCodeOfIn<Two, 'a'>, 'CLAS/OC' | 'PROG/P'>>,
  // `delete` is listed by one of them only.
  Assert<Equal<AdtCodeWithIn<Two, 'a' | 'b', 'read'>, 'CLAS/OC'>>,
  Assert<Equal<AdtCodeWithIn<Two, 'a' | 'b', 'delete'>, never>>,
  Assert<Equal<AdtCodeWithIn<Two, 'a', 'delete'>, 'CLAS/OC'>>,
  Assert<Equal<AdtServingVariantsIn<Two, 'class'>, 'a' | 'b'>>,
  Assert<Equal<AdtServingVariantsIn<Two, 'program'>, 'a'>>,
  Assert<Equal<AdtPerformingVariantsIn<Two, 'class', 'delete'>, 'a'>>,
  Assert<Equal<AdtPerformingVariantsIn<Two, 'class', 'read'>, 'a' | 'b'>>,
];

// ── On the real tables: union semantics kept, intersection added ────────────

type Basis740Codes =
  | 'CLAS/OC'
  | 'INTF/OI'
  | 'PROG/P'
  | 'PROG/I'
  | 'FUGR/F'
  | 'FUGR/FF'
  | 'FUGR/I'
  | 'DDLS/DF'
  | 'MSAG/N'
  | 'MSAG/NN';

export type RealIntersection = [
  // Over all three: the APIs they share are 7.40's, so both name its codes.
  Assert<Equal<AdtTypeCodeOf<AdtVariant>, Basis740Codes>>,
  Assert<Equal<AdtCodeOf<AdtVariant>, Basis740Codes>>,
  // The two newer tables list the same codes, so for them both agree.
  Assert<Equal<AdtCodeOf<AdtModernVariant>, AdtTypeCodeOf<'onprem'>>>,
  // 7.40 checks no deletion: the union helper still names a class, the
  // intersection nothing.
  Assert<
    Equal<
      Extract<AdtTypeCodeWith<AdtVariant, 'deletionCheck'>, 'CLAS/OC'>,
      'CLAS/OC'
    >
  >,
  Assert<Equal<AdtCodeWith<AdtVariant, 'deletionCheck'>, never>>,
  // ABAP cloud creates and deletes no program or include of one's own: the
  // intersection of the two modern variants leaves them out.
  Assert<
    Equal<
      AdtCodeWith<AdtModernVariant, 'deletionCheck'>,
      Exclude<AdtTypeCodeWith<'onprem', 'deletionCheck'>, 'PROG/P' | 'PROG/I'>
    >
  >,
  Assert<
    Equal<
      AdtCodeWith<AdtModernVariant, 'create'>,
      Exclude<AdtTypeCodeWith<'onprem', 'create'>, 'PROG/P' | 'PROG/I'>
    >
  >,
  Assert<
    Equal<
      Extract<AdtTypeCodeWith<'cloud', 'read'>, 'PROG/P' | 'PROG/I'>,
      'PROG/P' | 'PROG/I'
    >
  >,
  Assert<
    Equal<AdtServingVariantsIn<IAdtTypeTables, 'package'>, AdtModernVariant>
  >,
  Assert<
    Equal<
      AdtPerformingVariantsIn<IAdtTypeTables, 'functionModule', 'unitTestRun'>,
      AdtModernVariant
    >
  >,
];

// ── Group-only codes and the utility tables ────────────────────────────────

export type GroupOnly = [
  Assert<Equal<AdtGroupOnlyCode, 'VIEW/DV'>>,
  Assert<Equal<AdtGroupOnlyCodeOf<AdtVariant>, 'VIEW/DV'>>,
  // A package's node structure is served on 7.40, measured; its group
  // activation on the newer releases is sent, unmeasured.
  Assert<Equal<AdtUtilityCodeWith<'basis740', 'nodeStructure'>, 'DEVC/K'>>,
  Assert<Equal<AdtUtilityCodeWith<AdtModernVariant, 'nodeStructure'>, never>>,
  Assert<
    Equal<
      AdtUtilityCodeWith<AdtModernVariant, 'groupActivation'>,
      'VIEW/DV' | 'DEVC/K'
    >
  >,
  Assert<Equal<AdtUtilityCodeWith<'basis740', 'groupActivation'>, 'VIEW/DV'>>,
  Assert<Equal<IAdtUtilityCodeTables['basis740']['DEVC/K']['measured'], true>>,
  Assert<Equal<IAdtUtilityCodeTables['onprem']['DEVC/K']['measured'], false>>,
  Assert<
    Equal<
      IAdtUtilityCodeTables['cloud']['VIEW/DV']['collection'],
      '/sap/bc/adt/ddic/views'
    >
  >,
];

// A reference and a where-used parameter can name VIEW/DV when asked to; the
// 21.0.0 defaults cannot, and are unchanged.
const _viewReference: IObjectReference<'VIEW/DV'> = {
  name: 'ZV_SOME_VIEW',
  type: 'VIEW/DV',
};
void _viewReference;
const _viewWhereUsed: IGetWhereUsedParams<'VIEW/DV'> = {
  object_name: 'ZV_SOME_VIEW',
  object_type: 'VIEW/DV',
};
void _viewWhereUsed;
// @ts-expect-error the 21.0.0 default takes the API tables' codes alone
const _viewByDefault: IObjectReference = { name: 'ZV', type: 'VIEW/DV' };
void _viewByDefault;
export type DefaultsUnchanged = [
  Assert<Equal<IObjectReference['type'], AdtTypeCode>>,
  Assert<Equal<IGetWhereUsedParams['object_type'], AdtTypeCode>>,
];

// ── The references per operation ───────────────────────────────────────────

const _classActivation: IAdtGroupActivationReference = {
  name: 'ZCL_SOME_CLASS',
  type: 'CLAS/OC',
};
void _classActivation;
const _viewActivation: IAdtGroupActivationReference = {
  name: 'ZV_SOME_VIEW',
  type: 'VIEW/DV',
};
void _viewActivation;
const _packageActivation: IAdtGroupActivationReference = {
  name: 'ZPKG',
  type: 'DEVC/K',
};
void _packageActivation;

const _messageClassActivation: IAdtGroupActivationReference = {
  name: 'ZMSG',
  // @ts-expect-error a message class is not activated
  type: 'MSAG/N',
};
void _messageClassActivation;

const _packageActivation740: IAdtGroupActivationReference<'basis740'> = {
  name: 'ZPKG',
  // @ts-expect-error 7.40 activates no package in a group
  type: 'DEVC/K',
};
void _packageActivation740;

// @ts-expect-error a function module is activated under its group
const _moduleActivation: IAdtGroupActivationReference = {
  name: 'Z_SOME_MODULE',
  type: 'FUGR/FF',
};
void _moduleActivation;

const _moduleActivationWithGroup: IAdtGroupActivationReference = {
  name: 'Z_SOME_MODULE',
  type: 'FUGR/FF',
  parentName: 'Z_SOME_GROUP',
};
void _moduleActivationWithGroup;

// Within the combination limit: a code known only by its set builds a
// reference when the parent is named, and does not when it is not.
export function _activationFrom(
  c: AdtGroupActivationCode,
  name: string,
): IAdtGroupActivationReference {
  return { type: c, name, parentName: 'Z_SOME_GROUP' };
}
export function _activationFromWithoutParent(
  c: AdtGroupActivationCode,
  name: string,
): IAdtGroupActivationReference {
  // @ts-expect-error `c` may be a function module, which needs its group
  return { type: c, name };
}

const _deletionCheck740: IAdtGroupDeletionCheckReference<'basis740'> = {
  name: 'ZCL_SOME_CLASS',
  // @ts-expect-error 7.40 checks no deletion, so no reference is one
  type: 'CLAS/OC',
};
void _deletionCheck740;

const _messageDeletion: IAdtGroupDeletionReference = {
  name: 'ZMSG',
  // @ts-expect-error a message is deleted by writing its class, not by address
  type: 'MSAG/NN',
};
void _messageDeletion;
const _viewDeletion: IAdtGroupDeletionReference<'basis740'> = {
  name: 'ZV_SOME_VIEW',
  type: 'VIEW/DV',
};
void _viewDeletion;

const _viewUsage: IAdtWhereUsedParamsOf = {
  object_name: 'ZV_SOME_VIEW',
  object_type: 'VIEW/DV',
};
void _viewUsage;
const _includeUsage: IAdtWhereUsedParamsOf = {
  object_name: 'LZ_SOME_GROUPF01',
  // @ts-expect-error where-used has no field for a function include's group
  object_type: 'FUGR/I',
};
void _includeUsage;
export type WhereUsedCodes = Assert<
  Equal<Extract<AdtWhereUsedCode<'basis740'>, 'VIEW/DV' | 'MSAG/NN'>, 'VIEW/DV'>
>;

// ── The typed atoms beside the 21.0.0 ones ─────────────────────────────────

declare const headers: IAdtHeaders;
declare const lifecycle: IAdtGroupLifecycle<
  string,
  string,
  string,
  string,
  string,
  string
> &
  IAdtTypedGroupLifecycle<string, string, string>;
declare const usage: IAdtWhereUsed<string, string> &
  IAdtTypedWhereUsed<string, string>;
declare const untyped: IObjectReference[];

export function _bothSignatures(): void {
  // A 21.0.0 caller's call keeps compiling.
  void lifecycle.activateObjectsGroup(untyped, undefined, { headers });
  void lifecycle.deleteObjectsGroup(untyped, undefined, { headers });
  // A typed one reaches VIEW/DV.
  void lifecycle.activateObjectsGroup(
    [{ name: 'ZV_SOME_VIEW', type: 'VIEW/DV' }],
    undefined,
    { headers },
  );
  void usage.getWhereUsed(
    { object_name: 'ZV_SOME_VIEW', object_type: 'VIEW/DV' },
    { headers },
  );
}

declare const typedOnly: IAdtTypedGroupLifecycle<string, string, string>;
export function _typedRefuses(): void {
  void typedOnly.activateObjectsGroup(
    // @ts-expect-error the typed atom takes no message class
    [{ name: 'ZMSG', type: 'MSAG/N' }],
    undefined,
    { headers },
  );
}

// ── The type-structure atom and its reading ─────────────────────────────────

declare const types: IAdtTypeStructure<string>;
export function _readTypes(): void {
  void types.getTypeStructure({ headers });
}

// The slot is optional: a 21.0.0 set is still one.
export type TypeStructureSlotOptional = Assert<
  Equal<
    Pick<IUtilResults, 'typeStructure'>,
    { readonly typeStructure?: IResultStrategy<unknown> }
  >
>;
