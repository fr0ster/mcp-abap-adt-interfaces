/**
 * The text elements of a program, a class or a function group: text symbols,
 * selection texts, and list and column headings (`PROG/PX`, `CLAS/OCX`).
 *
 * **Their own resource, and their own contract.** SAP keeps them apart from
 * the object's source: `/sap/bc/adt/textelements/{programs|classes|functiongroups}/{name}`,
 * one sub-resource per part (`…/source/symbols`, `…/source/selections`,
 * `…/source/headings`), each with its own media type
 * (`application/vnd.sap.adt.textelements.{part}.v1`; measured: another
 * `Accept` answers HTML) and the object's own lock, taken by
 * `POST …/{name}?_action=LOCK&accessMode=MODIFY` (measured on premise and on
 * the cloud) — lock class `TEXT`, not the program's or the class's lock (Code:
 * `CL_SEDX_ADT_RES_TEXTELEMENT`). So they are not a field of
 * {@link IProgramConfig} or {@link IClassConfig}.
 *
 * **Which parts an object has.** A class has text symbols only; a program and
 * a function group have all three (Code: `CL_SEDX_ADT_RES_TEXTELEMENT->get`;
 * measured: the properties document of a program, a class and a function
 * group lists exactly these, on premise). A class with a part it does not
 * have does not compile here.
 *
 * **One write replaces one part: read, change, write back.** A write is
 * `PUT …/source/{part}?lockHandle=…[&corrNr=…]` with the whole part: an entry
 * the body leaves out is deleted, a new key is inserted, a changed one is
 * updated. Measured for symbols on premise and on the cloud (2026-11-19);
 * for selection texts and headings, Code: `CL_SEDX_ADT_RES_TEXTELEMENT`'s
 * local `lcl_textpool->save` — the same insert, update and delete loop for
 * selections, and for each heading a delete when it is sent empty. So create,
 * change and delete are the same write, and {@link ITextElementsUpdateConfig}
 * carries the complete list.
 *
 * **Saved inactive; activated with the object.** SAP writes the part to the
 * inactive working area (Code: `RS_INSERT_INTO_WORKING_AREA` in `save`;
 * measured: the inactive list names the text elements after a write). An
 * activation that names only the program's reference ran nothing for them
 * (measured on premise); one activation request naming both the object
 * (`PROG/P`, `CLAS/OC`, `FUGR/F`) and
 * `/sap/bc/adt/textelements/{programs|classes|functiongroups}/{name}`
 * activates both (measured on premise for a program and a function group,
 * on the cloud for a class, 2026-11-19); after a later change, the text
 * elements' reference alone activated them (measured on premise, a
 * program). There is no activation member here: that is the group
 * activation's, with both references — `PROG/PX` and `CLAS/OCX` are in the
 * utility tables with `groupActivation`, so `activateObjects` and the typed
 * `activateObjectsGroup` take `{ name, type: 'PROG/PX', uri:
 * '/sap/bc/adt/textelements/programs/{name}' }` beside the object's own
 * reference.
 *
 * **The original language only.** SAP reads and writes the texts in the
 * object's original language (TADIR `masterlang`) whatever the logon language
 * (`RS_TEXTPOOL_READ` / `RPY_TEXTELEMENTS_INSERT_AIE`, Code; a write under
 * `sap-language` RU on premise and DE on the cloud landed in the original EN,
 * measured). There is no language here, and no translation.
 *
 * **On the cloud** the lock answers `MODIFICATION_SUPPORT=NoModification`, and
 * the write is accepted and saved all the same (measured 2026-11-19).
 *
 * **A function group** (measured on premise, 2026-11-19): its text elements
 * are at `/sap/bc/adt/textelements/functiongroups/{group}`, the plain group
 * name (`…/sapl{group}` answers 404). The properties document names them
 * `FUGR/PX`; after a write the inactive list holds the group (`FUGR/F`) and
 * them as `PROG/PX`, named `SAPL{GROUP}`; one activation naming the group's
 * URI and theirs activates both. No release's `typestructure` lists
 * `FUGR/PX`, so a function group's text elements are typed `PROG/PX`, under
 * their own URI: `{ type: 'PROG/PX', uri:
 * '/sap/bc/adt/textelements/functiongroups/{group}' }` beside `FUGR/F`, or
 * alone, activates them (measured on premise; the name may be `{GROUP}` or
 * `SAPL{GROUP}`, the URI decides), and where-used resolves them to
 * `PROG/PX` (measured).
 *
 * Types and constants only.
 */

