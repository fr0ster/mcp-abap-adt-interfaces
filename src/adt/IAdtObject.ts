/**
 * High-level ADT Object Operations Interface
 *
 * Defines the interface for high-level CRUD operations on ADT objects.
 * This interface is implemented by Adt{Entity} classes (e.g., AdtClass, AdtDomain).
 *
 * Unlike Builders which provide low-level method chaining, this interface
 * provides high-level operation chains with automatic error handling and cleanup.
 */

import type { IAdtWireResponse } from '../connection/IAbapConnection';
import type {
  IAdtActivatable,
  IAdtCheckable,
  IAdtCrud,
  IAdtLockable,
  IAdtTransportAware,
  IAdtValidatable,
  IAdtVersionable,
} from './IAdtCapabilities';
import type { IAdtError } from './IAdtResponse';

/**
 * Error codes for the `IAdtObject` members that still signal failure by throwing.
 *
 * **The CRUD members no longer throw.** `create`, `read`, `readMetadata`,
 * `update`, `delete`, `validate`, `check` and `activate` answer `IAdtResponse`,
 * so a failure comes back rather than flying past, and it is read from the
 * contract:
 *
 * ```typescript
 * const answer = await adtObject.read({ className: 'ZTEST' });
 *
 * if (answer.ok) {
 *   answer.getResult().value;    // the state
 * } else {
 *   const failure = answer.getError();
 *   failure.origin;              // 'connection' | 'refusal' | 'parse'
 *   failure.message;             // what SAP said, in SAP's words
 *   failure.response;            // the answer it was read from, untouched
 * }
 * ```
 *
 * Note what is *not* in that example: a check for "not found". ADT answers a
 * request for a missing object with **200 and an empty body** rather than a 404,
 * so absence is not a distinct failure the library can report on its own
 * authority — a read-modify-write must treat it as one, since writing back what
 * it read erases the object, while a listing must treat it as an empty list.
 * That reading is supplied through {@link IAdtOperationOptions.analyse}.
 *
 * These codes therefore apply only to the members that have no failure half to
 * put a refusal in: `lock`, `unlock`, `getVersions` and `getVersionSource`.
 *
 * The code is read structurally, off whatever was thrown. This package exports
 * no error class to narrow with — a contract says what a thing is, and shipping
 * a class from it would make "use your own implementation" untrue for that
 * piece — so an implementation is free to throw its own type as long as it
 * carries `code`.
 *
 * ```typescript
 * import { AdtObjectErrorCodes } from '@mcp-abap-adt/interfaces';
 *
 * try {
 *   await adtObject.lock({ className: 'ZTEST' });
 * } catch (error: unknown) {
 *   const code = (error as { code?: string }).code;
 *   if (code === AdtObjectErrorCodes.LOCK_FAILED) {
 *     // held by someone else
 *   }
 * }
 * ```
 *
 * The remaining members' codes are kept for consumers still on the throwing
 * contract and will go when those call sites do.
 */
export const AdtObjectErrorCodes = {
  /** Object not found (404) */
  OBJECT_NOT_FOUND: 'ADT_OBJECT_NOT_FOUND',
  /** Object not ready yet (400) - e.g., just created, not available for reading */
  OBJECT_NOT_READY: 'ADT_OBJECT_NOT_READY',
  /** Object validation failed */
  VALIDATION_FAILED: 'ADT_VALIDATION_FAILED',
  /** Object creation failed */
  CREATE_FAILED: 'ADT_CREATE_FAILED',
  /** Object update failed */
  UPDATE_FAILED: 'ADT_UPDATE_FAILED',
  /** Object deletion failed */
  DELETE_FAILED: 'ADT_DELETE_FAILED',
  /** Object activation failed */
  ACTIVATE_FAILED: 'ADT_ACTIVATE_FAILED',
  /** Object check failed */
  CHECK_FAILED: 'ADT_CHECK_FAILED',
  /** Lock operation failed */
  LOCK_FAILED: 'ADT_LOCK_FAILED',
  /** Unlock operation failed */
  UNLOCK_FAILED: 'ADT_UNLOCK_FAILED',
  /** Operation not supported for this object type (e.g. version history on a non-source object) */
  UNSUPPORTED_OPERATION: 'ADT_UNSUPPORTED_OPERATION',
} as const;

/**
 * Options for ADT operations (create and update)
 * Unified interface for both create and update operations
 */
