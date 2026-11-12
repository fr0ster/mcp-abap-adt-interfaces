/**
 * Package ADT operation parameter interfaces (snake_case, low-level)
 */

import type { IResultStrategy } from './IAdtResponse';

// Builder configuration (camelCase)
// Note: superPackage is required for create operations (validated in builder methods)
// description is required for create/validate operations
export interface IPackageConfig {
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

  packageName: string; // Required
  superPackage?: string | undefined; // Required for create operations, optional for others
  description?: string | undefined; // Required for create/validate operations, optional for others
  packageType?: string | undefined;
  softwareComponent?: string | undefined;
  transportLayer?: string | undefined;
  transportRequest?: string | undefined; // Only optional parameter
  applicationComponent?: string | undefined;
  responsible?: string | undefined;
  masterSystem?: string | undefined;
  masterLanguage?: string | undefined; // Original/master language for create; falls back to systemContext (SAP_LANGUAGE); with neither, none is sent and SAP takes its logon language
  recordChanges?: boolean | undefined;
}

/** One strategy per member of a package implementation. See `IClassResults`. */
export interface IPackageResults {
  readonly created: IResultStrategy<unknown>;
  readonly source: IResultStrategy<unknown>;
  readonly metadata: IResultStrategy<unknown>;
  readonly check: IResultStrategy<unknown>;
  readonly validation: IResultStrategy<unknown>;
  readonly deletion: IResultStrategy<unknown>;
  readonly metadataUpdated: IResultStrategy<unknown>;
  readonly transport: IResultStrategy<unknown>;
  /** What a deletion check answers: `del:checkResponse`. */
  readonly deletionCheck: IResultStrategy<unknown>;
}
