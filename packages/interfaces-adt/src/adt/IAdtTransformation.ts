/**
 * Transformation ADT operation parameter interfaces (low-level)
 */

export type TransformationType = 'SimpleTransformation' | 'XSLTProgram';

// Builder configuration (camelCase)
export interface ITransformationConfig {
  transformationName: string;
  masterLanguage?: string; // Original/master language for create; falls back to systemContext (SAP_LANGUAGE), then EN
  transformationType: TransformationType;
  packageName?: string;
  transportRequest?: string;
  description?: string;
  sourceCode?: string;
}

// The state types were removed in 29.0.0: each member answers what its own
// endpoint produced, and a failure carries the request that produced it.
