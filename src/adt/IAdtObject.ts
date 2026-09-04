/**
 * Operation options, version entries and error codes shared by the capability
 * atoms.
 *
 * The wide `IAdtObject` this file was named for was removed in 29.0.0; what an
 * object can do is now stated by the atoms it declares in `IAdtCapabilities.ts`.
 * Nothing here declares an operation — these are the pieces the atoms refer to:
 * {@link IAdtOperationOptions} carries the strategy a caller injects,
 * a version history's entries are the implementation's since 31.0.0, and
 * {@link AdtObjectErrorCodes} names failures a strategy can put in
 * {@link IAdtError.code}.
 */

import type { IAdtWireResponse } from '../connection/IAbapConnection';
import type { AdtNoFailure, IAdtError } from './IAdtResponse';

/**
 * The codes a failure can name itself by.
 *
 * **Nothing in this package throws** since 30.0.0. Every member answers
 * {@link IAdtResponse}, so a failure comes back rather than flying past, and it
 * is read from the contract:
 *
 * ```typescript
 * const answer = await adtObject.read({ className: 'ZTEST' });
 *
 * if (answer.ok) {
 *   answer.getResult().value;    // what the endpoint produced
 * } else {
 *   const failure = answer.getError();
 *   failure.origin;              // 'connection' | 'refusal'
 *   failure.message;             // what SAP said, in SAP's words
 *   failure.code;                // one of these, when the strategy named one
 *   failure.response;            // the answer it was read from, untouched
 * }
 * ```
 *
 * These are for the failures the contract promises in a specific place, where
 * `origin` alone cannot tell two apart: a version resource a system does not
 * expose is `UNSUPPORTED_OPERATION` rather than merely a refusal, and a lock
 * another user holds is `LOCK_FAILED`. A consumer branches on the code without a
 * cast, which until 30.0.0 they could not — the promise was made by members that
 * threw, and the failure contract had nowhere to carry it.
 *
 * `code` is optional, and deliberately: what a strategy chooses is how much of a
 * failure to fill in, not whether to be one. An implementation is free to name
 * codes of its own beside these; this package ships no error class to narrow
 * with, because a contract says what a thing is and shipping a class from it
 * would make "use your own implementation" untrue for that piece.
 *
 * Note what is *not* among them: "not found". ADT answers a request for a
 * missing object with **200 and an empty body** rather than a 404, so absence is
 * not a failure this library can report on its own authority — a read-modify-write
 * must treat it as one, since writing back what it read erases the object, while
 * a listing must treat it as an empty list. That reading is supplied through
 * {@link IAdtOperationOptions.analyse}.
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
   * clear one it raised. Answering {@link ADT_NO_FAILURE} means "not a failure
   * here" — a token rather than `undefined`, so that the absence of a strategy
   * and a strategy's verdict of "fine" are not the same value.
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
    verdict: IAdtError | AdtNoFailure,
    answer?: IAdtWireResponse,
  ) => IAdtError | AdtNoFailure;

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
