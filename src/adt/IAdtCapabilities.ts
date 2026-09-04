/**
 * Capability atoms — one small interface per operation, and nothing above them.
 *
 * There is no composite. `IAdtObject`, `IAdtCrud`, `IAdtModifiable` and
 * `IAdtSourceObject` were removed in 29.0.0 because they forced one result type
 * on members that answer different things: a create does not answer what a read
 * answers, and a type saying they do was saying something untrue about ADT. A
 * handler declares the atoms it honours, so a consumer reading it learns what
 * that object can do and what comes back, rather than what the fattest object
 * could do.
 *
 * **Each atom names its own result.** `IAdtCreatable<TConfig, TCreated>`,
 * `IAdtUpdatable<TConfig, TUpdated>`, and so on. `IAdtReadable` carries two —
 * source and metadata — because it is two endpoints.
 *
 * The grain comes from ADT itself: a lock and its unlock are one operation seen
 * from two ends, and a version list is useless without the source behind an
 * entry, so each pair is honoured or refused whole. `update` and `delete` were
 * taken for a third such pair until 15.0.0 and are not one: nothing in ADT ties
 * changing an object to removing it.
 *
 * `lock`, `unlock`, `getVersions` and `getVersionSource` still throw. They answer
 * a lock handle, nothing, a version list and a source string, so they have no
 * failure half to put a refusal in.
 */
import type { IAdtOperationOptions, IObjectVersion } from './IAdtObject';
import type { IAdtResponse } from './IAdtResponse';
import type { IAdtObjectHit, ISearchObjectsParams } from './IAdtShared';

/**
 * Bring an object into existence.
 *
 * Separate from the mutation atoms because creation and mutation do not travel
 * together: a unit-test run is created and never updated.
 */
export interface IAdtCreatable<TConfig, TCreated> {
  /**
   * Create object with full operation chain:
   * validate → create → check → lock → check(inactive) → update → unlock → check → activate (optional)
   *
   * @param config - Object configuration
   * @param options - Create options (activation, cleanup, source code)
   * @returns Created object configuration
   */
  create(
    config: TConfig,
    options?: IAdtOperationOptions,
  ): Promise<IAdtResponse<TCreated>>;
}

/** Obtain a representation of an object — its source, or the metadata about it. */
export interface IAdtReadable<TConfig, TSource, TMetadata> {
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
    options?: { withLongPolling?: boolean } & IAdtOperationOptions,
  ): Promise<IAdtResponse<TSource>>;

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
    options?: {
      withLongPolling?: boolean;
      version?: 'active' | 'inactive';
    } & IAdtOperationOptions,
  ): Promise<IAdtResponse<TMetadata>>;
}

export interface IAdtUpdatable<TConfig, TUpdated> {
  /**
   * Update object with full operation chain:
   * lock → check(inactive) → update → unlock → check → activate (optional)
   *
   * @param config - Object configuration with updates
   * @param options - Update options (activation, cleanup, lock handle)
   * @returns Updated object configuration
   */
  update(
    config: Partial<TConfig>,
    options?: IAdtOperationOptions,
  ): Promise<IAdtResponse<TUpdated>>;
}

export interface IAdtDeletable<TConfig, TDeleted> {
  /**
   * Delete object
   * Performs deletion check before deleting.
   *
   * @param config - Object identification
   * @returns State with delete result
   */
  delete(
    config: Partial<TConfig>,
    options?: IAdtOperationOptions,
  ): Promise<IAdtResponse<TDeleted>>;
}

export interface IAdtValidatable<TConfig, TValidated> {
  /**
   * Validate object configuration before creation
   * @param config - Object configuration
   * @returns State with validation result
   */
  validate(
    config: Partial<TConfig>,
    options?: IAdtOperationOptions,
  ): Promise<IAdtResponse<TValidated>>;
}

export interface IAdtCheckable<TConfig, TChecked> {
  /**
   * Check object (syntax, consistency, etc.)
   * @param config - Object identification
   * @param status - Optional status to check ('active', 'inactive', 'deletion')
   * @returns State with check result
   */
  check(
    config: Partial<TConfig>,
    status?: string,
    options?: IAdtOperationOptions,
  ): Promise<IAdtResponse<TChecked>>;
}

export interface IAdtActivatable<TConfig, TActivated> {
  /**
   * Activate object
   * @param config - Object identification
   * @returns State with activation result
   */
  activate(
    config: Partial<TConfig>,
    options?: IAdtOperationOptions,
  ): Promise<IAdtResponse<TActivated>>;
}

export interface IAdtLockable<TConfig> {
  /**
   * Lock object for modification
   * Sets connection to stateful mode before locking.
   *
   * @param config - Object identification
   * @returns Lock handle (string) that must be used in unlock() and update operations
   * @throws Error if lock fails (object may be locked by another user)
   *
   * Still throws, deliberately: this member answers a lock handle rather than
   * `IAdtResponse`, so it has no failure half to put a refusal in. It migrates
   * with the lock pair or not at all — a lock and its unlock are one operation
   * seen from two ends.
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
  unlock(config: Partial<TConfig>, lockHandle: string): Promise<void>;
}

export interface IAdtVersionable<TConfig> {
  /**
   * List the version history of this object's source. Identity is passed per
   * call (the implementations are stateless factories) — e.g.
   * `getVersions({ className: 'ZCL_X' })`.
   * @throws an error carrying `code: AdtObjectErrorCodes.UNSUPPORTED_OPERATION`
   *         when the object has no version resource (SAP 404/406, or a
   *         non-source object type). The type is the implementation's; this
   *         package ships no error class to name here. Never leaks raw HTTP.
   */
  getVersions(config: Partial<TConfig>): Promise<IObjectVersion[]>;

  /**
   * Fetch the source code of a specific version.
   * @param contentUri the opaque, complete `contentUri` from a getVersions() entry.
   * @throws an error when the version resource cannot be read. Like its pair
   *         above, this member answers the source itself and so has no failure
   *         half to put a refusal in. The error's type is the implementation's;
   *         this package ships no error class to name here.
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
  TValue extends IAdtObjectHit = IAdtObjectHit,
> {
  search(criteria: TCriteria): Promise<TValue[]>;
}

export interface IAdtTransportAware<TConfig, TTransport> {
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
    options?: { withLongPolling?: boolean } & IAdtOperationOptions,
  ): Promise<IAdtResponse<TTransport>>;
}
