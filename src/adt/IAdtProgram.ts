/**
 * Program ADT operation parameter interfaces (snake_case, low-level)
 */

export interface ICreateProgramParams {
  programName: string;
  description?: string;
  packageName: string;
  transportRequest?: string;
  masterSystem?: string;
  responsible?: string;
  masterLanguage?: string;
  programType?: string;
  application?: string;
  sourceCode?: string;
  activate?: boolean;
}

export interface IReadProgramParams {
  program_name: string;
  version?: 'active' | 'inactive';
}

export interface IUpdateProgramParams {
  program_name: string;
  source_code: string;
  transport_request?: string;
}

export interface IUpdateProgramSourceParams {
  programName: string;
  sourceCode: string;
  activate?: boolean;
}

export interface IDeleteProgramParams {
  programName: string;
  transportRequest?: string;
}
