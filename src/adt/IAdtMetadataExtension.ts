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
