/**
 * Capability atoms — the methods of IAdtObject, partitioned so each method
 * belongs to exactly one small interface. See
 * docs/superpowers/specs/2026-07-20-capability-interfaces-design.md.
 *
 * The atoms are the definitions; `IAdtObject` is assembled from them below.
 * A handler declares the atoms it actually honours, so a consumer reading the
 * type learns what the object can do rather than what the fattest object can do.
 *
 * The grain comes from ADT itself: a lock and its unlock are one operation seen
 * from two ends, and a version list is useless without the source behind an
 * entry. The handlers in @mcp-abap-adt/adt-clients bear both out — each pair is
 * honoured or refused whole.
 *
 * `update` and `delete` were taken for a third such pair until 15.0.0. They are
 * not: nothing in ADT ties changing an object to removing it, so they are now
 * separate atoms and a handler that supports one can say so without claiming
 * the other.
 */
import type { IAdtOperationOptions, IObjectVersion } from './IAdtObject';
import type { IAdtObjectHit, ISearchObjectsParams } from './IAdtShared';

/**
 * Bring an object into existence.
 *
 * Separate from IAdtModifiable because creation and mutation do not travel
 * together: a unit-test run is created and never updated.
 */
export interface IAdtCreatable<TConfig, TReadResult = TConfig> {
  /**
   * Create object with full operation chain:
   * validate → create → check → lock → check(inactive) → update → unlock → check → activate (optional)
   *
   * @param config - Object configuration
   * @param options - Create options (activation, cleanup, source code)
   * @returns Created object configuration
   * @throws Error if validation fails (object is not created)
   * @throws Error if any operation fails (with cleanup if deleteOnFailure=true)
   */
  create(config: TConfig, options?: IAdtOperationOptions): Promise<TReadResult>;
}

/** Obtain a representation of an object — its source, or the metadata about it. */
export interface IAdtReadable<TConfig, TReadResult = TConfig> {
  /**
   * Read object (source code or XML that describes the object)
   * For objects without source code (Domain, DataElement), this returns metadata XML.
   * For objects with source code (Class, Interface, Program), this returns source code.
   *
   * @param config - Object identification (name, etc.)
   * @param version - 'active' or 'inactive'
   * @param options - Optional read options
   * @param options.withLongPolling - If true, adds ?withLongPolling=true to wait for object to become available
   *                                  Useful after create/activate operations to wait until object is ready
   * @returns Object configuration or source code, or undefined if not found
   */
  read(
    config: Partial<TConfig>,
    version?: 'active' | 'inactive',
    options?: { withLongPolling?: boolean },
  ): Promise<TReadResult | undefined>;

  /**
   * Read object metadata (object characteristics: package, responsible, description, etc.)
   * For objects with source code (Class, Interface, Program), this reads metadata separately from source code.
   * For objects without source code (Domain, DataElement), this may delegate to read() as read() already returns metadata.
   *
   * @param config - Object identification (name, etc.)
   * @param options - Optional read options
   * @param options.withLongPolling - If true, adds ?withLongPolling=true to wait for object to become available
   *                                  Useful after create/activate operations to wait until object is ready
   * @param options.version - 'active' or 'inactive' (default: 'active')
   * @returns State with metadata result
   */
  readMetadata(
    config: Partial<TConfig>,
    options?: { withLongPolling?: boolean; version?: 'active' | 'inactive' },
  ): Promise<TReadResult>;
}

export interface IAdtUpdatable<TConfig, TReadResult = TConfig> {
  /**
   * Update object with full operation chain:
   * lock → check(inactive) → update → unlock → check → activate (optional)
   *
   * @param config - Object configuration with updates
   * @param options - Update options (activation, cleanup, lock handle)
   * @returns Updated object configuration
   * @throws Error if lock fails
   * @throws Error if any operation fails (with cleanup if deleteOnFailure=true)
   */
  update(
    config: Partial<TConfig>,
    options?: IAdtOperationOptions,
  ): Promise<TReadResult>;
}

export interface IAdtDeletable<TConfig, TReadResult = TConfig> {
  /**
   * Delete object
   * Performs deletion check before deleting.
   *
   * @param config - Object identification
   * @returns State with delete result
   * @throws Error if deletion check fails (object is not deleted)
   */
  delete(config: Partial<TConfig>): Promise<TReadResult>;
}

/**
 * Change **and** remove an existing object — the composite for handlers that do
 * both.
 *
 * The two do not travel together, which is why they are separate atoms: a
 * transport request, for one, takes a new description and can be deleted while
 * empty, but a handler may well support only the first. Name
 * {@link IAdtUpdatable} or {@link IAdtDeletable} when only one is required, and
 * this one when a consumer genuinely needs both.
 */
