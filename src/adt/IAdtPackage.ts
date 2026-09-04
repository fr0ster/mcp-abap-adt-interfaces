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

export interface IReadPackageParams {
  package_name: string;
  version?: 'active' | 'inactive';
}

export interface IDeletePackageParams {
  package_name: string;
  transport_request?: string;
}

// Builder configuration (camelCase)
// Note: superPackage is required for create operations (validated in builder methods)
// description is required for create/validate operations
export interface IPackageConfig {
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
