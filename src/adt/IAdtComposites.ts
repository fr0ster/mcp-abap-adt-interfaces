/**
 * Named capability composites for the recurring handler profiles. A handler
 * implements the composite that matches the capabilities it genuinely supports;
 * the fat IAdtObject is deprecated in favour of these.
 */
import type {
  IAdtActivatable,
  IAdtCheckable,
  IAdtCrud,
  IAdtLockable,
  IAdtTransportAware,
  IAdtValidatable,
  IAdtVersionable,
} from './IAdtCapabilities';
import type { IClassConfig, IClassState } from './IAdtClass';
import type { IAdtObject } from './IAdtObject';

/** Full capability set — source-backed objects (has /source/main → versions). */
export type IAdtSourceObject<TConfig, TValue> = IAdtCrud<TConfig, TValue> &
  IAdtValidatable<TConfig, TValue> &
  IAdtCheckable<TConfig, TValue> &
  IAdtActivatable<TConfig, TValue> &
  IAdtLockable<TConfig> &
  IAdtVersionable<TConfig> &
  IAdtTransportAware<TConfig, TValue>;

/** Assertion helper: instantiating with `false` is a compile error. */
type Assert<T extends true> = T;

/**
 * IAdtSourceObject must be structurally identical to the (deprecated) IAdtObject
 * — both directions — so switching a full handler from one to the other is a
 * no-op. Instantiated at a concrete pair, or nothing is checked.
 */
type _SourceEqualsObject<C, R> = [
  Assert<IAdtSourceObject<C, R> extends IAdtObject<C, R> ? true : false>,
  Assert<IAdtObject<C, R> extends IAdtSourceObject<C, R> ? true : false>,
];
type _Check = _SourceEqualsObject<IClassConfig, IClassState>;
