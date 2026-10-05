// Compile-only assertions. If these stop compiling, the types regressed.

import type { AuthOutcome } from '../auth/AuthOutcome';
import type { IAuthProvider } from '../auth/IAuthProvider';
import type { IAuthRejection } from '../auth/IAuthRejection';
import type { ILogonTarget, IRequestTarget } from '../auth/IAuthTargets';

const ok: AuthOutcome = { ok: true };
const oops = (reason: string, hint?: string): AuthOutcome => ({
  ok: false,
  refusal: hint === undefined ? { reason } : { reason, hint },
});

// ---- Every way in, on the one contract (decision 40) --------------------

// Basic: offers logon parameters (taken by RFC) and writes a header (carried
// by every wire). A wire that does not take the parameters is no failure for
// a password: the header carries it.
const _basic: IAuthProvider = {
  kind: 'basic',
  prepare: async () => ok,
  establish: async (logon) => {
    logon.logonParameters({ user: 'u', passwd: 'p' });
    return ok;
  },
  authorize: async (request) => {
    request.header('Authorization', 'Basic dTpw');
    return ok;
  },
  rejected: async () => oops('user or password refused'),
};

// A token (authorization code, OIDC, client credentials, …): renews in
// rejected() and says Ok, so the process tries once more.
const _token: IAuthProvider = {
  kind: 'token',
  prepare: async () => ok,
  establish: async () => ok,
  authorize: async (request) => {
    request.header('Authorization', 'Bearer t');
    return ok;
  },
  rejected: async () => ok,
};

// A SAML session handed over as cookies.
const _samlCookies: IAuthProvider = {
  kind: 'saml',
  prepare: async () => ok,
  establish: async () => ok,
  authorize: async (request) => {
    request.cookies('MYSAPSSO2=x');
    return ok;
  },
  rejected: async () => ok,
};

// A certificate: TLS material at logon, nothing per request.
const _certificate: IAuthProvider = {
  kind: 'certificate',
  prepare: async () => ok,
  establish: async (logon) => logon.tlsMaterial({ cert: 'C', key: 'K' }),
  authorize: async () => ok,
  rejected: async () => oops('certificate refused'),
};

// SNC: logon parameters or nothing — the wire's Oops is SNC's own.
const _snc: IAuthProvider = {
  kind: 'snc',
  prepare: async () => ok,
  establish: async (logon) =>
    logon.logonParameters({
      snc_mode: '1',
      snc_partnername: 'p:CN=SID',
      snc_qop: '9',
      snc_lib: '/lib/sapcrypto.so',
    }),
  authorize: async () => ok,
  rejected: async (r: IAuthRejection) =>
    String(r.error).includes('A2200019')
      ? oops('no certificate to present', 'log on in the Secure Login Client')
      : oops('SNC logon refused'),
};

// ---- The process: one sequence, no question about what it was given ------

async function run(
  provider: IAuthProvider,
  logon: ILogonTarget,
  request: IRequestTarget,
): Promise<AuthOutcome> {
  const ready = await provider.prepare();
  if (!ready.ok) return ready;
  const loggedOn = await provider.establish(logon);
  if (!loggedOn.ok) return loggedOn;
  const authorized = await provider.authorize(request);
  if (!authorized.ok) return authorized;
  return provider.rejected({ at: 'request', status: 401, error: {} });
}

const _all: IAuthProvider[] = [
  _basic,
  _token,
  _samlCookies,
  _certificate,
  _snc,
];
void _all;
void run;

// A refusal is read without narrowing to a provider.
const _answer: AuthOutcome = oops('x', 'y');
if (!_answer.ok) {
  const _reason: string = _answer.refusal.reason;
  const _hint: string | undefined = _answer.refusal.hint;
  void _reason;
  void _hint;
}

// ---- The members that are gone stay gone ---------------------------------

const _oldHeader: IAuthProvider = {
  kind: 'basic',
  prepare: async () => ok,
  establish: async () => ok,
  authorize: async () => ok,
  rejected: async () => ok,
  // @ts-expect-error authorizationHeader() is gone: authorize() writes the header.
  authorizationHeader: async () => 'Basic x',
};
void _oldHeader;

const _oldTls: IAuthProvider = {
  kind: 'certificate',
  prepare: async () => ok,
  establish: async () => ok,
  authorize: async () => ok,
  rejected: async () => ok,
  // @ts-expect-error transportMaterial() is gone: establish() writes TLS material.
  transportMaterial: () => ({}),
};
void _oldTls;

// @ts-expect-error a provider answers every moment — rejected() included.
const _partial: IAuthProvider = {
  kind: 'x',
  prepare: async () => ok,
  establish: async () => ok,
  authorize: async () => ok,
};
void _partial;
