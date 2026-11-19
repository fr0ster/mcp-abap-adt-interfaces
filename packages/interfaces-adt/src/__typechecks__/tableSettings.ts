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
  type IAdtTableSettingsUpdatable,
  type IAdtTableSettingsUpdateOptions,
  type ITableSettings,
  type ITableSettingsConfig,
  type ITableSettingsRead,
  type ITableSettingsUpdateConfig,
  type KnownTableBufferingAllowed,
  type KnownTableBufferingType,
  type KnownTableDataClass,
  type KnownTableSizeCategory,
  TABLE_BUFFERING_ALLOWED,
  TABLE_BUFFERING_TYPES,
  TABLE_DATA_CLASSES,
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
  translation: '',
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
  translation: '',
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
  translation: '',
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

// ── `isWritableByAMDP`: returned by cloud, not written by this contract ────

const _cloudRead: ITableSettingsRead = { ...settings, isWritableByAMDP: false };
const _onPremiseRead: ITableSettingsRead = {
  ...settings,
  isWritableByAMDP: undefined,
};
void _onPremiseRead;

const _writeLiteral: ITableSettingsUpdateConfig = {
  tableName: 'ZTABLE',
  description: 'A table',
  // @ts-expect-error a write does not carry isWritableByAMDP
  settings: { ...settings, isWritableByAMDP: false },
};
void _writeLiteral;

const _writeRead: ITableSettingsUpdateConfig = {
  tableName: 'ZTABLE',
  description: 'A table',
  // @ts-expect-error nor through a read result passed back as it is
  settings: _cloudRead,
};
void _writeRead;

// Read, change, write back: what only a read returns is dropped first.
const { isWritableByAMDP: _dropped, ...readBack } = _cloudRead;
void _dropped;
const _writeBack: ITableSettingsUpdateConfig = {
  tableName: 'ZTABLE',
  description: 'A table',
  settings: { ...readBack, dataClassCategory: 'APPL1' },
};
void _writeBack;

const _options: IAdtTableSettingsUpdateOptions = {
  lockHandle: 'HANDLE',
  timeout: undefined,
};
void _options;
