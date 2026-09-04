// Compile-only assertions. If these stop compiling, the types regressed.
//
// Two things are asserted here. `variants()` takes a category because the
// endpoint requires one — it used to take none, so the single call the contract
// permitted was the one that could not work, a 400 every time. And since 31.0.0
// the shapes a feed reading answers are the implementation's: this file declares
// its own, which is exactly what a consumer replacing `adt-clients` does.

import type { IAdtResponse } from '../adt/IAdtResponse';
import type { IFeedRepository } from '../feeds/IFeedRepository';

/** A consumer's own readings. Nothing here comes from the contract. */
interface MyFeed {
  href: string;
}
interface MyVariant {
  id: string;
}
interface MyEntry {
  at: string;
  text: string;
}

type Feeds = IFeedRepository<
  MyFeed[],
  MyVariant[],
  MyEntry[],
  MyEntry[],
  MyEntry[],
  string
>;

declare const feeds: Feeds;

/** A category is passed, and the result is the reading this implementation performs. */
const withCategory: Promise<IAdtResponse<MyVariant[]>> =
  feeds.variants('dumps');

/** No category is refused at compile time, not at 400. */
const withoutCategory: Promise<IAdtResponse<MyVariant[]>> =
  // @ts-expect-error variants() requires a category — the endpoint does
  feeds.variants();

/** Not a union: any string is accepted, because none could be enumerated. */
declare const fromConfig: string;
const anyString: Promise<IAdtResponse<MyVariant[]>> =
  feeds.variants(fromConfig);

/** The contract names no shape of its own, so this one cannot be assumed. */
// @ts-expect-error this implementation answers MyVariant[], not MyFeed[]
const wrongShape: Promise<IAdtResponse<MyFeed[]>> = feeds.variants('dumps');

export type { Feeds, MyFeed, MyVariant, MyEntry };
export { withCategory, withoutCategory, anyString, wrongShape };
