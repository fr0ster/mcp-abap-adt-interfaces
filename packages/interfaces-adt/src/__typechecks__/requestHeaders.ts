// Compile-only assertions. If these stop compiling, the types regressed.
//
// A member whose request sets both `Accept` and `Content-Type` takes them as
// `options.headers`, typed `IAdtHeaders` and required: the pair whole, and the
// member sends exactly that pair. A member whose request sets one of them, or
// neither, is as it was: no `headers`. The field is on each member's own
// options, not on the shared `IAdtAnalyseOptions` / `IAdtOperationOptions`.
// headersOnEveryMember.ts holds this for every member; these are call sites.

import type {
  IAdtActivatable,
  IAdtCreatable,
  IAdtLockable,
  IAdtReadable,
  IAdtUpdatable,
} from '../adt/IAdtCapabilities';
import type { IAdtHeaders } from '../adt/IAdtContentTypes';
import type {
  IAdtAnalyseOptions,
  IAdtOperationOptions,
} from '../adt/IAdtObject';
import type { IAdtDataPreview } from '../adt/IAdtUtilities';
import type { ITraceDeletion } from '../runtime/ITrace';

interface IClassConfig {
  className: string;
}

const headers: IAdtHeaders = {
  accept: 'application/xml',
  contentType: 'application/xml',
};

declare const creator: IAdtCreatable<IClassConfig, string>;
declare const writer: IAdtUpdatable<IClassConfig, string>;
declare const activator: IAdtActivatable<IClassConfig, string>;
declare const preview: IAdtDataPreview<unknown, unknown, unknown>;
declare const source: IAdtReadable<IClassConfig, string>;
declare const locker: IAdtLockable<IClassConfig>;
declare const deletion: ITraceDeletion;

// Both headers today: the pair is required, beside the member's own options.
void creator.create({ className: 'ZCL_X' }, { headers });
void writer.update({ className: 'ZCL_X' }, { source: 'x', headers });
void activator.activate({ className: 'ZCL_X' }, { headers });
void preview.getSqlQuery({ sql_query: 'SELECT 1' }, { headers });

// With the error strategy too: the generic overload takes it.
void creator.create(
  { className: 'ZCL_X' },
  { headers, analyse: (verdict) => verdict },
);

// Without it, the call does not compile: the member supplies no headers itself.
// @ts-expect-error the request's headers are required
void creator.create({ className: 'ZCL_X' });
// @ts-expect-error the request's headers are required
void writer.update({ className: 'ZCL_X' }, { source: 'x' });

// A partial pair is refused: the pair is given whole, not merged field by field.
void creator.create(
  {
    className: 'ZCL_X',
  },
  {
    // @ts-expect-error `contentType` is missing; the pair is not an override.
    headers: { accept: 'application/xml' },
  },
);
void writer.update(
  { className: 'ZCL_X' },
  {
    source: 'x',
    // @ts-expect-error `accept` is missing; the pair is not an override.
    headers: { contentType: 'text/plain' },
  },
);

// A create still refuses source beside it.
void creator.create(
  { className: 'ZCL_X' },
  // @ts-expect-error a create carries no source.
  { headers, source: 'x' },
);

// One header today, or none: the member is as it was, and takes no `headers`.
void source.read({ className: 'ZCL_X' });
// @ts-expect-error a read sets only Accept, and takes no headers
void source.read({ className: 'ZCL_X' }, 'active', { headers });
void locker.lock({ className: 'ZCL_X' });
// @ts-expect-error a lock sets only Accept, and takes no headers
void locker.lock({ className: 'ZCL_X' }, { headers });
void locker.unlock({ className: 'ZCL_X' }, 'handle');
// @ts-expect-error an unlock sets neither
void locker.unlock({ className: 'ZCL_X' }, 'handle', { headers });
void deletion.delete('id');
// @ts-expect-error a trace DELETE sets neither
void deletion.delete('id', { headers });

// The shared options do not carry it: each member's own signature does.
// @ts-expect-error not on the options shared by every member.
const _analyse: IAdtAnalyseOptions = { headers };
void _analyse;
// @ts-expect-error not on the options shared by every member.
const _operation: IAdtOperationOptions = { headers };
void _operation;
