// Compile-only assertions. If these stop compiling, the types regressed.
//
// `variants()` used to take no parameter while the endpoint requires a
// category, so the one call the contract permitted was the one that could not
// work — a 400 every time. The refusal below is the whole point of the change:
// a signature that accepts the broken call is the signature that was there.

import type { IAdtResponse } from '../adt/IAdtResponse';
import type { IFeedRepository } from '../feeds/IFeedRepository';
import type { IFeedVariant } from '../feeds/types';

declare const feeds: IFeedRepository;

/** A category is passed, and the result is the variant list. */
const withCategory: Promise<IAdtResponse<IFeedVariant[]>> =
  feeds.variants('dumps');

/** No category is refused at compile time, not at 400. */
const withoutCategory: Promise<IAdtResponse<IFeedVariant[]>> =
  // @ts-expect-error variants() requires a category — the endpoint does
  feeds.variants();

/** Not a union: any string is accepted, because none could be enumerated. */
declare const fromConfig: string;
const anyString: Promise<IAdtResponse<IFeedVariant[]>> =
  feeds.variants(fromConfig);

export type { IFeedRepository };
export { withCategory, withoutCategory, anyString };
