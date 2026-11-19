// Compile-only assertions. If these stop compiling, the types regressed.
//
// A table's technical settings are their own contract: read through
// `IAdtMetadataReadable`, locked through `IAdtLockable`, and written through
// `IAdtTableSettingsUpdatable`, whose body is the config and never a
// `source`. An update replaces every setting, so every field the document
// carries is required; a code is any the system defines; the cloud's
// `isWritableByAMDP` is on the read result only, and a write refuses it.

import type {
  IAdtLockable,
  IAdtMetadataReadable,
} from '../adt/IAdtCapabilities';
import type { IAdtHeaders } from '../adt/IAdtContentTypes';
import type { IAnalyse } from '../adt/IAdtObject';
import type { IAdtError } from '../adt/IAdtResponse';
import {
  type IAdtTableSettingsPatchable,
  type IAdtTableSettingsPatchHeaders,
  type IAdtTableSettingsPatchOptions,
  type IAdtTableSettingsUpdatable,
  type IAdtTableSettingsUpdateOptions,
  type ITableSettings,
  type ITableSettingsChanges,
  type ITableSettingsConfig,
  type ITableSettingsOf,
  type ITableSettingsRead,
  type ITableSettingsReadOf,
  type ITableSettingsUpdateConfig,
  type KnownTableBufferingAllowed,
  type KnownTableBufferingType,
  type KnownTableDataClass,
  type KnownTableSizeCategory,
  TABLE_BUFFERING_ALLOWED,
  TABLE_BUFFERING_TYPES,
  TABLE_DATA_CLASSES,
  TABLE_SETTINGS_MEDIA_TYPE,
  TABLE_SIZE_CATEGORIES,
} from '../adt/IAdtTableSettings';

declare const handler: IAdtMetadataReadable<ITableSettingsConfig, string> &
  IAdtLockable<ITableSettingsConfig> &
  IAdtTableSettingsUpdatable<string>;
declare const headers: IAdtHeaders;

// ── Reading and locking take the table's name and nothing else ──────────────

void handler.readMetadata({ tableName: 'ZTABLE' });
void handler.lock({ tableName: 'ZTABLE' });
void handler.unlock({ tableName: 'ZTABLE' }, 'HANDLE');

// ── A write: the settings and the description, under the caller's lock ──────

const settings: ITableSettings = {
  dataClassCategory: 'APPL1',
  sizeCategory: '1',
  buffering: { allowed: 'X', type: 'G', areaKeyFields: 1 },
  storageType: 'C',
  sharingType: '',
  loadUnit: '',
  translation: {
    value: '',
    isVisible: false,
    isEditable: false,
    granularity: '2',
  },
  loggingEnabled: false,
};
void handler.updateMetadata(
  {
    tableName: 'ZTABLE',
    description: 'A table',
    settings,
    transportRequest: undefined,
  },
  { headers, lockHandle: 'HANDLE' },
);

// @ts-expect-error SAP refuses a write without the description (SWB_TOOL 019)
const _noDescription: ITableSettingsUpdateConfig = {
  tableName: 'ZTABLE',
  settings,
};
void _noDescription;

// @ts-expect-error the library chooses no data class for the caller
const _noDataClass: ITableSettings = {
  sizeCategory: '0',
  buffering: { allowed: 'N', type: '', areaKeyFields: 0 },
  storageType: 'C',
  sharingType: '',
  loadUnit: '',
  translation: {
    value: '',
    isVisible: false,
    isEditable: false,
    granularity: '2',
  },
  loggingEnabled: false,
};
void _noDataClass;

// A field left out would be reset by SAP, so leaving one out does not compile.
// @ts-expect-error the storage type is part of the replace
const _noStorageType: ITableSettings = {
  dataClassCategory: 'APPL0',
  sizeCategory: '0',
  buffering: { allowed: 'N', type: '', areaKeyFields: 0 },
  sharingType: '',
  loadUnit: '',
  translation: {
    value: '',
    isVisible: false,
    isEditable: false,
    granularity: '2',
  },
  loggingEnabled: false,
};
void _noStorageType;

