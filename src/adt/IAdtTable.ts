/**
 * Table ADT operation parameter interfaces (snake_case, low-level)
 */

import type { IAdtObjectState } from './IAdtObjectState';

export interface ICreateTableParams {
  table_name: string;
  package_name: string;
  transport_request?: string;
  ddl_code?: string;
  masterSystem?: string;
  responsible?: string;
  masterLanguage?: string;
}

export interface IUpdateTableParams {
  table_name: string;
  ddl_code: string;
  transport_request?: string;
  activate?: boolean;
}

export interface IDeleteTableParams {
  table_name: string;
  transport_request?: string;
}

// Builder configuration (camelCase)
// Note: packageName is required for create operations (validated in builder methods)
// description is required for create/validate operations
export interface ITableConfig {
  tableName: string;
  masterLanguage?: string; // Original/master language for create; falls back to systemContext (SAP_LANGUAGE), then EN
  packageName?: string; // Required for create operations, optional for others
  transportRequest?: string; // Only optional parameter
  ddlCode?: string;
  description?: string; // Required for create/validate operations, optional for others
}

export interface ITableState extends IAdtObjectState {
  // All operation results are in IAdtObjectState:
  // validationResponse, createResult, lockHandle, updateResult, checkResult,
  // unlockResult, activateResult, deleteResult, readResult, transportResult
  // Table-specific fields can be added here if needed
}
