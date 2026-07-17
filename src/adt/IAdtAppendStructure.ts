/**
 * AppendStructure (TABL/DS append) ADT operation parameter interfaces (low-level)
 */

export interface ICreateAppendStructureParams {
  append_structure_name: string;
  base_object: string; // name of the base table OR structure being extended
  description?: string;
  package_name: string;
  transport_request?: string;
  masterSystem?: string;
  responsible?: string;
  masterLanguage?: string;
}

export interface IUpdateAppendStructureParams {
  append_structure_name: string;
  source_code: string;
  transport_request?: string;
}

export interface IDeleteAppendStructureParams {
  append_structure_name: string;
  transport_request?: string;
}
