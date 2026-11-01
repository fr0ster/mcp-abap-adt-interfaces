// Compile-only assertions. If these stop compiling, the types regressed.

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
