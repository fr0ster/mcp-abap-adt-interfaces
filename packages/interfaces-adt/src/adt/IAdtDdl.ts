/**
 * DDL-source ADT operation parameter interfaces (snake_case, low-level).
 * Cover the generic DDL-source endpoint (`/sap/bc/adt/ddic/ddl/sources/`):
 * CDS views, AMDP table functions, and other DDL sources.
 */

import type { IResultStrategy } from './IAdtResponse';

// Builder configuration (camelCase)
// Note: packageName is required for create operations (validated in builder methods)
// description is required for create/validate operations
export interface IDdlConfig {
  ddlName: string;
  masterLanguage?: string; // Original/master language for create; falls back to systemContext (SAP_LANGUAGE), then EN
  packageName?: string; // Required for create operations, optional for others
  transportRequest?: string; // Only optional parameter
  description?: string; // Required for create/validate operations, optional for others
  source?: string;
}

/** One strategy per member of a ddl implementation. See `IClassResults`. */
export interface IDdlResults {
  readonly created: IResultStrategy<unknown>;
  readonly source: IResultStrategy<unknown>;
  readonly metadata: IResultStrategy<unknown>;
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
  /**
   * What the test-doubles check answers: `SEVERITY` inside a 200.
   * `analyseCdsTestDoubles` in @mcp-abap-adt/adt-strategies reads the verdict.
   */
  readonly testDoubles: IResultStrategy<unknown>;
}
