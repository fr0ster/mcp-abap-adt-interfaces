// Compile-only assertions. If these stop compiling, the types regressed.

import type {
  AuthorizationOutcome,
  AuthorizationRequest,
  IAuthorizationStrategy,
} from '../auth/IAuthorizationStrategy';

// A strategy that receives a URL builder and returns a payload plus the URI it used.
const _browserish: IAuthorizationStrategy<string> = {
  authorize: async (request: AuthorizationRequest) => {
    const redirectUri = 'http://localhost:61001/callback';
    const url = await request.buildAuthorizationUrl(redirectUri);
    void url;
    return { payload: 'code-123', redirectUri };
  },
  dispose: async () => undefined,
};
void _browserish;

// `dispose` is optional: a strategy holding nothing may omit it.
const _disposeless: IAuthorizationStrategy<{ code: string }> = {
  authorize: async () => ({
    payload: { code: 'abc' },
    redirectUri: 'http://localhost:61001/callback',
  }),
};
void _disposeless;

// The outcome is generic over the payload the flow delivers.
const _samlOutcome: AuthorizationOutcome<string> = {
  payload: 'base64-saml-response',
  redirectUri: 'http://localhost:61001/callback',
};
void _samlOutcome;

import type { ICallbackServerOptions } from '../auth/ICallbackServer';
import type { ILogger } from '../logging/ILogger';

const logger: ILogger = {
  debug: () => undefined,
  info: () => undefined,
  warn: () => undefined,
  error: () => undefined,
};

// Ephemeral port plus a transport-level logger.
const _ephemeral: ICallbackServerOptions = {
  port: 0,
  timeoutMs: 30_000,
  logger,
};
void _ephemeral;
