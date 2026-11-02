// Compile-only assertions. If these stop compiling, the types regressed.

import type { IAdtResponse } from '../adt/IAdtResponse';
import type {
  IAtcResultListOptions,
  IAtcResultsReadable,
} from '../runtime/IAtcRun';

const answered = <T>(value: T): IAdtResponse<T> => ({
  ok: true,
  getResult: () => ({ value }),
});

const _results: IAtcResultsReadable<string, string> = {
  listResults: async (
    options: IAtcResultListOptions,
  ): Promise<IAdtResponse<string>> => {
    void options.createdBy;
    return answered('<atcresult:resultList/>');
  },
  getResult: async (displayId: string): Promise<IAdtResponse<string>> => {
    void displayId;
    return answered('<atcresult:resultList/>');
  },
};

void _results.listResults({ createdBy: '*' });
void _results.listResults({
  createdBy: '*',
  centralOnly: true,
  ageMin: 0,
  ageMax: 30,
});
void _results.getResult('E6AC99B2161F1FE1B5A1E9B68E5CD628');

// Whose results is the caller's to state: no call asks for every user's by
// leaving it out.
// @ts-expect-error createdBy is required
void _results.listResults({ centralOnly: true });
// @ts-expect-error the options are required, for createdBy
void _results.listResults();

// Only the parameters measured to act are offered.
// @ts-expect-error activeResult is not offered
void _results.listResults({ createdBy: '*', activeResult: true });
// @ts-expect-error contactPerson is not offered
void _results.listResults({ createdBy: '*', contactPerson: 'X' });
// @ts-expect-error includeExemptedFindings is not offered
void _results.getResult('D', { includeExemptedFindings: true });
