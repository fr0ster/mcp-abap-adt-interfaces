/**
 * The text elements of a program, a class or a function group: text symbols,
 * selection texts, and list and column headings (`PROG/PX`, `CLAS/OCX`).
 *
 * **Their own resource, and their own contract.** SAP keeps them apart from
 * the object's source: `/sap/bc/adt/textelements/{programs|classes|functiongroups}/{name}`,
 * one sub-resource per part (`…/source/symbols`, `…/source/selections`,
 * `…/source/headings`), each with its own media type
 * (`application/vnd.sap.adt.textelements.{part}.v1`) and the object's own
 * lock — lock class `TEXT`, taken by `POST …/{name}?_action=LOCK`, not the
 * program's or the class's lock (`CL_SEDX_ADT_RES_TEXTELEMENT`, read on premise
 * 2026-11-19). So they are not a field of {@link IProgramConfig} or
 * {@link IClassConfig}.
 *
 * **Which parts an object has.** A class has text symbols only; a program and
 * a function group have all three (the handler's `get`, Code). A class with a
 * part it does not have does not compile here.
 *
 * **One write replaces one part: read, change, write back.** A write is
 * `PUT …/source/{part}?lockHandle=…[&corrNr=…]` with the whole part: an entry
 * the body leaves out is deleted, a new key is inserted (measured on premise
 * and on the cloud, 2026-11-19). So create, change and delete are the same
 * write, and {@link ITextElementsUpdateConfig} carries the complete list.
 *
 * **Saved inactive; activated with the object.** SAP writes the part to the
 * inactive working area. An activation that names only the program's or the
 * class's reference runs nothing for it; it activates when one activation
 * request names both the object (`PROG/P`, `CLAS/OC`, `FUGR/F`) and
 * `/sap/bc/adt/textelements/{programs|classes|functiongroups}/{name}`
 * (measured on premise for a program and on the cloud for a class,
 * 2026-11-19). There is no activation member here: that is the group
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
 * **A function group** has the collection
 * `/sap/bc/adt/textelements/functiongroups` in the discovery of S/4HANA 2025
 * and of ABAP cloud; its addressing is not measured — the one read sent
 * (`…/functiongroups/sutl`) answered 404, "Resource REPT SAPLSUTL does not
 * exist" — and no release's `typestructure` lists a type code for its text
 * elements (the handler names `FUGR` with the program-text subtype, Code), so
 * the type tables carry `PROG/PX` and `CLAS/OCX` only.
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
 * The parts each object has (`CL_SEDX_ADT_RES_TEXTELEMENT`, `get`, Code): a
 * class has text symbols only.
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
 * (`CL_SEDX_ADT_RES_TEXTELEMENT`, `cl_adt_utility=>get_wb_version`, Code).
 *
 * - absent: the working area — the inactive version when it is the user's own
 *   inactive item, else the active one (Code); a read straight after a write
 *   answers the write (measured on premise and on the cloud);
 * - `inactive`: the inactive version (measured on premise and on the cloud);
 *   when there is none, SAP answers the active one (Code);
 * - `active`: the active version (Code; not yet measured);
 * - `workingArea`: the working area, the value Eclipse sends (seen in Eclipse's
 *   requests; the handler maps it through `get_wb_version`, Code; not yet
 *   measured here).
 *
 * A value outside these is not refused by SAP: it falls back to the working
 * area (Code). The contract offers only the three.
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
   * The symbol's key: up to three characters (`001`, `R01`); SAP writes it
   * upper case and refuses a longer one (`SEDX_ADT` 102, Code).
   */
  readonly key: string;
  /** The text, everything after the first `=`. */
  readonly text: string;
  /**
   * The symbol's maximum length, `@MaxLength:N`: a count, so a number. SAP
   * refuses a negative one (`SEDX_ADT` 103, Code).
   */
  readonly maxLength: number;
}

/**
 * One selection text: a line `NAME=text` for a parameter or a select option.
 *
 * The name is as SAP writes it: a read pads it to eight characters
 * (`P_TEST  =Test parameter EN`, measured on premise after writing
 * `P_TEST=…`). How SAP shows a selection text taken from the dictionary is
 * not measured.
 */
export interface ISelectionText {
  /** The parameter's or select option's name, as read. */
  readonly name: string;
  /** The text, everything after the first `=`. */
  readonly text: string;
}

/**
 * The list and column headings: one list header and four column headers,
 * the lines `listHeader=…` and `columnHeader_1=…` to `columnHeader_4=…` (read
 * on premise, 2026-11-19). Each is required, since a write replaces the part;
 * an empty heading is `''`.
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
  objectKind: TextElementsObjectKind;
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
