// Compile-only assertions. If these stop compiling, the types regressed.
//
// Why 3.0.0 is a major although this package's declarations did not change:
// `ICertificateMaterialLoader.load` answers `interfaces-auth`'s
// `ICertificateMaterial`, and 3.0.0 takes it from `interfaces-auth` 4.x, where
// its optional fields are `?: T | undefined`. A consumer that keeps the loaded
// material in a shape of its own declaring them `?: T` (the 2.x way) is
// refused under `exactOptionalPropertyTypes`. Against `interfaces-auth` 3.x the
// `@ts-expect-error` below is unused, so this file fails there.
//
// Why 3.1.0 accepts `interfaces-auth` 5.x in a minor: what this package's
// exported types reach there — `ICertificateMaterial` and `AUTH_TYPE_BASIC` /
// `AUTH_TYPE_JWT` — is unchanged in 5.0.0. `_sameAs4x` and `_sameKeys` hold
// the first: the loaded material is assigned both ways to its 4.x shape and
// has the same field names, so a field added, removed, renamed, retyped or
// made required in a later major fails here (an `Equal<>` identity check does
// not tell `?: T` from `?: T | undefined`, measured for 3.0.0 — hence
// assignment, both ways). `_authTypes` holds the second. All three compile against 4.x and 5.x alike.

import type { AuthType } from '../auth/AuthType';
import type { ICertificateMaterialLoader } from '../auth/ICertificateMaterialLoader';
import type { ISapConfig } from '../sap/ISapConfig';

interface CertificateMaterial2x {
  cert?: Buffer | string;
  key?: Buffer | string;
  pfx?: Buffer;
  passphrase?: string;
}

/** `ICertificateMaterial` as `interfaces-auth` 4.x declares it. */
interface CertificateMaterial4x {
  cert?: Buffer | string | undefined;
  key?: Buffer | string | undefined;
  pfx?: Buffer | undefined;
  passphrase?: string | undefined;
}

declare const loader: ICertificateMaterialLoader;
declare const config: ISapConfig;

/** Wrapped in a function: these are compile-only, and nothing here runs. */
async function _loaded(): Promise<void> {
  // @ts-expect-error 3.0.0: the loaded material's optional fields may be undefined
  const kept: CertificateMaterial2x = await loader.load(config);
  void kept;

  // The migration note's way out: the field widened the same way.
  const widened: {
    cert?: Buffer | string | undefined;
    key?: Buffer | string | undefined;
    pfx?: Buffer | undefined;
    passphrase?: string | undefined;
  } = await loader.load(config);
  void widened;
}
void _loaded;

type Loaded = Awaited<ReturnType<ICertificateMaterialLoader['load']>>;

/** 3.1.0: the loaded material is its 4.x shape under either major. */
function _sameAs4x(loaded: Loaded, shape4x: CertificateMaterial4x): void {
  const toShape: CertificateMaterial4x = loaded;
  const fromShape: Loaded = shape4x;
  void toShape;
  void fromShape;
}
void _sameAs4x;

/**
 * The same field names: assignment both ways does not notice an optional
 * field dropped from one side, so the keys are compared on their own.
 */
type SameKeys<A, B> = [keyof A] extends [keyof B]
  ? [keyof B] extends [keyof A]
    ? true
    : false
  : false;
const _sameKeys: SameKeys<Loaded, CertificateMaterial4x> = true;
void _sameKeys;

/** 3.1.0: the generic members of the union are still `'basic'` and `'jwt'`. */
function _authTypes(type: AuthType): void {
  const members: 'basic' | 'jwt' | 'xsuaa' = type;
  const back: AuthType = members;
  void back;
}
void _authTypes;
