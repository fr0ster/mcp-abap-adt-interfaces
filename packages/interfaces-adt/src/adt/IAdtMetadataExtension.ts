/**
 * Metadata Extension ADT operation parameter interfaces (low-level)
 */

import type { IResultStrategy } from './IAdtResponse';

// Promoted verbatim from adt-clients src/core/metadataExtension/types.ts

// Builder configuration (camelCase)
// Note: packageName and description are required for create/validate operations (validated in builder methods)
export interface IMetadataExtensionConfig {
  name: string; // Required
  description?: string; // Required for create/validate operations, optional for others
  packageName?: string; // Required for create/validate operations, optional for others
  transportRequest?: string; // Only optional parameter
  source?: string;
  masterLanguage?: string;
  masterSystem?: string;
  responsible?: string;
}

/** One strategy per member of a metadataExtension implementation. See `IClassResults`. */
export interface IMetadataExtensionResults {
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
