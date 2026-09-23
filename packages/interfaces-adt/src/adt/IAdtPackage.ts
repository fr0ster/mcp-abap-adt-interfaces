/**
 * Package ADT operation parameter interfaces (snake_case, low-level)
 */

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
  superPackage?: string; // Required for create operations, optional for others
  description?: string; // Required for create/validate operations, optional for others
  packageType?: string;
  softwareComponent?: string;
  transportLayer?: string;
  transportRequest?: string; // Only optional parameter
  applicationComponent?: string;
  responsible?: string;
  masterSystem?: string;
  masterLanguage?: string; // Original/master language for create; falls back to systemContext (SAP_LANGUAGE), then EN
  recordChanges?: boolean;
}
