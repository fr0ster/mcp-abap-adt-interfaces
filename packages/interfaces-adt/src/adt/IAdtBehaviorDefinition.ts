/**
 * Behavior Definition ADT operation parameter interfaces (snake_case, low-level)
 */

export type BehaviorDefinitionImplementationType =
  | 'Managed'
  | 'Unmanaged'
  | 'Abstract'
  | 'Projection';

// Builder configuration (camelCase)
// Note: packageName, description, implementationType are required for create/validate operations (validated in builder methods)
// rootEntity is required for validate operations
export interface IBehaviorDefinitionConfig {
  name: string; // Required
  masterLanguage?: string; // Original/master language for create; falls back to systemContext (SAP_LANGUAGE), then EN
  packageName?: string; // Required for create/validate operations, optional for others
  transportRequest?: string; // Only optional parameter
  description?: string; // Required for create/validate operations, optional for others
  implementationType?: 'Managed' | 'Unmanaged' | 'Abstract' | 'Projection'; // Required for create/validate operations, optional for others
  rootEntity?: string; // Required for validate operations, optional for others
  source?: string;
}

// Result/check helper types — promoted verbatim from adt-clients
// src/core/behaviorDefinition/types.ts (publicly exported, consumer-facing).
