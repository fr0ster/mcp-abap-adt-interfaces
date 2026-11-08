// Compile-only assertions under `tsconfig.typecheck-loose.json`
// (`exactOptionalPropertyTypes` off); `tsconfig.json` leaves this file out.
// That config checks the union in the mode its consumers without the flag
// compile in. It leaves out the two files whose cases are about the flag
// itself: `rfcAddressStrictTypes.ts` and `certificateLoaderCompatibility.ts`
// (its 3.0.0 case is an `exactOptionalPropertyTypes` refusal).
//
// Recorded: without the flag, `url?: never` reads as `url?: undefined`, so an
// RFC literal setting `url: undefined` compiles. Only an absent key satisfies
// both modes, which is why a builder omits a key that does not belong rather
// than setting it to `undefined` (the consumers that compile without the flag
// — the connection library, the server — would otherwise accept it silently).

import type { ISapConfig } from '../index';

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
