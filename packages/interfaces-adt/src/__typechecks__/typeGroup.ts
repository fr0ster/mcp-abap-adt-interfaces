// Compile-only assertions. If these stop compiling, the types regressed.
//
// Type groups (`TYPE/DG`): their config, their result set, the locked delete
// they are the first to use, and the two rows — each written from the
// measurements of both releases, so a row edit changes one of these on purpose.

import type {
  ADT_TYPES_CLOUD,
  ADT_TYPES_ONPREM,
  AdtTypeCodeWith,
} from '../adt/AdtTypeTables';
import type { IAdtLockedDeletable } from '../adt/IAdtCapabilities';
import type { IAdtHeaders } from '../adt/IAdtContentTypes';
import type {
  IAdtError,
  IAdtResponse,
  IResultStrategy,
} from '../adt/IAdtResponse';
import type { ITypeGroupConfig, ITypeGroupResults } from '../adt/IAdtTypeGroup';
import type { AdtApiName } from '../adt/IAdtTypeTable';

type Assert<T extends true> = T;
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

const headers: IAdtHeaders = {
  accept: 'application/xml',
  contentType: 'application/xml',
};

function answered<T, E extends IAdtError = IAdtError>(
  value: T,
): IAdtResponse<T, E> {
  return { ok: true, getResult: () => ({ value }) };
}

// ── The API name ────────────────────────────────────────────────────────────

export type TypeGroupIsAnApi = Assert<
  Equal<Extract<AdtApiName, 'typeGroup'>, 'typeGroup'>
>;

// ── The config ──────────────────────────────────────────────────────────────

const _nameOnly: ITypeGroupConfig = { typeGroupName: 'ZTG1' };
void _nameOnly;

const _whole: ITypeGroupConfig = {
  typeGroupName: 'ZTG1',
  packageName: 'ZPKG',
  description: 'a type group',
  transportRequest: undefined,
  masterLanguage: 'EN',
  source: 'TYPE-POOL ztg1 .',
};
void _whole;

// @ts-expect-error the name is required
const _noName: ITypeGroupConfig = { packageName: 'ZPKG' };
void _noName;

const _noSubtype: ITypeGroupConfig = {
  typeGroupName: 'ZTG1',
  // @ts-expect-error a type group has no transformation type
  transformationType: 'XSLTProgram',
};
void _noSubtype;

// ── The result set: exactly nine slots ──────────────────────────────────────

declare const slot: IResultStrategy<unknown>;
const _results: ITypeGroupResults = {
  validation: slot,
  created: slot,
  metadata: slot,
  source: slot,
  updated: slot,
  activation: slot,
  deletion: slot,
  versions: slot,
  versionSource: slot,
};
void _results;

export type ResultSlots = Assert<
  Equal<
    keyof ITypeGroupResults,
    | 'validation'
    | 'created'
    | 'metadata'
    | 'source'
    | 'updated'
    | 'activation'
    | 'deletion'
    | 'versions'
    | 'versionSource'
  >
>;

// @ts-expect-error a result set without `versionSource` is incomplete
const _missing: ITypeGroupResults = {
  validation: slot,
  created: slot,
  metadata: slot,
  source: slot,
  updated: slot,
  activation: slot,
  deletion: slot,
  versions: slot,
};
void _missing;

const _extra: ITypeGroupResults = {
  ..._results,
  // @ts-expect-error the check run is not a type group member
  check: slot,
};
void _extra;

// ── The locked delete ───────────────────────────────────────────────────────

// A delete alone satisfies it: there is no deletion check to offer.
const _lockedDelete: IAdtLockedDeletable<
  ITypeGroupConfig,
  void,
  'typeGroupName'
> = {
  delete: async () => answered(undefined),
};
void _lockedDelete;

void _lockedDelete.delete(
  { typeGroupName: 'ZTG1' },
  { headers, lockHandle: 'HANDLE' },
);
void _lockedDelete.delete(
  { typeGroupName: 'ZTG1' },
  {
    headers,
    lockHandle: 'HANDLE',
    analyse: () => ({ kind: 'none' }) as never,
  },
);
// @ts-expect-error the delete runs under the caller's lock: the handle is required
void _lockedDelete.delete({ typeGroupName: 'ZTG1' }, { headers });

export type NoDeletionCheck = Assert<
  Equal<
    keyof IAdtLockedDeletable<ITypeGroupConfig, void, 'typeGroupName'>,
    'delete'
  >
>;

// ── The rows ────────────────────────────────────────────────────────────────

type Ops<T> = T extends {
  readonly typeGroup: {
    readonly codes: {
      readonly 'TYPE/DG': { readonly operations: readonly (infer O)[] };
    };
  };
}
  ? O
  : never;

type Facts<T> = T extends {
  readonly typeGroup: { readonly codes: { readonly 'TYPE/DG': infer F } };
}
  ? F
  : never;

export type Rows = [
  Assert<
    Equal<
      Ops<typeof ADT_TYPES_ONPREM>,
      | 'validate'
      | 'create'
      | 'readMetadata'
      | 'read'
      | 'source'
      | 'update'
      | 'lock'
      | 'unlock'
      | 'activate'
      | 'versions'
      | 'delete'
    >
  >,
  Assert<
    Equal<
      Ops<typeof ADT_TYPES_CLOUD>,
      'validate' | 'readMetadata' | 'read' | 'source' | 'versions'
    >
  >,
  Assert<Equal<Facts<typeof ADT_TYPES_ONPREM>['nameMaxLength'], 5>>,
  Assert<Equal<Facts<typeof ADT_TYPES_CLOUD>['nameMaxLength'], 5>>,
  Assert<
    Equal<
      Facts<typeof ADT_TYPES_ONPREM>['evidence'],
      'system-description-s4-2025--07-typestructure'
    >
  >,
  Assert<
    Equal<
      Facts<typeof ADT_TYPES_CLOUD>['evidence'],
      'system-description-abap-cloud--07-typestructure'
    >
  >,
  Assert<Equal<Extract<AdtTypeCodeWith<'cloud', 'create'>, 'TYPE/DG'>, never>>,
  Assert<
    Equal<Extract<AdtTypeCodeWith<'cloud', 'validate'>, 'TYPE/DG'>, 'TYPE/DG'>
  >,
  Assert<
    Equal<Extract<AdtTypeCodeWith<'onprem', 'delete'>, 'TYPE/DG'>, 'TYPE/DG'>
  >,
];
