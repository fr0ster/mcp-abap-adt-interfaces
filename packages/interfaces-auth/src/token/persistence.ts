/**
 * The persistence strategy: how a provider reports what it holds, so a
 * consumer can store it. Types only. A provider with no persistence
 * persists nothing.
 */

import type { OAuth2GrantType } from './AuthType';

/** What a committed result did to the refresh token. */
export type ReportedRefreshToken =
  | { readonly change: 'new'; readonly value: string }
  /** The result carried none: the refresh token held before, if any, is still held. */
  | { readonly change: 'none' };

/** The credential held when the report is made. */
export interface ReportedCredential {
  /** '' when no access token is held (a seeded refresh token alone, say). */
  readonly authorizationToken: string;
  readonly tokenType: 'jwt' | 'saml' | 'opaque';
  readonly authType: OAuth2GrantType;
  readonly expiresAt?: number | undefined;
}

export type PersistenceReport =
  | {
      readonly event: 'credential';
      /** The credential the commit installed. */
      readonly credential: ReportedCredential;
      readonly refreshToken: ReportedRefreshToken;
      /** True: a call waits for this report, and a failure is its answer. */
      readonly awaited: boolean;
    }
  | {
      /** The refresh token held was discarded by the renewal strategy's decision. */
      readonly event: 'refresh-token-discarded';
      /**
       * The credential still held, unchanged, so a store can clear the
       * refresh token without erasing the rest of the session.
       */
      readonly credential: ReportedCredential;
      readonly awaited: boolean;
    };

export interface ITokenPersistence {
  report(report: PersistenceReport): void | Promise<void>;
}
