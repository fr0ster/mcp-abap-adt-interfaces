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
  contentTypes,
  unicode: false,
};
void _configured;

const _context: IAdtSystemContext = {
  masterSystem: 'TRL',
  responsible: 'CB99',
};
void _context;

// **No signal, no refusal** (removed in 16.0.0). If either comes back, this
// stops compiling.
import type { IAdtError } from '../adt/IAdtResponse';

// @ts-expect-error a client takes no signal
const _noSignal: IAdtClientOptions = { signal: new AbortController().signal };
void _noSignal;

const _noRefusal: IAdtError = {
  origin: 'connection',
  message: 'x',
  // @ts-expect-error an error carries no refusal
  refusal: {},
};
void _noRefusal;

// **No accept correction** (removed in 20.0.0): the headers travel with the
// call, and correcting a refused format is the consumer's. If the field comes
// back, this stops compiling.
// @ts-expect-error a client takes no accept-correction switch
const _noAcceptCorrection: IAdtClientOptions = { enableAcceptCorrection: true };
void _noAcceptCorrection;
