// Compile-only assertions. If these stop compiling, the types regressed.
//
// Why accepting `interfaces-auth-sap` 3.x is not a major here. 3.0.0 changes
// nothing in its own declarations; it is a major because
// `ICertificateMaterialLoader.load` answers `interfaces-auth` 4.x's widened
// `ICertificateMaterial`. This package takes one type from it,
// `IAuthorizationConfig`, which imports nothing — and does not depend on
// `interfaces-auth` at all (check:graph refuses an undeclared import). So every
// type this package exports resolves the same under either major. This pins
// the one link: `IAuthorizationConfig` is exactly its 2.x shape, `?: T` and
// all, so a widening reaching it would fail here first.

import type { IAuthorizationConfig } from '@mcp-abap-adt/interfaces-auth-sap';

/** `IAuthorizationConfig` as `interfaces-auth-sap` 2.x declares it. */
interface AuthorizationConfig2x {
  uaaUrl: string;
  uaaClientId: string;
  uaaClientSecret: string;
  refreshToken?: string;
}

// Both ways: a field widened to `| undefined` fails the first, a required
// field added or a type narrowed fails the second. (An `Equal<>` identity
// check does not tell `?: T` from `?: T | undefined`, measured; assignment
// does.)
declare const current: IAuthorizationConfig;
declare const previous: AuthorizationConfig2x;
const _toPrevious: AuthorizationConfig2x = current;
const _toCurrent: IAuthorizationConfig = previous;
void _toPrevious;
void _toCurrent;
