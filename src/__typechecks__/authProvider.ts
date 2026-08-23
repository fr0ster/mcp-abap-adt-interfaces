// Compile-only assertions. If these stop compiling, the types regressed.

import type {
  IAuthProvider,
  ICredentialOwningItsFetch,
  ICredentialTransport,
  IRenewableCredential,
} from '../auth/IAuthProvider';
import type { ICertificateMaterial } from '../auth/ICertificateMaterialLoader';

// The whole contract, stated: a credential says all of itself, and the empty
// answers are as much a statement as the others. If a member below ever becomes
// optional again, the partial credential under it starts compiling and this
// file stops being a check.
const _minimal: IAuthProvider = {
  kind: 'basic',
  // Empty where there is nothing to say, and that is the point: a credential
  // states all of itself, so nothing has to ask whether it does.
  prepare: async () => {},
  authorizationHeader: async () => 'Basic dTpw',
  cookies: () => null,
  transportMaterial: () => ({}),
};

// @ts-expect-error the members are the contract; a partial credential is not one
const _partial: IAuthProvider = {
  kind: 'basic',
  authorizationHeader: async () => 'Basic dTpw',
};

// `null`, not `''`. A credential that authenticates through TLS has no header,
// and the empty string is a legal header value rather than a way of saying so.
const _headerless: IAuthProvider = {
  kind: 'certificate',
  prepare: async () => {},
  authorizationHeader: async () => null,
  cookies: () => null,
  transportMaterial: (): ICertificateMaterial => ({
    cert: 'PEM',
    key: 'PEM',
  }),
};

// A credential whose way in is a round trip. The transport is what makes this
// implementable at all: the exchange must be able to SEND, and the cookies it
// comes back with must be adoptable by the connection, or the session the
// exchange just opened is lost the moment the token is spent.
const _negotiating: ICredentialOwningItsFetch = {
  kind: 'spnego',
  prepare: async () => {},
  authorizationHeader: async () => 'Negotiate AAAA',
  cookies: () => null,
  transportMaterial: () => ({}),
  fetchCsrfToken: async (transport: ICredentialTransport) => {
    const response = await transport.send({
      method: 'GET',
      url: `${transport.baseUrl}/sap/bc/adt/discovery`,
      headers: { 'x-csrf-token': 'fetch' },
      adoptCookies: true,
    });
    // `headers` is deliberately `unknown`: a contract package cannot name any
    // one client's header type, and a caller narrows what it needs.
    const headers = response.headers as Record<string, string> | undefined;
    return headers?.['x-csrf-token'] ?? '';
  },
};

// Renewability is an ATOM, not a member every credential carries. A bare
// IAuthProvider has no `renew` to call — which is the whole point, since a
// password has nothing behind it to ask again.
const _plainToken: IAuthProvider = {
  kind: 'token',
  prepare: async () => {},
  authorizationHeader: async () => 'Bearer x',
  cookies: () => null,
  transportMaterial: () => ({}),
};

const _renewable: IRenewableCredential = {
  kind: 'token',
  prepare: async () => {},
  authorizationHeader: async () => 'Bearer x',
  cookies: () => null,
  transportMaterial: () => ({}),
  renew: async () => {},
};

// The narrowing a consumer writes: evidence, not a cast.
function isRenewable(c: IAuthProvider): c is IRenewableCredential {
  return typeof (c as Partial<IRenewableCredential>).renew === 'function';
}
void isRenewable(_plainToken);

// @ts-expect-error a bare credential has no renew(); that is what the atom is for
void _plainToken.renew;

// A credential that carries a session negotiated elsewhere.
const _handedOver: IAuthProvider = {
  kind: 'saml',
  prepare: async () => {},
  authorizationHeader: async () => null,
  cookies: () => 'MYSAPSSO2=x',
  transportMaterial: () => ({}),
};

// The one question left about a credential, and the only one whose answer
// changes what the connection DOES rather than what it sends.
function ownsItsFetch(c: IAuthProvider): c is ICredentialOwningItsFetch {
  return (
    typeof (c as Partial<ICredentialOwningItsFetch>).fetchCsrfToken ===
    'function'
  );
}
void ownsItsFetch(_minimal);

// @ts-expect-error a bare credential does not earn the token itself
void _minimal.fetchCsrfToken;

// Everything a provider needs beyond `kind`/`authorizationHeader` is optional,
// so a consumer's own credential compiles without implementing what it does not
// have. This is the whole reason the contract lives in this package.
const _providers: IAuthProvider[] = [
  _minimal,
  _headerless,
  _negotiating,
  _partial,
  _plainToken,
  _renewable,
  _handedOver,
];

void _providers;
