// Compile-only assertions. If these stop compiling, the types regressed.

import type { IAdtHeaders } from '../adt/IAdtContentTypes';
import type { IAdtAnalyseOptions } from '../adt/IAdtObject';
import type { IAdtResponse } from '../adt/IAdtResponse';
import type { IAdtGroupActivationReference } from '../adt/IAdtShared';
import type { IAdtObjectActivation, IUtilResults } from '../adt/IAdtUtilities';

const answered = <T>(value: T): IAdtResponse<T> => ({
  ok: true,
  getResult: () => ({ value }),
});

// Something outside this package implements the synchronous group member.
class MyActivation implements IAdtObjectActivation<string, 'cloud'> {
  async activateObjects(
    objects: IAdtGroupActivationReference<'cloud'>[],
    preauditRequested: boolean | undefined,
    options: { headers: IAdtHeaders } & IAdtAnalyseOptions,
  ): Promise<IAdtResponse<string>> {
    void options.headers;
    return answered(`${objects.length} ${preauditRequested ?? false}`);
  }
}

declare const headers: IAdtHeaders;
const activation: IAdtObjectActivation<string, 'cloud'> = new MyActivation();
void activation.activateObjects(
  [{ name: 'ZCL_SOME_CLASS', type: 'CLAS/OC' }],
  false,
  { headers },
);
void activation.activateObjects(
  // @ts-expect-error ABAP cloud activates no program of one's own
  [{ name: 'ZSOME_PROGRAM', type: 'PROG/P' }],
  undefined,
  { headers },
);

// A full result set names the slot.
declare const withoutSlot: Omit<IUtilResults, 'objectActivation'>;
// @ts-expect-error objectActivation is required
const _withoutSlot: IUtilResults = withoutSlot;
void _withoutSlot;
