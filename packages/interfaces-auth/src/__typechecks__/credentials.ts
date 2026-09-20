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

// The literal is the whole reason these are three contracts and not one shape.
// Without `kind`, an api-key and a bearer are both "an object with one async
// string method", and handing over the wrong one would compile everywhere.
// @ts-expect-error a bearer is not an api key, however identical the methods
const _confused: IApiKeyCredential = _bearer;

// @ts-expect-error and not the other way round either
const _confusedBack: IBearerCredential = _key;

// A structurally right object with no `kind` is not a credential: the
// discriminator is what an acceptor checks, so it cannot be inferred.
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

// What an acceptor writes: narrow by the literal, then use what that kind has.
// The union is the acceptor's to declare — this package ships the members, not
// the set any one site admits.
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

// @ts-expect-error and a site that did not admit it cannot be handed one
const _rejected: Accepted = { kind: 'none' };

void [_key, _bearer, _login, _confused, _confusedBack, _anonymous, _nameless];
void [_held, _unauthenticated, _rejected];
