/**
 * Function Group ADT operation parameter interfaces (snake_case, low-level)
 */

export interface ICreateFunctionGroupParams {
  function_group_name: string;
  description: string;
  package_name: string;
  transport_request?: string;
  master_system?: string;
  responsible?: string;
}

export interface IReadFunctionGroupParams {
  function_group_name: string;
  version?: 'active' | 'inactive';
}

export interface IUpdateFunctionGroupParams {
  function_group_name: string;
  description?: string;
  transport_request?: string;
  lock_handle?: string;
}

export interface IDeleteFunctionGroupParams {
  function_group_name: string;
  transport_request?: string;
}
