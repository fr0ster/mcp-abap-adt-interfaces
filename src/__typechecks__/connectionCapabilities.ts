// Compile-only assertions. If these stop compiling, the types regressed.

import type {
  IAbapConnection,
  IAdtWireResponse,
} from '../connection/IAbapConnection';
import {
  ADT_SESSION_ERROR,
  type AdtSessionErrorCode,
  type ISessionLifecycleAware,
} from '../connection/IConnectionCapabilities';

// The point of the split: a transport that owns no HTTP session is STILL a
// valid IAbapConnection. If the atom ever migrates into IAbapConnection, this
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
    }) as unknown as IAdtWireResponse<T, D>,
};
void _sessionless;

// And a connection that owns its session composes the atom alongside it.
const _full: IAbapConnection & ISessionLifecycleAware = {
  ..._sessionless,
  disconnect: async () => {},
  isConnected: () => true,
  getSessionIdentity: () => 'SAP_SESSIONID_T_100=S1',
};
void _full;

// disconnect() resolves to nothing: a teardown reports through the connection's
// own state, not through a value the caller has to interpret.
const _void: Promise<void> = _full.disconnect();
void _void;

// No options, and this is what keeps it that way: a deadline bounded a wait for
// an answer nothing acts on, so passing one must NOT compile. The two lines this
// replaces were left over from the old contract — "the deadline is optional...
// both call shapes must type-check" — sitting directly above the assertion that
// one of those shapes does not.
// @ts-expect-error disconnect() takes nothing
void _full.disconnect({ deadlineMs: 0 });

// The codes are values, so a consumer can match on them rather than on a
// message. Every member must widen to the code type.
const _codes: AdtSessionErrorCode[] = [
  ADT_SESSION_ERROR.NOT_CONNECTED,
  ADT_SESSION_ERROR.SESSION_REPLACED,
  ADT_SESSION_ERROR.RELEASE_PENDING,
];
void _codes;

// A batch recorder is a legitimate IAbapConnection whose responses arrive late.
// The atom says so; nothing in IAbapConnection can.
import type { IDeferredResponseConnection } from '../connection/IConnectionCapabilities';

const _deferring: IAbapConnection & IDeferredResponseConnection = {
  ..._sessionless,
  responsesAreDeferred: true,
};
void _deferring;

// The atom is enough to narrow with: a consumer writes the guard themselves,
// which is the point of it being a shape rather than a function this package
// ships. Nothing executable is needed here, only the declaration to check
// against.
function theirGuard<T extends object>(
  connection: T,
): connection is T & IDeferredResponseConnection {
  return (
    (connection as Partial<IDeferredResponseConnection>)
      .responsesAreDeferred === true
  );
}

const _narrowed: IAbapConnection = _sessionless;
if (theirGuard(_narrowed)) {
  const _flag: true = _narrowed.responsesAreDeferred;
  void _flag;
}

// @ts-expect-error the flag is `true`, not `boolean`: "sometimes deferred" is not a state.
const _sometimes: IDeferredResponseConnection = { responsesAreDeferred: false };
void _sometimes;
