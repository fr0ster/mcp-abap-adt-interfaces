/**
 * AppendStructure (TABL/DS append) ADT operation parameter interfaces (low-level)
 */

import type { IResultStrategy } from './IAdtResponse';

export interface IAppendStructureConfig {
  appendStructureName: string;
  baseObject?: string; // required for create (validated in handler)
  masterLanguage?: string;
  packageName?: string;
  transportRequest?: string;
  description?: string;
  source?: string;
}

/** One strategy per member of a appendStructure implementation. See `IClassResults`. */
export interface IAppendStructureResults {
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
