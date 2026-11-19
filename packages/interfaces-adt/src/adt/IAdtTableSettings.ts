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
 * every field of DD09L from the document it is given
 * (`CL_TABT_WB_PERSIST->move_adt_to_ddv`, then `DDIF_TABT_PUT`; Code on both
 * systems, measured on both, 2026-11-19); a field the document leaves out is
 * reset to its initial value. So {@link ITableSettings} requires every field
 * the document carries, and {@link IAdtTableSettingsPatchable} reads,
 * overlays and writes the whole document.
 *
 * Types and constants only.
 */

import type { AdtModernVariant } from './AdtTypeTables';
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
   * number. SAP writes it only with type `G`
   * (`CL_TABT_WB_PERSIST->move_adt_to_ddv`: `IF e_dd09l_wa-pufferung = 'G'.
   * e_dd09l_wa-schfeldanz = …`, Code on both systems); with any other type the
   * field is not written, so it stays initial (`0`) — a write that changes
   * the type away from `G` drops it.
   */
  readonly areaKeyFields: number;
}

/**
 * The `ts:translation` element's attributes, as the transformation
 * `SDDIC_ADT_TTAB` writes them. Read on premise and on the cloud
 * (2026-11-19): `ts:value=""`, `ts:isVisible="false"`, `ts:isEditable="false"`,
 * `ts:granularity="2"`.
 *
 * **SAP stores `value` alone.** `move_adt_to_ddv` writes `uebersetz` from
 * `translation-value` and nothing from the other three (Code, both systems);
 * a read computes them (`move_ddv_to_adt`, `get_translation_granularity`).
 * A write still sends all four, as read: a present element without one is
 * refused (see {@link ITableSettings.translation}).
 */
export interface ITableTranslation {
  /** `ts:value`: `UEBERSETZ`; `''` on the systems read. */
  readonly value: string;
  /** `ts:isVisible`. */
  readonly isVisible: boolean;
  /** `ts:isEditable`. */
  readonly isEditable: boolean;
  /**
   * `ts:granularity`: a one-character code (`1` manual, `2` original, from
   * SAP's handler code); `'2'` on the systems read.
   */
  readonly granularity: string;
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
 * Not here: `supportsLoggingAssessment`, which SAP computes on every read.
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
  /**
   * `ts:translation`: its four attributes, written back as read.
   *
   * SAP's transformation reads the element inside a `tt:cond`, its four
   * attributes required there (Code: `SDDIC_ADT_TTAB`, on premise and on the
   * cloud). Measured on both (2026-11-19): a PUT with the element absent is
   * accepted (200), one with all four attributes is accepted, and one with
   * the element present but an attribute missing is refused, 400 `00/001`
   * with the transformation's words and an `XML_PATH` property
   * (`CL_ADT_REST_ST_HANDLER->deserialize`, Code). The contract keeps the
   * element required, so a write always carries the four attributes read.
   */
  readonly translation: ITableTranslation;
  /** `PROTOKOLL`: log data changes. */
  readonly loggingEnabled: boolean;
}

/**
 * What each system kind adds to the settings a write carries: the cloud's
 * `ts:isWritableByAMDP` (DD09L `ALLOWED_FOR_AMDP_WRITE`).
 *
 * - **cloud: required.** The cloud's `CL_TABT_WB_PERSIST->move_adt_to_ddv`
 *   writes `allowed_for_amdp_write` from the document, and its transformation
 *   reads the element inside a `tt:cond` (Code, cloud). Measured on the cloud
 *   (2026-11-19): written `true`, read back `true`; a later PUT without it,
 *   read back `false`. A write without it would reset it, so it does not
 *   compile.
 * - **onprem: refused.** Neither the on-premise transformation nor its
 *   `move_adt_to_ddv` maps it (Code, on premise), and a read answers none.
 */
export interface ITableSettingsByVariant {
  readonly onprem: { readonly isWritableByAMDP?: never };
  readonly cloud: { readonly isWritableByAMDP: boolean };
}

/**
 * Every setting a write carries on variant `V`: {@link ITableSettings} and
 * what the system kind adds ({@link ITableSettingsByVariant}). For a union of
 * variants — the default — a value of either kind.
 */
export type ITableSettingsOf<V extends AdtModernVariant = AdtModernVariant> = {
  [W in V]: ITableSettings & ITableSettingsByVariant[W];
}[V];

/**
 * The settings as a read answers them, on any system: every field a write
 * carries, and the cloud's `isWritableByAMDP` where the read has it. The shape
 * a reading strategy that parses the document answers; the shipped default
 * answers the document as it arrived. A write takes a variant's own shape
 * ({@link ITableSettingsReadOf}), so a cloud read written back carries the
 * flag.
 */
