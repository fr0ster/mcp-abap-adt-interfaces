// Compile-only assertions for 33.0.0. If these stop compiling, the types
// regressed.
//
// **The `IAnalyse` example narrows before reading its own field.** The
// generic answer is `E | IAdtError` since 32.0.0, so the example's
// `answer.getError().t100` stopped compiling; it reads the field after
// narrowing, as `IAdtObject.ts` now shows.

import type { IAdtReadable } from '../adt/IAdtCapabilities';
import type { IAnalyse } from '../adt/IAdtObject';
import type { IProgramConfig } from '../adt/IAdtProgram';
import type { IAdtError } from '../adt/IAdtResponse';

interface IT100Failure extends IAdtError {
  readonly t100: { msgid: string; msgno: string };
}
declare const t100: IAnalyse<IT100Failure>;
declare const program: IAdtReadable<IProgramConfig, string, 'programName'>;

export async function documentedExample(): Promise<void> {
  const answer = await program.read({ programName: 'ZPROG' }, undefined, {
    analyse: t100,
  });
  if (!answer.ok) {
    // @ts-expect-error the library's own IAdtError has no t100
    void answer.getError().t100;
    const failure = answer.getError();
    if ('t100' in failure) void failure.t100;
  }
}
