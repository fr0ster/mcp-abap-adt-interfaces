// Compile-only assertions. If these stop compiling, the types regressed.
//
// **The optional members (5.1.0).** A holder of an `IAbapConnection` calls a
// full connector's members — the teardown, the critical section, the session
// mode, the cookies, the configuration — with `?.`, and a connection that has
// none of them is still an `IAbapConnection`.

import type {
  IAbapConnection,
  IAbapConnectionConfig,
  IAdtWireResponse,
} from '../IAbapConnection';
import type {
  ICriticalSection,
  ISessionLifecycleAware,
} from '../IConnectionCapabilities';

// The five required members alone still make a connection: every optional
// member may be absent.
const _minimal: IAbapConnection = {
  connect: async () => {},
  getBaseUrl: async () => undefined,
  getSessionId: () => null,
  setSessionType: () => {},
  makeAdtRequest: async (): Promise<IAdtWireResponse> => ({
    data: undefined,
    status: 200,
    statusText: 'OK',
    headers: {},
  }),
};
void _minimal;

// A full connector states every one of them.
const _full: IAbapConnection = {
  ..._minimal,
  disconnect: async () => {},
  flushGoodbye: async () => {},
  isConnected: () => true,
  beginCriticalSection: () => {},
  endCriticalSection: () => {},
  getSessionMode: () => 'stateless',
  getSessionType: () => 'stateful',
  sessionCookies: () => 'SAP_SESSIONID_T_100=S1',
  getConfig: () => ({ connectionType: 'rfc' }),
};
void _full;

declare const _plain: IAbapConnection;

// **Each member's signature, exactly.** Assignability alone would let a member
// drift wider or narrower and still compile; equality does not.
type Assert<T extends true> = T;
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
type Member<K extends keyof IAbapConnection> = NonNullable<IAbapConnection[K]>;
type SessionMode = 'stateful' | 'stateless';

export type _Disconnect = Assert<
  Equal<Member<'disconnect'>, () => Promise<void>>
>;
export type _FlushGoodbye = Assert<
  Equal<Member<'flushGoodbye'>, (timeoutMs?: number) => Promise<void>>
>;
export type _IsConnected = Assert<Equal<Member<'isConnected'>, () => boolean>>;
export type _BeginCriticalSection = Assert<
  Equal<Member<'beginCriticalSection'>, () => void>
>;
export type _EndCriticalSection = Assert<
  Equal<Member<'endCriticalSection'>, () => void>
>;
export type _GetSessionMode = Assert<
  Equal<Member<'getSessionMode'>, () => SessionMode>
>;
export type _GetSessionType = Assert<
  Equal<Member<'getSessionType'>, () => SessionMode>
>;
export type _SessionCookies = Assert<
  Equal<Member<'sessionCookies'>, () => string | null>
>;
export type _GetConfig = Assert<
  Equal<Member<'getConfig'>, () => IAbapConnectionConfig>
>;
export type _ConnectionType = Assert<
  Equal<IAbapConnectionConfig['connectionType'], 'http' | 'rfc' | undefined>
>;

// Where an atom declares the same member, the two are identical.
export type _SameDisconnect = Assert<
  Equal<Member<'disconnect'>, ISessionLifecycleAware['disconnect']>
>;
export type _SameFlushGoodbye = Assert<
  Equal<Member<'flushGoodbye'>, ISessionLifecycleAware['flushGoodbye']>
>;
export type _SameIsConnected = Assert<
  Equal<Member<'isConnected'>, ISessionLifecycleAware['isConnected']>
>;
export type _SameBegin = Assert<
  Equal<
    Member<'beginCriticalSection'>,
    ICriticalSection['beginCriticalSection']
  >
>;
export type _SameEnd = Assert<
  Equal<Member<'endCriticalSection'>, ICriticalSection['endCriticalSection']>
>;

// Called with `?.`, each answers its own type or `undefined` — no detection,
// no cast.
void (async () => {
  const _ending: Promise<void> | undefined = _plain.disconnect?.();
  await _ending;
  const _flushing: Promise<void> | undefined = _plain.flushGoodbye?.();
  await _flushing;
  await _plain.flushGoodbye?.(1_000);
  const _live: boolean | undefined = _plain.isConnected?.();
  void _live;
  _plain.beginCriticalSection?.();
  _plain.endCriticalSection?.();
  const _mode: 'stateful' | 'stateless' | undefined = _plain.getSessionMode?.();
  void _mode;
  const _type: 'stateful' | 'stateless' | undefined = _plain.getSessionType?.();
  void _type;
  const _cookies: string | null | undefined = _plain.sessionCookies?.();
  void _cookies;
  const _rfc: boolean = _plain.getConfig?.().connectionType === 'rfc';
  void _rfc;
});

// Without `?.` it does not compile: the member may be absent.
void (async () => {
  // @ts-expect-error a connection may have no disconnect
  await _plain.disconnect();
});

void (() => {
  // @ts-expect-error a connection may have no session cookies
  _plain.sessionCookies();
});

// An implementer's own signature conforms when the optional member's call
// shape is one it accepts: a disconnect that takes optional arguments of its
// own is still called with none.
const _withArguments: IAbapConnection = {
  ..._minimal,
  disconnect: async (_code?: number, _reason?: string) => {},
};
void _withArguments;

// A member of the same name with another answer does not.
const _wrongAnswer: IAbapConnection = {
  ..._minimal,
  // @ts-expect-error isConnected answers a boolean
  isConnected: () => 'yes',
};
void _wrongAnswer;

const _wrongMode: IAbapConnection = {
  ..._minimal,
  // @ts-expect-error a session mode is 'stateful' or 'stateless'
  getSessionMode: () => 'long',
};
void _wrongMode;

// **The configuration.** A connector's own configuration type, wider than
// this one, is assignable to it: the transport is read, the rest is the
// connector's.
interface ConnectorRfcConfig {
  connectionType: 'rfc';
  client: string;
  language: string;
  ashost: string;
  sysnr: string;
}
interface ConnectorHttpConfig {
  connectionType?: 'http';
  url: string;
}
declare const _connectorConfig: ConnectorRfcConfig | ConnectorHttpConfig;

const _configured: IAbapConnection = {
  ..._minimal,
  getConfig: () => _connectorConfig,
};
void _configured;

// Absent `connectionType` is HTTP, and is allowed.
const _http: IAbapConnectionConfig = {};
void _http;

// @ts-expect-error a transport is 'http' or 'rfc'
const _ws: IAbapConnectionConfig = { connectionType: 'ws' };
void _ws;

// **The atoms stay as they were.** Composed with an atom, the member is
// required, and identical: an intersection does not conflict, and a consumer
// that needs the member present narrows to the atom.
declare const _owned: IAbapConnection &
  ISessionLifecycleAware &
  ICriticalSection;

void (async () => {
  await _owned.disconnect();
  await _owned.flushGoodbye();
  const _connected: boolean = _owned.isConnected();
  void _connected;
  _owned.beginCriticalSection();
  _owned.endCriticalSection();
});
