/**
 * ScalarFunction (CDS DSFD/SCF) ADT operation parameter interfaces (low-level)
 *
 * Note: only the low-level params are promoted here. Config/State/domain-object
 * types (IScalarFunctionConfig, IScalarFunctionState, etc.) are out of scope
 * for this task and are promoted separately.
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
