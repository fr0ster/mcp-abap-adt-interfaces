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
  IAdtResponse,
  IAdtWireResponse,
  IAnalyse,
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

// ── The failure a strategy names is the failure a caller reads ──────────────
//
// `IAdtFailure<TError extends IAdtError>` carried the parameter since the union
// existed, and it arrived nowhere: the options pinned `analyse`'s return to
// `IAdtError`, so a strategy answering something richer was narrowed at the
// call site. These assert it flows — and that it flows *without* the contract
// growing a field for anybody's special case. Decision 25.

/** What a consumer who branches on SAP's message identifiers would declare. */
interface IT100Failure extends IAdtError {
  readonly t100: { readonly msgid: string; readonly msgno: string };
}

/**
 * The identifiers are in the document already — every `<exc:exception>` carries
 * `T100KEY-ID` and `T100KEY-NO` in its `<properties>` — so the strategy reads
 * them out of the answer it was handed. Nothing about this is in the contract.
 */
const t100: IAnalyse<IT100Failure> = (verdict, answer) => {
  if (verdict !== ADT_NO_FAILURE) return verdict as IT100Failure;
  const document = String(answer?.data ?? '');
  const key = /<entry key="T100KEY-ID">([^<]*)<\/entry>/.exec(document);
  const no = /<entry key="T100KEY-NO">([^<]*)<\/entry>/.exec(document);
  if (!(key && no)) return ADT_NO_FAILURE;
  return {
    origin: 'refusal',
    message: 'refused',
    t100: { msgid: key[1], msgno: no[1] },
  };
};

/** A member's options carry it, which is the link that was missing. */
const richOptions: IAdtOperationOptions<IT100Failure> = { analyse: t100 };
void richOptions;

/**
 * And out the other end: the failure half is the consumer's type, so their own
 * field is reachable with no cast and no guard. A `.t100` that stops compiling
 * here is the regression this file exists to catch.
 */
declare const answer: IAdtResponse<string, IT100Failure>;
if (!answer.ok) {
  const key: { msgid: string; msgno: string } = answer.getError().t100;
  void key;
  // The contract's own fields are still there — this extends, never replaces.
  const origin: 'connection' | 'refusal' = answer.getError().origin;
  void origin;
}

/**
 * Written without an argument it means exactly what it did, which is what makes
 * the change additive: every existing strategy still satisfies it.
 */
const plainOptions: IAdtOperationOptions = { analyse: strictAboutEmpty };
void plainOptions;

/**
 * The asymmetry that stays: the verdict handed *in* is the library's own,
 * built before any strategy is consulted, so a strategy is never handed a
 * failure of a type only it can make.
 */
const readsThePlainVerdict: IAnalyse<IT100Failure> = (verdict) => {
  const incoming: IAdtError | AdtNoFailure = verdict;
  void incoming;
  return ADT_NO_FAILURE;
};
void readsThePlainVerdict;
