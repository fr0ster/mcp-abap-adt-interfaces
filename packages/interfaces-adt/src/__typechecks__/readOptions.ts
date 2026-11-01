// Compile-only assertions. If these stop compiling, the types regressed.

import type {
  IAdtMetadataReadable,
  IAdtReadable,
} from '../adt/IAdtCapabilities';
import type { IAdtObjectAccess } from '../adt/IAdtUtilities';
import type {
  IGetApplicationLogObjectOptions,
  IGetApplicationLogSourceOptions,
} from '../runtime/IApplicationLog';
import type { AdtReadVersion, IReadOptions } from '../shared/IReadOptions';

// A read names any of the three versions ADT takes.
const _active: IReadOptions = { version: 'active' };
const _inactive: IReadOptions = { version: 'inactive' };
const _workingArea: IReadOptions = { version: 'workingArea' };
const _versions: AdtReadVersion[] = ['active', 'inactive', 'workingArea'];
void _active;
void _inactive;
void _workingArea;
void _versions;

// Any other version does not compile.
// @ts-expect-error ADT refuses it with 400
const _bogus: IReadOptions = { version: 'bogus' };
void _bogus;

// Every read contract takes the working area too.
declare const source: IAdtReadable<{ name: string }, string>;
declare const metadata: IAdtMetadataReadable<{ name: string }, string>;
declare const access: IAdtObjectAccess<string, string, string>;
void source.read({ name: 'X' }, 'workingArea');
void metadata.readMetadata({ name: 'X' }, { version: 'workingArea' });
void access.readObjectSource('PROG/P', 'X', undefined, 'workingArea');
void access.getObjectSourceUri('PROG/P', 'X', undefined, 'workingArea');
// @ts-expect-error ADT refuses it with 400
void metadata.readMetadata({ name: 'X' }, { version: 'bogus' });

// The application log's reads name the same three (measured on S/4HANA 2025,
// 2026-11-01: object and source/main each answer 200 to the three, 400 to any
// other value).
const _logObject: IGetApplicationLogObjectOptions = { version: 'workingArea' };
const _logSource: IGetApplicationLogSourceOptions = { version: 'inactive' };
void _logObject;
void _logSource;
// @ts-expect-error ADT refuses it with 400
const _logBogus: IGetApplicationLogSourceOptions = { version: 'bogus' };
void _logBogus;
