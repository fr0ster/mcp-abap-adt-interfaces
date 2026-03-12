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
