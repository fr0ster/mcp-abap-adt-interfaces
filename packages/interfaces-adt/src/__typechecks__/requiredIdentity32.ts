// Compile-only assertions for 32.0.0. If these stop compiling, the types
// regressed.
//
// **The identity requires what addresses the object.** Every atom that
// identifies an object takes `TRequired`, the config keys the member needs: the
// object's own name, its parent where it has one, and a field such as a local
// include's `source` where the member sends it. The parameter has no default,
// so an atom cannot be named without saying what addresses the object. A
// required key is `string`, not `string | undefined`.
//
// **The write atoms take the identity too,** and the options a member must be
// given: `source` and `lockHandle` are required where an implementation names
// them in `TRequiredOptions`, and optional elsewhere.

import type {
  AdtObjectIdentity,
  IAdtLockable,
  IAdtMetadataUpdatable,
  IAdtReadable,
  IAdtUpdatable,
  IAdtValidatable,
} from '../adt/IAdtCapabilities';
import type { ILocalTypesConfig } from '../adt/IAdtClass';
import type { IAdtHeaders } from '../adt/IAdtContentTypes';
import type { IDomainConfig } from '../adt/IAdtDomain';
import type { IProgramConfig } from '../adt/IAdtProgram';

type Assert<T extends true> = T;
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

const headers: IAdtHeaders = {
  accept: 'application/xml',
  contentType: 'application/xml',
};

// ── An atom is named with the keys that address the object ──────────────────

// @ts-expect-error an atom that identifies an object names its required keys
type _ReadableWithoutKeys = IAdtReadable<IProgramConfig, string>;
// @ts-expect-error the same for lock
type _LockableWithoutKeys = IAdtLockable<IProgramConfig>;

declare const program: IAdtReadable<IProgramConfig, string, 'programName'>;
void program.read({ programName: 'ZPROG' });
// @ts-expect-error a read without the object's name is refused
void program.read({});

// ── A required key is a string, never `undefined` ───────────────────────────

export type _Checks = [
  Assert<
    Equal<
      AdtObjectIdentity<ILocalTypesConfig, 'className' | 'source'>['source'],
      string
    >
  >,
  Assert<
    Equal<
      AdtObjectIdentity<IProgramConfig, 'programName'>['description'],
      string | undefined
    >
  >,
];

declare const localTypes: IAdtValidatable<
  ILocalTypesConfig,
  string,
  'className' | 'source'
>;
void localTypes.validate({ className: 'ZCL_X', source: 'CLASS lcl…' });
// @ts-expect-error a required source may not be `undefined`
void localTypes.validate({ className: 'ZCL_X', source: undefined });

// ── The write atoms: the identity, and the options a member needs ───────────

declare const update: IAdtUpdatable<
  IProgramConfig,
  string,
  'programName',
  'source'
>;
void update.update(
  { programName: 'ZPROG' },
  { headers, source: 'REPORT zprog.', lockHandle: 'H' },
);
// @ts-expect-error every locked write needs its lock handle (C7)
void update.update({ programName: 'ZPROG' }, { headers, source: 'REPORT z.' });
// @ts-expect-error a write that sends a source needs one
void update.update({ programName: 'ZPROG' }, { headers, lockHandle: 'H' });
const _noName = {};
// @ts-expect-error a write names the object it writes
void update.update(_noName, { headers, source: 'x', lockHandle: 'H' });

// A write from a typed config names no source, and still needs the lock.
declare const typedWrite: IAdtUpdatable<IProgramConfig, string, 'programName'>;
void typedWrite.update({ programName: 'ZPROG' }, { headers, lockHandle: 'H' });
// @ts-expect-error no member locks for itself: the handle is the caller's
void typedWrite.update({ programName: 'ZPROG' }, { headers });

declare const metadata: IAdtMetadataUpdatable<
  IDomainConfig,
  string,
  'domainName',
  'source'
>;
void metadata.updateMetadata(
  { domainName: 'ZDOM' },
  { headers, source: '<doma:domain/>', lockHandle: 'H' },
);
// @ts-expect-error the document write needs its lock handle
void metadata.updateMetadata({ domainName: 'ZDOM' }, { headers, source: 'x' });
