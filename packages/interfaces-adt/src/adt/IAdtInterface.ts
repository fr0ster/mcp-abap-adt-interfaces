/**
 * Interface ADT operation parameter interfaces (snake_case, low-level)
 */

import type { IAdtObjectConfig } from './IAdtObjectState';

export interface ICreateInterfaceParams {
  interfaceName: string;
  description: string;
  packageName: string;
  transportRequest?: string;
  masterSystem?: string;
  responsible?: string;
  masterLanguage?: string;
}

export interface IUpdateInterfaceSourceParams {
  interface_name: string;
  source_code: string;
  activate?: boolean;
}

export interface IDeleteInterfaceParams {
  interface_name: string;
  transport_request?: string;
}

// Builder configuration (camelCase)
// Note: packageName is required for create operations (validated in builder methods)
// description is required for create/validate operations
export type IInterfaceConfig = IAdtObjectConfig & {
  interfaceName: string;
  masterLanguage?: string; // Original/master language for create; falls back to systemContext (SAP_LANGUAGE), then EN
  packageName?: string; // Required for create operations, optional for others
  transportRequest?: string; // Only optional parameter
  description?: string; // Required for create/validate operations, optional for others
  sourceCode?: string;
  sessionId?: string;
  onLock?: (lockHandle: string) => void;
};
