// Compile-only assertions. If these stop compiling, the types regressed.
//
// Since 4.1.0 the error a connection throws carries the RFC SDK's fields of a
// failed call in `rfc`, and a consumer reads which failure it was from a field.

import {
  type IAbapConnectionError,
  type IRfcErrorInfo,
  RFC_RCS,
  type RfcReturnCodeName,
} from '../IAbapConnectionError';
import type { AdtSessionErrorCode } from '../IConnectionCapabilities';

type Assert<T extends true> = T;
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

// The list is exactly the SDK's RFC_RC names, in the header's order: a name
// removed, added or moved is a compile error here.
export type _ExactList = Assert<
  Equal<
    typeof RFC_RCS,
    readonly [
      'RFC_OK',
      'RFC_COMMUNICATION_FAILURE',
      'RFC_LOGON_FAILURE',
      'RFC_ABAP_RUNTIME_FAILURE',
      'RFC_ABAP_MESSAGE',
      'RFC_ABAP_EXCEPTION',
      'RFC_CLOSED',
      'RFC_CANCELED',
      'RFC_TIMEOUT',
      'RFC_MEMORY_INSUFFICIENT',
      'RFC_VERSION_MISMATCH',
      'RFC_INVALID_PROTOCOL',
      'RFC_SERIALIZATION_FAILURE',
      'RFC_INVALID_HANDLE',
      'RFC_RETRY',
      'RFC_EXTERNAL_FAILURE',
      'RFC_EXECUTED',
      'RFC_NOT_FOUND',
      'RFC_NOT_SUPPORTED',
      'RFC_ILLEGAL_STATE',
      'RFC_INVALID_PARAMETER',
      'RFC_CODEPAGE_CONVERSION_FAILURE',
      'RFC_CONVERSION_FAILURE',
      'RFC_BUFFER_TOO_SMALL',
      'RFC_TABLE_MOVE_BOF',
      'RFC_TABLE_MOVE_EOF',
      'RFC_START_SAPGUI_FAILURE',
      'RFC_ABAP_CLASS_EXCEPTION',
      'RFC_UNKNOWN_ERROR',
      'RFC_AUTHORIZATION_FAILURE',
      'RFC_AUTHENTICATION_FAILURE',
      'RFC_CRYPTOLIB_FAILURE',
      'RFC_IO_FAILURE',
      'RFC_LOCKING_FAILURE',
    ]
  >
>;

// The union is the list's members, nothing wider.
export type _ExactUnion = Assert<
  Equal<
    RfcReturnCodeName,
    | 'RFC_OK'
    | 'RFC_COMMUNICATION_FAILURE'
    | 'RFC_LOGON_FAILURE'
    | 'RFC_ABAP_RUNTIME_FAILURE'
    | 'RFC_ABAP_MESSAGE'
    | 'RFC_ABAP_EXCEPTION'
    | 'RFC_CLOSED'
    | 'RFC_CANCELED'
    | 'RFC_TIMEOUT'
    | 'RFC_MEMORY_INSUFFICIENT'
    | 'RFC_VERSION_MISMATCH'
    | 'RFC_INVALID_PROTOCOL'
    | 'RFC_SERIALIZATION_FAILURE'
    | 'RFC_INVALID_HANDLE'
    | 'RFC_RETRY'
    | 'RFC_EXTERNAL_FAILURE'
    | 'RFC_EXECUTED'
    | 'RFC_NOT_FOUND'
    | 'RFC_NOT_SUPPORTED'
    | 'RFC_ILLEGAL_STATE'
    | 'RFC_INVALID_PARAMETER'
    | 'RFC_CODEPAGE_CONVERSION_FAILURE'
    | 'RFC_CONVERSION_FAILURE'
    | 'RFC_BUFFER_TOO_SMALL'
    | 'RFC_TABLE_MOVE_BOF'
    | 'RFC_TABLE_MOVE_EOF'
    | 'RFC_START_SAPGUI_FAILURE'
    | 'RFC_ABAP_CLASS_EXCEPTION'
    | 'RFC_UNKNOWN_ERROR'
    | 'RFC_AUTHORIZATION_FAILURE'
    | 'RFC_AUTHENTICATION_FAILURE'
    | 'RFC_CRYPTOLIB_FAILURE'
    | 'RFC_IO_FAILURE'
    | 'RFC_LOCKING_FAILURE'
  >
