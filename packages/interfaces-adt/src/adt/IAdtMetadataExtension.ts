/**
 * Metadata Extension ADT operation parameter interfaces (low-level)
 */

// Promoted verbatim from adt-clients src/core/metadataExtension/types.ts

// Builder configuration (camelCase)
// Note: packageName and description are required for create/validate operations (validated in builder methods)
export interface IMetadataExtensionConfig {
  name: string; // Required
  description?: string; // Required for create/validate operations, optional for others
  packageName?: string; // Required for create/validate operations, optional for others
  transportRequest?: string; // Only optional parameter
  source?: string;
  masterLanguage?: string;
  masterSystem?: string;
  responsible?: string;
}