import type { AdtReadVersion } from '../shared/IReadOptions';
import type { IAdtHeaders } from './IAdtContentTypes';
import type {
  IAdtAnalyseOptions,
  IAdtUpdateOptions,
  IAnalyse,
} from './IAdtObject';
import type { IAdtError, IAdtResponse, IResultStrategy } from './IAdtResponse';

/**
 * The objects that have text elements, as this contract names them — the
 * segment of the address is SAP's (`programs`, `classes`, `functiongroups`).
 */
export const TEXT_ELEMENTS_OBJECT_KINDS = [
  'program',
  'class',
  'functionGroup',
] as const;

/** One of {@link TEXT_ELEMENTS_OBJECT_KINDS}. */
export type TextElementsObjectKind =
  (typeof TEXT_ELEMENTS_OBJECT_KINDS)[number];

/**
 * The parts of the text elements, each its own sub-resource
 * (`…/source/{part}`) with its own media type.
 */
export const TEXT_ELEMENTS_PARTS = [
  'symbols',
  'selections',
  'headings',
] as const;

/** One of {@link TEXT_ELEMENTS_PARTS}. */
export type TextElementsPart = (typeof TEXT_ELEMENTS_PARTS)[number];

/**
 * The parts each object has (Code: `CL_SEDX_ADT_RES_TEXTELEMENT->get`;
 * measured in the properties documents on premise): a class has text symbols
 * only.
 */
export interface ITextElementsPartsByKind {
  readonly program: TextElementsPart;
  readonly class: 'symbols';
  readonly functionGroup: TextElementsPart;
}

/** The parts an object of kind `K` has. */
export type TextElementsPartOf<K extends TextElementsObjectKind> =
  ITextElementsPartsByKind[K];

/**
 * The version a read asks for (`?version=`): every value SAP's handler maps
 * (Code: `CL_SEDX_ADT_RES_TEXTELEMENT`, `cl_adt_utility=>get_wb_version`).
 *
 * Measured on premise (2026-11-19) for a program's selection texts — after a
 * write never activated, after the activation, and after a later change not
 * yet activated:
 *
 * - absent, `inactive` and `workingArea` answer the same: the working area,
 *   the inactive version when there is one, else the active one;
 * - `active` answers the last activated version — before the first
 *   activation only the screen fields' `?...` placeholders, after a change
 *   the text as it was activated.
 *
 * SAP reads the value case-insensitively (`ACTIVE` answered the active
 * version), and an unknown or empty value answers the working area (both
 * measured on premise; Code: `CL_SEDX_ADT_RES_TEXTELEMENT` lower-cases it,
 * and an unmapped value is replaced by the working area's version). The
 * contract offers only the three.
 *
 * On the cloud every value is accepted (200) but not distinguished: no
 * inactive version existed for the objects read (measured, read-only).
 */
export type TextElementsReadVersion = AdtReadVersion;

/**
 * One text symbol: a line `KEY=text` after its `@MaxLength:N` line.
 *
 * Written back as read. SAP keeps the text as written: a leading space is
 * part of it (`E01= Defektes Sammelprofil`, read on premise).
 */
export interface ITextSymbol {
  /**
   * The symbol's key: up to three characters (`001`, `R01`); SAP upper-cases
   * it and refuses a longer one (Code: `CL_SEDX_ADT_SRC_UTIL`,
   * `map_source_to_textpool_data`, `SEDX_ADT/102`).
   */
  readonly key: string;
  /** The text, everything after the first `=`. */
  readonly text: string;
  /**
   * The symbol's maximum length, `@MaxLength:N`: a count, so a number. SAP
   * refuses a negative one (Code: `CL_SEDX_ADT_SRC_UTIL`,
   * `map_source_to_textpool_data`, `SEDX_ADT/103`).
   */
  readonly maxLength: number;
}

/**
 * A text symbol's key is exactly three characters: SAP reads a symbol line
 * only with `=` within its first four characters, and refuses a longer key
 * `406` `SEDX_ADT/106` "Cannot parse the source code" (measured on premise
 * with `0001`; Code: `CL_SEDX_ADT_SRC_UTIL=>map_source_to_textpool_data`).
 * Any three characters its key check accepts are taken — `0#1` and `AB1`
 * were stored (measured). For a caller to check against; the contract does
 * not.
 */
export const TEXT_SYMBOL_KEY_LENGTH = 3;

/**
 * The longest selection text name SAP takes: eight characters. A longer one
 * refuses the whole write — `406`, "Key … exceeds 8 characters",
 * `SEDX_ADT/102` (measured on premise; Code: `CL_SEDX_ADT_C_HANDLER_SELECTIS`).
 * For a caller to check against; the contract does not.
 */
