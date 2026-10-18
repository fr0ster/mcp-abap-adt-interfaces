// Compile-only assertions. If these stop compiling, the types regressed.
//
// A read member takes the headers of its one request as `options.headers`,
// typed `IAdtHeaders`: the pair whole, or nothing. A write does not take it —
// the field is on the read members' own options, not on the shared
// `IAdtAnalyseOptions` / `IAdtOperationOptions`.

import type {
  IAdtMetadataReadable,
  IAdtReadable,
  IAdtUpdatable,
} from '../adt/IAdtCapabilities';
import type { IAdtHeaders } from '../adt/IAdtContentTypes';
import type {
  IAdtAnalyseOptions,
  IAdtOperationOptions,
} from '../adt/IAdtObject';
import type { IAdtRequest } from '../adt/IAdtTransport';
import type { IFeedRepository } from '../feeds/IFeedRepository';
import type { ITraceReading, ITraceView } from '../runtime/ITrace';

interface IClassConfig {
  className: string;
}

const headers: IAdtHeaders = {
  accept: 'text/plain',
  contentType: 'text/plain',
};

declare const source: IAdtReadable<IClassConfig, string>;
declare const metadata: IAdtMetadataReadable<IClassConfig, string>;
declare const writer: IAdtUpdatable<IClassConfig, string>;
declare const feeds: IFeedRepository<
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown
>;
declare const transports: IAdtRequest<unknown>;
declare const traces: ITraceReading<{
  hitlist: ITraceView<unknown, { withSystemEvents?: boolean } | undefined>;
  records: ITraceView<unknown>;
}>;

// A read takes the pair whole, beside its own options.
void source.read({ className: 'ZCL_X' }, 'active', {
  headers,
  withLongPolling: true,
});
void metadata.readMetadata({ className: 'ZCL_X' }, { headers });
void feeds.dumps({ headers, maxResults: 10 });
void transports.list({ configUri: '/sap/bc/adt/cts/x', headers });
void traces.read('id', 'hitlist', { headers, withSystemEvents: true });
void traces.read('id', 'records', { headers });

// Without it, nothing changes.
void source.read({ className: 'ZCL_X' });
void traces.read('id', 'records');

// With the error strategy too: the generic overload takes it.
void source.read({ className: 'ZCL_X' }, undefined, {
  headers,
  analyse: (verdict) => verdict,
});

// A partial pair is refused: the pair is given whole, not merged field by field.
void source.read({ className: 'ZCL_X' }, 'active', {
  // @ts-expect-error `contentType` is missing; the pair is not an override.
  headers: { accept: 'text/plain' },
});
void feeds.dumps({
  // @ts-expect-error `accept` is missing; the pair is not an override.
  headers: { contentType: 'text/plain' },
});

// A write does not take it, nor do the shared options.
void writer.update(
  { className: 'ZCL_X' },
  {
    source: 'x',
    // @ts-expect-error `headers` is on the read members only.
    headers,
  },
);
// @ts-expect-error not on the options shared with writes.
const _analyse: IAdtAnalyseOptions = { headers };
void _analyse;
// @ts-expect-error not on the options shared with writes.
const _operation: IAdtOperationOptions = { headers };
void _operation;
