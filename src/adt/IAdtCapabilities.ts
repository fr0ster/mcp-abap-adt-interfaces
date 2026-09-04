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
 * **Nothing here throws.** Until 30.0.0 four members did — `lock`, `unlock`,
 * `getVersions` and `getVersionSource` — on the grounds that they answer a lock
 * handle, nothing, a version list and a source string and so have no failure
 * half. That premise was false: a lock refused because another user holds it is
 * a 403, and a version resource a system does not expose is a 404. They answer
 * like everything else, and decision 20 says why — a thrown error is invisible
 * to the compiler, so a consumer never learns from the type that a failure path
 * exists.
 */
import type { IAdtOperationOptions } from './IAdtObject';
import type { IAdtResponse } from './IAdtResponse';

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
   * @returns the lock handle that `unlock` and `update` must be given
   *
   * A refusal — another user holds the lock — is a failure in the answer, not
   * an exception. The pair migrated together, because a lock and its unlock are
   * one operation seen from two ends.
   */
  lock(config: Partial<TConfig>): Promise<IAdtResponse<string>>;

  /**
   * Unlock object
   * Sets connection to stateless mode after unlocking.
   * Must use the same session and lock handle from lock() operation.
   *
   * @param config - Object identification
   * @param lockHandle - Lock handle returned from lock() operation
   * @returns nothing to read, and the answer says whether it happened
   */
  unlock(
    config: Partial<TConfig>,
    lockHandle: string,
  ): Promise<IAdtResponse<void>>;
}

export interface IAdtVersionable<TConfig, TVersions, TSource> {
  /**
   * List the version history of this object's source. Identity is passed per
   * call (the implementations are stateless factories) — e.g.
   * `getVersions({ className: 'ZCL_X' })`.
   * An object with no version resource — SAP answers 404 or 406, or the type
   * has no source at all — is a failure in the answer, and the strategy names it
   * in {@link IAdtError.code} as `AdtObjectErrorCodes.UNSUPPORTED_OPERATION`, so
   * a consumer branches on it without a cast. Not an exception: a caller asking
   * a type it did not choose is the normal case here, and a normal case belongs
   * in the return type.
   */
  getVersions(config: Partial<TConfig>): Promise<IAdtResponse<TVersions>>;

  /**
   * Fetch the source code of a specific version.
   * @param contentUri the opaque, complete `contentUri` from a getVersions() entry.
   *
   * Answers like its pair above: a version resource that cannot be read is a
   * failure in the answer.
   */
  getVersionSource(contentUri: string): Promise<IAdtResponse<TSource>>;
}

/**
 * `IAdtSearchable` was here until 30.0.0.
 *
 * Searching is not something an object does to itself, and the question already
 * had a home: {@link IAdtInformationSystem.search}, over
 * `/repository/informationsystem/search`. Declaring it here as well made one
 * endpoint two members across two files — decision 16 — and gave a consumer two
 * places to look for one answer.
 */

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
