/**
 * Function Module ADT operation parameter interfaces (snake_case, low-level)
 */

import type { IResultStrategy } from './IAdtResponse';

export interface ICreateFunctionModuleParams {
  functionGroupName: string;
  functionModuleName: string;
  description: string;
  transportRequest?: string;
  masterSystem?: string;
  responsible?: string;
}

// Builder configuration (camelCase)
// Note: packageName is required for create operations (validated in builder methods)
// description is required for create/validate operations
// source is required for create/update operations
export interface IFunctionModuleConfig {
  functionGroupName: string; // Required
  functionModuleName: string; // Required
  transportRequest?: string; // Only optional parameter
  description?: string; // Required for create/validate operations, optional for others
  source?: string; // Required for create/update operations, optional for others
  masterSystem?: string; // SAP system ID (three characters) — required on on-premise
  responsible?: string; // User responsible for the object
}

/** One strategy per member of a functionModule implementation. See `IClassResults`. */
export interface IFunctionModuleResults {
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