>;

// @ts-expect-error a name off the list is not a return code
const _unlisted: RfcReturnCodeName = 'RFC_SOMETHING_ELSE';
void _unlisted;

// The list is closed: it cannot be added to.
// @ts-expect-error a readonly tuple has no push
RFC_RCS.push('RFC_OK');

// A conversation closed by the other side: the index is the numeric code.
const _closed: IRfcErrorInfo = {
  key: 'RFC_CLOSED',
  group: 4,
  code: 6,
  codeString: 'RFC_CLOSED',
};
void _closed;
export type _ClosedAtSix = Assert<Equal<(typeof RFC_RCS)[6], 'RFC_CLOSED'>>;

declare const someText: string;

const _plainCodeString: IRfcErrorInfo = {
  key: 'RFC_CLOSED',
  group: 4,
  code: 6,
  // @ts-expect-error a plain string is not a return code name
  codeString: someText,
};
void _plainCodeString;

// The key is the SDK's free text: any string.
const _freeKey: IRfcErrorInfo = {
  key: someText,
  group: 4,
  code: 6,
  codeString: 'RFC_CLOSED',
};
void _freeKey;

const _textGroup: IRfcErrorInfo = {
  key: 'RFC_CLOSED',
  // @ts-expect-error the group is a number
  group: '4',
  code: 6,
  codeString: 'RFC_CLOSED',
};
void _textGroup;

const _textCode: IRfcErrorInfo = {
  key: 'RFC_CLOSED',
  group: 4,
  // @ts-expect-error the code is a number
  code: '6',
  codeString: 'RFC_CLOSED',
};
void _textCode;

// All four fields are required.
// @ts-expect-error the key is required
const _noKey: IRfcErrorInfo = { group: 4, code: 6, codeString: 'RFC_CLOSED' };
void _noKey;

// @ts-expect-error the code's name is required
const _noName: IRfcErrorInfo = { key: 'RFC_CLOSED', group: 4, code: 6 };
void _noName;

// No text field: the SDK's message is not part of the fields.
const _withMessage: IRfcErrorInfo = {
  key: 'RFC_CLOSED',
  group: 4,
  code: 6,
  codeString: 'RFC_CLOSED',
  // @ts-expect-error the fields carry no message
  message: 'connection closed',
};
void _withMessage;

// Read, never written.
declare const info: IRfcErrorInfo;
// @ts-expect-error the fields are readonly
info.key = 'RFC_OK';

declare const error: IAbapConnectionError;
// @ts-expect-error the error's fields are readonly
error.rfc = info;

// An error without `rfc` conforms: every HTTP failure, every session error.
const _plain: IAbapConnectionError = {};
void _plain;
const _session: IAbapConnectionError = { code: 'ADT_NOT_CONNECTED' };
void _session;

// The keys with no value conform too, under exactOptionalPropertyTypes.
const _undefinedKeys: IAbapConnectionError = {
  code: undefined,
  rfc: undefined,
};
void _undefinedKeys;

// The error a connection throws is one, with or without the RFC fields.
declare const sessionError: Error & { code: AdtSessionErrorCode };
const _thrown: IAbapConnectionError = sessionError;
void _thrown;
declare const rfcError: Error & {
  code: AdtSessionErrorCode;
  rfc: IRfcErrorInfo;
};
const _thrownRfc: IAbapConnectionError = rfcError;
void _thrownRfc;

// Reading gives the types, or nothing.
const _readName: RfcReturnCodeName | undefined = error.rfc?.codeString;
void _readName;
const _readKey: string | undefined = error.rfc?.key;
void _readKey;
