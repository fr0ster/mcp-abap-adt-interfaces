/**
 * What a token result says about the refresh token a consumer has stored.
 *
 * - `'replace'` — the result carries a new, usable refresh token;
 * - `'keep'` — the result carries none and nothing was cut: the stored one
 *   stands;
 * - `'clear'` — the held refresh token was cut, or the result carried one
 *   that may not be used: the stored refresh token must go.
 */
export const REFRESH_TOKEN_DISPOSITIONS = Object.freeze([
  'keep',
  'replace',
  'clear',
] as const);

export type RefreshTokenDisposition =
  (typeof REFRESH_TOKEN_DISPOSITIONS)[number];
