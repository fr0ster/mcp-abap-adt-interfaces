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
