/**
 * What an accepting side must be handed to authenticate — named by the protocol
 * it speaks, never by what the holder keeps or where the secret travels.
 *
 * Three contracts, because there are three things an acceptor can need: a
 * secret; a bearer token; an identity and a secret. Everything else a real
 * credential has — how it was obtained, when it expires, which header carries
 * it — belongs to the implementation.
 *
 * **Not what the holder keeps.** Whether a secret is a static password, a
 * rotated key or a freshly issued token; whether a bearer token came from
 * client credentials, a device flow or a token exchange — that is behind the
 * contract, not in it. Client credentials are therefore not a contract of their
 * own: they are one way to implement {@link IBearerCredential}. A contract with
 * a `clientId` and a `tokenEndpoint` would be describing one way of getting a
 * token rather than the thing the acceptor needs.
 *
 * **Not where it travels.** An API key is the same key whether the provider
 * sends it as `Authorization: Bearer`, `x-api-key` or `api-key`; a secret login
 * is the same whether it becomes a Basic header or two connection fields. The
 * header, query parameter or connection property is the accepting
 * implementation's business.
 *
 * **A new `kind` appears only when the accepting side speaks a different
 * protocol** — not when the holder keeps something different. Two acceptors
 * that both want "a secret, and nothing else" share one contract however
 * differently their secrets were obtained.
 *
 * **Every secret is a function.** Asked for on each use and never held as a
 * string by the acceptor, so rotation and expiry stay with the implementation
 * that knows about them. An acceptor that captured the string would serve a
 * stale token and defeat the provider it was handed.
 *
 * **The `kind` literal is what makes a check real.** Not because the members
 * always differ — an api key and a bearer token do differ, one having
 * `secret()` and the other `token()`. The overlap that matters is between
 * {@link ISecretLoginCredential} and {@link IApiKeyCredential}: a secret login
 * has everything a key asks for, and its extra `principal` does not get in the
 * way, so without the literal it would satisfy the key contract outright. The
 * literal is also what lets an acceptor narrow a union and reach the members of
 * exactly one protocol. It is a plain string
 * literal rather than a `unique symbol` so that the same shape declared in two
 * packages is satisfied by one object: a credential written against this
 * package must not have to be re-wrapped to cross a package boundary.
 *
 * These live here, not beside an implementation, for the reason
 * {@link IAuthProvider} does: a consumer whose credential source neither this
 * family nor any shipped provider anticipated can implement one, and that is
 * only possible if the contract is in the contract package.
 */

/**
 * One secret, and nothing else — the shape an acceptor needs when the protocol
 * is "present this key".
 *
 * Accepted by the LLM providers and embedders that take an API key today, and
 * by `qdrant-rag`. What each does with it differs — a header name here, a query
 * parameter there — and none of that is in the contract.
 */
export interface IApiKeyCredential {
  /** Discriminates this from {@link IBearerCredential}, which is otherwise identical. */
  readonly kind: 'api-key';

  /**
   * The key, asked for on every use.
   *
   * A function rather than a field so a key that rotates can rotate: the
   * acceptor never holds the string, and the implementation decides whether
   * each call is a constant, a lookup in a vault, or a refresh.
   */
  secret(): Promise<string>;
}

/**
 * A bearer token, issued by someone and presented as proof.
 *
 * Distinct from {@link IApiKeyCredential} only by `kind`, and that distinction
 * is the point: a token has an issuer and a lifetime, a key does not, and an
 * acceptor that expects one and receives the other has no way to notice without
 * the literal.
 *
 * The SAP AI Core providers accept this: a constructed destination carries
 * `headers.Authorization`, rebuilt per call, which is exactly why `token()` is
 * asked each time rather than read once.
 */
export interface IBearerCredential {
  /** Discriminates this from {@link IApiKeyCredential}, which is otherwise identical. */
  readonly kind: 'bearer';

  /**
   * The token, asked for on every use.
   *
   * Asynchronous because the honest implementation checks expiry and renews
   * behind this call — Azure Entra ID tokens expire after an hour, and a caller
   * that cached the string would present a dead one. Cheap in the ordinary
   * case for the same reason: the provider answers from what it holds and goes
   * to the network only when it must.
   */
  token(): Promise<string>;
}

/**
 * An identity and a secret — the shape a wire protocol needs when it logs in as
 * someone, which is what a database does.
 *
 * Accepted by `pg-vector-rag` and `hana-vector-rag`. {@link IAuthProvider} does
 * not fit here: it is HTTP-shaped, answering with a header, cookies and TLS
 * material, none of which a database connection speaks.
 */
export interface ISecretLoginCredential {
  /** The protocol this speaks: log in as someone, with a secret. */
  readonly kind: 'secret-login';

  /**
   * What the protocol logs in as.
   *
   * In the credential rather than in the provider's configuration, and
   * deliberately: with the name in one object and the secret in another, a
   * provider can pair one principal's secret with another principal's name and
   * nothing in the types objects. They are one fact and they travel together.
   *
   * A field, not a function: an identity does not rotate. What may rotate is
   * the secret, which is why only that one is asked for each time.
   */
  readonly principal: string;

  /**
   * The secret for that principal, asked for on every use.
   *
   * A password or a token — the contract does not say which, because the
   * database does not care: it receives a password field either way, and where
   * it came from is the implementation's.
   */
  secret(): Promise<string>;
}
