// Compile-only assertions. If these stop compiling, the types regressed.

import type { IAdtActivatable } from '../adt/IAdtCapabilities';
import type { IAdtHeaders } from '../adt/IAdtContentTypes';
import type { IAdtOperationOptions } from '../adt/IAdtObject';
import type { IAdtResponse } from '../adt/IAdtResponse';

const answered = <T>(value: T): IAdtResponse<T> => ({
  ok: true,
  getResult: () => ({ value }),
});

const headers: IAdtHeaders = {
  accept: 'application/xml',
  contentType: 'application/xml',
};

declare const _activatable: IAdtActivatable<{ name: string }, string>;
const id = { name: 'ZCL_X' };

// A caller asks for the activation without the preaudit, or leaves it out.
void _activatable.activate(id, { headers, preauditRequested: false });
void _activatable.activate(id, { headers });

// @ts-expect-error preauditRequested is a boolean
void _activatable.activate(id, { headers, preauditRequested: 'no' });

// An implementer written against the narrower options still is one.
const _narrow: IAdtActivatable<{ name: string }, string> = {
  activate: async (
    config: { name: string },
    options: { headers: IAdtHeaders } & IAdtOperationOptions,
  ) => {
    void options.headers;
    return answered(config.name);
  },
};
void _narrow;
