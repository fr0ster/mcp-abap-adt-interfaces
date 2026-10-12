// Compile-only assertions. If these stop compiling, the types regressed.

// Imported from the index, not the file: a consumer can only reach what the
// index exports, so this is what fails when an export is dropped.
import {
  ADT_REQUEST_ERROR,
  type AdtRequestErrorCode,
  type IAbapRequestOptions,
} from '../index';

// A request may carry the caller's signal …
const _signalled: IAbapRequestOptions = {
  url: '/sap/bc/adt/discovery',
  method: 'GET',
  timeout: 30_000,
  signal: new AbortController().signal,
};
void _signalled;

// … and need not: every request written before 2.1.0 still compiles.
const _plain: IAbapRequestOptions = {
  url: '/sap/bc/adt/discovery',
  method: 'GET',
  timeout: 30_000,
};
void _plain;

// "Not given" is spelled `undefined` too, under exactOptionalPropertyTypes.
const _notGiven: IAbapRequestOptions = { ..._plain, signal: undefined };
void _notGiven;

// @ts-expect-error a signal is an AbortSignal, not a flag
const _flag: IAbapRequestOptions = { ..._plain, signal: true };
void _flag;

// The code is a literal a consumer matches on, not any string.
const _aborted: 'ADT_REQUEST_ABORTED' = ADT_REQUEST_ERROR.ABORTED;
void _aborted;

const _codes: AdtRequestErrorCode[] = [ADT_REQUEST_ERROR.ABORTED];
void _codes;

// @ts-expect-error a session code is not a request code
const _session: AdtRequestErrorCode = 'ADT_NOT_CONNECTED';
void _session;
