// Compile-only assertions for the request flags. If these stop compiling, the types regressed.

import type { IAbapRequestOptions } from '../IAbapRequestOptions';

const base = { url: '/x', method: 'POST', timeout: 1000 } as const;

export const _noLogTrue: IAbapRequestOptions = { ...base, noLog: true };
export const _noResendTrue: IAbapRequestOptions = { ...base, noResend: true };
export const _statelessTrue: IAbapRequestOptions = {
  ...base,
  stateless: true,
};
export const _allFlagsAbsent: IAbapRequestOptions = { ...base };
export const _allFlagsUndefined: IAbapRequestOptions = {
  ...base,
  noLog: undefined,
  noResend: undefined,
  stateless: undefined,
};

// @ts-expect-error a flag is `true` or absent, never `false`
export const _noLogFalse: IAbapRequestOptions = { ...base, noLog: false };
// @ts-expect-error a flag is `true` or absent, never `false`
export const _noResendFalse: IAbapRequestOptions = { ...base, noResend: false };
export const _statelessFalse: IAbapRequestOptions = {
  ...base,
  // @ts-expect-error a flag is `true` or absent, never `false`
  stateless: false,
};

// @ts-expect-error a flag is `true`, not a string
export const _noLogYes: IAbapRequestOptions = { ...base, noLog: 'yes' };
// @ts-expect-error a flag is `true`, not a string
export const _noResendYes: IAbapRequestOptions = { ...base, noResend: 'yes' };
// @ts-expect-error a flag is `true`, not a string
export const _statelessYes: IAbapRequestOptions = { ...base, stateless: 'yes' };
