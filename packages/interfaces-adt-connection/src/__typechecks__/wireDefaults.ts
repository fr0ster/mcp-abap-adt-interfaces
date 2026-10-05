// Compile-only assertions. If these stop compiling, the types regressed.
//
// Since 2.0.0 an answer whose types the caller did not name is `unknown`, not
// `any`: a caller narrows it or names the type, and a typo in a field read is
// a compile error rather than a value of `undefined`.

import type { IAbapConnection, IAdtWireResponse } from '../IAbapConnection';
import type { IAbapRequestOptions } from '../IAbapRequestOptions';

type Assert<T extends true> = T;
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

export type _DataDefault = Assert<Equal<IAdtWireResponse['data'], unknown>>;

declare const connection: IAbapConnection;
declare const options: IAbapRequestOptions;

/** Wrapped in a function: these are compile-only, and nothing here runs. */
async function _untypedAnswer(): Promise<void> {
  const answer = await connection.makeAdtRequest(options);
  type _Untyped = Assert<Equal<typeof answer.data, unknown>>;
  // @ts-expect-error an untyped answer must be narrowed before it is read
  answer.data.length;

  // Named, the answer is what the caller said.
  const typed = await connection.makeAdtRequest<string>(options);
  const text: string = typed.data;
  void text;
}
void _untypedAnswer;
