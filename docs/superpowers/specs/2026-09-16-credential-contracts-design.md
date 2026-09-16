# Credential contracts: naming the protocol the accepting side speaks

**Status:** design, agreed 2026-09-16 · **Base:** `master` after the package split (`interfaces-utils`/`-network`/`-auth`/`-adt` 1.0.0, `interfaces` 45.0.0, decision 26)

## TL;DR

- Four contracts, all bound for `@mcp-abap-adt/interfaces-auth`: `AccessCheck<R>`, `IApiKeyCredential`, `IBearerCredential`, `ISecretLoginCredential`.
- **A credential contract names the protocol the accepting side speaks** — never what the holder keeps (password, rotated key, token), nor where it travels (which header, query parameter or connection field).
- Each is added only when its **first accepting package** is implemented (decision 11). Nothing here is written yet.

## 1. Where this comes from

These sections were §7, §7.1 and the credential half of §8 of `2026-09-15-interfaces-split-design.md`. That spec's own subject — splitting `@mcp-abap-adt/interfaces` into five packages — is implemented and published, so it was deleted; decision 26 in `docs/architecture/DECISIONS.md` and `ARCHITECTURE.md` §1/§4/§7 carry what it decided. What survives here is the design it unblocked: the split gave these contracts a home that is not tied to the ADT release cadence, which is the whole reason `llm-agent` and cloud-llm-hub can accept them.

---

## 2. The contracts

| contract | shape | accepted by | package |
|---|---|---|---|
| `AccessCheck<R>` | `(request: R) => Promise<boolean>` — passed or not; a throw inside counts as `false`; the null implementation answers `true` | `llm-agent` (session factory, collection registry and tools, server routes), cloud-llm-hub | `interfaces-auth` |
| request type `R` | per checking site: tool call, collection action, model, configuration | the one package that checks | that package |
| `IApiKeyCredential` | `kind: 'api-key'`, `secret(): Promise<string>` | several LLM providers and embedders (`openai-llm`, `anthropic-llm`, `deepseek-llm`, `openai-embedder`), `qdrant-rag` | `interfaces-auth` |
| `IBearerCredential` | `kind: 'bearer'`, `token(): Promise<string>` | `sap-aicore-llm`, `sap-aicore-embedder` — to verify: whether the SAP AI SDK they use takes a token source, or only a service key it exchanges itself | `interfaces-auth` |
| `ISecretLoginCredential` | `kind: 'secret-login'`, `readonly principal: string`, `secret(): Promise<string>` | `pg-vector-rag`, `hana-vector-rag` (§4) | `interfaces-auth` |

---

## 3. The rule

**A credential contract names the method the accepting side speaks — never what the holder keeps, nor where it travels.**

- **Not what the holder keeps.** Whether a secret is a static password, a rotated key or a freshly issued token; whether a bearer token came from client credentials, a device flow or a token exchange — that is the implementation behind the contract (`StaticPassword`, `EntraTokenLogin`, an adapter over `ITokenProvider`). The contract carries no user-and-password, client-id or token-endpoint fields. Client credentials are therefore not a contract: they are one way to implement `IBearerCredential`.
- **Not where it travels.** An API key is the same whether the provider sends it as `Authorization: Bearer`, `x-api-key` or `api-key`; a secret login is the same whether it becomes a Basic header or connection fields. The header, query parameter or connection field is the accepting implementation's.
- **What remains** is what the accepting side must hand to its protocol: a secret; a bearer token; an identity and a secret. The identity (`principal`) is not a detail of the method but what the protocol logs in as, so it lives in the credential, not in the provider's configuration — the provider can never pair one principal's secret with another name.
- **Secrets and tokens are functions,** asked for on every use and never held as strings by the acceptor, so rotation and expiry are the implementation's (Azure Entra ID tokens expire after 60 minutes).
- **A new `kind` appears only when the accepting side speaks a different protocol,** not when the holder keeps something different.

Admission follows the pattern `connection` already uses: the accepting site constrains a type parameter (`AdtCloudConnector<TCredential extends IAuthProvider>`) and credentials carry a string-literal `kind`, never a `unique symbol` brand, so the same shape declared in two packages is satisfied by one object. Every contract has a do-nothing implementation; for a site that may run without authentication, that is one more member, `{ kind: 'none' }`, admitted only where the accepting package includes it.

---

## 4. Vector-store credentials

A vector-store provider accepts the credential contracts for the protocols its database speaks. PostgreSQL has one for this purpose: a user name and a password message. A static password and an Azure Entra ID token both travel in it, so for `pg-vector-rag` they are **one contract**, and which of the two sits behind it is invisible to the provider.

