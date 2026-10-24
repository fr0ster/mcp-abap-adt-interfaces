/**
 * ScalarFunctionImplementation (DSFI/SFI) ADT operation parameter interfaces (low-level)
 */

import type { IResultStrategy } from './IAdtResponse';

export type ScalarFunctionEngine = 'sqlEngine' | 'amdpEngine';

export interface IScalarFunctionImplementationConfig {
  implementationName: string;
  scalarFunctionName: string;
  engineValue?: ScalarFunctionEngine;
  masterLanguage?: string;
  packageName?: string;
  transportRequest?: string;
  description?: string;
  source?: string;
}

/** One strategy per member of a scalarFunctionImplementation implementation. See `IClassResults`. */
export interface IScalarFunctionImplementationResults {
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
  /** What the object's own document answers when written. */
  readonly metadataUpdated: IResultStrategy<unknown>;
  /** The version history — an Atom feed; `objectVersions` reads it. */
  readonly versions: IResultStrategy<unknown>;
  /** One version's source. */
  readonly versionSource: IResultStrategy<unknown>;
}
