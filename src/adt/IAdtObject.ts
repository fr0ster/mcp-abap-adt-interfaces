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
 * Options for create operations
 */
export interface CreateOptions {
  /**
   * Activate object after creation
   * @default false
   */
  activateOnCreate?: boolean;

  /**
   * Delete object if creation fails
   * @default false
   */
  deleteOnFailure?: boolean;

  /**
   * Source code to use for update after create
   */
  sourceCode?: string;

  /**
   * XML content to use for update after create
   */
  xmlContent?: string;
}

/**
 * Options for update operations
 */
export interface UpdateOptions {
  /**
   * Activate object after update
   * @default false
   */
  activateOnUpdate?: boolean;

  /**
   * Delete object if update fails
   * @default false
   */
  deleteOnFailure?: boolean;

  /**
   * Lock handle if object is already locked
   */
  lockHandle?: string;
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
   * @returns Validation response from ADT
   */
  validate(config: Partial<TConfig>): Promise<AxiosResponse>;

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
    options?: CreateOptions
  ): Promise<TReadResult>;

  /**
   * Read object
   * @param config - Object identification (name, etc.)
   * @param version - 'active' or 'inactive'
   * @returns Object configuration or source code, or undefined if not found
   */
  read(
    config: Partial<TConfig>,
    version?: 'active' | 'inactive'
  ): Promise<TReadResult | undefined>;

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
    options?: UpdateOptions
  ): Promise<TReadResult>;

  /**
   * Delete object
   * Performs deletion check before deleting.
   * 
   * @param config - Object identification
   * @returns Delete response from ADT
   * @throws Error if deletion check fails (object is not deleted)
   */
  delete(config: Partial<TConfig>): Promise<AxiosResponse>;

  /**
   * Activate object
   * @param config - Object identification
   * @returns Activation response from ADT
   */
  activate(config: Partial<TConfig>): Promise<AxiosResponse>;

  /**
   * Check object (syntax, consistency, etc.)
   * @param config - Object identification
   * @param status - Optional status to check ('active', 'inactive', 'deletion')
   * @returns Check response from ADT
   */
  check(
    config: Partial<TConfig>,
    status?: string
  ): Promise<AxiosResponse>;
}
