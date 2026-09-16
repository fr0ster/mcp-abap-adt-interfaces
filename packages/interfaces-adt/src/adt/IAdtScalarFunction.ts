/**
 * ScalarFunction (CDS DSFD/SCF) ADT operation parameter interfaces (low-level)
 */

export interface ICreateScalarFunctionParams {
  scalar_function_name: string;
  description?: string;
  package_name: string;
  transport_request?: string;
  masterSystem?: string;
  responsible?: string;
  masterLanguage?: string;
}

export interface IUpdateScalarFunctionParams {
  scalar_function_name: string;
  source_code: string;
  transport_request?: string;
}

export interface IDeleteScalarFunctionParams {
  scalar_function_name: string;
  transport_request?: string;
}

// Handler configuration (camelCase)
export interface IScalarFunctionConfig {
  scalarFunctionName: string;
  masterLanguage?: string;
  packageName?: string;
  transportRequest?: string;
  description?: string;
  sourceCode?: string;
}