export interface IAdtModifiable<TConfig, TReadResult = TConfig>
  extends IAdtUpdatable<TConfig, TReadResult>,
    IAdtDeletable<TConfig, TReadResult> {}

/**
 * create / read / readMetadata / update / delete.
 *
 * Retained as the composite of {@link IAdtCreatable}, {@link IAdtReadable} and
 * {@link IAdtModifiable} so existing consumers keep compiling. Prefer naming the
 * atom you actually need: this one claims an object can be changed and removed,
 * which is not true of every handler.
 */
export interface IAdtCrud<TConfig, TReadResult = TConfig>
  extends IAdtCreatable<TConfig, TReadResult>,
    IAdtReadable<TConfig, TReadResult>,
    IAdtModifiable<TConfig, TReadResult> {}

export interface IAdtValidatable<TConfig, TReadResult = TConfig> {
  /**
   * Validate object configuration before creation
   * @param config - Object configuration
   * @returns State with validation result
   */
  validate(config: Partial<TConfig>): Promise<TReadResult>;
}

export interface IAdtCheckable<TConfig, TReadResult = TConfig> {
  /**
   * Check object (syntax, consistency, etc.)
   * @param config - Object identification
   * @param status - Optional status to check ('active', 'inactive', 'deletion')
   * @returns State with check result
   * @throws Error if check finds errors (type E in XML response)
   */
  check(config: Partial<TConfig>, status?: string): Promise<TReadResult>;
}

export interface IAdtActivatable<TConfig, TReadResult = TConfig> {
  /**
   * Activate object
   * @param config - Object identification
   * @returns State with activation result
   */
  activate(config: Partial<TConfig>): Promise<TReadResult>;
}

export interface IAdtLockable<TConfig, TReadResult = TConfig> {
  /**
   * Lock object for modification
   * Sets connection to stateful mode before locking.
   *
   * @param config - Object identification
   * @returns Lock handle (string) that must be used in unlock() and update operations
   * @throws Error if lock fails (object may be locked by another user)
   */
  lock(config: Partial<TConfig>): Promise<string>;

  /**
   * Unlock object
   * Sets connection to stateless mode after unlocking.
   * Must use the same session and lock handle from lock() operation.
   *
   * @param config - Object identification
   * @param lockHandle - Lock handle returned from lock() operation
   * @returns State with unlock result
   * @throws Error if unlock fails
   */
  unlock(config: Partial<TConfig>, lockHandle: string): Promise<TReadResult>;
}

export interface IAdtVersionable<TConfig> {
  /**
   * List the version history of this object's source. Identity is passed per
   * call (the implementations are stateless factories) — e.g.
   * `getVersions({ className: 'ZCL_X' })`.
   * @throws AdtOperationError(UNSUPPORTED_OPERATION) when the object has no
   *         version resource (SAP 404/406, or a non-source object type).
   *         Never leaks raw HTTP.
   */
  getVersions(config: Partial<TConfig>): Promise<IObjectVersion[]>;

  /**
   * Fetch the source code of a specific version.
   * @param contentUri the opaque, complete `contentUri` from a getVersions() entry.
   */
  getVersionSource(contentUri: string): Promise<string>;
}

/**
 * Locate objects in the repository.
 *
 * Unlike the other atoms this one is not per-object-type: it is implemented by
 * whatever offers a way of finding objects — free-text search, where-used,
 * package contents. The two parameters exist because those differ in what they
 * accept and in what detail they return, while agreeing that a result is a
 * named object with an ADT type code.
 */
export interface IAdtSearchable<
  TCriteria = ISearchObjectsParams,
  TResult extends IAdtObjectHit = IAdtObjectHit,
> {
  search(criteria: TCriteria): Promise<TResult[]>;
}

export interface IAdtTransportAware<TConfig, TReadResult = TConfig> {
  /**
   * Read transport request information for the object
   * @param config - Object identification
   * @param options - Optional read options
   * @param options.withLongPolling - If true, adds ?withLongPolling=true to wait for object to become available
   *                                  Useful after create/activate operations to wait until object is ready
   * @returns State with transport result
   */
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
 * Guard that the partition stays exact. IAdtObject is now assembled from the
 * atoms, so one direction holds by construction — but the other still catches
 * a method declared on IAdtObject directly instead of on an atom, which is the
 * way this partition would rot.
 */
type _PartitionIsExact<C, R> = [
  Assert<IAdtObject<C, R> extends AllAtoms<C, R> ? true : false>,
  Assert<AllAtoms<C, R> extends IAdtObject<C, R> ? true : false>,
];

// Instantiate at a concrete pair so the constraints are actually evaluated.
type _Check = _PartitionIsExact<IClassConfig, IClassState>;