```ts
// interfaces-auth
interface ISecretLoginCredential {
  readonly kind: 'secret-login';
  readonly principal: string;   // what the database logs in as
  secret(): Promise<string>;    // a password or a token — the implementation's
}

// pg-vector-rag
new PgVectorRagProvider({ host, database, credential }); // credential: ISecretLoginCredential
// inside: { user: credential.principal, password: () => credential.secret() }

// built by whoever owns the secret
const byPassword = { kind: 'secret-login', principal: 'rag_svc', secret: async () => process.env.PG_PASSWORD! };
const byEntra    = { kind: 'secret-login', principal: 'rag-app@contoso', secret: () => entra.getToken() };
```

- **Principal is required.** `pg` falls back to the environment (`PGUSER`, then the OS user) when `user` is missing; with the principal inside the credential there is no such fallback and no connection under the wrong identity.
- **Fresh secret per connection.** `pg` 8.23.0 accepts `password` as a function, possibly async, and calls it for each new connection (`Client._getPassword`), so each new pooled connection gets a current token.
- **Admission.** The constructor's parameter type is the filter: a credential for another protocol does not compile. A database speaking several protocols accepts a union, one member per protocol.
- **The token source stays outside.** The database package does not depend on `auth-providers`; an adapter over `ITokenProvider` is one line: `secret: async () => (await provider.getTokens()).authorizationToken`.
- **Placement.** `ISecretLoginCredential` is accepted by two packages, so it goes to `interfaces-auth`. A protocol only one database speaks stays in that database's package until a second one accepts it.
- **Whose credential.** Normally the service's: one object per provider, with user isolation done by the consumer (cloud-llm-hub). Passing an end user's token to the database (HANA JWT single sign-on) means a provider per session built with that user's credential — the same shape as an MCP server per session; the contract does not change.

What each database speaks, as checked on 2026-09-15:

| package | accepts today | the database also supports | contracts to accept |
|---|---|---|---|
| `pg-vector-rag` | connection string, or host/port/user/password/database | a token in the password message (Azure Entra ID) — same protocol | `ISecretLoginCredential` |
| `hana-vector-rag` | user and password (`uid`/`pwd`), both required | JWT, SAML, X.509 (SAP HANA Cloud; the `@sap/hana-client` 2.29.27 changelog mentions JWT, SAML and X.509 connections) — separate authentication mechanisms | `ISecretLoginCredential`; a contract per further mechanism once the client's connection properties are checked (§5.1) |

---

## 5. Open questions

### 5.1 Credentials

1. **HANA connection properties.** Which `@sap/hana-client` properties carry a JWT, SAML assertion or X.509 key decides whether each is its own contract or, where the client sends it as a password, `ISecretLoginCredential`.
2. **Passwords in connection strings.** `pg-vector-rag` and `hana-vector-rag` both accept a connection string, which can carry the password — the credential travelling where the consumer can see it. Proposed: the connection string carries the address only, and authentication always comes as a credential object. A major release of both packages.
3. **One credential object for HTTP and databases.** `IAuthProvider` is HTTP-shaped (header, cookies, TLS material) and does not fit a database wire protocol. Should `connection`'s `BasicAuthProvider` and `TokenAuthProvider` be built from `ISecretLoginCredential` and `IBearerCredential`, so one object serves ADT and a database alike?
4. **SAP AI SDK.** Whether `sap-aicore-llm` and `sap-aicore-embedder` can accept `IBearerCredential`, or whether the SDK only takes a service key and runs client credentials itself (§2).

### 5.2 Inherited from the split, still open

5. **The unaccepted contracts.** `interfaces` 45.0.0 still carries what no package imports — the five header groups, `ISessionState`, `ISessionStorage`, `ITokenProviderResult` — each marked `@deprecated`. They go with the facade's next major, together with the re-export. Only repositories under `~/prj` were searched; a consumer outside them would not have shown.
6. **A separate `interfaces-sap`.** SAP/BTP configuration and authentication live in `interfaces-adt` because only the ABAP family accepts them. If their release rate differs from ADT's as much as ADT's differs from the rest, they could be their own package.
7. **`IAuthorizationStrategy`** describes a generic interactive OAuth login but is accepted only by `auth-providers` today, so it stays in `interfaces-adt`. It moves to `interfaces-auth` when a package outside the SAP side accepts it.

---

## 6. Out of scope

- Writing any of these contracts before a package accepts one (decision 11).
- The `llm-agent` per-session authentication design — its own spec, built on `interfaces-auth`.
- cloud-llm-hub still depends on `interfaces` 11.6.0 through `@mcp-abap-adt/lib` 10.2.0; it adopts these packages with the new `lib`.
