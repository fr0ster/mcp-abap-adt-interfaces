// Compile-only assertions. If these stop compiling, the types regressed.
//
// The error axis is the half a consumer supplies to say what counts as a
// failure. What is asserted here is that its two answers are both *named*: an
// `IAdtError`, or the token that says this answer is fine. Neither is
// `undefined`, so the absence of a strategy and a strategy's verdict of "fine"
// cannot be confused — which they were until 31.0.0.

import type {
  AdtNoFailure,
  IAdtActivatable,
  IAdtCreatable,
  IAdtError,
  IAdtMetadataReadable,
  IAdtOperationOptions,
  IAdtReadable,
  IAdtUpdatable,
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
 * And out the other end — **through a real member**, which is the whole point.
 *
 * An earlier version of this check declared the answer by hand as
 * `IAdtResponse<string, IT100Failure>` and asserted `.t100` on it. That proved
 * only that the union works, which was never in doubt, and it passed while the
 * capability members still took a non-generic `IAdtOperationOptions` — so the
 * example in the PR did not compile and the check said nothing. Caught in
 * review. The members are parameterised now, and this asks one of them.
 */
declare const activatable: IAdtActivatable<{ name: string }, string>;
declare const creatable: IAdtCreatable<{ name: string }, string>;
declare const updatable: IAdtUpdatable<{ name: string }, string>;
declare const readable: IAdtReadable<{ name: string }, string> &
  IAdtMetadataReadable<{ name: string }, string>;

/** Wrapped in a function: these are compile-only, and nothing here runs. */
async function _theFailureIsTheCallers(): Promise<void> {
  const activated = await activatable.activate(
    { name: 'ZCL_X' },
    { analyse: t100 },
  );
  if (!activated.ok) {
    // No cast, no guard: `E` was inferred from the strategy handed to the call.
    const key: { msgid: string; msgno: string } = activated.getError().t100;
    void key;
    // The contract's own fields are still there — this extends, never replaces.
    const origin: 'connection' | 'refusal' = activated.getError().origin;
    void origin;
  }

  // The other members carry it too, not just the one that was asked about.
  const created = await creatable.create({ name: 'ZCL_X' }, { analyse: t100 });
  if (!created.ok) void created.getError().t100;

  const updated = await updatable.update({ name: 'ZCL_X' }, { analyse: t100 });
  if (!updated.ok) void updated.getError().t100;

  const read = await readable.read({ name: 'ZCL_X' }, 'active', {
    analyse: t100,
  });
  if (!read.ok) void read.getError().t100;

  // And a member called without a strategy answers the plain contract, which is
  // what keeps every existing call site compiling.
  const plain = await activatable.activate({ name: 'ZCL_X' });
  if (!plain.ok) {
    const failure: IAdtError = plain.getError();
    void failure;
    // @ts-expect-error nobody named a richer failure, so there is no `t100`
    void plain.getError().t100;
  }
}
void _theFailureIsTheCallers;

// ── A generic cannot be claimed without the strategy that earns it ──────────
//
// `activate<IT100Failure>(config)` used to compile: the type argument promised
// a failure the runtime had no way to produce, because without an `analyse`
// the member answers whatever its own default reads — an `IAdtError`. Reading
// `.t100` off that compiles and finds nothing there. Caught in review.
//
// Two call signatures now, the strategy-bearing one first: a caller who names
// `E` must hand over the thing that makes it.

async function _aTypeArgumentWithoutAStrategy(): Promise<void> {
  // @ts-expect-error naming the failure type requires the strategy that answers it
  await activatable.activate<IT100Failure>({ name: 'ZCL_X' });

  // `IAdtOperationOptions<IT100Failure>` with no strategy in it is still a
  // writable type — `analyse` is optional, and making it conditionally required
  // is not expressible. It does not matter, because the member is the gate: an
  // options object that names a failure type without carrying the thing that
  // produces it does not select the parameterised signature, so the answer is
  // the plain contract and `.t100` is not there to read.
  const named: IAdtOperationOptions<IT100Failure> = {};
  const answered = await activatable.activate({ name: 'ZCL_X' }, named);
  if (!answered.ok) {
    const failure: IAdtError = answered.getError();
    void failure;
    // @ts-expect-error the type argument bought nothing without a strategy
    void answered.getError().t100;
  }

  // What is allowed is the honest pair.
  const honest = await activatable.activate(
    { name: 'ZCL_X' },
    { analyse: t100 },
  );
  if (!honest.ok) void honest.getError().t100;
}
void _aTypeArgumentWithoutAStrategy;
