/**
 * Program ADT operation parameter interfaces (snake_case, low-level)
 */

export interface ICreateProgramParams {
  program_name: string;
  description?: string;
  package_name: string;
  transport_request?: string;
  master_system?: string;
  responsible?: string;
  program_type?: string;
  application?: string;
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

export interface IDeleteProgramParams {
  program_name: string;
  transport_request?: string;
}
