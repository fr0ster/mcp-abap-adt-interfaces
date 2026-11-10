// Compile-only assertions. If these stop compiling, the types regressed.

import {
  ADT_CONNECTION_CAUSES,
  type AdtConnectionCause,
  type IAdtError,
} from '../adt/IAdtResponse';

type Assert<T extends true> = T;
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

// The list is exactly these seven, in this order: a code removed or added is
// a compile error here.
type _ExactList = Assert<
  Equal<
    typeof ADT_CONNECTION_CAUSES,
    readonly [
      'ECONNREFUSED',
      'ECONNRESET',
      'ENOTFOUND',
      'EAI_AGAIN',
      'ETIMEDOUT',
      'EHOSTUNREACH',
      'ENETUNREACH',
    ]
  >
>;
type _ExactUnion = Assert<
  Equal<
    AdtConnectionCause,
    | 'ECONNREFUSED'
    | 'ECONNRESET'
    | 'ENOTFOUND'
    | 'EAI_AGAIN'
    | 'ETIMEDOUT'
    | 'EHOSTUNREACH'
    | 'ENETUNREACH'
  >
>;

// The union is the list's members, nothing wider.
const _listed: AdtConnectionCause = ADT_CONNECTION_CAUSES[0];
void _listed;
const _refused: AdtConnectionCause = 'ECONNREFUSED';
void _refused;
const _again: AdtConnectionCause = 'EAI_AGAIN';
void _again;

// @ts-expect-error a code off the list is not a cause
const _unlisted: AdtConnectionCause = 'EPIPE';
void _unlisted;

// @ts-expect-error a TLS code is not on this list
const _tls: AdtConnectionCause = 'CERT_HAS_EXPIRED';
void _tls;

// The list is closed: it cannot be added to.
// @ts-expect-error a readonly tuple has no push
ADT_CONNECTION_CAUSES.push('EPIPE');

// A connection failure names its cause by a listed code.
const _withCause: IAdtError = {
  origin: 'connection',
  message: 'connect ECONNREFUSED',
  connectionCause: 'ECONNREFUSED',
};
void _withCause;

// The field is optional: an error built for 27.0.0 still conforms.
const _withoutCause: IAdtError = { origin: 'connection', message: 'gone' };
void _withoutCause;

// The key with no value conforms too, under exactOptionalPropertyTypes.
const _undefinedCause: IAdtError = {
  origin: 'connection',
  message: 'gone',
  connectionCause: undefined,
};
void _undefinedCause;

const _offList: IAdtError = {
  origin: 'connection',
  message: 'broken pipe',
  // @ts-expect-error only a listed code is a cause
  connectionCause: 'EPIPE',
};
void _offList;

declare const someCode: string;
const _anyString: IAdtError = {
  origin: 'connection',
  message: 'x',
  // @ts-expect-error a plain string is not a cause
  connectionCause: someCode,
};
void _anyString;

// Reading it gives the union, or nothing.
declare const failure: IAdtError;
const _read: AdtConnectionCause | undefined = failure.connectionCause;
void _read;
