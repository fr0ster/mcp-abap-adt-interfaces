/**
 * ScalarFunctionImplementation (DSFI/SFI) ADT operation parameter interfaces (low-level)
 *
 * Note: only the low-level params + the nested shapes they reference are
 * promoted here. Config/State/domain-object types (IScalarFunctionImplementationConfig,
 * IScalarFunctionImplementationState, etc.) are out of scope for this task and
 * are promoted separately.
 */

export type ScalarFunctionEngine = 'sqlEngine' | 'amdpEngine';

export interface ICreateScalarFunctionImplementationParams {
  implementation_name: string;
  scalar_function_name: string;
  engine_value?: ScalarFunctionEngine;
  description?: string;
  package_name: string;
  transport_request?: string;
  masterSystem?: string;
  responsible?: string;
  masterLanguage?: string;
}

export interface IUpdateScalarFunctionImplementationParams {
  implementation_name: string;
  source_code: string;
  transport_request?: string;
}

export interface IDeleteScalarFunctionImplementationParams {
  implementation_name: string;
  transport_request?: string;
}
