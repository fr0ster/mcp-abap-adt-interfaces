// Compile-only assertions. If these stop compiling, the types regressed.
//
// The text elements of a program, a class or a function group are their own
// contract: read part by part through `IAdtTextElementsReadable`, locked
// through `IAdtLockable` on the object, and written through
// `IAdtTextElementsUpdatable`, whose body is the config and never a
// `source`. A write replaces one whole part, so the list is required; a class
// has text symbols only; a write needs the text elements' own lock handle.

import type { IAdtLockable } from '../adt/IAdtCapabilities';
import type { IAdtHeaders } from '../adt/IAdtContentTypes';
import type { IAnalyse } from '../adt/IAdtObject';
import type { IAdtError } from '../adt/IAdtResponse';
import type {
  IAdtTextElementsReadable,
  IAdtTextElementsUpdatable,
  IAdtTextElementsUpdateOptions,
  ITextElementsConfig,
  ITextElementsPartConfig,
  ITextElementsUpdateConfig,
  ITextHeadings,
  ITextSymbol,
  TEXT_ELEMENTS_OBJECT_KINDS,
  TEXT_ELEMENTS_PARTS,
  TextElementsDocument,
  TextElementsObjectKind,
  TextElementsPart,
  TextElementsPartOf,
} from '../adt/IAdtTextElements';

declare const handler: IAdtTextElementsReadable<string> &
  IAdtLockable<ITextElementsConfig, 'objectKind' | 'objectName'> &
  IAdtTextElementsUpdatable<string>;
declare const headers: IAdtHeaders;

type Assert<T extends true> = T;
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

// ── The vocabularies ────────────────────────────────────────────────────────

export type Vocabularies = [
  Assert<
    Equal<
      (typeof TEXT_ELEMENTS_OBJECT_KINDS)[number],
      'program' | 'class' | 'functionGroup'
    >
  >,
  Assert<Equal<TextElementsObjectKind, 'program' | 'class' | 'functionGroup'>>,
  Assert<Equal<(typeof TEXT_ELEMENTS_PARTS)[number], TextElementsPart>>,
  Assert<Equal<TextElementsPart, 'symbols' | 'selections' | 'headings'>>,
  Assert<Equal<TextElementsPartOf<'class'>, 'symbols'>>,
  Assert<Equal<TextElementsPartOf<'program'>, TextElementsPart>>,
  Assert<Equal<TextElementsPartOf<'functionGroup'>, TextElementsPart>>,
];

// ── Reading: the object and the part ───────────────────────────────────────

void handler.read({
  objectKind: 'program',
  objectName: 'ZPROG',
  part: 'selections',
});
void handler.read(
  { objectKind: 'class', objectName: 'ZCL_X', part: 'symbols' },
  'active',
);
void handler.read(
  { objectKind: 'functionGroup', objectName: 'ZFG', part: 'headings' },
  'inactive',
);

// @ts-expect-error a class has text symbols only
void handler.read({
  objectKind: 'class',
  objectName: 'ZCL_X',
  part: 'headings',
});

void handler.read(
  { objectKind: 'program', objectName: 'ZPROG', part: 'symbols' },
  // @ts-expect-error the working area is SAP's default, never sent as a value
  'workingArea',
);

// @ts-expect-error a read names its part
const _noPart: ITextElementsPartConfig = {
  objectKind: 'program',
  objectName: 'ZPROG',
};
void _noPart;

declare const readWithHandle: { lockHandle: string };
void handler.read(
  { objectKind: 'program', objectName: 'ZPROG', part: 'symbols' },
  undefined,
  // @ts-expect-error a read honours no lock handle (decision 29)
  readWithHandle,
);

// ── Locking: the object, kind and name required ────────────────────────────

void handler.lock({ objectKind: 'program', objectName: 'ZPROG' });
void handler.unlock({ objectKind: 'class', objectName: 'ZCL_X' }, 'HANDLE');
// @ts-expect-error the lock names the object's kind
void handler.lock({ objectName: 'ZPROG' });

