// Compile-only assertions. If these stop compiling, the types regressed.
//
// The tables name a parent API for a function module, a function include and
// the four local class includes. ADT addresses each under its parent, so a
// config or a reference without the parent cannot be sent — and since 21.0.0
// it does not compile. The members that identify an object take
// `AdtIdentity<TConfig>`: every field optional, except the parent.

import type {
  AdtIdentity,
  IAdtDeletable,
  IAdtLockable,
  IAdtReadable,
} from '../adt/IAdtCapabilities';
import type { IClassConfig, ILocalTestClassConfig } from '../adt/IAdtClass';
import type { IFunctionIncludeConfig } from '../adt/IAdtFunctionInclude';
import type { IFunctionModuleConfig } from '../adt/IAdtFunctionModule';
import type { IAdtAnsweredObject, IObjectReference } from '../adt/IAdtShared';

type Assert<T extends true> = T;
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

type ReadConfig<T> = Parameters<IAdtReadable<T, string>['read']>[0];
type LockConfig<T> = Parameters<IAdtLockable<T>['lock']>[0];
type DeleteConfig<T> = Parameters<IAdtDeletable<T, string>['delete']>[0];

// ── A function module without its group does not compile ────────────────────

// @ts-expect-error a function module is addressed under its group
const _moduleWithoutGroup: ReadConfig<IFunctionModuleConfig> = {
  functionModuleName: 'Z_SOME_MODULE',
};
void _moduleWithoutGroup;

const _moduleWithGroup: ReadConfig<IFunctionModuleConfig> = {
  functionGroupName: 'Z_SOME_GROUP',
  functionModuleName: 'Z_SOME_MODULE',
};
void _moduleWithGroup;

// The same through every identifying member, not only `read`.
// @ts-expect-error lock needs the group too
const _lockWithoutGroup: LockConfig<IFunctionModuleConfig> = {
  functionModuleName: 'Z_SOME_MODULE',
};
void _lockWithoutGroup;

// @ts-expect-error a function include is addressed under its group
const _includeWithoutGroup: DeleteConfig<IFunctionIncludeConfig> = {
  includeName: 'LZ_SOME_GROUPF01',
};
void _includeWithoutGroup;

const _includeWithGroup: DeleteConfig<IFunctionIncludeConfig> = {
  functionGroupName: 'Z_SOME_GROUP',
  includeName: 'LZ_SOME_GROUPF01',
};
void _includeWithGroup;

// @ts-expect-error a local include is addressed under its class
const _localIncludeWithoutClass: ReadConfig<ILocalTestClassConfig> = {};
void _localIncludeWithoutClass;

const _localIncludeWithClass: ReadConfig<ILocalTestClassConfig> = {
  className: 'ZCL_SOME_CLASS',
};
void _localIncludeWithClass;

// A config without a parent is taken partially, as it always was.
export type NoParentIsPartial = Assert<
  Equal<keyof AdtIdentity<IClassConfig>, keyof Partial<IClassConfig>>
>;
const _classByNothing: ReadConfig<IClassConfig> = {};
void _classByNothing;

// ── A group operation's reference to a parented code names its parent ───────

// @ts-expect-error `FUGR/FF` lives under a function group
const _moduleReference: IObjectReference = {
  name: 'Z_SOME_MODULE',
  type: 'FUGR/FF',
};
void _moduleReference;

const _moduleReferenceWithGroup: IObjectReference = {
  name: 'Z_SOME_MODULE',
  type: 'FUGR/FF',
  parentName: 'Z_SOME_GROUP',
};
void _moduleReferenceWithGroup;

const _classReference: IObjectReference = {
  name: 'ZCL_SOME_CLASS',
  type: 'CLAS/OC',
};
void _classReference;

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
