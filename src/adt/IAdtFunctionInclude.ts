/**
 * FunctionInclude (FUGR/I) ADT operation parameter interfaces (low-level)
 */

export interface ICreateFunctionIncludeParams {
  function_group_name: string;
  include_name: string;
  description?: string;
  transport_request?: string;
  master_system?: string;
  responsible?: string;
}

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
