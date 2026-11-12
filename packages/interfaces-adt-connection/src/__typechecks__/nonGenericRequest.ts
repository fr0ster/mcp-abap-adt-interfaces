// Compile-only assertions. If these stop compiling, the types regressed.
//
// Since 5.0.0 `makeAdtRequest` takes no type parameters: it answers
// `IAdtWireResponse` with `data: unknown`, and the caller reads it. A caller
// that chose `T` made every connection that records or forwards a request
// assert one, because nothing it holds is a `T` the caller picked.

import type { IAbapConnection, IAdtWireResponse } from '../IAbapConnection';
import type { IAbapRequestOptions } from '../IAbapRequestOptions';

type Assert<T extends true> = T;
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

const _base = {
  connect: async () => {},
  getBaseUrl: async () => 'https://h',
  getSessionId: () => null,
  setSessionType: () => {},
};

// **A non-generic connection conforms.** It answers what came off the wire and
// names no type for `data` — a recorder, a forwarder, a test stand-in — and
// needs no assertion to do so.
const _nonGeneric: IAbapConnection = {
  ..._base,
  makeAdtRequest: async (): Promise<IAdtWireResponse> => ({
    data: undefined,
    status: 200,
    statusText: 'OK',
    headers: {},
  }),
};
void _nonGeneric;

// **A generic connection still conforms.** An implementation that keeps its
// own `<T, D>` (the connector does) is assignable to the non-generic member:
// its `T` defaults to `unknown`.
declare function genericRequest<T = unknown, D = unknown>(
  options: IAbapRequestOptions,
): Promise<IAdtWireResponse<T, D>>;

const _generic: IAbapConnection = {
  ..._base,
  makeAdtRequest: genericRequest,
};
void _generic;

declare const connection: IAbapConnection;
declare const options: IAbapRequestOptions;

/** Wrapped in a function: these are compile-only, and nothing here runs. */
async function _answers(): Promise<void> {
  const answer = await connection.makeAdtRequest(options);
  type _Data = Assert<Equal<typeof answer.data, unknown>>;
  type _Answer = Assert<Equal<typeof answer, IAdtWireResponse>>;

  // **A caller names no type.** It reads `data` as `unknown` and narrows it.
  // @ts-expect-error makeAdtRequest takes no type arguments
  await connection.makeAdtRequest<string>(options);
}
void _answers;