export interface ITableSettingsRead extends ITableSettings {
  /**
   * The cloud's `ts:isWritableByAMDP`: answered by a cloud read (Measured),
   * absent on premise, whose transformation does not define it (Code).
   */
  readonly isWritableByAMDP?: boolean | undefined;
}

/**
 * The settings as a read answers them on variant `V` — the shape a write of
 * `V` takes back as it is ({@link ITableSettingsOf}).
 */
export type ITableSettingsReadOf<
  V extends AdtModernVariant = AdtModernVariant,
> = ITableSettingsOf<V>;

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
export interface ITableSettingsUpdateConfig<
  V extends AdtModernVariant = AdtModernVariant,
> extends ITableSettingsConfig {
  description: string;
  /**
   * Every setting the write carries on `V`: on the cloud `isWritableByAMDP`
   * among them (required), on premise without it (refused).
   */
  settings: ITableSettingsOf<V>;
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
export interface IAdtTableSettingsUpdatable<
  TMetadataUpdated,
  V extends AdtModernVariant = AdtModernVariant,
> {
  /**
   * Write the settings: the document built from `config`, under the lock the
   * caller passes as `options.lockHandle`.
   *
   * @returns whatever this implementation's reading makes of the answer —
   *          SAP answers 200 with the inactive document
   */
  updateMetadata<E extends IAdtError>(
    config: ITableSettingsUpdateConfig<V>,
    options: { headers: IAdtHeaders } & IAdtTableSettingsUpdateOptions<E> & {
        analyse: IAnalyse<E>;
      },
  ): Promise<IAdtResponse<TMetadataUpdated, E>>;
  updateMetadata(
    config: ITableSettingsUpdateConfig<V>,
    options: { headers: IAdtHeaders } & IAdtTableSettingsUpdateOptions,
  ): Promise<IAdtResponse<TMetadataUpdated>>;
}

/** `T` with at least one of its keys present. */
type AtLeastOne<T> = {
  [K in keyof T]-?: Required<Pick<T, K>> & Partial<Omit<T, K>>;
}[keyof T];

/**
 * A buffering change: at least one field. SAP writes `SCHFELDANZ` only when
 * the **resulting** type is `G` (`move_adt_to_ddv`: `IF e_dd09l_wa-pufferung =
 * 'G'.`, Code on both systems): with any other resulting type the count is not
 * kept. So `areaKeyFields` goes only with type `G`, or with no type (the type
 * read is kept); `{ type: 'P', areaKeyFields: 1 }` and a `string` type that is
 * not the literal `'G'` with it do not compile. With the type kept, the
 * resulting type is the one read: `patchMetadata` refuses an `areaKeyFields`
 * change whose resulting type (the read merged with the changes) is not `G`,
 * before any PUT — a check on what SAP answered, not on the caller's types.
 */
export type ITableBufferingChange =
  | AtLeastOne<{
      readonly allowed?: string;
      readonly type: 'G';
      readonly areaKeyFields?: number;
    }>
  | AtLeastOne<{
      readonly allowed?: string;
      readonly type?: never;
      readonly areaKeyFields?: number;
    }>
  | AtLeastOne<{
      readonly allowed?: string;
      readonly type: string;
      readonly areaKeyFields?: never;
    }>;

/**
 * A translation change: its `value` alone, the one attribute SAP stores
 * (`move_adt_to_ddv`: `e_dd09l_wa-uebersetz = …-translation-value.`, Code on
 * both systems). `isVisible`, `isEditable` and `granularity` are SAP's on a
 * read; a patch writes them back as read.
 */
export interface ITableTranslationChange {
  readonly value: string;
}

/** The settings a patch may change on system kind `W`. */
type TableSettingsChangeFields<W extends AdtModernVariant> = {
  readonly dataClassCategory?: string;
  readonly sizeCategory?: string;
  readonly buffering?: ITableBufferingChange;
  readonly storageType?: string;
  readonly sharingType?: string;
  readonly loadUnit?: string;
  readonly translation?: ITableTranslationChange;
  readonly loggingEnabled?: boolean;
} & (W extends 'cloud'
  ? { readonly isWritableByAMDP?: boolean }
  : { readonly isWritableByAMDP?: never });

/**
 * What a patch changes on variant `V`: at least one setting — `{}`,
 * `{ buffering: {} }` and `{ translation: {} }` do not compile. Every setting
 * not named keeps the value read. The fields are optional without
 * `| undefined`: under `exactOptionalPropertyTypes` an explicit `undefined`
 * does not compile; an implementation treats a field set to `undefined` by a
 * caller without that flag as not named (the value read is kept).
 * `isWritableByAMDP` on the cloud only.
 */
export type ITableSettingsChangesOf<
  V extends AdtModernVariant = AdtModernVariant,
> = {
  [W in V]: AtLeastOne<TableSettingsChangeFields<W>>;
}[V];

/** {@link ITableSettingsChangesOf} for any newer system. */
export type ITableSettingsChanges = ITableSettingsChangesOf;

/**
 * What a patch takes: the table, and the settings to change. The description
 * is the one read; every setting not named keeps the value read.
 */
export interface ITableSettingsPatchConfig<
  V extends AdtModernVariant = AdtModernVariant,
> extends ITableSettingsConfig {
  changes: ITableSettingsChangesOf<V>;
}

/**
 * The settings document's media type, without a charset — the v2 a read is
 * answered with (a v1 `Accept` was answered `406`, measured on both).
 */
export const TABLE_SETTINGS_MEDIA_TYPE =
  'application/vnd.sap.adt.table.settings.v2+xml';

/**
 * The media type a patch reads and writes with: exactly
 * {@link TABLE_SETTINGS_MEDIA_TYPE}, a literal, so a value with a charset does
 * not compile. It is the read's `Accept`, and the guarded PUT's `Accept` and
 * `Content-Type` — sent without a charset (with `; charset=utf-8` beside a
 * fresh `If-Match` SAP answered `412` `SADT_RESOURCE/043`; without it `200`;
 * measured on both).
 */
export interface IAdtTableSettingsPatchHeaders {
  readonly accept: typeof TABLE_SETTINGS_MEDIA_TYPE;
  readonly contentType?: never;
}

/**
 * The options of a patch: those of a write, with the lock handle required and
 * neither a `source` nor an `ifMatch` — the patch sends the ETag it read.
 */
export type IAdtTableSettingsPatchOptions<E extends IAdtError = IAdtError> =
  Omit<IAdtUpdateOptions<E>, 'source' | 'lockHandle' | 'ifMatch'> & {
    source?: never;
    ifMatch?: never;
    lockHandle: string;
  };

/**
 * The settings can be patched: the named settings changed, every other one
 * kept as it is — with one exception: when the resulting buffering type is
 * not `G` (a type-only change from `G` to `P`, say), SAP clears the area-key
 * count, since it writes `SCHFELDANZ` only for `G` (`move_adt_to_ddv`, Code
 * on both systems). The patch does not block that change: the count means
 * nothing for the other types.
 *
 * **Read, overlay, write the whole document.** SAP resets every setting a
 * write leaves out (`CL_TABT_WB_PERSIST->move_adt_to_ddv`, Code on both
 * systems; measured on both, 2026-11-19), so a patch cannot send the changes
 * alone. Under the caller's lock it reads the settings' working area
 * (`version: 'inactive'`) with its ETag, overlays `changes` on the settings
 * read (`buffering` field by field, `translation` by its `value`), and writes
 * the whole document back — the description read, on the cloud
 * `isWritableByAMDP` as read unless changed — guarded by `If-Match` with the
 * ETag read, its `Content-Type` without a charset
 * ({@link IAdtTableSettingsPatchHeaders}). A read with no ETag is a refusal
 * and nothing is written; a refused read or write is answered as SAP
 * answered it; nothing is retried. Whether SAP refuses a stale ETag here is
 * not measured.
 *
 * Two requests in one member: decision 51.
 *
 * **What the types cannot see.** The per-kind rules are TypeScript's
 * structural checks: a caller who widens the variant (a cloud writer used as
 * `IAdtTableSettingsUpdatable<T>`, a generic that forwards the default), or
 * carries extra keys through a variable, a union or a spread, passes values
 * the rules would refuse as literals. A shipped implementation writes only
 * what SAP persists, and `patchMetadata` is the safe path: it writes back
 * what it read.
 */
export interface IAdtTableSettingsPatchable<
  TMetadataUpdated,
  V extends AdtModernVariant = AdtModernVariant,
> {
  /**
   * Patch the settings under the caller's lock (`options.lockHandle`).
   *
   * @returns whatever this implementation's reading makes of the write's
   *          answer — SAP answers 200 with the inactive document — or the
   *          read's failure, when the read failed
   */
  patchMetadata<E extends IAdtError>(
    config: ITableSettingsPatchConfig<V>,
    options: {
      headers: IAdtTableSettingsPatchHeaders;
    } & IAdtTableSettingsPatchOptions<E> & {
        analyse: IAnalyse<E>;
      },
  ): Promise<IAdtResponse<TMetadataUpdated, E>>;
  patchMetadata(
    config: ITableSettingsPatchConfig<V>,
    options: {
      headers: IAdtTableSettingsPatchHeaders;
    } & IAdtTableSettingsPatchOptions,
  ): Promise<IAdtResponse<TMetadataUpdated>>;
}

/** One strategy per member of a table settings implementation. See `IClassResults`. */
export interface ITableSettingsResults {
  /** The settings document a read answers. */
  readonly metadata: IResultStrategy<unknown>;
  /** What a write, or a patch's write, answers: the settings document, inactive. */
  readonly metadataUpdated: IResultStrategy<unknown>;
}
