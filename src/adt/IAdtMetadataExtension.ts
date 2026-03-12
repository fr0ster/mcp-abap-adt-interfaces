/**
 * Metadata Extension ADT operation parameter interfaces (snake_case, low-level)
 */

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
