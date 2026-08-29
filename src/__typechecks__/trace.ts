// Compile-only assertions. If these stop compiling, the types regressed.
//
// Half of these are @ts-expect-error: a constraint that only ever accepts is
// not a constraint, and each of the four refusals below is one this design was
// written to produce.

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

// A map whose members are not views is refused WHERE IT IS DECLARED, not at the
// call site with a result of `never`.
interface IBadViews {
  hitlist: string;
}
// @ts-expect-error a view map must be made of views
type _Bad = ITraceReading<IBadViews>;

/** A family with views: the shape `IProfiler` will have. */
type WithViews = ITraceFamily<'probe', ITraceEntry, { user?: string }> & Reader;

/** A family without views says nothing about reading — and needs no `read`. */
type ListingOnly = ITraceFamily<'listing-only'>;

const _listingOnly: ListingOnly = {
  kind: 'listing-only',
  list: async () => [],
};

async function _assertions(
  family: WithViews,
  required: RequiredOptionReader,
  noOptions: NoOptionReader,
) {
  // The result is typed, not `any`.
  const gross: number = (await family.read('t', 'hitlist')).entries[0]
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
  const hits = await family.read('t', 'hitlist');
  // @ts-expect-error hitlist entries carry no `statement`
  const _wrong: string = hits.entries[0].statement;

  const count: number = (await noOptions.read('t', 'records')).count;

  // The literal kind still discriminates.
  const kind: 'probe' = family.kind;

  // The listing carries its own options type.
  const listing: ITraceListing<ITraceEntry, { user?: string }> = family;
  const entries = await listing.list({ user: 'SOMEONE' });

  return { gross, count, kind, id: entries[0]?.id };
}

export type { Reader, WithViews, ListingOnly };
export { _listingOnly, _assertions };

// ---------------------------------------------------------------------------
// The published families, and who is NOT obliged to schedule.

import type { IAdtRunnable } from '../execution/IAdtRunnable';
import type {
  IAtcRunOptions,
  IAtcRunResult,
  IAtcRunTarget,
} from '../runtime/IAtcRun';
import type { IAbapTraceViews, IProfiler } from '../runtime/IProfiler';

/**
 * A consumer's own profiler. Nothing from this package implements it here —
 * that is the point: the contract must be satisfiable by somebody else's class.
 */
const _profiler: IProfiler = {
  kind: 'profiler',
  list: async (options?: { user?: string }) => {
    void options?.user;
    return [];
  },
  // An implementer must write this generically — a union parameter does NOT
  // satisfy it, and the compiler says so. That is the contract working: the
  // return type depends on which view was asked for, and a method that took a
  // union could not honour that dependency.
  read: async <K extends keyof IAbapTraceViews>(
    traceId: string,
    view: K,
    ...args: ViewArgs<IAbapTraceViews, K>
  ): Promise<ViewResult<IAbapTraceViews, K>> => {
    void traceId;
    void view;
    void args;
    // A real one parses the response; the assertion here is about the
    // signature, so this is the narrowest thing that satisfies it.
    return undefined as never;
  },
  // The consumer-supplied reader. Satisfiable by an object literal, which an
  // overload on `read` was not — the reason this is a second method.
  readWith: async <K extends keyof IAbapTraceViews, T>(
    parse: (data: unknown) => T,
    traceId: string,
    view: K,
    ...args: ViewArgs<IAbapTraceViews, K>
  ): Promise<T> => {
    void traceId;
    void view;
    void args;
    return parse('<trc:hitlist/>');
  },
};
void _profiler;

async function _profilerCalls(p: IProfiler) {
  const rows = (await p.read('t1', 'hitlist')).entries;
  await p.read('t1', 'statements', {
    id: 7,
    withDetails: true,
    autoDrillDownThreshold: 20,
    withSystemEvents: false,
  });
  const total = (await p.read('t1', 'dbAccesses')).accesses[0]?.accessTime
    ?.total;
  const kind: 'profiler' = p.kind;

  // A consumer's own reader keeps its own type — no fallback to a raw
  // response, and no obligation to accept ours.
  const mine: { rows: number } = await p.readWith(
    (data) => ({ rows: String(data).length }),
    't1',
    'hitlist',
  );

  // @ts-expect-error a cross-trace option is not a profiler option
  await p.list({ traceUser: 'A' });

  return { rows, total, kind, mine };
}
void _profilerCalls;

/**
 * An ATC-shaped runnable owes nothing to scheduling.
 *
 * If `ITraceScheduling` ever migrates onto `IAdtRunnable` or `IExecutor`, this
 * stops compiling — which is the guard, because the cost of that mistake is an
 * ATC run having to answer for trace parameters.
 */
const _atc: IAdtRunnable<IAtcRunTarget, IAtcRunResult, IAtcRunOptions> = {
  run: async (target, options) => {
    void target;
    void options;
    return undefined as never;
  },
};
void _atc;
