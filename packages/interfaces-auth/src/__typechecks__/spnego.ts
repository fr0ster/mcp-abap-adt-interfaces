// Compile-only assertions of the SPNego contract: the `spnego` kind and the
// token source. Every `@ts-expect-error` line must fail — an unused directive
// fails `test:check` — so each one is load-bearing by construction.

import type {
  INegotiateTokenSource,
  NegotiateTokenAnswer,
  NegotiateTokenOptions,
} from '../auth/INegotiateTokenSource';
import type { AuthProviderErrorFacts, SpnegoFactsOf } from '../error/facts';
import type {
  IAuthProviderError,
  SpnegoError,
} from '../error/IAuthProviderError';
import type {
  AuthProviderErrorKind,
  ConfigField,
  CredentialKind,
  NEGOTIATE_SOURCE_PROBLEMS,
  NegotiateSourceProblem,
  Operation,
  SPNEGO_PROBLEMS,
  SpnegoProblem,
  VariantKind,
} from '../error/kinds';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
type Expect<T extends true> = T;
type Has<U, M> = [M] extends [U] ? true : false;

declare function use(value: unknown): void;

// ---- the lists and their unions ------------------------------------------

export type SpnegoLists = [
  Expect<Equal<SpnegoProblem, (typeof SPNEGO_PROBLEMS)[number]>>,
  Expect<
    Equal<NegotiateSourceProblem, (typeof NEGOTIATE_SOURCE_PROBLEMS)[number]>
  >,
  Expect<Equal<keyof AuthProviderErrorFacts, AuthProviderErrorKind>>,
  Expect<Has<AuthProviderErrorKind, 'spnego'>>,
  Expect<Has<VariantKind, 'spnego'>>,
  Expect<Has<Operation, 'obtaining-negotiate-token'>>,
  Expect<Has<Operation, 'presenting-negotiate-token'>>,
  Expect<Has<ConfigField, 'servicePrincipal'>>,
  Expect<Has<ConfigField, 'tokenSource'>>,
  Expect<Has<CredentialKind, 'kerberos-ticket'>>,
  // a source answers seven problems; the provider adds two
  Expect<Has<SpnegoProblem, 'no-mechanism'>>,
  Expect<Has<NegotiateSourceProblem, 'no-mechanism'>>,
  Expect<
    Equal<
      Exclude<SpnegoProblem, NegotiateSourceProblem>,
      'ntlm-token' | 'token-unreadable'
    >
  >,
  Expect<Equal<Has<NegotiateSourceProblem, 'ntlm-token'>, false>>,
  Expect<Equal<Has<NegotiateSourceProblem, 'token-unreadable'>, false>>,
];

// ---- an exhaustive switch over the kinds needs `spnego` -------------------

declare const kind: AuthProviderErrorKind;
function exhaustive(k: AuthProviderErrorKind): string {
  switch (k) {
    case 'configuration':
    case 'client-certificate':
    case 'client-authentication':
    case 'request-failed':
    case 'tls':
    case 'interactive-login':
    case 'saml-assertion':
    case 'snc':
    case 'spnego':
    case 'credential-refused':
    case 'system-refused':
    case 'renewal-unchanged':
    case 'renewal-declined':
    case 'token-binding':
    case 'not-prepared':
    case 'logon-target':
    case 'connection':
    case 'unknown':
      return k;
    default: {
      const never: never = k;
      return never;
    }
  }
}
function missingSpnego(k: AuthProviderErrorKind): string {
  switch (k) {
    case 'configuration':
    case 'client-certificate':
    case 'client-authentication':
    case 'request-failed':
    case 'tls':
    case 'interactive-login':
    case 'saml-assertion':
    case 'snc':
    case 'credential-refused':
    case 'system-refused':
    case 'renewal-unchanged':
    case 'renewal-declined':
    case 'token-binding':
    case 'not-prepared':
    case 'logon-target':
    case 'connection':
    case 'unknown':
      return k;
    default: {
      // @ts-expect-error 'spnego' is not handled above: the switch is not exhaustive
      const never: never = k;
      return never;
    }
  }
}
use([kind, exhaustive, missingSpnego]);