const _noBufferingType: ITableSettings = {
  ...settings,
  // @ts-expect-error the buffering type is part of the replace
  buffering: { allowed: 'N', areaKeyFields: 0 },
};
void _noBufferingType;

// A customer data class is a data class: the field is not limited to the
// value help's six.
const _customerDataClass: ITableSettings = {
  ...settings,
  dataClassCategory: 'USER1',
};
void _customerDataClass;

// The measured six are there to be found.
const _known: KnownTableDataClass = TABLE_DATA_CLASSES[1];
const _knownIsAClass: ITableSettings['dataClassCategory'] = _known;
void _knownIsAClass;

// A size category and the buffering codes are not limited to SAP's standard
// domain values either: the known ones are constants, the fields strings.
const _otherCodes: ITableSettings = {
  ...settings,
  sizeCategory: '10',
  buffering: { allowed: 'Y', type: 'Z', areaKeyFields: 0 },
};
void _otherCodes;
const _knownSize: KnownTableSizeCategory = TABLE_SIZE_CATEGORIES[0];
const _knownAllowed: KnownTableBufferingAllowed = TABLE_BUFFERING_ALLOWED[0];
const _knownType: KnownTableBufferingType = TABLE_BUFFERING_TYPES[0];
const _knownCodes: ITableSettings = {
  ...settings,
  dataClassCategory: _known,
  sizeCategory: _knownSize,
  buffering: { allowed: _knownAllowed, type: _knownType, areaKeyFields: 0 },
};
void _knownCodes;

const _numericSize: ITableSettings = {
  ...settings,
  // @ts-expect-error a size category is a code, as the document carries it
  sizeCategory: 0,
};
void _numericSize;

// ── The body is the config: no `source`, not even through a variable ───────

declare const withSource: {
  headers: IAdtHeaders;
  lockHandle: string;
  source: string;
};
void handler.updateMetadata(
  { tableName: 'ZTABLE', description: 'A table', settings },
  // @ts-expect-error a settings write has no second channel for its body
  withSource,
);

// ── The lock is the caller's, and a write cannot be sent without it ────────

void handler.updateMetadata(
  { tableName: 'ZTABLE', description: 'A table', settings },
  // @ts-expect-error a settings write needs the settings' own lock handle
  { headers },
);
declare const analyse: IAnalyse<IAdtError>;
void handler.updateMetadata(
  { tableName: 'ZTABLE', description: 'A table', settings },
  // @ts-expect-error the overload with a verdict needs the handle as well
  { headers, analyse },
);

// ── The translation: all four attributes, SAP refuses a write without one ──

const _translationAsText: ITableSettings = {
  ...settings,
  // @ts-expect-error the translation is the element's four attributes, not its value alone
  translation: '',
};
void _translationAsText;

const _translationWithoutVisibility: ITableSettings = {
  ...settings,
  // @ts-expect-error SAP refuses a PUT without ts:isVisible (400 00/001)
  translation: { value: '', isEditable: false, granularity: '2' },
};
void _translationWithoutVisibility;

// ── `isWritableByAMDP`, per system kind ──────────────────────────────────
// Cloud: the write requires it (a PUT without it resets it, measured).
// On premise: refused (neither the transformation nor move_adt_to_ddv maps it).

