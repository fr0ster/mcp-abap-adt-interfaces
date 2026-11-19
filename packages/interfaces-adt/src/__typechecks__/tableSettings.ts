// Compile-only assertions. If these stop compiling, the types regressed.
//
// A table's technical settings are their own contract: read through
// `IAdtMetadataReadable`, locked through `IAdtLockable`, and written through
// `IAdtTableSettingsUpdatable`, whose body is the config and never a
// `source`. A write states what it sets: data class, size category and
// buffering are required, and every optional field takes `undefined`.

import type {
  IAdtLockable,
  IAdtMetadataReadable,
} from '../adt/IAdtCapabilities';
import type { IAdtHeaders } from '../adt/IAdtContentTypes';
import type {
  IAdtTableSettingsUpdatable,
  IAdtTableSettingsUpdateOptions,
  ITableSettings,
  ITableSettingsConfig,
  ITableSettingsUpdateConfig,
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
  buffering: { allowed: 'N' },
};
void _noDataClass;

const _unknownDataClass: ITableSettings = {
  // @ts-expect-error a data class the value help does not list
  dataClassCategory: 'APPL9',
  sizeCategory: '0',
  buffering: { allowed: 'N' },
};
void _unknownDataClass;

const _numericSize: ITableSettings = {
  dataClassCategory: 'APPL0',
  // @ts-expect-error a size category is a code, as the document carries it
  sizeCategory: 0,
  buffering: { allowed: 'N' },
};
void _numericSize;

// ── The body is the config: no `source`, not even through a variable ───────

declare const withSource: { headers: IAdtHeaders; source: string };
void handler.updateMetadata(
  { tableName: 'ZTABLE', description: 'A table', settings },
  // @ts-expect-error a settings write has no second channel for its body
  withSource,
);

// ── Every optional field takes `undefined` ──────────────────────────────────

const _optional: ITableSettings = {
  dataClassCategory: 'APPL0',
  sizeCategory: '0',
  buffering: { allowed: 'N', type: undefined, areaKeyFields: undefined },
  storageType: undefined,
  sharingType: undefined,
  loadUnit: undefined,
  translation: undefined,
  loggingEnabled: undefined,
};
void _optional;

const _options: IAdtTableSettingsUpdateOptions = {
  lockHandle: undefined,
  timeout: undefined,
};
void _options;
