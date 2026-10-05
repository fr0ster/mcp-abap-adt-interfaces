/**
 * What every call of {@link IAuthProvider} answers: go on, or not authenticated.
 *
 * One shape for all four moments, so the process reads every answer the same
 * way and never has to know which provider gave it. A provider that fails says
 * so here; it does not throw across the contract — an exception out of a
 * provider is a bug in the provider, not an answer.
 */

import type { IAuthProviderError } from '../error/IAuthProviderError';

/**
 * Why a provider could not authenticate: an {@link IAuthProviderError}.
 *
 * `reason` and `hint` read as before — what went wrong, and what to do about
 * it when there is something to suggest. A decision is made on `kind` and
 * `facts`, never on the words. A refusal is minted by
 * `@mcp-abap-adt/auth-errors`; an object literal is not one, and a refusal is
 * relayed as the object it is, never copied into a new one.
 */
export type IAuthRefusal = IAuthProviderError;

export type AuthOutcome =
  | { readonly ok: true }
  | { readonly ok: false; readonly refusal: IAuthRefusal };
