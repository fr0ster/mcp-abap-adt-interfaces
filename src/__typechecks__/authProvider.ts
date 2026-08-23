// Compile-only assertions. If these stop compiling, the types regressed.

import type {
  IAuthProvider,
  ICredentialTransport,
  IRenewableCredential,
} from '../auth/IAuthProvider';
import type { ICertificateMaterial } from '../auth/ICertificateMaterialLoader';

// The minimum: a credential is a kind and a header. Everything else is optional
// because four of the five ways in do not need it — if any member below moves
// out of the optional group, this stops compiling.
const _minimal: IAuthProvider = {
  kind: 'basic',
  authorizationHeader: async () => 'Basic dTpw',
};

// `null`, not `''`. A credential that authenticates through TLS has no header,
// and the empty string is a legal header value rather than a way of saying so.
const _headerless: IAuthProvider = {
  kind: 'certificate',
  authorizationHeader: async () => null,
  transportMaterial: (): ICertificateMaterial => ({
    cert: 'PEM',
    key: 'PEM',
  }),
};

// A credential whose way in is a round trip. The transport is what makes this
// implementable at all: the exchange must be able to SEND, and the cookies it
// comes back with must be adoptable by the connection, or the session the
// exchange just opened is lost the moment the token is spent.
const _negotiating: IAuthProvider = {
  kind: 'spnego',
  authorizationHeader: async () => 'Negotiate AAAA',
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
  authorizationHeader: async () => 'Bearer x',
};

const _renewable: IRenewableCredential = {
  kind: 'token',
  authorizationHeader: async () => 'Bearer x',
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
  authorizationHeader: async () => null,
  cookies: () => 'MYSAPSSO2=x',
};

// Everything a provider needs beyond `kind`/`authorizationHeader` is optional,
// so a consumer's own credential compiles without implementing what it does not
// have. This is the whole reason the contract lives in this package.
const _providers: IAuthProvider[] = [
  _minimal,
  _headerless,
  _negotiating,
  _plainToken,
  _renewable,
  _handedOver,
];

void _providers;
