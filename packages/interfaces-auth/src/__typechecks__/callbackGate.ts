import type {
  ICallbackServerHandle,
  ICallbackServerOptions,
} from '../auth/ICallbackServer';

// 7.3.0: the gate, the bind address and the allowed authorities are optional
// and typed; a transport written before them still satisfies the contract.
const options: ICallbackServerOptions = {
  port: 61001,
  host: '127.0.0.1',
  allowedHosts: ['192.168.1.10:61001', 'buildhost.example'],
  gated: true,
};
void options;

const before: ICallbackServerHandle<string> = {
  port: 61001,
  redirectUri: 'http://localhost:61001/callback',
  waitForResult: () => Promise.resolve('code'),
  fail: () => {},
};
void before;

const armed: ICallbackServerHandle<string> = {
  ...before,
  expectState: (_state: string | null) => {},
};
armed.expectState?.('state');
armed.expectState?.(null);

// @ts-expect-error — a state is a string or null, nothing else
armed.expectState?.(42);

const badHosts: ICallbackServerOptions = {
  port: 0,
  // @ts-expect-error — allowedHosts is a list of strings
  allowedHosts: '0.0.0.0',
};
void badHosts;
