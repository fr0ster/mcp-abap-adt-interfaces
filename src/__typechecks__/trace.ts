// Compile-only assertions. If these stop compiling, the types regressed.
//
// Half of these are @ts-expect-error: a constraint that only ever accepts is
// not a constraint, and each of the four refusals below is one this design was
// written to produce.

import type { IAdtResponse } from '../adt/IAdtResponse';
import type {
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
// The published families, and who is NOT obliged to schedule.

import type { IAdtRunnable } from '../execution/IAdtRunnable';
import type {
  IAbapTraceEntry,
  IAbapTraceHitListEntry,
} from '../runtime/IAbapTrace';
import type { IAtcRunOptions, IAtcRunTarget } from '../runtime/IAtcRun';
import type { IAbapTraceViews, IProfiler } from '../runtime/IProfiler';

// The timings are a shape now, not `unknown` — a consumer reads them without
// narrowing, and the compiler refuses a wrong member.
function _timings(entry: IAbapTraceHitListEntry) {
  const ms: number | undefined = entry.grossTime?.time;
  const share: number | undefined = entry.grossTime?.percentage;
  // @ts-expect-error the unit was never measured, so there is no such member
  const micros = entry.grossTime?.timeMicros;
  return { ms, share, micros };
}
void _timings;

// The ABAP entry says what the feed actually carries, and says it is there.
function _abapEntry(entry: IAbapTraceEntry) {
  const user: string = entry.user;
  const system: string = entry.system;
  const client: string = entry.client;
  const aggregated: boolean = entry.isAggregated;
  const finished: string = entry.state.text;
  // @ts-expect-error the feed carries no such field
  const nothing = entry.tracedProgramLine;
  return { user, system, client, aggregated, finished, nothing };
}
void _abapEntry;

/**
 * A consumer's own profiler. Nothing from this package implements it here —
 * that is the point: the contract must be satisfiable by somebody else's class.
 */
const _profiler: IProfiler = {
  kind: 'profiler',
  // One real entry rather than `[]`: an empty array satisfies any element type,
  // so it proves nothing about whether the shape can actually be built.
  list: async (options?: { user?: string }) => {
    void options?.user;
    return answered([
      {
        id: 'ABCDEF0123456789ABCD',
        recordedAt: '2026-08-29T06:09:50Z',
        user: 'SOMEONE',
        objectName: 'ZCL_SOMETHING=========CP',
        state: { value: 'R', text: 'Finished' },
        expiresAt: '2026-09-24T06:09:50Z',
        system: 'ABC',
        client: '100',
        host: 'somehost',
        size: 8,
        runtime: 554,
        runtimeABAP: 553,
        runtimeSystem: 1,
        runtimeDatabase: 0,
        isAggregated: false,
        amdpFileSize: 0,
      },
    ]);
  },
  // An implementer must write this generically — a union parameter does NOT
  // satisfy it, and the compiler says so. That is the contract working: the
  // return type depends on which view was asked for, and a method that took a
  // union could not honour that dependency.
  read: async <K extends keyof IAbapTraceViews>(
    traceId: string,
    view: K,
    ...args: ViewArgs<IAbapTraceViews, K>
  ): Promise<IAdtResponse<ViewResult<IAbapTraceViews, K>>> => {
    void traceId;
    void view;
    void args;
    // A real one parses the response; the assertion here is about the
    // signature, so this is the narrowest thing that satisfies it.
    return undefined as never;
  },
  // Deletion is part of the contract now, so an implementer owes it — a
  // profiler that only reads no longer satisfies `IProfiler`.
  delete: async (traceId: string) => {
    void traceId;
    return answered(undefined);
  },
};
void _profiler;

async function _profilerCalls(p: IProfiler) {
  const rows = read(await p.read('t1', 'hitlist')).entries;
  await p.read('t1', 'statements', {
    id: 7,
    withDetails: true,
    autoDrillDownThreshold: 20,
    withSystemEvents: false,
  });
  const total = read(await p.read('t1', 'dbAccesses')).accesses[0]?.accessTime
    ?.total;
  const kind: 'profiler' = p.kind;

  // A consumer's own reading keeps its own type. It is chosen when the
  // implementation is constructed — `readWith(parse, …)` at the call site is
  // gone, and with it the second signature every implementer owed.
  const mine = read(await p.read('t1', 'hitlist'));

  // Deletion answers with nothing to read — but it still answers, so a caller
  // is made to ask whether it happened.
  const deleted: void = read(await p.delete('t1'));

  // @ts-expect-error a cross-trace option is not a profiler option
  await p.list({ traceUser: 'A' });

  return { rows, total, kind, mine, deleted };
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
