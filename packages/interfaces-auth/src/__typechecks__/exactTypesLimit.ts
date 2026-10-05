// The known limit: TypeScript has no exact object types.
//
// The compiler guarantees a correct pairing of kind, variant, facts and
// diagnostics for object literals and for declared fields: a field a variant
// does not permit is `?: never`, so naming it — in a literal, or in a
// declared type of any origin — fails (errorContract.ts). It cannot refuse
// keys it is never told about: a source typed with an index signature, or a
// spread that brings undeclared keys, assigns past the types. Each line
// below COMPILES, and is asserted to: it records the limit, not a rule.
//
// What holds the line at run time instead: the producers' shape check
// forbids spreading a minted error (relay the object itself), and
// `@mcp-abap-adt/auth-errors` re-validates and rebuilds every error at each
// hand-off — `classifyOutcome`, `relayOutcome`, `readFailure` — from `kind`
// and its allowlisted facts only, so an extra key never survives.
//
// If TypeScript gains exact types, these lines should stop compiling: turn
// each into a `@ts-expect-error` line of errorContract.ts then.

import type { IAuthProviderError } from '../error/IAuthProviderError';

type MintedOf<K extends IAuthProviderError['kind'], V = unknown> = Extract<
  IAuthProviderError,
  { kind: K } & (V extends string ? { variant: V } : unknown)
>;
declare const samlIssuer: MintedOf<'saml-assertion', 'untrusted-issuer'>;
declare const certificate: MintedOf<'client-certificate'>;

// Codex, PR #124: diagnostics from a source typed with an index signature —
// at run time it may hold another kind's field (an SNC library path, a
// configuration URI) that the type of this variant excludes.
declare const anyDiagnostics: Record<string, string>;
export const indexSignatureDiagnostics: IAuthProviderError = {
  ...samlIssuer,
  diagnostics: anyDiagnostics,
};

// Codex, PR #124: a spread of a minted error with a value typed by an index
// signature — undeclared keys at any level pass the types.
declare const anyBag: { readonly [key: string]: unknown };
export const spreadIndexSignature: IAuthProviderError = {
  ...samlIssuer,
  ...anyBag,
};
export const spreadIntoFacts: IAuthProviderError = {
  ...certificate,
  facts: { ...certificate.facts, ...anyBag },
};

// A spread of a variable whose declared type names a key no variant knows:
// excess-property checks see only keys written in the literal itself.
declare const undeclared: { readonly secret: string };
export const spreadUndeclaredKey: IAuthProviderError = {
  ...samlIssuer,
  ...undeclared,
};
