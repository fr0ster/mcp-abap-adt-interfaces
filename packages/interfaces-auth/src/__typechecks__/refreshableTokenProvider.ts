// Compile-only assertions. If these stop compiling, the types regressed.

import type { IRefreshableTokenProvider } from '../token/IRefreshableTokenProvider';
import type { ITokenProvider } from '../token/ITokenProvider';
import type { ITokenResult } from '../token/ITokenResult';

const result: ITokenResult = {
  authorizationToken: 't',
  authType: 'authorization_code',
};

// A refreshable provider is a provider: anything that takes the plain contract
// takes this one.
const _refreshable: IRefreshableTokenProvider = {
  getTokens: async () => result,
  refreshTokens: async () => result,
};
const _asPlain: ITokenProvider = _refreshable;

// @ts-expect-error a provider that cannot refresh is not a refreshable one
const _cacheOnly: IRefreshableTokenProvider = {
  getTokens: async () => result,
};

void _asPlain;
void _cacheOnly;
