// Compile-only assertions. If these stop compiling, the types regressed.

import type { IAdtCreatable, IAdtUpdatable } from '../adt/IAdtCapabilities';
import type { IAdtUpdateOptions } from '../adt/IAdtObject';
import type { IAdtResponse } from '../adt/IAdtResponse';

const answered = <T>(value: T): IAdtResponse<T> => ({
  ok: true,
  getResult: () => ({ value }),
});

const headers = { accept: 'text/plain', contentType: 'text/plain' };

const _updatable: IAdtUpdatable<{ name: string }, string> = {
  update: async (config: { name: string }, options: IAdtUpdateOptions) => {
    void config.name;
    return answered(options.ifMatch ?? '');
  },
};

// An update takes the ETag of its read, and goes without one as before.
void _updatable.update(
  { name: 'ZPROG' },
  { headers, source: 'REPORT zprog.', ifMatch: '202611030852340001' },
);
void _updatable.update({ name: 'ZPROG' }, { headers, source: 'REPORT zprog.' });
// @ts-expect-error the ETag is a string
void _updatable.update({ name: 'ZPROG' }, { headers, ifMatch: 202611030852 });

declare const _creatable: IAdtCreatable<{ name: string }, string>;
// A create replaces no document, so it takes no ETag.
// @ts-expect-error ifMatch is an update's
void _creatable.create({ name: 'ZPROG' }, { headers, ifMatch: '1' });
