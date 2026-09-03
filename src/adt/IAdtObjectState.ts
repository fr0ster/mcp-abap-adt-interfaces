/**
 * Base state interface for all ADT Object operations
 *
 * All specific state types (DomainBuilderState, DataElementBuilderState, etc.)
 * should extend this interface to ensure consistency across all ADT object types.
 */

import type { IAdtWireResponse } from '../connection/IAbapConnection';

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
