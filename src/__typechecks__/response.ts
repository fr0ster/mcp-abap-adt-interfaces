// Compile-only assertions. If these stop compiling, the types regressed.
//
// The first draft of this contract had two independently-optional methods and a
// comment claiming a caller could not reach a result without being told an error
// exists. The comment was not true — nothing narrowed, an implementation could
// answer both or neither, and the doc example did not compile. Review found it,
// the typechecks did not, because there were none for this type.
//
// So these assert the guarantee itself, in both directions.

import type {
  IAdtError,
  IAdtFailure,
  IAdtResponse,
  IAdtResult,
  IAdtSuccess,
  ISearchResult,
} from '../index';

declare const answer: IAdtResponse<ISearchResult[]>;

/** Narrowing works, and the result is not `| undefined` on the happy side. */
export function readHits(): ISearchResult[] {
  if (answer.ok) {
    // `.value` because a result is a contract too, symmetric with IAdtError: the
    // strategy chooses how much of it to fill in.
    return answer.getResult().value;
  }
  return [];
}

/** And the failure is not `| undefined` on the other side. */
export function readFailure(): string {
  if (answer.ok) {
    return '';
  }
  // Not `answer.getError()?.message`. The union is what removes the question
  // mark, and the question mark is what made the original claim false.
  return answer.getError().message;
}

/** Reaching the result without asking is refused. */
// @ts-expect-error getResult() is `undefined` on the failure half of the union
export const unchecked: IAdtResult<ISearchResult[]> = answer.getResult();

/** So is reaching the error without asking. */
// @ts-expect-error getError() is `undefined` on the success half
export const uncheckedError: IAdtError = answer.getError();

/** A member cannot answer without naming what it gives back. */
// @ts-expect-error IAdtResponse requires its result contract
export declare const promisesNothing: IAdtResponse;

/**
 * A consumer's own implementation of each half.
 *
 * The point of the contract is that something written outside this package can
 * be one — including the error, which is why `IAdtError` is a shape and not a
 * class shipped from here.
 */
export class TheirSuccess implements IAdtSuccess<ISearchResult[]> {
  readonly ok = true as const;
  getResult(): IAdtResult<ISearchResult[]> {
    // A `brief` result strategy fills in the value and stops; a `full` one adds
    // the response it was read out of. Two amounts of one contract.
    return { value: [] };
  }
  getError(): undefined {
    return undefined;
  }
}

export class TheirFailure implements IAdtFailure {
  readonly ok = false as const;
  getResult(): undefined {
    return undefined;
  }
  getError(): IAdtError {
    // A `brief` strategy fills in the two required fields and stops. A caller
    // written against IAdtError reads this and a `full` one the same way — the
    // strategy chose the amount, not the shape.
    return { origin: 'refusal', message: 'Object ZNOPE is locked by user XYZ' };
  }
}

/** Both halves satisfy the union they belong to. */
export const asResponse: IAdtResponse<ISearchResult[]> = new TheirSuccess();
export const asFailure: IAdtResponse<ISearchResult[]> = new TheirFailure();

/** An origin outside the three is refused — they are the ones with remedies. */
// @ts-expect-error 'timeout' is not an AdtFailureOrigin
export const badOrigin: IAdtError = { origin: 'timeout', message: 'x' };

/** A failure without a message is not one: it is the least it can say. */
// @ts-expect-error message is required
export const silent: IAdtError = { origin: 'connection' };

/** A result without its value is not one, for the same reason a failure needs a message. */
// @ts-expect-error value is required
export const emptyResult: IAdtResult<ISearchResult[]> = {};
