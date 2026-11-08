// Compile-only assertions under `tsconfig.json` (`exactOptionalPropertyTypes`
// on); `tsconfig.typecheck-loose.json` leaves this file out, because the case
// below compiles there — see `rfcAddressLooseTypes.ts`.

import type { ISapConfig } from '../index';

// `url: undefined` on RFC: with the flag on, `url?: never` admits no value,
// `undefined` included.
// @ts-expect-error with exactOptionalPropertyTypes, an RFC config has no url, not even undefined
const _rfcUrlUndefined: ISapConfig = {
  connectionType: 'rfc',
  authType: 'basic',
  client: '100',
  language: 'EN',
  ashost: 'h',
  sysnr: '00',
  url: undefined,
};
void _rfcUrlUndefined;
