// Compile-only assertions. If these stop compiling, the types regressed.

import type {
  IListTransportsOptions,
  IListTransportsParams,
  ITransportSearchConfiguration,
} from '../adt/IAdtTransport';

// The low level cannot be called without naming a configuration. This is the
// whole point of the split: that layer requests, it does not resolve.
const _low: IListTransportsParams = { configUri: '/sap/bc/adt/cts/x' };
void _low;

// @ts-expect-error configUri is required at the low level.
const _lowEmpty: IListTransportsParams = {};
void _lowEmpty;

// The high level may omit it, which opts into resolution.
const _highEmpty: IListTransportsOptions = {};
const _highNamed: IListTransportsOptions = { configUri: '/sap/bc/adt/cts/x' };
void _highEmpty;
void _highNamed;

// A configuration is addressable and carries its attributes verbatim. There is
// no name and no default marker in the payload — do not add one to the type.
const _config: ITransportSearchConfiguration = {
  uri: '/sap/bc/adt/cts/transportrequests/searchconfiguration/configurations/7E5B',
  etag: '20260807095048',
  attributes: { createdBy: 'CB9980008038', client: '100' },
};
void _config;

// etag is optional: a link may not carry one.
const _noEtag: ITransportSearchConfiguration = { uri: '/x', attributes: {} };
void _noEtag;

// uri is required: this would fail if it became optional.
// @ts-expect-error uri is required.
const _noUri: ITransportSearchConfiguration = { attributes: {} };
void _noUri;
