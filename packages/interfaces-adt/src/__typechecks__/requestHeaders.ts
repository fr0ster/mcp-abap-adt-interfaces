// Compile-only assertions. If these stop compiling, the types regressed.
//
// A member whose endpoint needs `Accept` and/or `Content-Type` takes the whole
// pair as `options.headers`, typed `IAdtHeaders` and required, and sends exactly
// that pair. A member whose endpoint needs neither takes no `headers` at all. The
// field is on each member's own options, not on the shared
// `IAdtAnalyseOptions` / `IAdtOperationOptions`.
// headersOnEveryMember.ts holds this for every member; these are call sites.

import type {
  IAdtCreatable,
  IAdtLockable,
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
import type {
  ITraceDeletion,
  ITraceReading,
  ITraceView,
} from '../runtime/ITrace';

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
declare const creator: IAdtCreatable<IClassConfig, string>;
declare const locker: IAdtLockable<IClassConfig>;
declare const deletion: ITraceDeletion;
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

// Without it, the call does not compile: the member supplies no headers itself.
// @ts-expect-error the request's headers are required
void source.read({ className: 'ZCL_X' });
// @ts-expect-error the request's headers are required
void source.read({ className: 'ZCL_X' }, 'active', { withLongPolling: true });
// @ts-expect-error the request's headers are required
void traces.read('id', 'records');
// @ts-expect-error the request's headers are required
void traces.read('id', 'hitlist', {});

// A member whose endpoint needs no headers takes none.
void deletion.delete('id', {});
// @ts-expect-error a DELETE of a trace carries no headers
void deletion.delete('id', { headers });

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

// A write takes it the same way: create, update and lock require the pair.
// @ts-expect-error the request's headers are required
void creator.create({ className: 'ZCL_X' }, {});
void creator.create({ className: 'ZCL_X' }, { headers });
void writer.update({ className: 'ZCL_X' }, { source: 'x', headers });
void locker.lock({ className: 'ZCL_X' }, { headers });
// unlock takes none: no body, and its answer is never read.
void locker.unlock({ className: 'ZCL_X' }, 'handle');
// @ts-expect-error an unlock carries no headers
void locker.unlock({ className: 'ZCL_X' }, 'handle', { headers });
void writer.update(
  { className: 'ZCL_X' },
  {
    source: 'x',
    // @ts-expect-error `contentType` is missing; the pair is not an override.
    headers: { accept: 'text/plain' },
  },
);

// A create still refuses source beside it.
void creator.create(
  { className: 'ZCL_X' },
  // @ts-expect-error a create carries no source.
  { headers, source: 'x' },
);

// The shared options do not carry it: each member's own signature does.
// @ts-expect-error not on the options shared by every member.
const _analyse: IAdtAnalyseOptions = { headers };
void _analyse;
// @ts-expect-error not on the options shared by every member.
const _operation: IAdtOperationOptions = { headers };
void _operation;
