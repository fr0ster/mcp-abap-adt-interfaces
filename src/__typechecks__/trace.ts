// Compile-only assertions. If these stop compiling, the types regressed.
//
// Half of these are @ts-expect-error: a constraint that only ever accepts is
// not a constraint, and each of the four refusals below is one this design was
// written to produce.

import type { IAdtResponse } from '../adt/IAdtResponse';
import type {
  ITraceDeletion,
  ITraceEntry,
  ITraceFamily,
  ITraceListing,
  ITraceReading,
  ITraceView,
  ViewArgs,
  ViewResult,
} from '../runtime/ITrace';

interface IHitList {
  entries: { name: string; grossTime: number }[];
}
interface IStatements {
  entries: { statement: string }[];
}

interface IGoodViews {
  hitlist: ITraceView<IHitList, { withSystemEvents?: boolean } | undefined>;
  statements: ITraceView<IStatements, { withDetails?: boolean } | undefined>;
}

/** An `interface` fits — the reason the constraint is not `Record<string, …>`. */
type Reader = ITraceReading<IGoodViews>;

/** A view with no options at all. */
interface INoOptionViews {
  records: ITraceView<{ count: number }>;
}
type NoOptionReader = ITraceReading<INoOptionViews>;

/** A view whose options are REQUIRED. */
interface IRequiredOptionViews {
  recordContent: ITraceView<{ body: string }, { recordNumber: number }>;
}
type RequiredOptionReader = ITraceReading<IRequiredOptionViews>;

/** What an implementation answers with when it succeeded. */
const answered = <T>(value: T): IAdtResponse<T> => ({
  ok: true,
  getResult: () => ({ value }),
  getError: () => undefined,
});

/**
 * Take the value, having asked the contract whether there was a failure.
 *
 * Every member answers {@link IAdtResponse} since 30.0.0, so an assertion about
 * a *value* has to get past that question first — which is decision 21, and the
 * shape every consumer writes.
 */
const read = <T>(answer: IAdtResponse<T>): T => {
  if (!answer.ok) throw new Error(answer.getError().message);
  return answer.getResult().value;
};

// A map whose members are not views is refused WHERE IT IS DECLARED, not at the
// call site with a result of `never`.
interface IBadViews {
  hitlist: string;
}
// @ts-expect-error a view map must be made of views
type _Bad = ITraceReading<IBadViews>;

/** A family with views: the shape `IProfiler` will have. */
type WithViews = ITraceFamily<'probe'> &
  ITraceListing<ITraceEntry, { user?: string }> &
  Reader;

/** A family without views says nothing about reading — and needs no `read`. */
type ListingOnly = ITraceFamily<'listing-only'>;

/**
 * A family that only says what it is called.
 *
 * `ITraceFamily` carried a listing with it until 30.0.0, so "a family" and "a
 * family that lists" could not be distinguished. Minimal contracts, composed
 * where they are used, is what replaced that: the listing is spelled beside the
 * name when it is true.
 */
const _listingOnly: ListingOnly = {
  kind: 'listing-only',
};

const _listingAndName: ListingOnly & ITraceListing = {
  kind: 'listing-only',
  list: async () => answered([]),
};

async function _assertions(
  family: WithViews,
  required: RequiredOptionReader,
  noOptions: NoOptionReader,
) {
  // The result is typed, not `any`.
  const gross: number = read(await family.read('t', 'hitlist')).entries[0]
    .grossTime;

  // Optional options may be given or omitted.
  await family.read('t', 'hitlist');
  await family.read('t', 'statements', { withDetails: true });

  // Required options must be given, and the compiler says so.
  await required.read('t', 'recordContent', { recordNumber: 3 });
  // @ts-expect-error a required option may not be omitted
  await required.read('t', 'recordContent');

  // A view the family does not have.
  // @ts-expect-error unknown view
  await family.read('t', 'callGraph');

  // The result type is the view's, not a union to narrow.
  const hits = read(await family.read('t', 'hitlist'));
  // @ts-expect-error hitlist entries carry no `statement`
  const _wrong: string = hits.entries[0].statement;

  const count: number = read(await noOptions.read('t', 'records')).count;

  // The literal kind still discriminates.
  const kind: 'probe' = family.kind;

  // The listing carries its own options type.
  const listing: ITraceListing<ITraceEntry, { user?: string }> = family;
  const entries = read(await listing.list({ user: 'SOMEONE' }));

  return { gross, count, kind, id: entries[0]?.id };
}

export type { Reader, WithViews, ListingOnly };
export { _listingOnly, _listingAndName, _assertions };

// ---------------------------------------------------------------------------
// A consumer's own profiler, composed from the atoms.
//
// `IProfiler` and the trace shapes left in 31.0.0 — a composition of atoms with
// an implementation's readings is that implementation's. What is asserted here
// is that the atoms still compose into one, with shapes this file declares.

import type { IAdtRunnable } from '../execution/IAdtRunnable';
import type { IAtcRunOptions, IAtcRunTarget } from '../runtime/IAtcRun';
import type { IProfilerListOptions } from '../runtime/IProfiler';

interface MyTraceEntry extends ITraceEntry {
  user: string;
}
interface MyHitList {
  entries: { grossTime: number }[];
}
interface MyViews {
  hitlist: ITraceView<MyHitList>;
}

type MyProfiler = ITraceFamily<'profiler'> &
  ITraceListing<MyTraceEntry, IProfilerListOptions> &
  ITraceReading<MyViews> &
  ITraceDeletion;

const _profiler: MyProfiler = {
  kind: 'profiler',
  list: async () =>
    answered([
      {
        id: 'ABCDEF0123456789ABCD',
        recordedAt: '2026-08-29T06:09:50Z',
        objectName: 'ZCL_SOMETHING=========CP',
        user: 'SOMEONE',
      } as MyTraceEntry,
    ]),
  read: async <K extends keyof MyViews>(
    traceId: string,
    view: K,
    ...args: ViewArgs<MyViews, K>
  ): Promise<IAdtResponse<ViewResult<MyViews, K>>> => {
    void traceId;
    void view;
    void args;
    return undefined as never;
  },
  delete: async (traceId: string) => {
    void traceId;
    return answered(undefined);
  },
};
void _profiler;

async function _profilerCalls(p: MyProfiler) {
  const hits: MyHitList = read(await p.read('t1', 'hitlist'));
  const rows = hits.entries;
  const kind: 'profiler' = p.kind;
  const deleted: void = read(await p.delete('t1'));

  // @ts-expect-error this profiler has one view, and that is not it
  await p.read('t1', 'dbAccesses');

  return { rows, kind, deleted };
}
void _profilerCalls;

/**
 * An ATC-shaped runnable owes nothing to scheduling.
 *
 * If `ITraceScheduling` ever migrates onto `IAdtRunnable` or a profiler atom,
 * this stops compiling — which is the guard, because the cost of that mistake is an
 * ATC run having to answer for trace parameters.
 */
const _atc: IAdtRunnable<
  IAtcRunTarget,
  { worklistId: string },
  IAtcRunOptions
> = {
  run: async (target, options) => {
    void target;
    void options;
    return undefined as never;
  },
};
void _atc;
