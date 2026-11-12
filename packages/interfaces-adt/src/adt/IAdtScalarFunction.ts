/**
 * ScalarFunction (CDS DSFD/SCF) ADT operation parameter interfaces (low-level)
 */

import type { IResultStrategy } from './IAdtResponse';

// Handler configuration (camelCase)
export interface IScalarFunctionConfig {
  scalarFunctionName: string;
  masterLanguage?: string | undefined;
  packageName?: string | undefined;
  transportRequest?: string | undefined;
  description?: string | undefined;
  source?: string | undefined;
}

/** One strategy per member of a scalarFunction implementation. See `IClassResults`. */
export interface IScalarFunctionResults {
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
