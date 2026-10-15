/**
 * Enhancement ADT operation parameter interfaces (snake_case, low-level)
 */

/**
 * Enhancement subtypes served by ADT:
 * - `enhoxhb`: BAdI implementation (ENHO/XHB).
 * - `enhoxhh`: source code plugin (ENHO/XHH), on-premise only; Cloud answers 403.
 * - `enhsxsb`: BAdI enhancement spot (ENHS/XSB).
 * Class enhancements (`enhoxh`) and plain spots (`enhsxs`) are not served by
 * ADT: reads answer HTTP 500, and Eclipse opens them in SAP GUI.
 */
export type EnhancementType = 'enhoxhb' | 'enhoxhh' | 'enhsxsb';

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
  source?: string;
  enhancementSpot?: string;
  badiDefinition?: string;
  /**
   * Host object of an ENHO/XHH source code plugin; needed to create it.
   * `uri`, `type` (PROG/P, CLAS/OC, FUGR/F, …) and `name` identify the host.
   * `program` is its main program name (programname): the program itself,
   * SAPL<group> for a function group, or the class pool for a class.
   */
  enhancedObject?: { uri: string; type: string; name: string; program: string };
  /**
   * Full enhancement option name implemented by an ENHO/XHH plugin; needed to
   * create it. Obtained from GET {hostUri}/enhancements/options.
   */
  enhancementOption?: string;
  /** ENHO/XHH option mode: S (static) or D (dynamic); needed to create it. */
  enhancementMode?: 'S' | 'D';
}

// Metadata type — promoted verbatim from adt-clients
// src/core/enhancement/types.ts (publicly exported, consumer-facing).
