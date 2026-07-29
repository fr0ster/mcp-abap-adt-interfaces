// Compile-only assertions. If these stop compiling, the types regressed.

import type {
  IAbapConnection,
  IAdtResponse,
} from '../connection/IAbapConnection';
import {
  ADT_SESSION_ERROR,
  type AdtSessionErrorCode,
  type ILockWindowAware,
  type ISessionLifecycleAware,
  type ITeardownReport,
  type WindowToken,
} from '../connection/IConnectionCapabilities';

// The point of the split: a transport that owns no HTTP session is STILL a
// valid IAbapConnection. If the atoms ever migrate into IAbapConnection, this
// stops compiling — which is the warning, since RFC connections, batch
// recorders and test stubs all live here.
const _sessionless: IAbapConnection = {
  connect: async () => {},
  getBaseUrl: async () => 'https://h',
  getSessionId: () => null,
  setSessionType: () => {},
  // Generic in T/D, so the stub must be too — a fixed `data` shape cannot
  // satisfy a caller that asks for its own.
  makeAdtRequest: async <T = unknown, D = unknown>() =>
    ({
      data: undefined,
      status: 200,
      statusText: 'OK',
      headers: {},
    }) as unknown as IAdtResponse<T, D>,
};
void _sessionless;

// And a connection that supports everything composes the atoms alongside it.
const _full: IAbapConnection & ISessionLifecycleAware & ILockWindowAware = {
  ..._sessionless,
  disconnect: async () => ({ abandonedWindows: [], releasePending: false }),
  isConnected: () => true,
  getSessionIdentity: () => 'SAP_SESSIONID_T_100=S1',
  beginWindow: (label: string) => Symbol(label),
  endWindow: () => {},
};
void _full;

// Windows are distinguishable per occurrence, not per label: the same object
// locked twice must close twice, and a stale token must not close a live window.
const _first: WindowToken = _full.beginWindow('Class/ZCL_X');
const _second: WindowToken = _full.beginWindow('Class/ZCL_X');
const _distinct: boolean = _first !== _second;
void _distinct;

const _report: ITeardownReport = {
  abandonedWindows: ['Class/ZCL_X'],
  releasePending: true,
};
void _report;

// The codes are values, so a consumer can match on them rather than on a
// message. Every member must widen to the code type.
const _codes: AdtSessionErrorCode[] = [
  ADT_SESSION_ERROR.NOT_CONNECTED,
  ADT_SESSION_ERROR.SESSION_REPLACED,
  ADT_SESSION_ERROR.RELEASE_PENDING,
];
void _codes;