// ── A write: one whole part, under the caller's lock ───────────────────────

const symbols: readonly ITextSymbol[] = [
  { key: '001', text: 'Symbol one', maxLength: 20 },
  { key: '002', text: 'Symbol two', maxLength: 20 },
];
void handler.update(
  { objectKind: 'program', objectName: 'ZPROG', part: 'symbols', symbols },
  { headers, lockHandle: 'HANDLE' },
);
void handler.update(
  {
    objectKind: 'class',
    objectName: 'ZCL_X',
    part: 'symbols',
    symbols: [],
    transportRequest: undefined,
  },
  { headers, lockHandle: 'HANDLE' },
);
void handler.update(
  {
    objectKind: 'program',
    objectName: 'ZPROG',
    part: 'selections',
    selections: [{ name: 'P_TEST  ', text: 'Test parameter' }],
    transportRequest: 'E19K900001',
  },
  { headers, lockHandle: 'HANDLE' },
);
const headings: ITextHeadings = {
  listHeader: 'List',
  columnHeader1: '',
  columnHeader2: '',
  columnHeader3: '',
  columnHeader4: '',
};
void handler.update(
  {
    objectKind: 'functionGroup',
    objectName: 'ZFG',
    part: 'headings',
    headings,
  },
  { headers, lockHandle: 'HANDLE' },
);

// @ts-expect-error a class has no selection texts
const _classSelections: ITextElementsUpdateConfig = {
  objectKind: 'class',
  objectName: 'ZCL_X',
  part: 'selections',
  selections: [],
};
void _classSelections;

const _crossedPart: ITextElementsUpdateConfig = {
  objectKind: 'program',
  objectName: 'ZPROG',
  part: 'symbols',
  // @ts-expect-error the part's list goes with its own part
  selections: [],
};
void _crossedPart;

// @ts-expect-error a write carries the whole list — SAP deletes what is left out
const _noList: ITextElementsUpdateConfig = {
  objectKind: 'program',
  objectName: 'ZPROG',
  part: 'symbols',
};
void _noList;

// @ts-expect-error a symbol carries its maximum length
const _noMaxLength: ITextSymbol = { key: '001', text: 'x' };
void _noMaxLength;

// @ts-expect-error a heading left out would be written empty, so every one is required
const _noColumn4: ITextHeadings = {
  listHeader: '',
  columnHeader1: '',
  columnHeader2: '',
  columnHeader3: '',
};
void _noColumn4;

// A read's parsed part is a write's document as it is.
declare const parsed: Extract<TextElementsDocument, { part: 'symbols' }>;
void handler.update(
  { objectKind: 'program', objectName: 'ZPROG', ...parsed },
  { headers, lockHandle: 'HANDLE' },
);

// ── The body is the config: no `source`, not even through a variable ───────

declare const withSource: {
  headers: IAdtHeaders;
  lockHandle: string;
  source: string;
};
void handler.update(
  { objectKind: 'program', objectName: 'ZPROG', part: 'symbols', symbols },
  // @ts-expect-error a text elements write has no second channel for its body
  withSource,
);

// ── The lock is the caller's, and a write cannot be sent without it ────────

void handler.update(
  { objectKind: 'program', objectName: 'ZPROG', part: 'symbols', symbols },
  // @ts-expect-error a write needs the text elements' own lock handle
  { headers },
);
declare const analyse: IAnalyse<IAdtError>;
void handler.update(
  { objectKind: 'program', objectName: 'ZPROG', part: 'symbols', symbols },
  // @ts-expect-error the overload with a verdict needs the handle as well
  { headers, analyse },
);

const _options: IAdtTextElementsUpdateOptions = {
  lockHandle: 'HANDLE',
  timeout: undefined,
};
void _options;
