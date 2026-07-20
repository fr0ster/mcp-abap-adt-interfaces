/**
 * Capability atoms — the methods of IAdtObject, partitioned so each method
 * belongs to exactly one small interface. See
 * docs/superpowers/specs/2026-07-20-capability-interfaces-design.md.
 *
 * These are ADDITIVE. IAdtObject is unchanged; a handler implementing the
 * atoms satisfies IAdtObject structurally (Task A2 proves the equivalence).
 */
import type { IAdtOperationOptions, IObjectVersion } from './IAdtObject';

/** create / read / readMetadata / update / delete — universal, never partial. */
export interface IAdtCrud<TConfig, TReadResult = TConfig> {
  create(config: TConfig, options?: IAdtOperationOptions): Promise<TReadResult>;
  read(
    config: Partial<TConfig>,
    version?: 'active' | 'inactive',
    options?: { withLongPolling?: boolean },
  ): Promise<TReadResult | undefined>;
  readMetadata(
    config: Partial<TConfig>,
    options?: { withLongPolling?: boolean; version?: 'active' | 'inactive' },
  ): Promise<TReadResult>;
  update(
    config: Partial<TConfig>,
    options?: IAdtOperationOptions,
  ): Promise<TReadResult>;
  delete(config: Partial<TConfig>): Promise<TReadResult>;
}

export interface IAdtValidatable<TConfig, TReadResult = TConfig> {
  validate(config: Partial<TConfig>): Promise<TReadResult>;
}

export interface IAdtCheckable<TConfig, TReadResult = TConfig> {
  check(config: Partial<TConfig>, status?: string): Promise<TReadResult>;
}

export interface IAdtActivatable<TConfig, TReadResult = TConfig> {
  activate(config: Partial<TConfig>): Promise<TReadResult>;
}

export interface IAdtLockable<TConfig, TReadResult = TConfig> {
  lock(config: Partial<TConfig>): Promise<string>;
  unlock(config: Partial<TConfig>, lockHandle: string): Promise<TReadResult>;
}

export interface IAdtVersionable<TConfig> {
  getVersions(config: Partial<TConfig>): Promise<IObjectVersion[]>;
  getVersionSource(contentUri: string): Promise<string>;
}

export interface IAdtTransportAware<TConfig, TReadResult = TConfig> {
  readTransport(
    config: Partial<TConfig>,
    options?: { withLongPolling?: boolean },
  ): Promise<TReadResult>;
}

import type { IClassConfig, IClassState } from './IAdtClass';
import type { IAdtObject } from './IAdtObject';

/** Assertion helper: instantiating with `false` is a compile error. */
type Assert<T extends true> = T;

/** The intersection of every atom that composes IAdtObject. */
type AllAtoms<C, R> = IAdtCrud<C, R> &
  IAdtValidatable<C, R> &
  IAdtCheckable<C, R> &
  IAdtActivatable<C, R> &
  IAdtLockable<C, R> &
  IAdtVersionable<C> &
  IAdtTransportAware<C, R>;

/**
 * Proof that the partition is exact: IAdtObject and the atom intersection are
 * mutually assignable. Both directions are required. The generic parameters
 * are bound and the alias is instantiated below, or nothing is checked.
 */
type _PartitionIsExact<C, R> = [
  Assert<IAdtObject<C, R> extends AllAtoms<C, R> ? true : false>,
  Assert<AllAtoms<C, R> extends IAdtObject<C, R> ? true : false>,
];

// Instantiate at a concrete pair so the constraints are actually evaluated.
type _Check = _PartitionIsExact<IClassConfig, IClassState>;