export const SELECTION_TEXT_NAME_MAX_LENGTH = 8;

/**
 * The heading keys SAP reads, in its order: any other is refused, `406`
 * `SEDX_ADT/101` "Invalid key … defined" (measured on premise with
 * `columnHeader_5`; Code: `CL_SEDX_ADT_C_HANDLER_HEADING`). Each is a field of
 * {@link ITextHeadings}: `listHeader` is `listHeader`, `columnHeader_N` is
 * `columnHeaderN`.
 */
export const TEXT_HEADING_KEYS = [
  'listHeader',
  'columnHeader_1',
  'columnHeader_2',
  'columnHeader_3',
  'columnHeader_4',
] as const;

/** One of {@link TEXT_HEADING_KEYS}. */
export type TextHeadingKey = (typeof TEXT_HEADING_KEYS)[number];

/**
 * The longest selection text SAP takes: 30 characters. A longer one refuses
 * the whole write — `406`, "Length of text symbol … exceeds 30 characters",
 * `SEDX_ADT/110` — and nothing is saved (measured on premise, 2026-11-19;
 * Code: `CL_SEDX_ADT_C_HANDLER_SELECTIS`). For a caller to check against; the
 * contract does not.
 */
export const SELECTION_TEXT_MAX_LENGTH = 30;

/**
 * One selection text: a line `NAME=text` for a parameter or a select option,
 * after an `@DDICReference` line when the text is the dictionary's.
 *
 * Measured on premise (2026-11-19): a read lists every parameter and select
 * option of the program, sorted by name, the name upper case and padded to
 * eight characters (`P_TEST  =Test parameter EN`); a screen field with no
 * text yet reads `?...`. A write takes the name padded or not.
 */
export interface ISelectionText {
  /**
   * The parameter's or select option's name, as read: up to
   * {@link SELECTION_TEXT_NAME_MAX_LENGTH} characters. SAP does not check it
   * against the selection screen: an unknown name (`P_NOPE`) is stored and
   * read back (measured on premise).
   */
  readonly name: string;
  /**
   * The text, everything after the first `=`: at most
   * {@link SELECTION_TEXT_MAX_LENGTH} characters. With `ddicReference`, a
   * read answers the dictionary field's label, and a write's text is ignored —
   * SAP stores the label (measured).
   */
  readonly text: string;
  /**
   * Whether the text is the dictionary's (`@DDICReference` before the line):
   * the field's label, not a text of the program's (measured on premise).
   * Required, since a write replaces the part: an entry sent without it gets
   * the text it carries (measured). On a field not typed by the dictionary:
   * not measured.
   */
  readonly ddicReference: boolean;
}

/**
 * The list and column headings: one list header and four column headers,
 * the lines `listHeader=…` and `columnHeader_1=…` to `columnHeader_4=…` (read
 * on premise, 2026-11-19). A read lists all five, an absent one as `''`.
 * Each is required, since a write sets every one: a heading sent empty or
 * left out of the body is deleted, any other inserted or updated (measured
 * on premise; Code: `lcl_textpool->save`, `update_header` — an absent key and
 * an empty one are the same initial field). The keys are
 * {@link TEXT_HEADING_KEYS}.
 */
export interface ITextHeadings {
  readonly listHeader: string;
  readonly columnHeader1: string;
  readonly columnHeader2: string;
  readonly columnHeader3: string;
  readonly columnHeader4: string;
}

/**
 * The content of one part, as a write carries it and a parsing read answers
 * it: the part names which list it is.
 */
export type TextElementsDocument =
  | {
      readonly part: 'symbols';
      readonly symbols: readonly ITextSymbol[];
    }
  | {
      readonly part: 'selections';
      readonly selections: readonly ISelectionText[];
    }
  | {
      readonly part: 'headings';
      readonly headings: ITextHeadings;
    };

/**
 * The text elements of one object, named by the object: what `lock` and
 * `unlock` take. `transportRequest` is the `corrNr` of a write.
 */
export interface ITextElementsConfig {
  /** `readonly`, as in the part configs: a built config is not re-kinded. */
  readonly objectKind: TextElementsObjectKind;
  objectName: string;
  transportRequest?: string | undefined;
}

/**
 * One part of one object's text elements: what a read takes. A class names
 * `symbols` only.
 *
 * The kind and the part are `readonly`: they are the discriminant, and
 * assigning `objectKind = 'class'` to a config that names a program's part
 * would make a pair SAP does not serve.
 */
export type ITextElementsPartConfig = {
  [K in TextElementsObjectKind]: {
    readonly objectKind: K;
    objectName: string;
    readonly part: TextElementsPartOf<K>;
  };
}[TextElementsObjectKind];

