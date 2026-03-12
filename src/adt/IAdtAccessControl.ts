/**
 * Access Control (DCL) ADT operation parameter interfaces (snake_case, low-level)
 */

export interface ICreateAccessControlParams {
  access_control_name: string;
  description?: string;
  package_name: string;
  transport_request?: string;
  source_code?: string;
  master_system?: string;
  responsible?: string;
}

export interface IReadAccessControlParams {
  access_control_name: string;
  version?: 'active' | 'inactive';
}

export interface IUpdateAccessControlParams {
  access_control_name: string;
  source_code: string;
  transport_request?: string;
}

export interface IDeleteAccessControlParams {
  access_control_name: string;
  transport_request?: string;
}
