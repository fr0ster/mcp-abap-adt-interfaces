/**
 * The configuration shapes an ADT object is identified and created by.
 *
 * The state interfaces this file is named for were removed in 29.0.0 — they were
 * a bag of transport frames, and a state is a shape an *implementation* builds
 * rather than something a contract hands back. What a member answers is now
 * named by its own atom in `IAdtCapabilities.ts`.
 *
 * The filename outlives them for one release so import paths do not churn twice;
 * it is `IAdtObjectConfig.ts` in spirit.
 */

/**
 * Base configuration interface for all ADT Object operations
 *
 * This interface defines common fields that are present in all ADT object configurations.
 * Specific configuration types should extend this interface to ensure consistency.
 *
 * Example:
 * ```typescript
 * export type DomainBuilderConfig = IAdtObjectConfig & {
 *   domainName: string;
 *   // ... domain-specific fields
 *   // packageName, description and transportRequest come from IAdtObjectConfig,
 *   // composed rather than inherited — decision 23
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
