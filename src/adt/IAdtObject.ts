/**
 * High-level ADT Object Operations Interface
 * 
 * Defines the interface for high-level CRUD operations on ADT objects.
 * This interface is implemented by Adt{Entity} classes (e.g., AdtClass, AdtDomain).
 * 
 * Unlike Builders which provide low-level method chaining, this interface
 * provides high-level operation chains with automatic error handling and cleanup.
 */

import { AxiosResponse } from 'axios';

/**
 * Error codes that can be thrown by IAdtObject methods
 * Consumers can catch specific errors using these constants
 * 
 * Example:
 * ```typescript
 * try {
 *   await adtObject.read({ className: 'ZTEST' });
 * } catch (error: any) {
 *   if (error.code === AdtObjectErrorCodes.OBJECT_NOT_FOUND) {
 *     // Handle not found
 *   } else if (error.code === AdtObjectErrorCodes.OBJECT_NOT_READY) {
 *     // Handle not ready
 *   }
 * }
 * ```
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
} as const;

/**
 * Options for ADT operations (create and update)
 * Unified interface for both create and update operations
 */
export interface IAdtOperationOptions {
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

/**
 * High-level ADT Object Operations Interface
 * 
 * Provides simplified CRUD operations with automatic operation chains,
 * error handling, and resource cleanup.
 * 
 * @template TConfig - Configuration type for the object (e.g., ClassBuilderConfig)
 * @template TReadResult - Result type for read operations (defaults to TConfig)
 */
export interface IAdtObject<TConfig, TReadResult = TConfig> {
  /**
   * Validate object configuration before creation
   * @param config - Object configuration
   * @returns State with validation result
   */
  validate(config: Partial<TConfig>): Promise<TReadResult>;

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
  create(
    config: TConfig,
    options?: IAdtOperationOptions
  ): Promise<TReadResult>;

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
    options?: { withLongPolling?: boolean }
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
   * @returns State with metadata result
   */
  readMetadata(
    config: Partial<TConfig>,
    options?: { withLongPolling?: boolean }
  ): Promise<TReadResult>;

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
    options?: IAdtOperationOptions
  ): Promise<TReadResult>;

  /**
   * Delete object
   * Performs deletion check before deleting.
   * 
   * @param config - Object identification
   * @returns State with delete result
   * @throws Error if deletion check fails (object is not deleted)
   */
  delete(config: Partial<TConfig>): Promise<TReadResult>;

  /**
   * Activate object
   * @param config - Object identification
   * @returns State with activation result
   */
  activate(config: Partial<TConfig>): Promise<TReadResult>;

  /**
   * Check object (syntax, consistency, etc.)
   * @param config - Object identification
   * @param status - Optional status to check ('active', 'inactive', 'deletion')
   * @returns State with check result
   * @throws Error if check finds errors (type E in XML response)
   */
  check(
    config: Partial<TConfig>,
    status?: string
  ): Promise<TReadResult>;

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
    options?: { withLongPolling?: boolean }
  ): Promise<TReadResult>;
}
