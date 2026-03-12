/**
 * Function Module ADT operation parameter interfaces (snake_case, low-level)
 */

export interface ICreateFunctionModuleParams {
  function_group_name: string;
  function_module_name: string;
  description: string;
  transport_request?: string;
  master_system?: string;
  responsible?: string;
}

export interface IReadFunctionModuleParams {
  function_module_name: string;
  function_group_name: string;
  version?: 'active' | 'inactive';
}

export interface IUpdateFunctionModuleParams {
  function_group_name: string;
  function_module_name: string;
  lock_handle: string;
  source_code: string;
  transport_request?: string;
}

export interface IDeleteFunctionModuleParams {
  function_module_name: string;
  function_group_name: string;
  transport_request?: string;
}
