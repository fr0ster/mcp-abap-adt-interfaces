// Compile-only assertions. If these stop compiling, the types regressed.
//
// 25.0.2: an include's result set names what `readMainPrograms` answers, and
// it is required — an optional key would leave the read's answer typed
// `undefined` for every client that composes the default set.

import type { IIncludeResults } from '../adt/IAdtInclude';

type Assert<T extends true> = T;

export type _MainProgramsRequired = Assert<
  'mainPrograms' extends keyof IIncludeResults
    ? Record<string, never> extends Pick<IIncludeResults, 'mainPrograms'>
      ? false
      : true
    : false
>;