export interface IAdtOperationOptions {
  /**
   * The caller's own reading of what counts as a failure.
   *
   * Handed the default's verdict **and** the answer it was reached from, so it
   * can overrule in either direction: name a failure the default let through, or
   * clear one it raised. Returning `undefined` means "not a failure here".
   *
   * This exists because no single reading serves every caller. ADT answers a
   * request for a missing object with 200 and an empty body, and those same
   * bytes are a failure to a read-modify-write — writing back what it read
   * erases the object — and an empty list to a listing. Neither reading can be
   * the library's.
   *
   * The status is not the signal: a refusal arrives inside a 200, and what
   * decides is the message severity in the document, which is why the raw answer
   * is passed rather than a summary of it.
   */
  analyse?: (
    verdict: IAdtError | undefined,
    answer?: IAdtWireResponse,
  ) => IAdtError | undefined;

  /**
   * Activate object after creation (for create operations)
   * @default false
   */
  activateOnCreate?: boolean;

  /**
   * Activate object after update (for update operations)
   * @default false
   */
  activateOnUpdate?: boolean;

  /**
   * Delete object if operation fails
   * @default false
   */
  deleteOnFailure?: boolean;

  /**
   * Source code to use for update
   * Used in create operations for update after create, and in update operations
   */
  sourceCode?: string;

  /**
   * XML content to use for update
   * Used for objects that use XML format (e.g., Domain, DataElement)
   * Used in create operations for update after create, and in update operations
   */
  xmlContent?: string;

  /**
   * Lock handle to use for low-level update operations
   * If provided, the update method will skip lock, check, and unlock operations
   * and perform only the core update operation. Useful when you want to manage
   * lock/unlock manually or when performing updates in a custom workflow.
   *
   * When lockHandle is provided, the update method assumes the object is already locked
   * and will only perform the update operation without any additional checks or unlocks.
   */
  lockHandle?: string;

  /**
   * HTTP request timeout for operations in milliseconds
   * @default 1000 (1 second)
   *
   * Note: This timeout is for HTTP request completion, not for waiting object readiness.
   * For waiting object readiness after create/update/activate operations, use `withLongPolling: true`
   * in read operations instead of fixed timeouts.
   *
   * The `timeout` parameter controls how long to wait for HTTP responses from the server.
   * Increase timeout for complex operations or slow systems.
   *
   * Example: timeout: 5000 for 5 seconds
   *
   * @see withLongPolling - Use long polling for waiting object readiness
   */
  timeout?: number;
}

/** One entry in an object's version history (from the ADT versions Atom feed). */
export interface IObjectVersion {
  /** Version number, e.g. '00000'. */
  versionId: string;
  /** The user who created the version (atom:author/name), if present. */
  author?: string;
  /** ISO timestamp of the version (atom:updated), if present. */
  updatedAt?: string;
  /** Feed title, e.g. 'Version List of ZCL_X (CLAS)', if present. */
  title?: string;
  /** Opaque, complete URI to fetch this version's source (atom:content@src). */
  contentUri: string;
  /** Transport request id this version was recorded under, if any (from the
   *  entry's transport-request link, e.g. 'DS4K901917'). */
  transportRequest?: string;
  /** Short text / description of that transport request, if any. */
  transportDescription?: string;
}

/**
 * High-level ADT Object Operations Interface
 *
 * Provides simplified CRUD operations with automatic operation chains,
 * error handling, and resource cleanup.
 *
 * @template TConfig - Configuration type for the object (e.g., ClassBuilderConfig)
 * @template TReadResult - Result type for read operations (defaults to TConfig)
 *
 * @deprecated Since 11.3.0. Handlers now declare their honest capability set
 * (see IAdtComposites and the capability atoms). `IAdtObject` remains as the
 * full-capability composite for backward compatibility and will be removed in a
 * later major. New code should depend on the specific capability it needs.
 */
export interface IAdtObject<TConfig, TReadResult = TConfig>
  extends IAdtCrud<TConfig, TReadResult>,
    IAdtValidatable<TConfig, TReadResult>,
    IAdtCheckable<TConfig, TReadResult>,
    IAdtActivatable<TConfig, TReadResult>,
    IAdtLockable<TConfig, TReadResult>,
    IAdtVersionable<TConfig>,
    IAdtTransportAware<TConfig, TReadResult> {}
