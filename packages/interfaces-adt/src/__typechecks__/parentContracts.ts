// Compile-only assertions. If these stop compiling, the types regressed.
//
// The tables name a parent API for a function module, a function include and
// the four local class includes, and a message class message is addressed
// under its class. ADT addresses each under its parent, so a config or a
// reference without the parent cannot be sent. The atoms that identify an
// object take the keys that address it as `TRequired` (32.0.0: the object's
// own name, and its parent where it has one) and take
// `AdtObjectIdentity<TConfig, TRequired>`: every field optional except those.

import type { AdtTypeCode } from '../adt/AdtTypeTables';
import type {
  AdtObjectIdentity,
  IAdtDeletable,
  IAdtLockable,
  IAdtReadable,
} from '../adt/IAdtCapabilities';
import type { IClassConfig, ILocalTestClassConfig } from '../adt/IAdtClass';
import type { IFunctionIncludeConfig } from '../adt/IAdtFunctionInclude';
import type { IFunctionModuleConfig } from '../adt/IAdtFunctionModule';
import type { IMessageClassMessageConfig } from '../adt/IAdtMessageClass';
import type { IAdtAnsweredObject, IObjectReference } from '../adt/IAdtShared';

type Assert<T extends true> = T;
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

type ReadConfig<T, P extends keyof T> = Parameters<
  IAdtReadable<T, string, P>['read']
>[0];
type LockConfig<T, P extends keyof T> = Parameters<
  IAdtLockable<T, P>['lock']
>[0];
type DeleteConfig<T, P extends keyof T> = Parameters<
  IAdtDeletable<T, string, P, string>['delete']
>[0];

// ── The object's own name is always required ────────────────────────────────

export type _Checks = [
  Assert<
    Equal<
      AdtObjectIdentity<IClassConfig, 'className'>,
      Partial<Omit<IClassConfig, 'className'>> & { className: string }
    >
  >,
];

// @ts-expect-error a read without the class's name addresses nothing (32.0.0)
const _classByNothing: ReadConfig<IClassConfig, 'className'> = {};
void _classByNothing;

const _classByName: ReadConfig<IClassConfig, 'className'> = {
  className: 'ZCL_X',
};
void _classByName;

// Code generic in the config names the keys it needs.
export function _readGenerically<TConfig, TName extends keyof TConfig>(
  readable: IAdtReadable<TConfig, string, TName>,
  config: AdtObjectIdentity<TConfig, TName>,
): void {
  void readable.read(config);
}

// ── With its parent named, a function module needs its group ────────────────

// @ts-expect-error a function module is addressed under its group
const _moduleWithoutGroup: ReadConfig<
  IFunctionModuleConfig,
  'functionGroupName' | 'functionModuleName'
> = {
  functionModuleName: 'Z_SOME_MODULE',
};
void _moduleWithoutGroup;

const _moduleWithGroup: ReadConfig<IFunctionModuleConfig, 'functionGroupName'> =
  {
    functionGroupName: 'Z_SOME_GROUP',
    functionModuleName: 'Z_SOME_MODULE',
  };
void _moduleWithGroup;

// The same through every identifying member, not only `read`.
// @ts-expect-error lock needs the group too
const _lockWithoutGroup: LockConfig<
  IFunctionModuleConfig,
  'functionGroupName'
> = {
  functionModuleName: 'Z_SOME_MODULE',
};
void _lockWithoutGroup;

// @ts-expect-error a function include is addressed under its group
const _includeWithoutGroup: DeleteConfig<
  IFunctionIncludeConfig,
  'functionGroupName'
> = {
  includeName: 'LZ_SOME_GROUPF01',
};
void _includeWithoutGroup;

const _includeWithGroup: DeleteConfig<
  IFunctionIncludeConfig,
  'functionGroupName'
> = {
  functionGroupName: 'Z_SOME_GROUP',
  includeName: 'LZ_SOME_GROUPF01',
};
void _includeWithGroup;

// @ts-expect-error a local include is addressed under its class
const _localIncludeWithoutClass: ReadConfig<
  ILocalTestClassConfig,
  'className'
> = {};
void _localIncludeWithoutClass;

const _localIncludeWithClass: ReadConfig<ILocalTestClassConfig, 'className'> = {
  className: 'ZCL_SOME_CLASS',
};
void _localIncludeWithClass;

// @ts-expect-error a message is addressed under its class
const _messageWithoutClass: ReadConfig<
  IMessageClassMessageConfig,
  'className'
> = {
  msgno: '001',
};
void _messageWithoutClass;

// The rest of the config stays optional.
const _messageWithClass: ReadConfig<IMessageClassMessageConfig, 'className'> = {
  className: 'ZMY_MSGS',
};
void _messageWithClass;

// ── A reference names its parent where its code has one ─────────────────────

// @ts-expect-error `FUGR/FF` lives under a function group
const _moduleReference: IObjectReference<'FUGR/FF'> = {
  name: 'Z_SOME_MODULE',
  type: 'FUGR/FF',
};
void _moduleReference;

const _moduleReferenceWithGroup: IObjectReference<'FUGR/FF'> = {
  name: 'Z_SOME_MODULE',
  type: 'FUGR/FF',
  parentName: 'Z_SOME_GROUP',
};
void _moduleReferenceWithGroup;

const _classReference: IObjectReference<'CLAS/OC'> = {
  name: 'ZCL_SOME_CLASS',
  type: 'CLAS/OC',
};
void _classReference;

// A code known only as `AdtTypeCode` builds a reference: over every code at
// once the parent is optional.
export function _referenceFrom(c: AdtTypeCode, name: string): IObjectReference {
  return { type: c, name };
}

// And an interface can extend the reference.
export interface ReferenceWithNote extends IObjectReference {
  note: string;
}

// @ts-expect-error a reference's type is a code of the tables, upper case
const _lowerCaseReference: IObjectReference = { name: 'X', type: 'clas/oc' };
void _lowerCaseReference;

// ── An answered object is a known code or the text ADT sent, never both ────

const _known: IAdtAnsweredObject = { type: 'PROG/P' };
void _known;
const _unknown: IAdtAnsweredObject = { unknownType: 'ZZZZ/ZZ' };
void _unknown;

// @ts-expect-error an unknown code is not forced into the union
const _forced: IAdtAnsweredObject = { type: 'ZZZZ/ZZ' };
void _forced;

// @ts-expect-error a known type and an unknown one are exclusive
const _both: IAdtAnsweredObject = { type: 'PROG/P', unknownType: 'PROG/P' };
void _both;
