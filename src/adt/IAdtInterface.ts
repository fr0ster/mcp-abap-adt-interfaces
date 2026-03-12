/**
 * Interface ADT operation parameter interfaces (snake_case, low-level)
 */

export interface ICreateInterfaceParams {
  interface_name: string;
  description: string;
  package_name: string;
  transport_request?: string;
  master_system?: string;
  responsible?: string;
}

export interface IReadInterfaceParams {
  interface_name: string;
  version?: 'active' | 'inactive';
}

export interface IUpdateInterfaceParams {
  interface_name: string;
  source_code: string;
  transport_request?: string;
}

export interface IDeleteInterfaceParams {
  interface_name: string;
  transport_request?: string;
}
