/**
 * A database table's technical settings (`TABL/DTT`): data class, size
 * category, buffering, logging and the rest of DD09L.
 *
 * **Its own resource, and its own contract.** SAP keeps the settings apart
 * from the table's document: `/sap/bc/adt/ddic/db/settings/{name}`, content
 * type `application/vnd.sap.adt.table.settings.v2+xml`, its own ETag and its
 * own lock (ESDICT `TABT`, not the table's `TABL`). So the settings are not a
 * field of {@link ITableConfig} or a slot of {@link ITableResults}; the table's
 * document only links them (`…/relations/technicalsettings`). Read on premise
 * and on the cloud, 2026-11-19.
 *
 * **Created with the table, activated with it.** SAP fills default settings
 * itself when a table is created (a read right after the create answers 200,
 * `version="new"`), and activating the table activates them: measured with
 * the table's reference (`TABL/DT`) alone, on premise and on the cloud; an
 * activation of `TABL/DTT` alone was never sent. There is no create, no
 * delete and no activation of their own here.
 *
 * **An update replaces every setting: read, change, write back.** SAP writes
 * every field of DD09L from the document it is given (`CL_TABT_WB_PERSIST`,
 * `DDIF_TABT_PUT`); a field the document leaves out is reset to its initial
 * value. So {@link ITableSettings} requires every field the document carries.
 *
 * Types and constants only.
 */

import type { IAdtHeaders } from './IAdtContentTypes';
import type { IAdtUpdateOptions, IAnalyse } from './IAdtObject';
import type { IAdtError, IAdtResponse, IResultStrategy } from './IAdtResponse';

/**
 * The data classes (`TABART`) the value help lists on S/4HANA 2025
 * (`…/settings/dataClass/values`, measured 2026-11-19): master data,
 * transaction data, organisation and customizing, and the three BW classes.
 *
 * **For discovery, not a limit.** A system may define customer data classes
 * (`USER`, `USER1`, …), so {@link ITableSettings.dataClassCategory} is a
 * `string`; these are the values known to exist everywhere measured.
 */
export const TABLE_DATA_CLASSES = [
  'APPL0',
  'APPL1',
  'APPL2',
  'DDIM',
  'DFACT',
  'DODS',
] as const;

/** One of {@link TABLE_DATA_CLASSES}. */
export type KnownTableDataClass = (typeof TABLE_DATA_CLASSES)[number];

/**
 * Size categories (`TABKAT`): `0` to `9`. **SAP's standard domain values, not
 * measured** — the size value help answered no entries without a table's
 * context. Written as the document carries it
 * (`<ts:sizeCategory>0</ts:sizeCategory>`, measured): a code, so a string.
 *
 * For discovery, not a limit: {@link ITableSettings.sizeCategory} is a
 * `string`.
 */
export const TABLE_SIZE_CATEGORIES = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
] as const;

/** One of {@link TABLE_SIZE_CATEGORIES}. */
export type KnownTableSizeCategory = (typeof TABLE_SIZE_CATEGORIES)[number];

/**
 * Whether the table may be buffered (`BUFALLOW`): `N` not allowed, `X`
 * allowed, `A` allowed but switched off. **SAP's standard domain values, not
 * measured** — only `N` was read. SAP writes a blank as `N`
 * (`CL_TABT_WB_PERSIST`).
 *
 * For discovery, not a limit: {@link ITableBuffering.allowed} is a `string`.
 */
export const TABLE_BUFFERING_ALLOWED = ['N', 'X', 'A'] as const;

/** One of {@link TABLE_BUFFERING_ALLOWED}. */
export type KnownTableBufferingAllowed =
  (typeof TABLE_BUFFERING_ALLOWED)[number];

/**
 * Buffering types (`PUFFERUNG`): `P` single records, `G` generic area, `X`
 * full. **SAP's standard domain values, not measured** — only the empty one
 * (no buffering) was read. SAP reads {@link ITableBuffering.areaKeyFields}
 * only for `G`.
 *
 * For discovery, not a limit: {@link ITableBuffering.type} is a `string`.
 */
export const TABLE_BUFFERING_TYPES = ['P', 'G', 'X'] as const;

/** One of {@link TABLE_BUFFERING_TYPES}. */
export type KnownTableBufferingType = (typeof TABLE_BUFFERING_TYPES)[number];

/** The `ts:buffering` group: every element, as a write replaces them all. */
export interface ITableBuffering {
  /** One of {@link TABLE_BUFFERING_ALLOWED}, or another the system knows. */
  readonly allowed: string;
  /**
   * One of {@link TABLE_BUFFERING_TYPES}, another the system knows, or `''`
   * for no buffering type (what a read of an unbuffered table answers).
   */
  readonly type: string;
  /**
   * The number of key fields of a generic area (`SCHFELDANZ`); a count, so a
   * number. SAP writes it only with type `G`; a read answers `0` otherwise.
   */
  readonly areaKeyFields: number;
}

/**
 * Every setting a write carries, element by element, as the document names
 * them (transformation `SDDIC_ADT_TTAB`).
 *
 * **An update replaces every setting: read, change, write back.** SAP writes
 * every field of DD09L from the document it is given (`CL_TABT_WB_PERSIST`,
 * `DDIF_TABT_PUT`), and a field the document leaves out is written as its
 * initial value — reset, not kept. So every field the document carries is
 * required: a caller reads the settings, changes what it means to change, and
 * writes the whole set back. This library chooses no value for the caller.
 *
 * Not here: `isWritableByAMDP`, returned by the cloud and not written by this
 * contract (unmeasured; the on-premise transformation does not define it) —
 * it is on {@link ITableSettingsRead}; and `supportsLoggingAssessment`, which
 * SAP computes on every read.
 */
