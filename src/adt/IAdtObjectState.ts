/**
 * Base state interface for all ADT Object operations
 *
 * All specific state types (DomainBuilderState, DataElementBuilderState, etc.)
 * should extend this interface to ensure consistency across all ADT object types.
 */

import type { IAdtResponse } from '../connection/IAbapConnection';

/**
 * Base state that all ADT Object state types should extend
 *
 * This interface defines the common structure for all operation results
 * returned by IAdtObject methods (validate, create, read, readMetadata, update, delete, activate, check, readTransport).
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
  validationResponse?: IAdtResponse;
  /** Create operation response from create() method */
  createResult?: IAdtResponse;
  /** Lock handle obtained from lock operations */
  lockHandle?: string;
  /** Update operation response from update() method */
  updateResult?: IAdtResponse;
  /** Check operation response from check() method */
  checkResult?: IAdtResponse;
  /** Unlock operation response from unlock operations */
  unlockResult?: IAdtResponse;
  /** Activate operation response from activate() method */
  activateResult?: IAdtResponse;
  /** Delete operation response from delete() method */
  deleteResult?: IAdtResponse;
  /** Read operation response from read() method (source code or XML) */
  readResult?: IAdtResponse;
  /** Metadata read result from readMetadata() method (object characteristics: package, responsible, description, etc.) */
  metadataResult?: IAdtResponse;
  /** Transport request read result from readTransport() method */
  transportResult?: IAdtResponse;
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