/**
 * What a write takes: the object, and the whole of one part. A class writes
 * `symbols` only.
 *
 * **The list is the whole part.** An entry it leaves out is deleted by SAP;
 * an empty list deletes every entry of the part.
 *
 * The kind is `readonly`, as is the document's `part`: changing either on a
 * built config would pair a kind with a part it does not have.
 */
export type ITextElementsUpdateConfig = {
  [K in TextElementsObjectKind]: {
    readonly objectKind: K;
    objectName: string;
    transportRequest?: string | undefined;
  } & Extract<TextElementsDocument, { readonly part: TextElementsPartOf<K> }>;
}[TextElementsObjectKind];

/**
 * The options of a text elements write: those of every write, without a
 * `source` and with the lock handle required.
 *
 * The body is built from {@link ITextElementsUpdateConfig}, so there is no
 * second channel to send one through: `source?: never` refuses it for a
 * variable as well as a literal (decision 50, as decision 49 for a table's
 * settings).
 *
 * `lockHandle` is required: the write is measured only under the text
 * elements' own lock (`TEXT`), taken on `/sap/bc/adt/textelements/…/{name}`.
 */
export type IAdtTextElementsUpdateOptions<E extends IAdtError = IAdtError> =
  Omit<IAdtUpdateOptions<E>, 'source' | 'lockHandle'> & {
    source?: never;
    lockHandle: string;
  };

/**
 * The options of a text elements read: the error strategy and a timeout.
 *
 * What only a write carries is refused, for a variable as well as a literal
 * (`?: never`, as {@link IAdtTextElementsUpdateOptions} refuses `source`): a
 * read honours no `source`, `lockHandle` or `ifMatch` (decision 29).
 */
export type IAdtTextElementsReadOptions<E extends IAdtError = IAdtError> =
  IAdtAnalyseOptions<E> & {
    timeout?: number | undefined;
    source?: never;
    lockHandle?: never;
    ifMatch?: never;
  };

/**
 * One part of the text elements can be read.
 *
 * `GET …/source/{part}[?version=…]`, with the part's own media type as
 * `Accept` — SAP answers HTML to any other. The answer is the part's plain
 * text (`text/plain`-like, CR LF between lines), in the original language.
 */
export interface IAdtTextElementsReadable<TSource> {
  /**
   * Read one part.
   *
   * @param config - the object and the part
   * @param version - `active`, `inactive` or `workingArea`; absent, SAP's
   *                  working area
   * @returns whatever this implementation's reading makes of the answer
   */
  read<E extends IAdtError>(
    config: ITextElementsPartConfig,
    version: TextElementsReadVersion | undefined,
    options: IAdtTextElementsReadOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TSource, E>>;
  read(
    config: ITextElementsPartConfig,
    version?: TextElementsReadVersion,
    options?: IAdtTextElementsReadOptions,
  ): Promise<IAdtResponse<TSource>>;
}

/**
 * One part of the text elements can be written.
 *
 * Reading is {@link IAdtTextElementsReadable}; the lock is
 * {@link IAdtLockable} over {@link ITextElementsConfig}, with `objectKind` and
 * `objectName` required — the text elements' own lock, which the object's
 * does not cover.
 *
 * **One request, and the lock is the caller's.** A write is
 * `PUT …/source/{part}?lockHandle=…[&corrNr=…]`; locking before it,
 * unlocking after it on every path, and activating the object together with
 * its text elements are the caller's calls, in that order.
 */
export interface IAdtTextElementsUpdatable<TUpdated> {
  /**
   * Write one part, whole: the body built from `config`, under the lock the
   * caller passes as `options.lockHandle`.
   *
   * @returns whatever this implementation's reading makes of the answer —
   *          SAP answers 200 with the part as saved
   */
  update<E extends IAdtError>(
    config: ITextElementsUpdateConfig,
    options: { headers: IAdtHeaders } & IAdtTextElementsUpdateOptions<E> & {
        analyse: IAnalyse<E>;
      },
  ): Promise<IAdtResponse<TUpdated, E>>;
  update(
    config: ITextElementsUpdateConfig,
    options: { headers: IAdtHeaders } & IAdtTextElementsUpdateOptions,
  ): Promise<IAdtResponse<TUpdated>>;
}

/** One strategy per member of a text elements implementation. See `IClassResults`. */
export interface ITextElementsResults {
  /** The part a read answers. */
  readonly source: IResultStrategy<unknown>;
  /** What a write answers: the part as saved, inactive. */
  readonly updated: IResultStrategy<unknown>;
}
