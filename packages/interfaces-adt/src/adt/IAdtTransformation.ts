/**
 * Transformation ADT operation parameter interfaces (low-level)
 */

import type { IResultStrategy } from './IAdtResponse';

export type TransformationType = 'SimpleTransformation' | 'XSLTProgram';

// Builder configuration (camelCase)
export interface ITransformationConfig {
  transformationName: string;
  masterLanguage?: string; // Original/master language for create; falls back to systemContext (SAP_LANGUAGE), then EN
  transformationType: TransformationType;
  packageName?: string;
  transportRequest?: string;
  description?: string;
  source?: string;
}

// The state types were removed in 29.0.0: each member answers what its own
// endpoint produced, and a failure carries the request that produced it.

/** One strategy per member of a transformation implementation. See `IClassResults`. */
export interface ITransformationResults {
  readonly created: IResultStrategy<unknown>;
  readonly source: IResultStrategy<unknown>;
  readonly metadata: IResultStrategy<unknown>;
  readonly check: IResultStrategy<unknown>;
  readonly activation: IResultStrategy<unknown>;
  readonly validation: IResultStrategy<unknown>;
  readonly deletion: IResultStrategy<unknown>;
  readonly updated: IResultStrategy<unknown>;
  /** What writing the object's whole metadata document answers (`updateMetadata`). */
  readonly metadataUpdated: IResultStrategy<unknown>;
  readonly transport: IResultStrategy<unknown>;
  /** What a deletion check answers: `del:checkResponse`. */
  readonly deletionCheck: IResultStrategy<unknown>;
  /** The version history — an Atom feed; `objectVersions` reads it. */
  readonly versions: IResultStrategy<unknown>;
  /** One version's source. */
  readonly versionSource: IResultStrategy<unknown>;
}
