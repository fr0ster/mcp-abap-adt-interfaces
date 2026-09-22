/**
 * FunctionInclude (FUGR/I) ADT operation parameter interfaces (low-level)
 */

export interface IFunctionIncludeConfig {
  functionGroupName: string;
  includeName: string;
  description?: string;
  transportRequest?: string;
  masterSystem?: string;
  responsible?: string;
  sourceCode?: string;
  sessionId?: string;
  onLock?: (lockHandle: string) => void;
}
