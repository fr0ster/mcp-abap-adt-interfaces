// Compile-only assertions. If these stop compiling, the types regressed.
//
// A strategy is how a consumer says what an answer should become. It is a type
// here and a function there: this package emits nothing, so the assertions below
// stand in for the implementations `@mcp-abap-adt/adt-clients` ships.

import type { IAdtWireResponse, IResultStrategy } from '../index';

const answer: IAdtWireResponse = {
  data: '<pak:package/>',
  status: 200,
  statusText: 'OK',
  headers: {},
};

/** The whole document, untouched — what a backup consumer needs. */
const raw: IResultStrategy<string> = (wire) => String(wire.data);

/** A reading that needs more than the body. */
const withEtag: IResultStrategy<{ etag?: unknown; body: string }> = (wire) => ({
  etag: wire.headers.etag,
  body: String(wire.data),
});

/** A strategy is data: it can be held, passed and swapped. */
const chosen: IResultStrategy<string> = raw;

export const _resultStrategyAssertions = [
  chosen(answer),
  withEtag(answer).body,
] as const;
