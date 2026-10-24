/**
 * Enhancement ADT operation parameter interfaces (snake_case, low-level)
 */

import type { IResultStrategy } from './IAdtResponse';

/**
 * Enhancement subtypes served by ADT:
 * - `enhoxhb`: BAdI implementation (ENHO/XHB).
 * - `enhoxhh`: source code plugin (ENHO/XHH). The ABAP Cloud trial refuses
 *   the collection (403 on create and read; no discovery content type).
 * - `enhsxsb`: BAdI enhancement spot (ENHS/XSB).
 * Class enhancements (`enhoxh`) and plain spots (`enhsxs`): reads answered 500
 * on E19 (2026-10-15) and on premise + trial in mcp-abap-adt `5046d8a6`
 * (2026-10-02), which also measured Eclipse opening them in SAP GUI.
 * The trial discovery lists no content type for either subtype.
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

/** One strategy per member of a enhancement implementation. See `IClassResults`. */
export interface IEnhancementResults {
  readonly created: IResultStrategy<unknown>;
  readonly source: IResultStrategy<unknown>;
  readonly metadata: IResultStrategy<unknown>;
  /** The whole document returned by the object document PUT. */
  readonly metadataUpdated: IResultStrategy<unknown>;
  readonly check: IResultStrategy<unknown>;
  readonly activation: IResultStrategy<unknown>;
  readonly validation: IResultStrategy<unknown>;
  readonly deletion: IResultStrategy<unknown>;
  readonly updated: IResultStrategy<unknown>;
  readonly transport: IResultStrategy<unknown>;
  /** What a deletion check answers: `del:checkResponse`. */
  readonly deletionCheck: IResultStrategy<unknown>;
  /** The version history — an Atom feed; `objectVersions` reads it. */
  readonly versions: IResultStrategy<unknown>;
  /** One version's source. */
  readonly versionSource: IResultStrategy<unknown>;
}
