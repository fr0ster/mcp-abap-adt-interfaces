// Compile-only assertions. If these stop compiling, the types regressed.

import type {
  IAdtClientOptions,
  IAdtSystemContext,
} from '../adt/IAdtClientOptions';
import type { IAdtContentTypes } from '../adt/IAdtContentTypes';

// Every field is optional: a client can be built with no configuration at all.
const _empty: IAdtClientOptions = {};
void _empty;

// contentTypes is typed by the contract's IAdtContentTypes, not by a
// concrete implementation — a consumer's own content-type set satisfies it
// without importing adt-clients.
declare const contentTypes: IAdtContentTypes;
const _configured: IAdtClientOptions = {
  enableAcceptCorrection: true,
  contentTypes,
  unicode: false,
};
void _configured;

const _context: IAdtSystemContext = {
  masterSystem: 'TRL',
  responsible: 'CB99',
};
void _context;
