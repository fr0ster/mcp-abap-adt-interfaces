// Compile-only assertions. If these stop compiling, the types regressed.
//
// Why 4.0.0 is a major. Each widened contract is assigned to a shape of the
// consumer's own that declares the same optional fields the 3.x way, `?: T`.
// Under `exactOptionalPropertyTypes` (on in this repository) every such
// assignment is refused — which is the break a consumer on `^3` must opt into.
// Against 3.x each `@ts-expect-error` below is unused, so this file fails
// there: it passes only on the major that widened the fields.

import type { ILogger } from '@mcp-abap-adt/interfaces-utils';
import type {
  AssertionContext,
  ValidatedAssertion,
} from '../auth/IAssertionValidator';
import type { AuthorizationRequest } from '../auth/IAuthorizationStrategy';
import type { ICallbackServerOptions } from '../auth/ICallbackServer';
import type { ICertificateMaterial } from '../auth/ICertificateMaterial';
import type { OAuth2GrantType } from '../token/AuthType';
import type { ITokenResult } from '../token/ITokenResult';

/** The 3.x shapes, as a consumer would have mirrored them. */
interface TokenResult3 {
  authorizationToken: string;
  refreshToken?: string;
  authType: OAuth2GrantType;
  expiresIn?: number;
  expiresAt?: number;
  tokenType?: 'jwt' | 'saml' | 'opaque';
}
interface CertificateMaterial3 {
  cert?: Buffer | string;
  key?: Buffer | string;
  pfx?: Buffer;
  passphrase?: string;
}
interface CallbackServerOptions3 {
  readonly port: number;
  readonly timeoutMs: number;
  readonly signal?: AbortSignal;
  readonly logger?: ILogger;
}
interface AuthorizationRequest3 {
  buildAuthorizationUrl(redirectUri: string): Promise<string>;
  readonly logger?: ILogger;
}
interface AssertionContext3 {
  readonly expectedInResponseTo?: string;
  readonly audience: string;
  readonly acsUrl: string;
  readonly expectedIssuer?: string;
  readonly logger?: ILogger;
}
interface ValidatedAssertion3 {
  readonly expiresAt: Date;
  readonly assertionId: string;
  readonly issuer: string;
  readonly nameId?: string;
  readonly sessionIndex?: string;
  readonly attributes?: Readonly<Record<string, readonly string[]>>;
  readonly raw: string;
  readonly signedXml: string;
}

declare const token: ITokenResult;
declare const material: ICertificateMaterial;
declare const callback: ICallbackServerOptions;
declare const request: AuthorizationRequest;
declare const context: AssertionContext;
declare const validated: ValidatedAssertion;

// @ts-expect-error 4.0.0: refreshToken, expiresIn, expiresAt, tokenType may be undefined
const _token: TokenResult3 = token;
// @ts-expect-error 4.0.0: cert, key, pfx, passphrase may be undefined
const _material: CertificateMaterial3 = material;
// @ts-expect-error 4.0.0: signal, logger may be undefined
const _callback: CallbackServerOptions3 = callback;
// @ts-expect-error 4.0.0: logger may be undefined
const _request: AuthorizationRequest3 = request;
// @ts-expect-error 4.0.0: expectedInResponseTo, expectedIssuer, logger may be undefined
const _context: AssertionContext3 = context;
// @ts-expect-error 4.0.0: nameId, sessionIndex, attributes may be undefined
const _validated: ValidatedAssertion3 = validated;

// The migration note's way out: a field widened the same way takes the value.
interface TokenResultMigrated {
  authorizationToken: string;
  refreshToken?: string | undefined;
  authType: OAuth2GrantType;
  expiresIn?: number | undefined;
  expiresAt?: number | undefined;
  tokenType?: 'jwt' | 'saml' | 'opaque' | undefined;
}
const _migrated: TokenResultMigrated = token;

void _token;
void _material;
void _callback;
void _request;
void _context;
void _validated;
void _migrated;
