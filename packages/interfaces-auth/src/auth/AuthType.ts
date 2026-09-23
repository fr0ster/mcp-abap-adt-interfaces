/**
 * Authentication types, as a value and as the union over it.
 *
 * **There were two of these**, both in `@mcp-abap-adt/interfaces-adt`: this
 * file declared `AuthType = 'jwt' | 'xsuaa' | 'basic'` and `Headers.ts`
 * declared `AuthType = (typeof AUTH_TYPES)[number]`, which is the same union by
 * another route. The index exported the second, so the first was reachable only
 * inside the package. Moving the authentication contracts here put the two in
 * different packages under one name, which is the duplication this family keeps
 * removing — so this is the one declaration, and the constants came with it.
 */
export const AUTH_TYPE_JWT = 'jwt';
export const AUTH_TYPE_BASIC = 'basic';
export const AUTH_TYPE_XSUAA = 'xsuaa';

/** Every authentication type, for iterating and for the union below. */
export const AUTH_TYPES = [
  AUTH_TYPE_JWT,
  AUTH_TYPE_BASIC,
  AUTH_TYPE_XSUAA,
] as const;

export type AuthType = (typeof AUTH_TYPES)[number];