// ---- facts: the problem and the operation, nothing else -------------------

const _f1: AuthProviderErrorFacts['spnego'] = {
  problem: 'no-credential',
  operation: 'obtaining-negotiate-token',
};
const _f2: SpnegoFactsOf<'ntlm-token'> = {
  problem: 'ntlm-token',
  operation: 'presenting-negotiate-token',
};
// @ts-expect-error the operation is required
const _f3: AuthProviderErrorFacts['spnego'] = { problem: 'clock-skew' };
const _f4: AuthProviderErrorFacts['spnego'] = {
  problem: 'clock-skew',
  operation: 'obtaining-negotiate-token',
  // @ts-expect-error spnego carries no other fact
  status: 500,
};
const _f5: AuthProviderErrorFacts['spnego'] = {
  // @ts-expect-error a problem off the list
  problem: 'library-init-failed',
  operation: 'obtaining-negotiate-token',
};

// ---- narrowing on kind, then variant --------------------------------------

declare const e: IAuthProviderError;
if (e.kind === 'spnego') {
  const s: SpnegoError = e;
  const p: SpnegoProblem = e.variant;
  const q: SpnegoProblem = e.facts.problem;
  const o: Operation = e.facts.operation;
  use([s, p, q, o]);
  if (e.variant === 'ntlm-token') {
    const v: 'ntlm-token' = e.facts.problem; // facts narrowed with the variant
    use(v);
  }
  // no diagnostics on any problem
  // @ts-expect-error spnego carries no diagnostics
  use(e.diagnostics?.library);
}
if (e.kind === 'snc') {
  // @ts-expect-error an snc variant is not a spnego problem
  const _w: SpnegoProblem = e.variant;
}

// ---- the token source -----------------------------------------------------

declare const source: INegotiateTokenSource;
declare const options: NegotiateTokenOptions;
const _a1: Promise<NegotiateTokenAnswer> = source.token(
  'HTTP@sap.example.com',
  options,
);
const _o1: NegotiateTokenOptions = {};
const _o2: NegotiateTokenOptions = { signal: undefined };
const _o3: NegotiateTokenOptions = { signal: new AbortController().signal };
const _ok: NegotiateTokenAnswer = { ok: true, token: 'YIIC' };
const _no: NegotiateTokenAnswer = { ok: false, problem: 'clock-skew' };
// @ts-expect-error the provider's problems are not a source's to answer
const _no2: NegotiateTokenAnswer = { ok: false, problem: 'ntlm-token' };
// @ts-expect-error nor an unreadable token
const _no3: NegotiateTokenAnswer = { ok: false, problem: 'token-unreadable' };
// @ts-expect-error a refusal carries a problem, not a token
const _no4: NegotiateTokenAnswer = { ok: false, token: 'x' };
const _ok2: NegotiateTokenAnswer = {
  ok: true,
  token: 'x',
  // @ts-expect-error a token answer carries no problem
  problem: 'source-failed',
};
// @ts-expect-error the options name no other field
const _o4: NegotiateTokenOptions = { timeoutMs: 1 };
// @ts-expect-error a source takes the principal and the options
source.token('HTTP@sap.example.com');
declare const answer: NegotiateTokenAnswer;
if (answer.ok) {
  const t: string = answer.token;
  use(t);
} else {
  const p: NegotiateSourceProblem = answer.problem;
  use(p);
}

// ---- an exhaustive switch over the source's problems needs `no-mechanism` ---

function exhaustiveSourceProblem(p: NegotiateSourceProblem): string {
  switch (p) {
    case 'no-credential':
    case 'service-unknown':
    case 'kdc-unreachable':
    case 'clock-skew':
    case 'binding-unavailable':
    case 'source-failed':
      return p;
    default:
      // @ts-expect-error 'no-mechanism' is not handled above: not exhaustive
      return ((x: never) => x)(p);
  }
}
use(exhaustiveSourceProblem);
