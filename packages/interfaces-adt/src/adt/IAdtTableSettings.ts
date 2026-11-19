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
 * `version="new"`), and activating the table (`TABL/DT`) activates them. There
 * is no create, no delete and no activation of their own here.
 *
 * **A write is a replace.** SAP writes every field of DD09L from the document
 * it is given (`CL_TABT_WB_PERSIST`, `DDIF_TABT_PUT`); a field the document
 * leaves out is written as its initial value. This library chooses no value
 * for the caller: what is not stated in {@link ITableSettings} is not sent.
 *
 * Types and constants only.
 */

import type { IAdtHeaders } from './IAdtContentTypes';
import type { IAdtUpdateOptions, IAnalyse } from './IAdtObject';
import type { IAdtError, IAdtResponse, IResultStrategy } from './IAdtResponse';

/**
 * A data class (`TABART`) — the value help's list on S/4HANA 2025
 * (`…/settings/dataClass/values`, measured 2026-11-19): master data,
 * transaction data, organisation and customizing, and the three BW classes.
 */
export type TableDataClass =
  | 'APPL0'
  | 'APPL1'
  | 'APPL2'
  | 'DDIM'
  | 'DFACT'
  | 'DODS';

/**
 * A size category (`TABKAT`), SAP's fixed values `0` to `9`. Written as the
 * document carries it (`<ts:sizeCategory>0</ts:sizeCategory>`, measured): a
 * code, so a string.
 */
export type TableSizeCategory =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9';

/**
 * Whether the table may be buffered (`BUFALLOW`): `N` not allowed, `X`
 * allowed, `A` allowed but switched off. SAP writes a blank as `N`
 * (`CL_TABT_WB_PERSIST`); this type has no blank, so the caller says which.
 */
export type TableBufferingAllowed = 'N' | 'X' | 'A';

/**
 * The buffering type (`PUFFERUNG`): `P` single records, `G` generic area,
 * `X` full. SAP reads {@link ITableBuffering.areaKeyFields} only for `G`.
 */
export type TableBufferingType = 'P' | 'G' | 'X';

/** The `ts:buffering` group. */
export interface ITableBuffering {
  readonly allowed: TableBufferingAllowed;
  /** Absent: the element is not sent, and SAP writes no buffering type. */
  readonly type?: TableBufferingType | undefined;
  /**
   * The number of key fields of a generic area (`SCHFELDANZ`); a count, so a
   * number. SAP writes it only with type `G`.
   */
  readonly areaKeyFields?: number | undefined;
}

/**
 * What a write states, element by element, as the document names them
 * (transformation `SDDIC_ADT_TTAB`).
 *
 * Data class, size category and buffering are required: they are what the
 * settings are written for, and with no value of its own chosen here, a
 * missing one would be written blank. The rest are optional, and an absent one
 * is not sent — SAP then writes its initial value. The value sets of those
 * are not measured, so they are strings.
 *
 * Not here: `supportsLoggingAssessment`, which SAP computes on every read, and
 * the cloud's `isWritableByAMDP`, which the on-premise transformation does not
 * know and no write has been measured with. Both are in what a read answers.
 */
export interface ITableSettings {
  readonly dataClassCategory: TableDataClass;
  readonly sizeCategory: TableSizeCategory;
  readonly buffering: ITableBuffering;
  /** `ROWORCOLST`: `C` (column store) on the systems read. */
  readonly storageType?: string | undefined;
  /** `SHARINGTYPE`. */
  readonly sharingType?: string | undefined;
  /** `LOAD_UNIT`. */
  readonly loadUnit?: string | undefined;
  /** `UEBERSETZ`, sent as `ts:translation`'s `ts:value`. */
  readonly translation?: string | undefined;
  /** `PROTOKOLL`: log data changes. */
  readonly loggingEnabled?: boolean | undefined;
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
 * (SWB_TOOL 019, measured on premise and on the cloud). It is the table's
 * short text, which a read of the settings answers as `adtcore:description`;
 * SAP does not change it through this resource.
 */
export interface ITableSettingsUpdateConfig extends ITableSettingsConfig {
  description: string;
  settings: ITableSettings;
}

/**
 * The options of a settings write: those of every write, without a `source`.
 *
 * The body is built from {@link ITableSettingsUpdateConfig}, so there is no
 * second channel to send one through: `source?: never` refuses it for a
 * variable as well as a literal, as {@link IAdtCreateOptions} does.
 */
export type IAdtTableSettingsUpdateOptions<E extends IAdtError = IAdtError> =
  Omit<IAdtUpdateOptions<E>, 'source'> & { source?: never };

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
