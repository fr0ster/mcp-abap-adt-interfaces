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
  IAdtGroupActivationReference,
  IAdtWhereUsedParamsOf,
  IAdtWhereUsedScopeParamsOf,
  IGetWhereUsedParams,
  IGetWhereUsedScopeParams,
} from '../adt/IAdtShared';
import type {
  IAdtTextElementsReadable,
  IAdtTextElementsUpdatable,
  IAdtTextElementsUpdateOptions,
  ISelectionText,
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
  TextElementsReadVersion,
} from '../adt/IAdtTextElements';
import {
  SELECTION_TEXT_MAX_LENGTH,
  SELECTION_TEXT_NAME_MAX_LENGTH,
  TEXT_HEADING_KEYS,
  TEXT_SYMBOL_KEY_LENGTH,
  type TextHeadingKey,
} from '../adt/IAdtTextElements';
import type {
  IAdtObjectActivation,
  IAdtTypedGroupLifecycle,
} from '../adt/IAdtUtilities';
import type { AdtReadVersion } from '../shared/IReadOptions';

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
  Assert<Equal<TextElementsReadVersion, AdtReadVersion>>,
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

// Every version SAP's handler maps, the one Eclipse sends included.
void handler.read(
  { objectKind: 'program', objectName: 'ZPROG', part: 'selections' },
  'workingArea',
);
void handler.read(
  { objectKind: 'program', objectName: 'ZPROG', part: 'symbols' },
  // @ts-expect-error a version is one of the three SAP maps
  'newest',
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
    selections: [
      { name: 'P_TEST  ', text: 'Test parameter', ddicReference: false },
      // A dictionary text: SAP stores the field's label, whatever the text.
      { name: 'P_ARBGB', text: '', ddicReference: true },
    ],
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

// ── The discriminant is readonly: no kind paired with a part it lacks ──────

declare const programPart: ITextElementsPartConfig;
// @ts-expect-error the kind is the discriminant; a config is built, not re-kinded
programPart.objectKind = 'class';
// @ts-expect-error the part is fixed with the kind
programPart.part = 'headings';
declare const programWrite: ITextElementsUpdateConfig;
// @ts-expect-error a write's kind is not reassigned either
programWrite.objectKind = 'class';
// @ts-expect-error nor its part
programWrite.part = 'symbols';

// ── A read takes no write-only field, not even through a variable ──────────

declare const writeOptions: {
  timeout: number;
  lockHandle: string;
  source: string;
};
void handler.read(
  { objectKind: 'program', objectName: 'ZPROG', part: 'symbols' },
  undefined,
  // @ts-expect-error a read honours no lock handle and no source
  writeOptions,
);
declare const withIfMatch: { ifMatch: string };
void handler.read(
  { objectKind: 'program', objectName: 'ZPROG', part: 'symbols' },
  'inactive',
  // @ts-expect-error a read sends no If-Match
  withIfMatch,
);
void handler.read(
  { objectKind: 'program', objectName: 'ZPROG', part: 'symbols' },
  'active',
  { timeout: 1000 },
);

// ── Activation: the object with its text elements, typed, on both variants ─

// A program activates on premise (ABAP cloud activates no program).
const programWithTexts: IAdtGroupActivationReference<'onprem'>[] = [
  { name: 'ZPROG', type: 'PROG/P', uri: '/sap/bc/adt/programs/programs/zprog' },
  {
    name: 'ZPROG',
    type: 'PROG/PX',
    uri: '/sap/bc/adt/textelements/programs/zprog',
  },
];
const classWithTexts: IAdtGroupActivationReference<'cloud'>[] = [
  { name: 'ZCL_X', type: 'CLAS/OC', uri: '/sap/bc/adt/oo/classes/zcl_x' },
  {
    name: 'ZCL_X',
    type: 'CLAS/OCX',
    uri: '/sap/bc/adt/textelements/classes/zcl_x',
  },
];
const onPremClass: IAdtGroupActivationReference<'onprem'> = {
  name: 'ZCL_X',
  type: 'CLAS/OCX',
};
void onPremClass;
declare const onPremActivation: IAdtObjectActivation<string, 'onprem'>;
declare const cloudActivation: IAdtObjectActivation<string, 'cloud'>;
declare const onPremLifecycle: IAdtTypedGroupLifecycle<
  string,
  string,
  string,
  'onprem'
>;
void onPremActivation.activateObjects(programWithTexts, true, { headers });
void cloudActivation.activateObjects(classWithTexts, true, { headers });
void onPremLifecycle.activateObjectsGroup(programWithTexts, true, { headers });
// 7.40 has no text elements: its activation does not take them.
const _basisTexts: IAdtGroupActivationReference<'basis740'> = {
  name: 'ZPROG',
  // @ts-expect-error SAP_BASIS 7.40 serves no /textelements
  type: 'PROG/PX',
};
void _basisTexts;

// ── The lock config's kind is readonly too ─────────────────────────────────

declare const lockConfig: ITextElementsConfig;
// @ts-expect-error a lock config is not re-kinded either
lockConfig.objectKind = 'class';

// ── A selection text states whether it is the dictionary's ────────────────

// @ts-expect-error the write replaces the part: whether a text is the dictionary's is stated
const _noDdicFlag: ISelectionText = { name: 'P_X', text: 'x' };
void _noDdicFlag;
const _limit: 30 = SELECTION_TEXT_MAX_LENGTH;
void _limit;

// ── Where-used, per code, as measured ─────────────────────────────────────

// A program's text elements: served on premise (the scope offers PROG/P, PROG/PS).
const _programTextsOnPrem: IAdtWhereUsedParamsOf<'onprem'> = {
  object_name: 'RSPARAM',
  object_type: 'PROG/PX',
  container: 'program',
};
void _programTextsOnPrem;
const _programTextsScope: IAdtWhereUsedScopeParamsOf<'onprem'> = {
  object_name: 'RSPARAM',
  object_type: 'PROG/PX',
  container: 'program',
};
void _programTextsScope;
const _programTextsUntyped: IGetWhereUsedParams = {
  object_name: 'RSPARAM',
  object_type: 'PROG/PX',
  container: 'program',
};
void _programTextsUntyped;
// On the cloud too: a delivered program's text elements (RSPARAM), measured.
const _programTextsCloud: IAdtWhereUsedParamsOf<'cloud'> = {
  object_name: 'RSPARAM',
  object_type: 'PROG/PX',
  container: 'program',
};
void _programTextsCloud;
const _programTextsModern: IAdtWhereUsedParamsOf = {
  object_name: 'RSPARAM',
  object_type: 'PROG/PX',
  container: 'program',
};
void _programTextsModern;
const _classTextsOnPrem: IAdtWhereUsedParamsOf<'onprem'> = {
  object_name: 'ZCL_X',
  // @ts-expect-error "Where-Used List is not supported for Text Element: Class."
  object_type: 'CLAS/OCX',
};
void _classTextsOnPrem;
const _classTextsCloudScope: IAdtWhereUsedScopeParamsOf<'cloud'> = {
  object_name: 'ZCL_X',
  // @ts-expect-error not on the cloud either
  object_type: 'CLAS/OCX',
};
void _classTextsCloudScope;
const _classTextsUntyped: IGetWhereUsedScopeParams = {
  object_name: 'ZCL_X',
  // @ts-expect-error nor through the untyped default
  object_type: 'CLAS/OCX',
};
void _classTextsUntyped;
// @ts-expect-error nor named as the parameter
type _ClassTextsExplicit = IGetWhereUsedParams<'CLAS/OCX'>;
const _functionGroupTexts: IAdtWhereUsedParamsOf<'onprem'> = {
  object_name: 'ZFG',
  // @ts-expect-error FUGR/PX is no where-used type: a group's text elements resolve to PROG/PX
  object_type: 'FUGR/PX',
};
void _functionGroupTexts;
// Every one of them still activates beside its object.
const _activations: IAdtGroupActivationReference<'onprem'>[] = [
  {
    name: 'ZPROG',
    type: 'PROG/PX',
    uri: '/sap/bc/adt/textelements/programs/zprog',
  },
  {
    name: 'ZCL_X',
    type: 'CLAS/OCX',
    uri: '/sap/bc/adt/textelements/classes/zcl_x',
  },
  {
    name: 'ZFG',
    type: 'PROG/PX',
    uri: '/sap/bc/adt/textelements/functiongroups/zfg',
  },
];
void _activations;
const _cloudActivation: IAdtGroupActivationReference<'cloud'> = {
  name: 'ZCL_X',
  type: 'CLAS/OCX',
  uri: '/sap/bc/adt/textelements/classes/zcl_x',
};
void _cloudActivation;

// ── A function group's text elements are PROG/PX, under their own URI ─────

// Measured on premise: the pair activates, and PROG/PX alone too; the URI
// decides, the name may be the group's or SAPL{GROUP}.
const _groupWithTexts: IAdtGroupActivationReference<'onprem'>[] = [
  { name: 'ZFG', type: 'FUGR/F', uri: '/sap/bc/adt/functions/groups/zfg' },
  {
    name: 'ZFG',
    type: 'PROG/PX',
    uri: '/sap/bc/adt/textelements/functiongroups/zfg',
  },
];
void _groupWithTexts;
const _groupTextsAlone: IAdtGroupActivationReference<'onprem'> = {
  name: 'SAPLZFG',
  type: 'PROG/PX',
  uri: '/sap/bc/adt/textelements/functiongroups/zfg',
};
void _groupTextsAlone;
const _noGroupCode: IAdtGroupActivationReference<'onprem'> = {
  name: 'ZFG',
  // @ts-expect-error FUGR/PX is only the properties document's adtcore:type, no code of the tables
  type: 'FUGR/PX',
};
void _noGroupCode;

// ── The keys, closed where the type can say it ────────────────────────────

const _headingKeys: readonly TextHeadingKey[] = TEXT_HEADING_KEYS;
void _headingKeys;
// @ts-expect-error SAP refuses any other heading key (406 SEDX_ADT/101)
const _fifthColumn: TextHeadingKey = 'columnHeader_5';
void _fifthColumn;
const _limits: [3, 8] = [
  TEXT_SYMBOL_KEY_LENGTH,
  SELECTION_TEXT_NAME_MAX_LENGTH,
];
void _limits;

// ── PROG/PX names its container; no other code takes one ──────────────────

// A function group's text elements: the same code, the other address.
const _groupTextsWhereUsed: IAdtWhereUsedParamsOf<'onprem'> = {
  object_name: 'SEUF',
  object_type: 'PROG/PX',
  container: 'functionGroup',
};
void _groupTextsWhereUsed;
const _groupTextsScopeCloud: IAdtWhereUsedScopeParamsOf<'cloud'> = {
  object_name: 'ZFG',
  object_type: 'PROG/PX',
  container: 'functionGroup',
};
void _groupTextsScopeCloud;
// @ts-expect-error PROG/PX is two addresses: the container is required, nothing defaults
const _noContainer: IGetWhereUsedParams = {
  object_name: 'RSPARAM',
  object_type: 'PROG/PX',
};
void _noContainer;
// @ts-expect-error nor in the scope request
const _noContainerScope: IAdtWhereUsedScopeParamsOf<'onprem'> = {
  object_name: 'RSPARAM',
  object_type: 'PROG/PX',
};
void _noContainerScope;
const _classContainer: IGetWhereUsedParams = {
  object_name: 'RSPARAM',
  object_type: 'PROG/PX',
  // @ts-expect-error a class's text elements are CLAS/OCX, not a container
  container: 'class',
};
void _classContainer;
const _otherContainer: IAdtWhereUsedParamsOf<'onprem'> = {
  object_name: 'RSPARAM',
  object_type: 'PROG/PX',
  // @ts-expect-error only the two containers
  container: 'include',
};
void _otherContainer;
const _programWithContainer: IGetWhereUsedParams = {
  object_name: 'RSPARAM',
  object_type: 'PROG/P',
  // @ts-expect-error another code takes no container
  container: 'program',
};
void _programWithContainer;
const _classWithContainer: IGetWhereUsedScopeParams = {
  object_name: 'ZCL_X',
  object_type: 'CLAS/OC',
  // @ts-expect-error nor in the scope request
  container: 'program',
};
void _classWithContainer;
// Codes other than PROG/PX are as before: no container.
const _plainProgram: IAdtWhereUsedParamsOf<'onprem'> = {
  object_name: 'RSPARAM',
  object_type: 'PROG/P',
};
void _plainProgram;
// A variable of the whole union states the container only when it is PROG/PX.
declare const someCode: Exclude<
  IAdtWhereUsedParamsOf<'onprem'>['object_type'],
  'PROG/PX'
>;
const _anyOtherCode: IAdtWhereUsedParamsOf<'onprem'> = {
  object_name: 'X',
  object_type: someCode,
};
void _anyOtherCode;

// ── The where-used discriminant and its container are readonly ────────────

declare const builtWhereUsed: IGetWhereUsedParams;
// @ts-expect-error a built where-used is not re-coded
builtWhereUsed.object_type = 'PROG/P';
declare const programTextsWhereUsed: IAdtWhereUsedParamsOf<'onprem'> & {
  readonly object_type: 'PROG/PX';
};
// @ts-expect-error nor moved to the other address
programTextsWhereUsed.container = 'functionGroup';
declare const builtScope: IAdtWhereUsedScopeParamsOf<'cloud'>;
// @ts-expect-error the scope request's code neither
builtScope.object_type = 'CLAS/OC';
