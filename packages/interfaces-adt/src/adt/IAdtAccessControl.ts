/**
 * Access Control (DCL) ADT operation parameter interfaces (snake_case, low-level)
 */

import type { IResultStrategy } from './IAdtResponse';

// Builder configuration (camelCase)
export interface IAccessControlConfig {
  accessControlName: string;
  masterLanguage?: string; // Original/master language for create; falls back to systemContext (SAP_LANGUAGE), then EN
  packageName?: string;
  transportRequest?: string;
  description?: string;
  source?: string;
}

/** One strategy per member of a accessControl implementation. See `IClassResults`. */
export interface IAccessControlResults {
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
