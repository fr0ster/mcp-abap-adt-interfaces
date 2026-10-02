// Compile-only assertions. If these stop compiling, the types regressed.

import type { IConfig } from '../auth/IConfig';
import type { IConnectionConfig } from '../auth/IConnectionConfig';

// A session as a store answers it: the secret and what it is bound to.
const _session: IConfig = {
  authorizationToken: 'token',
  refreshToken: 'refresh',
  expiresAt: 1_790_000_000_000,
  issuedFor: 'https://my-abap.example.com:443/sap/bc/adt?sap-client=100',
  issuedBy:
    'https://sub.authentication.us10.hana.ondemand.com:443?client_id=sb-abap-trial',
};
void _session;

// Both optional: a 1.0.x session still satisfies the type.
const _legacy: IConnectionConfig = { authorizationToken: 'token' };
void _legacy;

// @ts-expect-error — a URI is a string, not a URL object
const _notAUrl: IConnectionConfig = { issuedFor: new URL('https://h') };
void _notAUrl;
