// Compile-only assertions. If these stop compiling, the types regressed.

import type { IRfcErrorInfo } from '@mcp-abap-adt/interfaces-adt-connection';
import type { IAdtError } from '../adt/IAdtResponse';

type Assert<T extends true> = T;
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

// The field is the connection's own type, not a copy of it.
type _SameType = Assert<Equal<NonNullable<IAdtError['rfc']>, IRfcErrorInfo>>;

// A connection failure carries what the RFC SDK said.
const _withRfc: IAdtError = {
  origin: 'connection',
  message: 'RFC call failed',
  rfc: { key: 'RFC_CLOSED', group: 4, code: 6, codeString: 'RFC_CLOSED' },
};
void _withRfc;

// Optional: an error built for 27.1.0 still conforms.
const _withoutRfc: IAdtError = { origin: 'connection', message: 'gone' };
void _withoutRfc;

// The key with no value conforms too, under exactOptionalPropertyTypes.
const _undefinedRfc: IAdtError = {
  origin: 'connection',
  message: 'gone',
  rfc: undefined,
};
void _undefinedRfc;

const _unknownCode: IAdtError = {
  origin: 'connection',
  message: 'x',
  // @ts-expect-error codeString is a name of RFC_RCS, nothing else
  rfc: { key: 'X', group: 4, code: 99, codeString: 'RFC_NOT_A_CODE' },
};
void _unknownCode;

// Reading it gives the connection's type, or nothing.
declare const failure: IAdtError;
const _read: IRfcErrorInfo | undefined = failure.rfc;
void _read;
