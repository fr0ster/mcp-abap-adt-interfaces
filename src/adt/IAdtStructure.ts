/**
 * Structure ADT operation parameter interfaces (snake_case, low-level)
 */

export interface ICreateStructureParams {
  structure_name: string;
  description: string;
  package_name: string;
  transport_request?: string;
  master_system?: string;
  responsible?: string;
}

export interface IReadStructureParams {
  structure_name: string;
  version?: 'active' | 'inactive';
}

export interface IUpdateStructureParams {
  structure_name: string;
  ddl_code: string;
  transport_request?: string;
}

export interface IDeleteStructureParams {
  structure_name: string;
  transport_request?: string;
}
