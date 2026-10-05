/**
 * What `ITokenProvider.getTokens()` and
 * `IRefreshableTokenProvider.refreshTokens()` reject with: an `Error` that
 * carries an {@link IAuthProviderError}.
 *
 * TypeScript does not type a rejection, so a consumer reads one with
 * `readFailure(thrown, operation)` from `@mcp-abap-adt/auth-errors`, which
 * answers the carried error for a failure and classifies anything else, then
 * switches on `error.kind`. The message is the error's words; nothing else of
 * a failure is part of the contract.
 */

import type { IAuthProviderError } from './IAuthProviderError';

export interface IAuthProviderFailure extends Error {
  readonly name: 'AuthProviderFailure';
  readonly error: IAuthProviderError;
}
