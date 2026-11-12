// Compile-only assertions. If these stop compiling, the types regressed.

import {
  ADT_SESSION_ERROR,
  type AdtSessionErrorCode,
} from '@mcp-abap-adt/interfaces-adt-connection';
import type { IAdtError } from '../adt/IAdtResponse';

type Assert<T extends true> = T;
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

// The field is the connection's own type, not a copy of it.
type _SameType = Assert<
  Equal<NonNullable<IAdtError['sessionError']>, AdtSessionErrorCode>
>;

// A connection failure carries the connection's session code, each of them.
const _notConnected: IAdtError = {
  origin: 'connection',
  message: 'ADT_NOT_CONNECTED',
  sessionError: ADT_SESSION_ERROR.NOT_CONNECTED,
};
void _notConnected;
const _replaced: IAdtError = {
  origin: 'connection',
  message: 'ADT_SESSION_REPLACED',
  sessionError: ADT_SESSION_ERROR.SESSION_REPLACED,
};
void _replaced;
const _pending: IAdtError = {
  origin: 'connection',
  message: 'ADT_RELEASE_PENDING',
  sessionError: ADT_SESSION_ERROR.RELEASE_PENDING,
};
void _pending;

// Optional: an error built for 27.2.0 still conforms.
const _withoutSessionError: IAdtError = {
  origin: 'connection',
  message: 'gone',
};
void _withoutSessionError;

// The key with no value conforms too, under exactOptionalPropertyTypes.
const _undefinedSessionError: IAdtError = {
  origin: 'connection',
  message: 'gone',
  sessionError: undefined,
};
void _undefinedSessionError;

const _unknownCode: IAdtError = {
  origin: 'connection',
  message: 'x',
  // @ts-expect-error only a code of ADT_SESSION_ERROR is a session code
  sessionError: 'ADT_SOMETHING_ELSE',
};
void _unknownCode;

const _networkCode: IAdtError = {
  origin: 'connection',
  message: 'x',
  // @ts-expect-error a network code is a connectionCause, not a session code
  sessionError: 'ECONNREFUSED',
};
void _networkCode;

// Reading it gives the connection's type, or nothing.
declare const failure: IAdtError;
const _read: AdtSessionErrorCode | undefined = failure.sessionError;
void _read;
