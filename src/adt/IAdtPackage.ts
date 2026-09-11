/**
 * Package ADT operation parameter interfaces (snake_case, low-level)
 */

export interface ICreatePackageParams {
  package_name: string;
  description?: string;
  super_package: string;
  package_type?: string;
  software_component?: string;
  transport_layer?: string;
  transport_request?: string;
  application_component?: string;
  responsible?: string;
  master_system?: string;
  /** Master/original language (e.g. "EN", "DE"). Defaults to EN when unset. */
  master_language?: string;
  record_changes: boolean;
}

export interface IUpdatePackageParams {
  package_name: string;
  description?: string;
  super_package?: string;
  package_type?: string;
  software_component?: string;
  transport_layer?: string;
  transport_request?: string;
  application_component?: string;
  responsible?: string;
  master_system?: string;
  record_changes?: boolean;
}

export interface IDeletePackageParams {
  package_name: string;
  transport_request?: string;
}

// Builder configuration (camelCase)
// Note: superPackage is required for create operations (validated in builder methods)
// description is required for create/validate operations
export interface IPackageConfig {
  /**
   * The complete document to write, when this config is used for an update.
   *
   * **An update is a write, not a read-modify-write.** Until 19.0.0 of
   * `adt-clients` the five DDIC-shaped updates fetched the current document,
   * patched the fields named here into it, and PUT the result — two requests in
   * one member, and a merge whose rules nobody outside could change. They no
   * longer do: a caller reads the document with the member that reads it, edits
   * it, and passes it here.
   *
   * So the fields beside this one describe a *create*. On an update they are not
   * sent, and a field left out of `document` is not preserved — there is nothing
   * to preserve it from, because nothing was read.
   *
   * Optional because the same config creates, where there is no document yet.
   */
  document?: string;

  packageName: string; // Required
  superPackage?: string; // Required for create operations, optional for others
  description?: string; // Required for create/validate operations, optional for others
  updatedDescription?: string; // Description to use for update operation
  packageType?: string;
  softwareComponent?: string;
  transportLayer?: string;
  transportRequest?: string; // Only optional parameter
  applicationComponent?: string;
  responsible?: string;
  masterSystem?: string;
  masterLanguage?: string; // Original/master language for create; falls back to systemContext (SAP_LANGUAGE), then EN
  recordChanges?: boolean;
  onLock?: (lockHandle: string) => void;
}
