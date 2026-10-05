// Compile-only assertions. If these stop compiling, the types regressed.
//
// A provider hands these objects out with an optional field present and
// `undefined` (`refreshToken: undefined`), and a consumer merges them
// (`{ ...stored, ...result }`). Under `exactOptionalPropertyTypes` a field
// declared `?: T` would forbid that, so each optional field of these types is
// declared `?: T | undefined`. Every such field is set to `undefined` here.

import type {
  AssertionContext,
  ValidatedAssertion,
} from '../auth/IAssertionValidator';
import type { AuthorizationRequest } from '../auth/IAuthorizationStrategy';
import type { ICallbackServerOptions } from '../auth/ICallbackServer';
import type { ICertificateMaterial } from '../auth/ICertificateMaterial';
import type { ITokenResult } from '../token/ITokenResult';

const _token: ITokenResult = {
  authorizationToken: 'eyJ...',
  authType: 'client_credentials',
  refreshToken: undefined,
  expiresIn: undefined,
  expiresAt: undefined,
  tokenType: undefined,
  refreshTokenDisposition: undefined,
};

const _material: ICertificateMaterial = {
  cert: undefined,
  key: undefined,
  pfx: undefined,
  passphrase: undefined,
};

const _callback: ICallbackServerOptions = {
  port: 0,
  signal: undefined,
  logger: undefined,
};

const _request: AuthorizationRequest = {
  buildAuthorizationUrl: async (redirectUri) => redirectUri,
  logger: undefined,
  signal: undefined,
};

const _context: AssertionContext = {
  audience: 'urn:sp',
  acsUrl: 'https://sp/acs',
  expectedInResponseTo: undefined,
  expectedIssuer: undefined,
  logger: undefined,
};

const _validated: ValidatedAssertion = {
  expiresAt: new Date(0),
  assertionId: '_a',
  issuer: 'urn:idp',
  raw: '<Assertion/>',
  signedXml: '<Assertion/>',
  nameId: undefined,
  sessionIndex: undefined,
  attributes: undefined,
};

void _token;
void _material;
void _callback;
void _request;
void _context;
void _validated;
