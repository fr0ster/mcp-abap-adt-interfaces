/**
 * Class ADT operation parameter interfaces (snake_case, low-level)
 */

import type { IResultStrategy } from './IAdtResponse';

// AdtClass configuration (camelCase)
// Note: packageName is required for create operations (validated in builder methods)
// description is required for create/validate operations
export interface IClassConfig {
  className: string;
  masterLanguage?: string; // Original/master language for create; falls back to systemContext (SAP_LANGUAGE), then EN
  description?: string; // Required for create/validate operations, optional for others
  packageName?: string; // Required for create operations, optional for others
  transportRequest?: string; // Only optional parameter
  source?: string;
  testClassCode?: string;
  testClassName?: string;
  localTypesCode?: string; // Local helper classes, interface definitions and type declarations
  definitionsCode?: string; // Class-relevant local types (private section types)
  macrosCode?: string; // Macro definitions (legacy ABAP)
  superclass?: string;
  final?: boolean;
  abstract?: boolean;
  createProtected?: boolean;
  masterSystem?: string;
  responsible?: string;
  classTemplate?: string;
}

// Class-includes config types — promoted verbatim from adt-clients
// src/core/class/AdtLocal{TestClass,Types,Definitions,Macros}.ts
// (publicly exported; the `TConfig` of the atoms a class handler declares).
//
// Each include is addressed under its class, its parent API in the tables: a
// contract passes `'className'` as the atoms' `TParent` (`AdtObjectIdentity`).
export interface ILocalTestClassConfig {
  className: string;
  /**
   * Source of the whole testclasses include. ADT addresses the include, not a
   * single test class inside it, so there is no field naming one.
   */
  source?: string;
  transportRequest?: string;
}

export interface ILocalTypesConfig {
  className: string;
  source?: string;
  transportRequest?: string;
}

export interface ILocalDefinitionsConfig {
  className: string;
  source?: string;
  transportRequest?: string;
}

export interface ILocalMacrosConfig {
  className: string;
  source?: string;
  transportRequest?: string;
}

/**
 * One strategy per member of a class implementation.
 *
 * An implementation is given a whole set when it is constructed, not a strategy
 * per call: a consumer that wants documents whole wants them for every member it
 * touches, and none of them changes its mind between `create` and `read` of the
 * same object.
 *
 * **The set carries no type parameters.** `ReturnType<R['created']>` reads the
 * type out of the strategy a consumer passed, so a positional parameter per slot
 * would only restate what is already derivable — and every constraint naming the
 * interface would have to repeat them. It did, and adding a slot then left the
 * new parameter at its default in every constraint that still listed the old
 * count: legal TypeScript, silently un-injectable. Twice. The shipped defaults
 * belong to the implementation, which defaults its `R` to them.
 */
export interface IClassResults {
  readonly created: IResultStrategy<unknown>;
  readonly source: IResultStrategy<unknown>;
  readonly metadata: IResultStrategy<unknown>;
  /** Enhancement implementations in the host's source. */
  readonly enhancementElements: IResultStrategy<unknown>;
  /** Places in the host that can be enhanced. */
  readonly enhancementOptions: IResultStrategy<unknown>;
  readonly check: IResultStrategy<unknown>;
  readonly activation: IResultStrategy<unknown>;
  readonly validation: IResultStrategy<unknown>;
  readonly deletion: IResultStrategy<unknown>;
  readonly updated: IResultStrategy<unknown>;
  /** What writing the object's whole metadata document answers (`updateMetadata`). */
  readonly metadataUpdated: IResultStrategy<unknown>;
  /** What a deletion check answers: `del:checkResponse`. */
  readonly deletionCheck: IResultStrategy<unknown>;
  /** The transport request document of the class. */
  readonly transport: IResultStrategy<unknown>;
  /** The version history — an Atom feed; `objectVersions` reads it. */
  readonly versions: IResultStrategy<unknown>;
  /** One version's source. */
  readonly versionSource: IResultStrategy<unknown>;
}
