/**
 * Interface ADT operation parameter interfaces (snake_case, low-level)
 */

export interface ICreateInterfaceParams {
  interfaceName: string;
  description: string;
  packageName: string;
  transportRequest?: string;
  masterSystem?: string;
  responsible?: string;
  masterLanguage?: string;
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

export interface IUpdateInterfaceSourceParams {
  interface_name: string;
  source_code: string;
  activate?: boolean;
}

export interface IDeleteInterfaceParams {
  interface_name: string;
  transport_request?: string;
}
