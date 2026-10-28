/**
 * Function Group ADT operation parameter interfaces (snake_case, low-level)
 */

import type { IResultStrategy } from './IAdtResponse';

// Builder configuration (camelCase)
// Note: packageName is required for create operations (validated in builder methods)
// description is required for create/validate operations
export interface IFunctionGroupConfig {
  /**
   * **No `source` here, and that is the point.** This type's write takes its
   * body from `IAdtOperationOptions.source`, which is where the capability
   * atoms say a write's body goes. It used to be declared on this config as
   * well, with a comment telling the caller to pass the document "here" — two
   * channels, two sentences, and an implementation forced to guess. Nothing on
   * this type read it but the write: it has no `check` and no `validate` that
   * compiles a source the server does not hold yet, which is the one job a
   * `source` on a config still has.
   */
  functionGroupName: string; // Required
  masterLanguage?: string; // Original/master language for create; falls back to systemContext (SAP_LANGUAGE), then EN
  packageName?: string; // Required for create operations, optional for others
  transportRequest?: string; // Only optional parameter
  description?: string; // Required for create/validate operations, optional for others
  masterSystem?: string; // SAP system ID (three characters) — required on on-premise where systeminfo endpoint is unavailable
  responsible?: string; // User responsible for the object — falls back to SAP_USERNAME env var
}

/** One strategy per member of a functionGroup implementation. See `IClassResults`. */
export interface IFunctionGroupResults {
  readonly created: IResultStrategy<unknown>;
  readonly source: IResultStrategy<unknown>;
  readonly metadata: IResultStrategy<unknown>;
  /** Enhancement implementations in the host's source. */
  readonly enhancementElements: IResultStrategy<unknown>;
  /** Places in the host that can be enhanced. */
  readonly enhancementOptions: IResultStrategy<unknown>;
  readonly check: IResultStrategy<unknown>;
  readonly activation: IResultStrategy<unknown>;
  readonly validation: IResultStrategy<unknown>;
  readonly deletion: IResultStrategy<unknown>;
  readonly metadataUpdated: IResultStrategy<unknown>;
  /** What writing the function pool's main source answers (`update`). */
  readonly updated: IResultStrategy<unknown>;
  readonly transport: IResultStrategy<unknown>;
  /** What a deletion check answers: `del:checkResponse`. */
  readonly deletionCheck: IResultStrategy<unknown>;
}
