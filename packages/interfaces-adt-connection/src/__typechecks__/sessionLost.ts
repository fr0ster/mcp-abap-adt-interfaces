// Compile-only assertions. If these stop compiling, the types regressed.
//
// Since 4.2.0 a connection says on the answer itself that this answer showed
// the SAP session lost: `sessionLost` on the response a stateless request
// resolves, and on SAP's refusal it rejects. A consumer reads a field, typed,
// attributable to the one request — never a message.

import type { IAdtWireResponse } from '../IAbapConnection';
import type { IAbapConnectionError } from '../IAbapConnectionError';
import {
  ADT_SESSION_ERROR,
  type AdtSessionLoss,
} from '../IConnectionCapabilities';
import type { AdtSessionLoss as FromIndex } from '../index';

type Assert<T extends true> = T;
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

// The loss is named by the existing code, and by that code alone.
export type _LossIsReplaced = Assert<
  Equal<AdtSessionLoss, typeof ADT_SESSION_ERROR.SESSION_REPLACED>
>;
// The same type through the package's index.
export type _ExportedFromIndex = Assert<Equal<FromIndex, AdtSessionLoss>>;

const frame = {
  data: '<app:service/>',
  status: 200,
  statusText: 'OK',
  headers: {},
};

// A response with the mark, and one without: both are responses.
export const _marked: IAdtWireResponse<string> = {
  ...frame,
  sessionLost: ADT_SESSION_ERROR.SESSION_REPLACED,
};
export const _unmarked: IAdtWireResponse<string> = frame;
// Absent stated explicitly (exactOptionalPropertyTypes): still a response.
export const _explicitlyAbsent: IAdtWireResponse<string> = {
  ...frame,
  sessionLost: undefined,
};

// No other code is a loss on an answer.
export const _notConnected: IAdtWireResponse<string> = {
  ...frame,
  // @ts-expect-error NOT_CONNECTED is not a loss shown by an answer
  sessionLost: ADT_SESSION_ERROR.NOT_CONNECTED,
};
export const _freeText: IAdtWireResponse<string> = {
  ...frame,
  // @ts-expect-error a word is not the mark
  sessionLost: 'x',
};
export const _flag: IAdtWireResponse<string> = {
  ...frame,
  // @ts-expect-error a boolean is not the mark
  sessionLost: true,
};

// The mark is read, never written by the reader.
export function _readOnlyResponse(response: IAdtWireResponse): void {
  // @ts-expect-error sessionLost is readonly
  response.sessionLost = ADT_SESSION_ERROR.SESSION_REPLACED;
}

// SAP's refusal carries it beside its own `code` and the RFC fields.
export const _refusal: Error & IAbapConnectionError = Object.assign(
  new Error('refused'),
  {
    code: 'ERR_BAD_REQUEST',
    sessionLost: ADT_SESSION_ERROR.SESSION_REPLACED,
  },
);
export const _refusalWithoutMark: Error & IAbapConnectionError = new Error(
  'refused',
);

export function _readOnlyError(error: IAbapConnectionError): void {
  // @ts-expect-error sessionLost is readonly
  error.sessionLost = ADT_SESSION_ERROR.SESSION_REPLACED;
}

export function _wrongCodeOnError(): IAbapConnectionError {
  // @ts-expect-error RELEASE_PENDING is not a loss shown by an answer
  return { sessionLost: ADT_SESSION_ERROR.RELEASE_PENDING };
}

// Read without words: the field, narrowed by the compiler.
export function _read(
  answer: IAdtWireResponse | IAbapConnectionError,
): boolean {
  return answer.sessionLost === ADT_SESSION_ERROR.SESSION_REPLACED;
}
