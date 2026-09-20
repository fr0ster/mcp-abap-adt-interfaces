// Compile-only assertions. If these stop compiling, the types regressed.

import type {
  IApiKeyCredential,
  IBearerCredential,
  ISecretLoginCredential,
} from '../auth/ICredentials';

// Each contract, stated minimally. A credential is its `kind` plus what the
// protocol needs; there is nothing else to implement, which is what makes a
// consumer's own implementation a few lines rather than a subclass.
const _key: IApiKeyCredential = {
  kind: 'api-key',
  secret: async () => 'sk-...',
};

const _bearer: IBearerCredential = {
  kind: 'bearer',
  token: async () => 'eyJ...',
};

const _login: ISecretLoginCredential = {
  kind: 'secret-login',
  principal: 'app_user',
  secret: async () => 'hunter2',
};

// --- what the literal actually buys -----------------------------------------
//
// Asserting that a bearer is not an api key proves nothing about `kind`: their
// members differ, so that assignment fails on the missing method whether or not
// a discriminator exists. Each check below is built so the ONLY difference is
// the literal — the members are exactly what the target asks for.

// A secret login is the real overlap: it has everything an api key asks for,
// and the extra `principal` does not get in the way. Without the literal it
// would satisfy IApiKeyCredential outright.
declare const realLogin: ISecretLoginCredential;
// @ts-expect-error the literal is the only thing refusing this
const _loginAsKey: IApiKeyCredential = realLogin;

// Members are exactly an api key's; only the `kind` is another protocol's.
declare const bearerShapedLikeKey: {
  readonly kind: 'bearer';
  secret(): Promise<string>;
};
// @ts-expect-error only the kind is wrong here
const _wrongKindKey: IApiKeyCredential = bearerShapedLikeKey;

// And the same in the other direction.
declare const keyShapedLikeBearer: {
  readonly kind: 'api-key';
  token(): Promise<string>;
};
// @ts-expect-error only the kind is wrong here
const _wrongKindBearer: IBearerCredential = keyShapedLikeBearer;

// --- the members are the contract -------------------------------------------

// A structurally right object with no `kind` is not a credential: the
// discriminator is what an acceptor checks, so it cannot be left to inference.
// @ts-expect-error `kind` is the contract, not decoration
const _anonymous: IApiKeyCredential = { secret: async () => 'sk-...' };

// The identity travels WITH the secret. A login without a principal would let a
// provider pair this secret with a name from somewhere else.
// @ts-expect-error a secret login is an identity and a secret, never one of them
const _nameless: ISecretLoginCredential = {
  kind: 'secret-login',
  secret: async () => 'hunter2',
};

// Secrets are functions, asked on every use. A field would let an acceptor hold
// the string, which is exactly what defeats rotation.
// @ts-expect-error a held secret is not a credential
const _held: IApiKeyCredential = { kind: 'api-key', secret: 'sk-...' };

// --- what an acceptor writes ------------------------------------------------

// Narrow by the literal, then use what that kind has. The union is the
// acceptor's to declare: this package ships the members, not the set any one
// site admits.
type Accepted = IApiKeyCredential | IBearerCredential | ISecretLoginCredential;

async function present(credential: Accepted): Promise<string> {
  switch (credential.kind) {
    case 'api-key':
      return credential.secret();
    case 'bearer':
      return credential.token();
    case 'secret-login':
      // Both halves are reachable here, and only here.
      return `${credential.principal}:${await credential.secret()}`;
  }
}
void present;

// An acceptor that may also run unauthenticated declares that itself. The
// contract package ships no `{ kind: 'none' }`: admitting it is a decision
// about one site, not a property of credentials.
type MaybeAuthenticated = Accepted | { readonly kind: 'none' };
const _unauthenticated: MaybeAuthenticated = { kind: 'none' };

// Refused by the site that did not admit it — and again the members are an api
// key's, so the literal is the only thing doing the refusing.
declare const noneShapedLikeKey: {
  readonly kind: 'none';
  secret(): Promise<string>;
};
// @ts-expect-error 'none' is not admitted at this site
const _rejected: Accepted = noneShapedLikeKey;

void [_key, _bearer, _login, _loginAsKey, _wrongKindKey, _wrongKindBearer];
void [_anonymous, _nameless, _held, _unauthenticated, _rejected];
