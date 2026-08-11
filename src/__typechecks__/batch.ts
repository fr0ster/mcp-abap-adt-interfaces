// Compile-only assertions. If these stop compiling, the types regressed.

import type {
  IBatchPayload,
  IBatchRequestPart,
  IBatchResponsePart,
} from '../adt/IAdtBatch';

// A consumer that builds a batch payload itself needs these to be
// describable without importing the implementation package.
const _part: IBatchRequestPart = {
  method: 'GET',
  url: '/sap/bc/adt/oo/classes/zcl_foo/source/main',
  headers: { Accept: 'text/plain' },
  data: '',
  params: { version: 'active' },
};
void _part;

// @ts-expect-error url is required, not optional
const _partMissingField: IBatchRequestPart = {
  method: 'GET',
  headers: {},
};
void _partMissingField;

const _payload: IBatchPayload = {
  boundary: 'batch_1234',
  body: '--batch_1234--',
};
void _payload;

// @ts-expect-error body is required, not optional
const _payloadMissingField: IBatchPayload = {
  boundary: 'batch_1234',
};
void _payloadMissingField;

const _response: IBatchResponsePart = {
  status: 200,
  statusText: 'OK',
  headers: { 'content-type': 'text/plain' },
  data: 'CLASS zcl_foo IMPLEMENTATION.',
};
void _response;

// @ts-expect-error data is required, not optional
const _responseMissingField: IBatchResponsePart = {
  status: 200,
  statusText: 'OK',
  headers: {},
};
void _responseMissingField;
