// Compile-only assertions for 32.0.0. If these stop compiling, the types
// regressed.
//
// **The transport operations take the overload pair every member has.** Until
// 32.0.0 eight of them kept one signature with a defaulted `E`, so a caller
// could name an error type and pass no `analyse` — the type argument promised
// an error the call had nothing to produce. Now a generic call needs the
// strategy, a plain call answers the library's error, and a generic answer is
// `E | IAdtError`.

import type { IAdtHeaders } from '../adt/IAdtContentTypes';
import type { IAnalyse } from '../adt/IAdtObject';
import type { IAdtError, IAdtResponse } from '../adt/IAdtResponse';
import type {
  IAdtTransportMoveObjects,
  IAdtTransportObjectActions,
  IAdtTransportSortAndCompress,
} from '../adt/IAdtTransport';

interface IMyError extends IAdtError {
  readonly mine: true;
}
declare const mine: IAnalyse<IMyError>;
declare const headers: IAdtHeaders;

declare const actions: IAdtTransportObjectActions<
  'removed',
  'added',
  'task',
  'log',
  'objects',
  'type'
>;
declare const compress: IAdtTransportSortAndCompress<'compressed'>;
declare const move: IAdtTransportMoveObjects<'moved'>;
const entry = { pgmid: 'R3TR', type: 'CLAS', name: 'ZCL_X', position: '1' };

export async function _theGenericNeedsTheStrategy(): Promise<void> {
  // @ts-expect-error naming the error type requires the strategy
  await actions.readActionLog<IMyError>('TR');
  // @ts-expect-error the same for readObjects
  await actions.readObjects<IMyError>('TR');
  // @ts-expect-error and for sortAndCompress
  await compress.sortAndCompress<IMyError>('TASK');
  // @ts-expect-error and for removeObject
  await actions.removeObject<IMyError>('TR', entry, { headers });
  // @ts-expect-error and for addObject
  await actions.addObject<IMyError>('TR', entry, { headers });
  // @ts-expect-error and for createTask
  await actions.createTask<IMyError>('TR', { headers, targetUser: 'U' });
  // @ts-expect-error and for changeTaskType
  await actions.changeTaskType<IMyError>('TASK', 'S', { headers });
  // @ts-expect-error and for moveObjects
  await move.moveObjects<IMyError>('A', 'B', [entry], { headers });

  // With the strategy, the answer is the caller's error or the library's.
  const log = await actions.readActionLog('TR', { analyse: mine });
  const wide: IAdtResponse<'log', IMyError | IAdtError> = log;
  void wide;
  // @ts-expect-error the library's own error may come back too
  const narrow: IAdtResponse<'log', IMyError> = log;
  void narrow;

  // Without one, the plain contract.
  const plain: IAdtResponse<'objects'> = await actions.readObjects('TR');
  void plain;
}
