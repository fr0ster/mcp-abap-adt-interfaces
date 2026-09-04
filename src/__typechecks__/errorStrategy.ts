// Compile-only assertions. If these stop compiling, the types regressed.
//
// The error axis is the half a consumer supplies to say what counts as a
// failure. What is asserted here is that its two answers are both *named*: an
// `IAdtError`, or the token that says this answer is fine. Neither is
// `undefined`, so the absence of a strategy and a strategy's verdict of "fine"
// cannot be confused — which they were until 31.0.0.

import type {
  AdtNoFailure,
  IAdtError,
  IAdtOperationOptions,
  IAdtWireResponse,
} from '../index';
import { ADT_NO_FAILURE } from '../index';

const empty: IAdtWireResponse = {
  data: '',
  status: 200,
  statusText: 'OK',
  headers: {},
};

/**
 * A read-modify-write calls an empty 200 a failure: writing back what it read
 * would erase the object. ADT answers a missing object exactly that way.
 */
const strictAboutEmpty: IAdtOperationOptions['analyse'] = (verdict, answer) => {
  if (answer?.status === 200 && answer.data === '') {
    return {
      origin: 'refusal',
      message: 'the object is not there, and writing back would erase it',
    };
  }
  return verdict;
};

/** A listing reads the same bytes as an empty list, and says so by name. */
const emptyIsFine: IAdtOperationOptions['analyse'] = (verdict, answer) => {
  if (answer?.status === 200 && answer.data === '') return ADT_NO_FAILURE;
  return verdict;
};

/** The verdict handed in is one of the two, never a third thing. */
const passesThrough: IAdtOperationOptions['analyse'] = (verdict) => {
  const asKnown: IAdtError | AdtNoFailure = verdict;
  return asKnown;
};

/** `undefined` is not one of them — that was the sentinel, and it is gone. */
// @ts-expect-error "not a failure" is ADT_NO_FAILURE now, not undefined
const refused: IAdtOperationOptions['analyse'] = () => undefined;

/** A consumer branches on the token by identity, without a cast. */
function _isFine(verdict: IAdtError | AdtNoFailure): boolean {
  return verdict === ADT_NO_FAILURE;
}

export const _errorStrategyAssertions = [
  strictAboutEmpty?.(ADT_NO_FAILURE, empty),
  emptyIsFine?.(ADT_NO_FAILURE, empty),
  passesThrough?.(ADT_NO_FAILURE),
  refused?.(ADT_NO_FAILURE),
  _isFine(ADT_NO_FAILURE),
] as const;
