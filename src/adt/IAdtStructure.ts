/**
 * Structure ADT operation parameter interfaces (snake_case, low-level)
 */

export interface ICreateStructureParams {
  structureName: string;
  description: string;
  packageName: string;
  transportRequest?: string;
  masterSystem?: string;
  responsible?: string;
  masterLanguage?: string;
}

export interface IReadStructureParams {
  structure_name: string;
  version?: 'active' | 'inactive';
}

export interface IUpdateStructureParams {
  structureName: string;
  ddlCode: string;
  transportRequest?: string;
}

export interface IDeleteStructureParams {
  structure_name: string;
  transport_request?: string;
}
