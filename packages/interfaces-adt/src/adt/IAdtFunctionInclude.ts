/**
 * FunctionInclude (FUGR/I) ADT operation parameter interfaces (low-level)
 */

export interface IFunctionIncludeConfig {
  functionGroupName: string;
  includeName: string;
  description?: string;
  transportRequest?: string;
  source?: string;
}
