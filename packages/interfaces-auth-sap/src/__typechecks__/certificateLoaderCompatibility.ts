// Compile-only assertions. If these stop compiling, the types regressed.
//
// Why 3.0.0 is a major although this package's declarations did not change:
// `ICertificateMaterialLoader.load` answers `interfaces-auth`'s
// `ICertificateMaterial`, and 3.0.0 takes it from `interfaces-auth` 4.x, where
// its optional fields are `?: T | undefined`. A consumer that keeps the loaded
// material in a shape of its own declaring them `?: T` (the 2.x way) is
// refused under `exactOptionalPropertyTypes`. Against `interfaces-auth` 3.x the
// `@ts-expect-error` below is unused, so this file fails there.

import type { ICertificateMaterialLoader } from '../auth/ICertificateMaterialLoader';
import type { ISapConfig } from '../sap/ISapConfig';

interface CertificateMaterial2x {
  cert?: Buffer | string;
  key?: Buffer | string;
  pfx?: Buffer;
  passphrase?: string;
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
