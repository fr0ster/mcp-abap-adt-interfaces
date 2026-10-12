// Compile-only assertions. If these stop compiling, the types regressed.

// Imported from the index, not the files: a consumer reaches only what the
// index exports.
import type { IAdtClientOptions, IAdtError } from '../index';

// A client may be given the caller's signal …
const _signal: IAdtClientOptions = {
  signal: new AbortController().signal,
};
void _signal;

// … or a function answering the signal of the request being sent, read at
// each request — one client serving several callers.
declare function currentRequestSignal(): AbortSignal | undefined;
const _perRequest: IAdtClientOptions = { signal: () => currentRequestSignal() };
void _perRequest;

// "Not given" is spelled `undefined` too, under exactOptionalPropertyTypes.
const _notGiven: IAdtClientOptions = { signal: undefined };
void _notGiven;

// Neither is required: options written before stay valid.
const _none: IAdtClientOptions = {};
void _none;

// @ts-expect-error a signal is an AbortSignal or a function answering one
const _flag: IAdtClientOptions = { signal: true };
void _flag;

// A failure may carry the authentication refusal it failed with …
declare const thrownRefusal: unknown;
const _refused: IAdtError = {
  origin: 'connection',
  message: 'the request was refused',
  refusal: thrownRefusal,
};
void _refused;

// … and an ADT answer carries none: the field is not required.
const _adt: IAdtError = { origin: 'refusal', message: 'locked by CB99' };
void _adt;

// The refusal is the thrown value's payload as it is: `unknown`, read with
// auth-errors' classify, never a shape this contract invents.
declare const anError: IAdtError;
const _read: unknown = anError.refusal;
void _read;
// @ts-expect-error no field of it is promised here
void anError.refusal.kind;
