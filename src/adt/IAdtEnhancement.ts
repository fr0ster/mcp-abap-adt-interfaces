/**
 * Enhancement ADT operation parameter interfaces (snake_case, low-level)
 */

export type EnhancementType =
  | 'enhoxh'
  | 'enhoxhb'
  | 'enhoxhh'
  | 'enhsxs'
  | 'enhsxsb';

export interface ICreateEnhancementParams {
  enhancement_name: string;
  enhancement_type: EnhancementType;
  description?: string;
  package_name: string;
  transport_request?: string;
  enhancement_spot?: string;
  badi_definition?: string;
  source_code?: string;
  master_system?: string;
  responsible?: string;
}

export interface IReadEnhancementParams {
  enhancement_name: string;
  enhancement_type: EnhancementType;
  version?: 'active' | 'inactive';
}

export interface IUpdateEnhancementParams {
  enhancement_name: string;
  enhancement_type: EnhancementType;
  source_code: string;
  lock_handle: string;
  transport_request?: string;
}

export interface IDeleteEnhancementParams {
  enhancement_name: string;
  enhancement_type: EnhancementType;
  transport_request?: string;
}
