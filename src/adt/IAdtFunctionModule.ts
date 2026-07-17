/**
 * Function Module ADT operation parameter interfaces (snake_case, low-level)
 */

export interface ICreateFunctionModuleParams {
  functionGroupName: string;
  functionModuleName: string;
  description: string;
  transportRequest?: string;
  masterSystem?: string;
  responsible?: string;
}

export interface IReadFunctionModuleParams {
  function_module_name: string;
  function_group_name: string;
  version?: 'active' | 'inactive';
}

export interface IUpdateFunctionModuleParams {
  functionGroupName: string;
  functionModuleName: string;
  lockHandle: string;
  sourceCode: string;
  transportRequest?: string;
}

export interface IDeleteFunctionModuleParams {
  function_module_name: string;
  function_group_name: string;
  transport_request?: string;
}
