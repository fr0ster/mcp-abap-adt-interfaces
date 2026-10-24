/**
 * Behavior Definition ADT operation parameter interfaces (snake_case, low-level)
 */

import type { IResultStrategy } from './IAdtResponse';

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

/** One strategy per member of a behaviorDefinition implementation. See `IClassResults`. */
export interface IBehaviorDefinitionResults {
  readonly created: IResultStrategy<unknown>;
  readonly source: IResultStrategy<unknown>;
  readonly metadata: IResultStrategy<unknown>;
  readonly check: IResultStrategy<unknown>;
  readonly activation: IResultStrategy<unknown>;
  readonly validation: IResultStrategy<unknown>;
  readonly deletion: IResultStrategy<unknown>;
  readonly updated: IResultStrategy<unknown>;
  readonly transport: IResultStrategy<unknown>;
  /** What a deletion check answers: `del:checkResponse`. */
  readonly deletionCheck: IResultStrategy<unknown>;
  /** The version history — an Atom feed; `objectVersions` reads it. */
  readonly versions: IResultStrategy<unknown>;
  /** One version's source. */
  readonly versionSource: IResultStrategy<unknown>;
}
