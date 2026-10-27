/**
 * FunctionInclude (FUGR/I) ADT operation parameter interfaces (low-level)
 */

import type { IResultStrategy } from './IAdtResponse';

/**
 * A function include lives under its group (`FUGR/I`, parent `FUGR/F`): a
 * contract passes `'functionGroupName'` as the atoms' `TParent`
 * (`AdtObjectIdentity`).
 */
export interface IFunctionIncludeConfig {
  functionGroupName: string;
  includeName: string;
  description?: string;
  transportRequest?: string;
  source?: string;
}

/** One strategy per member of a functionInclude implementation. See `IClassResults`. */
export interface IFunctionIncludeResults {
  readonly created: IResultStrategy<unknown>;
  readonly source: IResultStrategy<unknown>;
  readonly metadata: IResultStrategy<unknown>;
  readonly check: IResultStrategy<unknown>;
  readonly activation: IResultStrategy<unknown>;
  readonly validation: IResultStrategy<unknown>;
  readonly deletion: IResultStrategy<unknown>;
  readonly updated: IResultStrategy<unknown>;
  /** What a deletion check answers: `del:checkResponse`. */
  readonly deletionCheck: IResultStrategy<unknown>;
  /** What the object's own document answers when written. */
  readonly metadataUpdated: IResultStrategy<unknown>;
  /** The version history — an Atom feed; `objectVersions` reads it. */
  readonly versions: IResultStrategy<unknown>;
  /** One version's source. */
  readonly versionSource: IResultStrategy<unknown>;
}
