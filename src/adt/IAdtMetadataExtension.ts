/**
 * Metadata Extension ADT operation parameter interfaces (low-level)
 */

import type { IAdtObjectState } from './IAdtObjectState';

// Promoted verbatim from adt-clients src/core/metadataExtension/types.ts
export interface IMetadataExtensionValidationParams {
  name: string;
  description: string;
  packageName: string;
}

export interface IMetadataExtensionCreateParams {
  name: string;
  description: string;
  packageName: string;
  transportRequest?: string;
  masterLanguage?: string;
  masterSystem?: string;
  responsible?: string;
}

export interface ICreateMetadataExtensionParams {
  metadata_extension_name: string;
  description: string;
  package_name: string;
  transport_request?: string;
  master_language?: string;
  master_system?: string;
  responsible?: string;
}

export interface IReadMetadataExtensionParams {
  metadata_extension_name: string;
  version?: 'active' | 'inactive';
}

export interface IUpdateMetadataExtensionParams {
  metadata_extension_name: string;
  source_code: string;
  lock_handle: string;
  transport_request?: string;
}

export interface IDeleteMetadataExtensionParams {
  metadata_extension_name: string;
  transport_request?: string;
}

// Builder configuration (camelCase)
// Note: packageName and description are required for create/validate operations (validated in builder methods)
export interface IMetadataExtensionConfig {
  name: string; // Required
  description?: string; // Required for create/validate operations, optional for others
  packageName?: string; // Required for create/validate operations, optional for others
  transportRequest?: string; // Only optional parameter
  sourceCode?: string;
  masterLanguage?: string;
  masterSystem?: string;
  responsible?: string;
  sessionId?: string;
}

export interface IMetadataExtensionState extends IAdtObjectState {
  sourceCode?: string; // MetadataExtension-specific: stored source code
  // All operation results are in IAdtObjectState:
  // validationResponse, createResult, lockHandle, updateResult, checkResult,
  // unlockResult, activateResult, deleteResult, readResult, transportResult, errors
}
