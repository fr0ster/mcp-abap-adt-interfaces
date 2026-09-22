/**
 * ScalarFunctionImplementation (DSFI/SFI) ADT operation parameter interfaces (low-level)
 */

export type ScalarFunctionEngine = 'sqlEngine' | 'amdpEngine';

export interface IScalarFunctionImplementationConfig {
  implementationName: string;
  scalarFunctionName: string;
  engineValue?: ScalarFunctionEngine;
  masterLanguage?: string;
  packageName?: string;
  transportRequest?: string;
  description?: string;
  sourceCode?: string;
}
