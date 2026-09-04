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

// Builder configuration (camelCase)
// Note: packageName is required for create operations (validated in builder methods)
// description is required for create/validate operations
// sourceCode is required for create/update operations
export interface IFunctionModuleConfig {
  functionGroupName: string; // Required
  functionModuleName: string; // Required
  packageName?: string; // Required for create operations, optional for others
  transportRequest?: string; // Only optional parameter
  description?: string; // Required for create/validate operations, optional for others
  sourceCode?: string; // Required for create/update operations, optional for others
  masterSystem?: string; // SAP system ID (three characters) — required on on-premise
  responsible?: string; // User responsible for the object
  onLock?: (lockHandle: string) => void;
}
