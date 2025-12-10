/**
 * Base state interface for all ADT Object operations
 * 
 * All specific state types (DomainBuilderState, DataElementBuilderState, etc.)
 * should extend this interface to ensure consistency across all ADT object types.
 */

import { AxiosResponse } from 'axios';

/**
 * Base state that all ADT Object state types should extend
 * 
 * This interface defines the common structure for all operation results
 * returned by IAdtObject methods (validate, create, read, update, delete, activate, check).
 * 
 * Specific state types can extend this interface to add entity-specific fields.
 * 
 * Example:
 * ```typescript
 * export interface DomainBuilderState extends IAdtObjectState {
 *   transportResult?: any; // Domain-specific field
 * }
 * ```
 */
export interface IAdtObjectState {
  /** Validation response from validate() method */
  validationResponse?: AxiosResponse;
  /** Create operation response from create() method */
  createResult?: AxiosResponse;
  /** Lock handle obtained from lock operations */
  lockHandle?: string;
  /** Update operation response from update() method */
  updateResult?: AxiosResponse;
  /** Check operation response from check() method */
  checkResult?: AxiosResponse;
  /** Unlock operation response from unlock operations */
  unlockResult?: AxiosResponse;
  /** Activate operation response from activate() method */
  activateResult?: AxiosResponse;
  /** Delete operation response from delete() method */
  deleteResult?: AxiosResponse;
  /** Read operation response from read() method */
  readResult?: AxiosResponse;
  /** Transport request read result from readTransport() method */
  transportResult?: AxiosResponse;
  /** Array of errors that occurred during operations */
  errors: Array<{ method: string; error: Error; timestamp: Date }>;
}

/**
 * Base configuration interface for all ADT Object operations
 * 
 * This interface defines common fields that are present in all ADT object configurations.
 * Specific configuration types should extend this interface to ensure consistency.
 * 
 * Example:
 * ```typescript
 * export interface DomainBuilderConfig extends IAdtObjectConfig {
 *   domainName: string;
 *   // ... domain-specific fields
 *   // packageName, description, transportRequest are inherited from IAdtObjectConfig
 * }
 * ```
 */
export interface IAdtObjectConfig {
  /** Package name (required for create operations, optional for others) */
  packageName?: string;
  /** Description (required for create/validate operations, optional for others) */
  description?: string;
  /** Transport request (optional, used for create/update/delete operations) */
  transportRequest?: string;
}
