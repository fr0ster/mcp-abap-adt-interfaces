/**
 * Type group (`TYPE/DG`) parameter interfaces.
 */

import type { IResultStrategy } from './IAdtResponse';

/**
 * A type group: a name of at most 5 characters (the table's `nameMaxLength`),
 * its package and description, and its source (`TYPE-POOL <name>.` and the
 * types it declares). The measured create carries `adtcore:type="TYPE/DG"` and
 * nothing that selects a kind, so there is no subtype field.
 */
export interface ITypeGroupConfig {
  typeGroupName: string;
  packageName?: string | undefined;
  description?: string | undefined;
  transportRequest?: string | undefined;
  masterLanguage?: string | undefined; // Original/master language for create; with none, none is sent
  source?: string | undefined;
}

/**
 * One strategy per member of a type group implementation. See
 * `IClassResults`. Lock and unlock have no slot: they answer the handle and
 * nothing. There is no check, metadata write, transport or deletion check.
 */
export interface ITypeGroupResults {
  /** What a name validation answers: empty when the name is valid. */
  readonly validation: IResultStrategy<unknown>;
  readonly created: IResultStrategy<unknown>;
  /** The `atypgr:abapTypeGroup` document. */
  readonly metadata: IResultStrategy<unknown>;
  readonly source: IResultStrategy<unknown>;
  readonly updated: IResultStrategy<unknown>;
  readonly activation: IResultStrategy<unknown>;
  readonly deletion: IResultStrategy<unknown>;
  /** The version history — an Atom feed. */
  readonly versions: IResultStrategy<unknown>;
  /** One version's source. */
  readonly versionSource: IResultStrategy<unknown>;
}