const cloudSettings: ITableSettingsOf<'cloud'> = {
  ...settings,
  isWritableByAMDP: true,
};
const _cloudWrite: ITableSettingsUpdateConfig<'cloud'> = {
  tableName: 'ZTABLE',
  description: 'A table',
  settings: cloudSettings,
};
void _cloudWrite;
const _cloudWithoutFlag: ITableSettingsUpdateConfig<'cloud'> = {
  tableName: 'ZTABLE',
  description: 'A table',
  // @ts-expect-error a cloud write without isWritableByAMDP would reset it
  settings,
};
void _cloudWithoutFlag;
// The spread path: a base value spread into a cloud write still lacks it.
const _cloudSpread: ITableSettingsUpdateConfig<'cloud'> = {
  tableName: 'ZTABLE',
  description: 'A table',
  // @ts-expect-error spreading the shared settings does not add the flag
  settings: { ...settings, dataClassCategory: 'APPL1' },
};
void _cloudSpread;
// The variable path: a read of any system is not a cloud write as it is.
declare const anyRead: ITableSettingsRead;
const _cloudFromAnyRead: ITableSettingsUpdateConfig<'cloud'> = {
  tableName: 'ZTABLE',
  description: 'A table',
  // @ts-expect-error a read of any system may lack the flag
  settings: anyRead,
};
void _cloudFromAnyRead;
// A cloud read is written back as it is.
declare const cloudRead: ITableSettingsReadOf<'cloud'>;
const _cloudBack: ITableSettingsUpdateConfig<'cloud'> = {
  tableName: 'ZTABLE',
  description: 'A table',
  settings: { ...cloudRead, dataClassCategory: 'APPL1' },
};
void _cloudBack;

const _onPremiseWrite: ITableSettingsUpdateConfig<'onprem'> = {
  tableName: 'ZTABLE',
  description: 'A table',
  settings,
};
void _onPremiseWrite;
const _onPremiseWithFlag: ITableSettingsUpdateConfig<'onprem'> = {
  tableName: 'ZTABLE',
  description: 'A table',
  // @ts-expect-error on premise nothing maps isWritableByAMDP
  settings: cloudSettings,
};
void _onPremiseWithFlag;
// The union path: an either-system value is not an on-premise write.
declare const eitherSystem: ITableSettingsOf;
const _onPremiseFromEither: ITableSettingsUpdateConfig<'onprem'> = {
  tableName: 'ZTABLE',
  description: 'A table',
  // @ts-expect-error a value of either kind may carry the flag
  settings: eitherSystem,
};
void _onPremiseFromEither;

declare const cloudWriter: IAdtTableSettingsUpdatable<string, 'cloud'>;
void cloudWriter.updateMetadata(
  // @ts-expect-error the cloud writer takes the flag
  { tableName: 'ZTABLE', description: 'A table', settings },
  { headers, lockHandle: 'HANDLE' },
);
void cloudWriter.updateMetadata(
  { tableName: 'ZTABLE', description: 'A table', settings: cloudSettings },
  { headers, lockHandle: 'HANDLE' },
);

// The read of any system keeps its optional flag.
const _onPremiseRead: ITableSettingsRead = {
  ...settings,
  isWritableByAMDP: undefined,
};
void _onPremiseRead;

// ── A patch: at least one setting, translation by value, the ETag its own ───

