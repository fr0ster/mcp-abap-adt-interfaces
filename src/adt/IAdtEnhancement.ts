/**
 * Enhancement ADT operation parameter interfaces (snake_case, low-level)
 */

import type { IAdtObjectState } from './IAdtObjectState';

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
  /**
   * @deprecated No-op. `create()` posts metadata only; the source is written by
   * `update()`. Kept for backward compatibility — this field is never read.
   */
  source_code?: string;
  masterSystem?: string;
  responsible?: string;
  masterLanguage?: string;
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

export interface ICheckEnhancementParams {
  enhancement_name: string;
  enhancement_type: EnhancementType;
  version?: 'active' | 'inactive';
  source_code?: string;
}

export interface IValidateEnhancementParams {
  enhancement_name: string;
  enhancement_type: EnhancementType;
  package_name?: string;
  description?: string;
}

/**
 * AdtEnhancement configuration (camelCase)
 * Used by high-level IAdtObject implementation
 */
export interface IEnhancementConfig {
  enhancementName: string;
  masterLanguage?: string; // Original/master language for create; falls back to systemContext (SAP_LANGUAGE), then EN
  enhancementType: EnhancementType;
  description?: string;
  packageName?: string;
  transportRequest?: string;
  sourceCode?: string;
  enhancementSpot?: string;
  badiDefinition?: string;
}

/**
 * AdtEnhancement state
 * Extends base IAdtObjectState with enhancement-specific fields
 */
export interface IEnhancementState extends IAdtObjectState {
  enhancementType?: EnhancementType;
  sourceCode?: string;
}
