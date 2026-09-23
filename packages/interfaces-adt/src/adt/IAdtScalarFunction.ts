/**
 * ScalarFunction (CDS DSFD/SCF) ADT operation parameter interfaces (low-level)
 */

// Handler configuration (camelCase)
export interface IScalarFunctionConfig {
  scalarFunctionName: string;
  masterLanguage?: string;
  packageName?: string;
  transportRequest?: string;
  description?: string;
  source?: string;
}
