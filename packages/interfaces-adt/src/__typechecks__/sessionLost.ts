// Compile-only assertions. If these stop compiling, the types regressed.

import {
  ADT_SESSION_ERROR,
  type AdtSessionLoss,
} from '@mcp-abap-adt/interfaces-adt-connection';
import type { IAdtError, IAdtResult } from '../adt/IAdtResponse';

type Assert<T extends true> = T;
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

// Both fields are the connection's own type, not a copy of it.
type _SameOnError = Assert<
  Equal<NonNullable<IAdtError['sessionLost']>, AdtSessionLoss>
>;
type _SameOnResult = Assert<
  Equal<NonNullable<IAdtResult<string>['sessionLost']>, AdtSessionLoss>
>;

// A failure and a result carry the mark.
const _lostFailure: IAdtError = {
  origin: 'refusal',
  message: 'SAP said no',
  sessionLost: ADT_SESSION_ERROR.SESSION_REPLACED,
};
void _lostFailure;
const _lostResult: IAdtResult<string> = {
  value: '<document/>',
  sessionLost: ADT_SESSION_ERROR.SESSION_REPLACED,
};
void _lostResult;

// Optional: an error and a result built for 27.2.0 still conform.
const _withoutOnError: IAdtError = { origin: 'refusal', message: 'no' };
void _withoutOnError;
const _withoutOnResult: IAdtResult<number> = { value: 1 };
void _withoutOnResult;

// The key with no value conforms too, under exactOptionalPropertyTypes.
const _undefinedOnError: IAdtError = {
  origin: 'refusal',
  message: 'no',
  sessionLost: undefined,
};
void _undefinedOnError;
const _undefinedOnResult: IAdtResult<number> = {
  value: 1,
  sessionLost: undefined,
};
void _undefinedOnResult;

// Only the replacement is a loss: no other session code, no word, no flag.
const _notConnected: IAdtError = {
  origin: 'connection',
  message: 'x',
  // @ts-expect-error a session that was never there is not a loss mark
  sessionLost: ADT_SESSION_ERROR.NOT_CONNECTED,
};
void _notConnected;
const _word: IAdtResult<number> = {
  value: 1,
  // @ts-expect-error a free string is not the mark
  sessionLost: 'x',
};
void _word;
const _flag: IAdtResult<number> = {
  value: 1,
  // @ts-expect-error a boolean is not the mark
  sessionLost: true,
};
void _flag;

// Reading it gives the connection's type, or nothing.
declare const failure: IAdtError;
const _readError: AdtSessionLoss | undefined = failure.sessionLost;
void _readError;
declare const result: IAdtResult<string>;
const _readResult: AdtSessionLoss | undefined = result.sessionLost;
void _readResult;
