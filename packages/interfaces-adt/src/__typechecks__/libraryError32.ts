// Compile-only assertions for 32.0.0. If these stop compiling, the types
// regressed.
//
// **A generic answer says the library may answer too.** With `analyse` given,
// a member answers the error `analyse` made, except where the library answers
// with its own: no answer came back and `analyse` cleared the verdict, a chain
// step answered without a strategy, or a member a system does not serve
// refused without a request. So every generic overload answers
// `IAdtResponse<T, E | IAdtError>` (for the abapGit facts,
// `E | IAbapGitStructuredError`), and a caller narrows the error before reading
// its own fields.

import type { IAbapGitFactsResponse } from '../adt/IAdtAbapGit';
import type { IAdtReadable } from '../adt/IAdtCapabilities';
import type { IAnalyse } from '../adt/IAdtObject';
import type { IProgramConfig } from '../adt/IAdtProgram';
import type { IAdtError, IAdtResponse } from '../adt/IAdtResponse';
import type { IAtcRunStatusReadable } from '../runtime/IAtcRun';

/** A consumer's own error, with a field the library's error does not have. */
interface IMyError extends IAdtError {
  readonly mine: true;
}
declare const mine: IAnalyse<IMyError>;

declare const program: IAdtReadable<IProgramConfig, string, 'programName'>;

export async function _narrowsOnlyAfterACheck(): Promise<void> {
  const answer = await program.read({ programName: 'ZPROG' }, undefined, {
    analyse: mine,
  });
  const wide: IAdtResponse<string, IMyError | IAdtError> = answer;
  void wide;
  // @ts-expect-error the library's own error may come back too
  const narrow: IAdtResponse<string, IMyError> = answer;
  void narrow;

  // The plain overload answers the library's error, as before.
  const plain: IAdtResponse<string> = await program.read({
    programName: 'ZPROG',
  });
  void plain;
}

declare const atc: IAtcRunStatusReadable<string>;
export async function _runtimeContractsToo(): Promise<void> {
  const status = await atc.getRunStatus('RUN', { analyse: mine });
  // @ts-expect-error a runtime contract's generic answer is widened as well
  const narrow: IAdtResponse<string, IMyError> = status;
  void narrow;
}

export type _FactsResponseStillExported = IAbapGitFactsResponse<unknown>;
