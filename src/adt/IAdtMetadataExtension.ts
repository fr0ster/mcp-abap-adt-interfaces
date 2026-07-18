/**
 * Metadata Extension ADT operation parameter interfaces (low-level)
 */

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
