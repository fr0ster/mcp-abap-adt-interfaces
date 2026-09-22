/**
 * Enhancement ADT operation parameter interfaces (snake_case, low-level)
 */

export type EnhancementType =
  | 'enhoxh'
  | 'enhoxhb'
  | 'enhoxhh'
  | 'enhsxs'
  | 'enhsxsb';

/**
 * AdtEnhancement configuration (camelCase)
 * Used by the implementation behind the enhancement's capability atoms
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

// Metadata type — promoted verbatim from adt-clients
// src/core/enhancement/types.ts (publicly exported, consumer-facing).
