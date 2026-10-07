// Compile-only assertions of 5.0.0's outcome, refusal and thrown failure, the
// removed login timeout and the cancellation signal. If these stop compiling,
// the types regressed. Every `@ts-expect-error` line must fail — an unused
// directive fails `test:check` — and the positive line beside it proves the
// failure is the rule's.

import type { AuthOutcome, IAuthRefusal } from '../auth/AuthOutcome';
import type { AuthorizationRequest } from '../auth/IAuthorizationStrategy';
import type { ICallbackServerOptions } from '../auth/ICallbackServer';
import type { IAuthProviderError } from '../error/IAuthProviderError';
import type { IAuthProviderFailure } from '../error/IAuthProviderFailure';
import * as surface from '../index';
import type { IRefreshableTokenProvider } from '../token/IRefreshableTokenProvider';
import type { ITokenProvider } from '../token/ITokenProvider';
import type { ITokenRequestOptions } from '../token/ITokenRequestOptions';
import type { ITokenResult } from '../token/ITokenResult';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
type Expect<T extends true> = T;

declare const error: IAuthProviderError;

// ---- the refusal is the error --------------------------------------------

export type RefusalIsTheError = Expect<Equal<IAuthRefusal, IAuthProviderError>>;

const _refusal: IAuthRefusal = error; // a value typed IAuthProviderError is one
const _oops: AuthOutcome = { ok: false, refusal: error };
const _ok: AuthOutcome = { ok: true };

// @ts-expect-error a 4.x-shaped literal is not a refusal
const _literalRefusal: IAuthRefusal = { reason: 'x', hint: 'y' };
// @ts-expect-error nor is a complete one without the brand
const _unbrandedRefusal: IAuthRefusal = {
  kind: 'unknown',
  facts: { operation: 'preparing' },
  reason: 'x',
};
const _literalOops: AuthOutcome = {
  ok: false,
  // @ts-expect-error an Oops carries a minted error, not a literal
  refusal: { reason: 'the user or password was refused' },
};

// The words stay readable without narrowing.
if (!_oops.ok) {
  const _reason: string = _oops.refusal.reason;
  const _hint: string | undefined = _oops.refusal.hint;
  void _reason;
  void _hint;
}

// The outcome cannot be changed after the fact.
declare const outcome: AuthOutcome;
// @ts-expect-error ok is readonly
outcome.ok = true;

// ---- the thrown failure ----------------------------------------------------

declare const failure: IAuthProviderFailure;
const _asError: Error = failure;
const _failureName: 'AuthProviderFailure' = failure.name;
const _failureError: IAuthProviderError = failure.error;

const _built: IAuthProviderFailure = Object.assign(new Error('x'), {
  name: 'AuthProviderFailure' as const,
  error,
});
// @ts-expect-error a plain Error is not a failure
const _plain: IAuthProviderFailure = new Error('x');
// @ts-expect-error a failure carries a minted error, not a literal
const _forgedFailure: IAuthProviderFailure = Object.assign(new Error('x'), {
  name: 'AuthProviderFailure' as const,
  error: { reason: 'x' },
});

// ---- the callback server has no timeout (§6a) -----------------------------

const _bounded: ICallbackServerOptions = {
  port: 0,
  signal: AbortSignal.timeout(30_000),
};
const _unbounded: ICallbackServerOptions = { port: 61001 };
const _timed: ICallbackServerOptions = {
  port: 0,
  // @ts-expect-error timeoutMs is removed: a bound is the consumer's signal
  timeoutMs: 30_000,
};

// ---- cancelling a login (§6b) ------------------------------------------------

const result: ITokenResult = {
  authorizationToken: 't',
  authType: 'authorization_code',
};

// A 4.x-shaped provider, with no parameter, still satisfies the contract.
class PlainProvider implements ITokenProvider {
  async getTokens(): Promise<ITokenResult> {
    return result;
  }
}
// One that takes the options does too.
class CancellableProvider implements IRefreshableTokenProvider {
  async getTokens(options?: ITokenRequestOptions): Promise<ITokenResult> {
    void options?.signal;
    return result;
  }
  async refreshTokens(options?: ITokenRequestOptions): Promise<ITokenResult> {
    void options?.signal;
    return result;
  }
}
// A 4.x-shaped refreshable provider as well.
const _plainRefreshable: IRefreshableTokenProvider = {
  getTokens: async () => result,
  refreshTokens: async () => result,
};

function _calls(
  provider: ITokenProvider,
  refreshable: IRefreshableTokenProvider,
): void {
  const signal = new AbortController().signal;
  void provider.getTokens();
  void provider.getTokens({ signal });
  void provider.getTokens({ signal: undefined });
  // @ts-expect-error the signal is an AbortSignal
  void provider.getTokens({ signal: 'x' });
  void refreshable.refreshTokens({ signal });
  // @ts-expect-error the signal is an AbortSignal
  void refreshable.refreshTokens({ signal: 'x' });
}

const _request: AuthorizationRequest = {
  buildAuthorizationUrl: async (redirectUri) => redirectUri,
  signal: new AbortController().signal,
};
const _badRequest: AuthorizationRequest = {
  buildAuthorizationUrl: async (redirectUri) => redirectUri,
  // @ts-expect-error the request's signal is an AbortSignal
  signal: 'x',
};

// ---- removed code constants stay removed; the stores' stay -----------------

const _storeCodes: object = surface.STORE_ERROR_CODES;
// @ts-expect-error TOKEN_PROVIDER_ERROR_CODES is removed in 5.0.0
const _tokenCodes: unknown = surface.TOKEN_PROVIDER_ERROR_CODES;
// @ts-expect-error ASSERTION_ERROR_CODES is removed in 5.0.0
const _assertionCodes: unknown = surface.ASSERTION_ERROR_CODES;
// @ts-expect-error TokenProviderErrorCode is removed in 5.0.0
type _TokenCode = surface.TokenProviderErrorCode;
// @ts-expect-error AssertionErrorCode is removed in 5.0.0
type _AssertionCode = surface.AssertionErrorCode;
// The new names are on the surface.
type _New = surface.IAuthProviderFailure | surface.ITokenRequestOptions;

void _refusal;
void _oops;
void _ok;
void _literalRefusal;
void _unbrandedRefusal;
void _literalOops;
void _asError;
void _failureName;
void _failureError;
void _built;
void _plain;
void _forgedFailure;
void _bounded;
void _unbounded;
void _timed;
void PlainProvider;
void CancellableProvider;
void _plainRefreshable;
void _calls;
void _request;
void _badRequest;
void _storeCodes;
void _tokenCodes;
void _assertionCodes;
export type { _AssertionCode, _New, _TokenCode };