const patchHeaders = {
  accept: 'application/vnd.sap.adt.table.settings.v2+xml',
} as const;
const _withCharset: IAdtTableSettingsPatchHeaders = {
  // @ts-expect-error the media type exactly, no charset
  accept: 'application/vnd.sap.adt.table.settings.v2+xml; charset=utf-8',
};
void _withCharset;
const _fromConstant: IAdtTableSettingsPatchHeaders = {
  accept: TABLE_SETTINGS_MEDIA_TYPE,
};
void _fromConstant;
declare const anyAccept: string;
const _anyAccept: IAdtTableSettingsPatchHeaders = {
  // @ts-expect-error a string that may carry a charset is not the media type
  accept: anyAccept,
};
void _anyAccept;
declare const cloudPatcher: IAdtTableSettingsPatchable<string, 'cloud'>;
declare const onPremisePatcher: IAdtTableSettingsPatchable<string, 'onprem'>;
void cloudPatcher.patchMetadata(
  { tableName: 'ZTABLE', changes: { dataClassCategory: 'APPL1' } },
  { headers: patchHeaders, lockHandle: 'HANDLE' },
);
void cloudPatcher.patchMetadata(
  {
    tableName: 'ZTABLE',
    transportRequest: 'E19K900001',
    changes: { buffering: { allowed: 'X' }, isWritableByAMDP: true },
  },
  { headers: patchHeaders, lockHandle: 'HANDLE' },
);
void onPremisePatcher.patchMetadata(
  // @ts-expect-error on premise a patch does not name isWritableByAMDP
  { tableName: 'ZTABLE', changes: { isWritableByAMDP: true } },
  { headers: patchHeaders, lockHandle: 'HANDLE' },
);
void onPremisePatcher.patchMetadata(
  { tableName: 'ZTABLE', changes: { loggingEnabled: true } },
  // @ts-expect-error the patch sends the media type without a charset: no Content-Type of the caller's
  { headers, lockHandle: 'HANDLE' },
);
// @ts-expect-error a patch changes at least one setting
const _noChanges: ITableSettingsChanges = {};
void _noChanges;
const _emptyBuffering: ITableSettingsChanges = {
  // @ts-expect-error an empty buffering change changes nothing
  buffering: {},
};
void _emptyBuffering;
const _emptyTranslation: ITableSettingsChanges = {
  // @ts-expect-error a translation change names its value
  translation: {},
};
void _emptyTranslation;
const _translationValue: ITableSettingsChanges = {
  translation: { value: 'X' },
};
void _translationValue;
const _translationVisibility: ITableSettingsChanges = {
  // @ts-expect-error SAP stores the value alone: visibility is SAP's
  translation: { value: 'X', isVisible: true },
};
void _translationVisibility;
// @ts-expect-error an explicit undefined is no change (exactOptionalPropertyTypes)
const _undefinedChange: ITableSettingsChanges = {
  dataClassCategory: undefined,
};
void _undefinedChange;
// areaKeyFields goes with type G, or with the type kept.
const _generic: ITableSettingsChanges = {
  buffering: { type: 'G', areaKeyFields: 2 },
};
void _generic;
const _keyFieldsAlone: ITableSettingsChanges = {
  buffering: { areaKeyFields: 2 },
};
void _keyFieldsAlone;
const _singleRecords: ITableSettingsChanges = {
  // @ts-expect-error SAP writes areaKeyFields only for type G
  buffering: { type: 'P', areaKeyFields: 1 },
};
void _singleRecords;
declare const someType: string;
const _typeVariable: ITableSettingsChanges = {
  // @ts-expect-error a type that may not be G takes no areaKeyFields
  buffering: { type: someType, areaKeyFields: 1 },
};
void _typeVariable;
const _typeOnly: ITableSettingsChanges = { buffering: { type: someType } };
void _typeOnly;
const _wrongCount: ITableSettingsChanges = {
  // @ts-expect-error a count stays a number
  buffering: { areaKeyFields: '1' },
};
void _wrongCount;
void cloudPatcher.patchMetadata(
  { tableName: 'ZTABLE', changes: { loggingEnabled: true } },
  // @ts-expect-error a patch needs the settings' lock handle
  { headers: patchHeaders },
);
void cloudPatcher.patchMetadata(
  { tableName: 'ZTABLE', changes: { loggingEnabled: true } },
  // @ts-expect-error the patch sends the ETag it read: no ifMatch of the caller's
  { headers: patchHeaders, lockHandle: 'HANDLE', ifMatch: '"e"' },
);
declare const patchWithSource: {
  headers: IAdtTableSettingsPatchHeaders;
  lockHandle: string;
  source: string;
};
void cloudPatcher.patchMetadata(
  { tableName: 'ZTABLE', changes: { loggingEnabled: true } },
  // @ts-expect-error no second channel for the body
  patchWithSource,
);
const _patchOptions: IAdtTableSettingsPatchOptions = {
  lockHandle: 'HANDLE',
  timeout: undefined,
};
void _patchOptions;

const _options: IAdtTableSettingsUpdateOptions = {
  lockHandle: 'HANDLE',
  timeout: undefined,
};
void _options;