export interface ITableSettings {
  /**
   * The data class: one of {@link TABLE_DATA_CLASSES}, or a customer data
   * class the system defines.
   */
  readonly dataClassCategory: string;
  /** One of {@link TABLE_SIZE_CATEGORIES}, or another the system knows. */
  readonly sizeCategory: string;
  readonly buffering: ITableBuffering;
  /** `ROWORCOLST`: `C` (column store) on the systems read. */
  readonly storageType: string;
  /** `SHARINGTYPE`; `''` on the systems read. */
  readonly sharingType: string;
  /** `LOAD_UNIT`; `''` on the systems read. */
  readonly loadUnit: string;
  /** `UEBERSETZ`, sent as `ts:translation`'s `ts:value`; `''` on the systems read. */
  readonly translation: string;
  /** `PROTOKOLL`: log data changes. */
  readonly loggingEnabled: boolean;
}

/**
 * The settings as a read answers them: every field a write carries, and what
 * only a read returns. The shape a reading strategy that parses the document
 * answers; the shipped default answers the document as it arrived.
 *
 * Writing it back takes {@link ITableSettings}: drop what only a read returns
 * first (`const { isWritableByAMDP, ...settings } = read`), since the write
 * refuses it.
 */
export interface ITableSettingsRead extends ITableSettings {
  /**
   * The cloud's `ts:isWritableByAMDP`. Returned by cloud; not written by this
   * contract (unmeasured). Absent on premise, whose transformation does not
   * define it.
   */
  readonly isWritableByAMDP?: boolean | undefined;
}

/**
 * The settings of one table, named by the table: the identity every member
 * takes. `lock`, `unlock` and `readMetadata` read `tableName`;
 * `transportRequest` is the `corrNr` of a write.
 */
export interface ITableSettingsConfig {
  tableName: string;
  transportRequest?: string | undefined;
}

/**
 * What a write takes: the identity, and the document's content.
 *
 * `description` is required because SAP requires it: a write without
 * `adtcore:description` is refused, 400 "The description is missing"
 * (SWB_TOOL 019, measured on premise only; the cloud write was sent with a
 * description and never without one). It is the table's
 * short text, which a read of the settings answers as `adtcore:description`;
 * SAP does not change it through this resource.
 */
export interface ITableSettingsUpdateConfig extends ITableSettingsConfig {
  description: string;
  /**
   * Every setting the write carries. `isWritableByAMDP` is refused, for a
   * variable as well as a literal: this contract does not write it.
   */
  settings: ITableSettings & { readonly isWritableByAMDP?: never };
}

/**
 * The options of a settings write: those of every write, without a `source`
 * and with the lock handle required.
 *
 * The body is built from {@link ITableSettingsUpdateConfig}, so there is no
 * second channel to send one through: `source?: never` refuses it for a
 * variable as well as a literal, as {@link IAdtCreateOptions} does.
 *
 * `lockHandle` is required: the settings write is measured only under the
 * settings' own lock (`POST ?_action=LOCK&accessMode=MODIFY`), and the
 * table's lock does not cover them.
 */
export type IAdtTableSettingsUpdateOptions<E extends IAdtError = IAdtError> =
  Omit<IAdtUpdateOptions<E>, 'source' | 'lockHandle'> & {
    source?: never;
    lockHandle: string;
  };

/**
 * The settings can be written.
 *
 * The one member the atoms do not already say: {@link IAdtMetadataUpdatable}
 * takes its body as `options.source`, and this write takes its content from
 * the config. Reading is {@link IAdtMetadataReadable} over
 * {@link ITableSettingsConfig}, and the lock is {@link IAdtLockable} over the
 * same — the settings' own lock, which the table's does not cover.
 *
 * **One request, and the lock is the caller's.** A write is
 * `PUT …/settings/{name}?lockHandle=…[&corrNr=…]`; locking before it,
 * unlocking after it on every path, and activating the table are the
 * caller's calls, in that order.
 */
export interface IAdtTableSettingsUpdatable<TMetadataUpdated> {
  /**
   * Write the settings: the document built from `config`, under the lock the
   * caller passes as `options.lockHandle`.
   *
   * @returns whatever this implementation's reading makes of the answer —
   *          SAP answers 200 with the inactive document
   */
  updateMetadata<E extends IAdtError>(
    config: ITableSettingsUpdateConfig,
    options: { headers: IAdtHeaders } & IAdtTableSettingsUpdateOptions<E> & {
        analyse: IAnalyse<E>;
      },
  ): Promise<IAdtResponse<TMetadataUpdated, E>>;
  updateMetadata(
    config: ITableSettingsUpdateConfig,
    options: { headers: IAdtHeaders } & IAdtTableSettingsUpdateOptions,
  ): Promise<IAdtResponse<TMetadataUpdated>>;
}

/** One strategy per member of a table settings implementation. See `IClassResults`. */
export interface ITableSettingsResults {
  /** The settings document a read answers. */
  readonly metadata: IResultStrategy<unknown>;
  /** What a write answers: the settings document, inactive. */
  readonly metadataUpdated: IResultStrategy<unknown>;
}
