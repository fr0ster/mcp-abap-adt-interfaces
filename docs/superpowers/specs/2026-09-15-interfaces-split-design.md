# Splitting `@mcp-abap-adt/interfaces` into packages by who accepts them

**Status:** design, for review · **Date:** 2026-09-15 · **Base:** `master` at `717ef4d` (44.0.0)

## TL;DR

- **Why.** 108 versions, 41 of them majors, 28 majors since 2026-08-15, five on 11–12 September alone. Almost all of that churn is ADT. A package outside the ABAP family (`llm-agent`) that needs two credential contracts would inherit a major nearly every day.
- **Rule.** A contract lives where it is **accepted** — a parameter, field or return typed by it. One accepting package owns it. Several packages on the SAP side (ABAP and Cloud ALM families) → the SAP-side contract package. Accepted across families → a shared package.
- **Packages.**

  | package | holds | depends on |
  |---|---|---|
  | `@mcp-abap-adt/interfaces-utils` | logging | nothing |
  | `@mcp-abap-adt/interfaces-network` | transport-level contracts, generic HTTP/MCP headers, network error codes | nothing |
  | `@mcp-abap-adt/interfaces-auth` | cross-family credential and access contracts | nothing |
  | `@mcp-abap-adt/interfaces-adt` | ADT contracts, the ABAP connection, SAP/BTP configuration and authentication | `interfaces-auth`, `interfaces-utils` |
  | `@mcp-abap-adt/interfaces` | what no package accepts (today: four files and the five header groups, §3.5) + a transitional re-export of everything | all of the above |

- **Migration.** `interfaces` 45.0.0 re-exports what moved, marked deprecated. The fourteen packages that import it move their imports when they next release (§5). A later major removes the re-export.
- **Constants** stay with the contract whose vocabulary they are.
- **New contracts** (`AccessCheck`, LLM and vector-store credentials) go into `interfaces-auth`, but only when their first accepting package exists (decision 11).

---

## 1. The problem

### 1.1 Release coupling

`@mcp-abap-adt/interfaces` is one version line for 346 symbols across two groups that change at very different speeds (ARCHITECTURE §4):

- **ADT contracts** — `adt/` (40 files), `runtime/`, `execution/`, `feeds/`, `service/`. Most of the 41 majors came from here.
- **Infrastructure** — `auth/`, `connection/`, `session/`, `serviceKey/`, `storage/`, `store/`, `token/`, `logging/`, `sap/`, `validation/`, `shared/`, `utils/`.

Measured with `npm view @mcp-abap-adt/interfaces time`: 108 versions, 41 majors, 28 majors since 2026-08-15, and 40.0.0 → 44.0.0 between 2026-09-11 15:05 and 2026-09-12 04:48.

### 1.2 The consumer that surfaced it

`llm-agent` is moving to per-session graphs where a session is built with its authentication. It needs to **accept** `IAuthProvider` (the MCP HTTP client) and a new access-check contract (session factory, collection tools, server routes). Both are also accepted by the hub. Depending on `@mcp-abap-adt/interfaces` for that would tie `llm-agent` to every ADT major.

Import size is **not** the problem: every module except 51 runtime values compiles to an empty file (ARCHITECTURE §1), and `import type` is erased.

---

## 2. The rule

**A contract lives where it is accepted, not where it is implemented.**

- **Accepted** means a package declares something typed by the contract: a parameter, a field, a return. Implementing it does not count.
- **One accepting package** → the contract lives in that package (or is added to the shared package only when a second acceptor appears).
- **Several accepting packages, all on the SAP side** — the ABAP family (`connection`, `lib`, `core`, `proxy`, `auth-*`, `adt-clients`, `adt-strategies`, `header-validator`, `logger`) and the Cloud ALM family (`mcp-calm-client`, `mcp-calm-server`) → `interfaces-adt` or `interfaces-utils`, by what it is.
- **Accepted across families** (the ABAP family and `llm-agent` / the hub) → `interfaces-auth`, `interfaces-network` or `interfaces-utils`, by what it is.
- **Accepted by nobody** → not moved; a candidate for removal (decision 11: zero callers is evidence of an unused contract).
- **Granularity.** Evidence is gathered per exported symbol; the unit that moves is the file. A file moves when any of its exports is imported by another package, or is referenced by a contract that moves. Unimported exports inside a moved file travel with it and are listed as removal candidates (§3.5); a file none of whose exports is used stays in `interfaces`.

This extends decisions 11 and 24 from members and shapes to packages, and does not change decisions 3, 20 or 23: contracts stay atoms, composed at the point of use, never inherited.

**What would change it.** A second family that accepts most of `interfaces-adt`; then the split is along the wrong line and the family boundary should be redrawn.

---

## 3. Package map

Acceptors below were found (2026-09-16) by parsing, in every repository under `~/prj`, the import and `require` statements that name `@mcp-abap-adt/interfaces`, and attributing each imported name to the package owning the file. Excluded: `node_modules`, `dist`, worktrees, the `mcp-abap-adt-workspace` mirrors, backups and this repository. Imports from tests, type checks and scripts were recorded separately and do not make a symbol accepted. On top of that, a reference graph inside this repository marks exports that a used contract's declaration names, so a composed atom moves with its composite. Names are resolved through `src/index.ts`, including its aliases (`AuthTypeEnum`). An import is evidence, not proof of acceptance: an implementing package imports too. Each move is re-checked against the importing file when it is planned.

An earlier version of this map searched for file and symbol names instead; it missed exports whose file name differs from them (`IConnectionCapabilities.ts`, `ICallbackServer.ts`) and credited acceptors that declare a same-named type of their own.

### 3.1 `@mcp-abap-adt/interfaces-utils` — depends on nothing

| from | symbols | accepted by |
|---|---|---|
| `logging/` | `ILogger` | `logger`, `auth-broker`, `auth-providers`, `auth-stores`, `adt-clients`, `connection`, `lib`, `core`, `mcp-calm-server`, cloud-llm-hub (`llm-agent` declares its own `ILogger`); also the SAP-side `ICallbackServer` (§3.4) |
| `logging/` | `LogLevel` (enum) | `logger` |

### 3.2 `@mcp-abap-adt/interfaces-network` — depends on nothing

| from | symbols | accepted by |
|---|---|---|
| `connection/IWebSocketTransport.ts` | `IWebSocketTransport` and its message kinds | `adt-clients`, `connection` |
| `connection/NetworkErrors.ts` | `NETWORK_ERROR_CODES` | `connection` |
| `utils/ITimeoutConfig.ts` | `ITimeoutConfig` | `adt-clients`, `connection` |
| `Headers.ts` (generic part) | `HEADER_AUTHORIZATION` · `HEADER_CONTENT_TYPE`, `HEADER_ACCEPT`, `HEADER_SESSION_ID`, `HEADER_MCP_SESSION_ID`, `HEADER_X_MCP_SESSION_ID` | `proxy`, cloud-llm-hub · `proxy` |

### 3.3 `@mcp-abap-adt/interfaces-auth` — depends on nothing

Only what is not SAP- or BTP-specific.

| from | symbols | accepted by |
|---|---|---|
| `auth/IAuthProvider.ts` | `IAuthProvider`, `IRenewableCredential` | `connection` (`CredentialAbapConnection`, `AdtCloudConnector`, `AdtOnPremConnector`); next: `llm-agent-mcp` |
| `auth/ICertificateMaterialLoader.ts` (shape only) | `ICertificateMaterial` | `connection`; returned by `IAuthProvider.transportMaterial()` |

The file `auth/ICertificateMaterialLoader.ts` is **split**: `ICertificateMaterial` goes here, `ICertificateMaterialLoader` (whose `load(config: ISapConfig)` is SAP-specific) goes to `interfaces-adt`. Without the split, `interfaces-auth` would import `sap/ISapConfig` and depend on the ABAP package.

### 3.4 `@mcp-abap-adt/interfaces-adt` — depends on `interfaces-auth`, `interfaces-utils`

**ADT contracts** (ARCHITECTURE §4, unchanged): `adt/*`, `runtime/*`, `execution/*`, `feeds/*`, `service/*`, `shared/IReadOptions` — accepted by `adt-clients`; `adt/IAdtObject`, `adt/IAdtResponse` also by `adt-strategies`, `lib`, and `IAdtResponse` by `connection` and cloud-llm-hub. `adt/IAdtObjectState.ts` has no importer but moves: `IInterfaceConfig` composes its `IAdtObjectConfig`.

**ABAP connection:** `connection/IAbapConnection` (with `IAdtWireResponse`) and `IAbapRequestOptions` — accepted by cloud-llm-hub, `lib`, `adt-clients`, `adt-strategies`, `connection`.

**ABAP connection capabilities** — `connection/IConnectionCapabilities.ts` exports atoms, not a symbol of that name:

| symbol | accepted by |
|---|---|
| `ISessionLifecycleAware`, `ADT_SESSION_ERROR` | `adt-clients`, `connection` |
| `IDeferredResponseConnection` | `adt-clients` |
| `ICriticalSection`, `IRequestProfiling`, `AdtSessionErrorCode` | `connection` |

**Browser callback server** — `auth/ICallbackServer.ts`: `ICallbackServerOptions`, `ICallbackServerHandle<TResult>`, `CallbackServerFactory<TResult>`, accepted by `auth-providers` (`BrowserCallbackStrategy` holds a `CallbackServerFactory<TResult>` field). It imports `ILogger` (`interfaces-utils`). Like `IAuthorizationStrategy` (open question 4) it is generic OAuth machinery accepted only on the SAP side, so it lives here until a package outside it accepts it.

**Cloud ALM connection:** `ICalmConnection`, `ICalmRequestOptions`, `CalmService` + `CALM_SERVICES` — accepted by `mcp-calm-client`, `mcp-calm-server`.

**SAP/BTP configuration and authentication** — accepted only by SAP-side packages:

| from | symbols | accepted by |
|---|---|---|
| `sap/` | `ISapConfig` · `SapAuthType`, `SapConnectionType` | `connection` · `connection`, `lib` |
| `auth/` (SAP/BTP part) | `IConnectionConfig` (`sapClient`, `language`, `sessionCookies`, …) | `lib`, `auth-broker`, `auth-stores` |
| | `IAuthorizationConfig` (UAA) | `lib`, `auth-broker`, `auth-providers`, `auth-stores`, `proxy` |
| | `IConfig` | `auth-broker`, `auth-stores` |
| | `IAuthorizationStrategy` | `auth-providers` |
| | `ICertificateMaterialLoader` | `connection` |
| `token/` | `ITokenProvider` | `lib`, `auth-broker`, `auth-providers`, `mcp-calm-server` |
| | `ITokenRefresher` | `lib`, `auth-broker`, `connection`, `mcp-calm-server` |
| | `ITokenResult` | `lib`, `auth-broker`, `auth-providers` |
| | `ITokenProviderOptions` | `auth-broker` |
| | the token `AuthType` constants (`AUTH_TYPE_AUTHORIZATION_CODE`, …), `TOKEN_PROVIDER_ERROR_CODES` | `auth-providers` |
| `session/` | `ISessionStore` | `lib`, `auth-broker`, `auth-stores`, `mcp-calm-server` |
| `serviceKey/` | `IServiceKeyStore` | `lib`, `auth-broker`, `auth-stores` |
| `store/` | `STORE_ERROR_CODES` | `auth-broker`, `auth-stores` |
| `validation/` | `IHeaderValidationResult`, `IValidatedAuthConfig`, `AuthMethodPriority` | `header-validator` |
| `utils/ITokenRefreshResult.ts` | `ITokenRefreshResult` | `connection` |
| `Headers.ts` (SAP/BTP part) | `HEADER_SAP_*`, `HEADER_BTP_DESTINATION`, `HEADER_MCP_DESTINATION`, `HEADER_MCP_URL`, `HEADER_UAA_*` | `header-validator`, `proxy`, cloud-llm-hub (`HEADER_SAP_CLIENT`, `_DESTINATION`, `_LOGIN`, `_PASSWORD`) |
| | `AuthType` (`jwt` · `xsuaa` · `basic`, derived from `AUTH_TYPES`) with `AUTH_TYPES` and `AUTH_TYPE_JWT` · `_BASIC` · `_XSUAA` | `AuthType`: `auth-broker`, `header-validator`; the constants: `header-validator` |

The header groups (`SAP_CONNECTION_HEADERS`, `UAA_HEADERS`, `PRESERVED_HEADERS`, `PROXY_MODIFIED_HEADERS`, `PROXY_ROUTING_HEADERS`) are **not** here: no package imports them (§3.5).

`AdtObjectErrorCodes`, `SERVICE_BINDING_VARIANT_MAP`, `ADT_NO_FAILURE`, `TRANSPORT_SEARCH_CONFIGURATIONS_URL` stay with their `adt/` contracts.

### 3.5 `@mcp-abap-adt/interfaces` — the rest

- **Unaccepted files** — no export is imported by another package or composed by a moved contract:

  | file / symbols | note |
  |---|---|
  | `storage/ISessionState.ts`, `storage/ISessionStorage.ts` | |
  | `token/ITokenProviderResult.ts` | |
  | `auth/AuthType.ts` — public name `AuthTypeEnum` | the same union as `Headers.ts`'s `AuthType`, which is the one imported |
  | `Headers.ts` groups: `SAP_CONNECTION_HEADERS`, `UAA_HEADERS`, `PRESERVED_HEADERS`, `PROXY_MODIFIED_HEADERS`, `PROXY_ROUTING_HEADERS` | they list header names from both the generic and the SAP/BTP part; only this package depends on both (§3.6) |

- **Unimported exports inside moved files** — they move with their file and are removal candidates: `IUpdateIncludeSourceParams`, `IDeleteIncludeParams` (`adt/IAdtInclude.ts`), `IClassExecutor`, `IProgramExecutor` (`execution/IAdtExecutors.ts`), `IRunnableWithProfiling` (`execution/IAdtRunnable.ts`). Types derived from a used constant (`NetworkErrorCode`, `TokenProviderErrorCode`, `AdtSessionErrorCode`) are that constant's vocabulary, not candidates.
- Both lists are kept for one major, marked deprecated, and removed with the re-export (open question 2).
- **Transitional re-export** of every moved symbol (§5).

The unaccepted contracts stay here, not in the package their folder would suggest: moving a contract nobody uses into a new package would give it a second life it has no claim to.

### 3.6 Dependency graph

```
interfaces-utils      interfaces-network      interfaces-auth
       ▲                                            ▲
       └──────────────── interfaces-adt ────────────┘
                               ▲
                        interfaces (residual + re-export)
```

Measured cross-folder imports today that decide the arrows: `auth → logging` and `token → logging` (utils); `serviceKey`, `session`, `token`, `validation → auth` (all SAP/BTP, all in `interfaces-adt`); `adt → connection` is `IAdtWireResponse` only (inside `interfaces-adt`); `auth → sap` is `ICertificateMaterialLoader` only (split, §3.3); `auth/ICallbackServer → logging` (utils). No contract bound for `interfaces-adt` imports a file bound for `interfaces-network` (`IWebSocketTransport`, `NetworkErrors`, `ITimeoutConfig` are imported only by `index.ts`).

**Inside `Headers.ts`** the only cross-part references are the five header groups: `PROXY_MODIFIED_HEADERS` lists `HEADER_AUTHORIZATION` (generic) next to `HEADER_SAP_*`. Placing the groups in `interfaces-adt` would need an `interfaces-adt → interfaces-network` arrow. They are unaccepted, so they stay in `interfaces`, which depends on every sibling; the arrow is not added. If a package starts importing a group, it moves to `interfaces-adt` and the arrow, the table and that package's `package.json` change together. No cycle.

ARCHITECTURE §1 says the package "depends on nothing". After the split, **each package depends on no implementation and no runtime package**; contract packages may depend on sibling contract packages. §1 is updated to say exactly that.

---

## 4. Constants

1. **A constant lives with the contract whose vocabulary it is:** a union derived from it (`AuthType = (typeof AUTH_TYPES)[number]`), the error type its code map names, the protocol its header names belong to.
2. **Data only.** `as const` values and enums. No classes or functions (ARCHITECTURE §1 stays true per package); a type guard is added only when a contract needs narrowing, the way `IRenewableCredential` is meant to be narrowed to.
3. **`Headers.ts` is split** (§3.2 generic, §3.4 SAP/BTP).
4. Every package sets `"sideEffects": false`.

---

## 5. Migration

1. **Publish order:** `interfaces-utils`, `interfaces-network`, `interfaces-auth` (independent) → `interfaces-adt` → `interfaces` 45.0.0.
2. **`interfaces` 45.0.0** re-exports every moved symbol from its new package, each with `@deprecated Import from @mcp-abap-adt/interfaces-<name>`. Nothing a dependent imports disappears. It is a major because the package gains dependencies and loses the "depends on nothing" guarantee.
3. **Dependents move when they next release**, not all at once: `connection`, `lib`, `core`, `proxy`, `auth-broker`, `auth-providers`, `auth-stores`, `header-validator`, `logger`, `adt-clients`, `adt-strategies`, `mcp-calm-client`, `mcp-calm-server`, and cloud-llm-hub. `mcp-abap-adt-gcts-client` and `mcp-reports-server` declare the dependency but import nothing from it; they drop it. Each release is a manual publish, so batching them is not required.
4. **A later major of `interfaces`** removes the re-export and the unaccepted storage contracts, once no dependent imports moved symbols from it.
5. **Versions are independent** per package — no lockstep. The point of the split is that an ADT major does not bump `interfaces-auth`.

---

## 6. Repository layout

- **One repository, npm workspaces:** `packages/interfaces-utils`, `packages/interfaces-network`, `packages/interfaces-auth`, `packages/interfaces-adt`, and the existing package moved to `packages/interfaces`. History, `docs/architecture` and review stay in one place.
- **Each package keeps the existing guarantees:** biome + `tsc -p tsconfig.build.json`, its own `src/__typechecks__/` (the downstream-compiles checks move with the contracts they check), `LICENSE` and `README.md`.
- **Licence unchanged:** every package is `LGPL-3.0-only`, as `interfaces` is today (`package.json`, `LICENSE`). The split does not relicense anything; a change of licence would be a separate decision.
- **TypeScript project references** between packages, so a sibling is built before its dependent.
- **Root scripts** build and type-check all packages in dependency order.

---

## 7. New contracts this unblocks

Added only when their first accepting package is implemented (decision 11); sketched here so the placement is settled.

| contract | shape | accepted by | package |
|---|---|---|---|
| `AccessCheck<R>` | `(request: R) => Promise<boolean>` — passed or not; a throw inside counts as `false`; the null implementation answers `true` | `llm-agent` (session factory, collection registry and tools, server routes), cloud-llm-hub | `interfaces-auth` |
| request type `R` | per checking site: tool call, collection action, model, configuration | the one package that checks | that package |
| API-key credential | the key, and nothing about where it travels | several LLM providers and embedders (`openai-llm`, `anthropic-llm`, `deepseek-llm`, `openai-embedder`), `qdrant-rag` | `interfaces-auth` |
| client-credentials credential | client id, secret and token endpoint — or the token they yield | `sap-aicore-llm`, `sap-aicore-embedder` | `interfaces-auth` |
| user-and-password credential `IUserPasswordCredential` | `kind: 'user-password'`, a user, a password | `pg-vector-rag`, `hana-vector-rag` (§7.1) | `interfaces-auth` |
| token credential `ITokenCredential` | `kind: 'token'`, `token(): Promise<string>` — asked for on every use, never held as a string | `pg-vector-rag`, `hana-vector-rag` (§7.1) | `interfaces-auth` |

**A credential contract names the way in, never where it travels.** An API key is an API key whether the provider sends it as `Authorization: Bearer`, `x-api-key` or `api-key`; a user and password are the same whether they become a Basic header or connection fields. The header, query parameter or connection field is the accepting implementation's, and a consumer holding the credential never learns it. So contracts are per authentication method, not per transport.

Admission follows the pattern `connection` already uses: the accepting site constrains a type parameter (`AdtCloudConnector<TCredential extends IAuthProvider>`) and credentials carry a string-literal `kind`, never a `unique symbol` brand, so the same shape declared in two packages is satisfied by one object. Every contract has a do-nothing implementation.

### 7.1 Vector-store credentials: the database decides which methods it admits

A vector-store provider accepts a **union of the method contracts its database supports**. There is no per-database credential contract: a database that can authenticate with a user and password or with a token gets a provider constructed with either.

```ts
// interfaces-auth — one contract per method
interface IUserPasswordCredential { readonly kind: 'user-password'; user: string; password: string }
interface ITokenCredential        { readonly kind: 'token'; token(): Promise<string> }

// pg-vector-rag — what PostgreSQL admits
type PgCredential = IUserPasswordCredential | ITokenCredential;
new PgVectorRagProvider({ host, database, credential }); // credential: PgCredential
```

- **Admission.** The union in the constructor parameter is the filter: a method the database cannot use does not compile.
- **Transport stays inside.** The provider switches on `credential.kind`. In `pg-vector-rag`, a user and password become `password: string`; a token becomes `password: () => credential.token()`. `pg` 8.23.0 accepts a password function, possibly async, and calls it for each new connection (`Client._getPassword`), so every new pooled connection gets a fresh token. The consumer never learns which field carries it.
- **A token is a function, not a string.** Tokens expire (Azure Entra ID tokens after 60 minutes). Where the token comes from — `ITokenProvider` from `auth-providers`, the hub's XSUAA exchange, a cache — belongs to whoever builds the object. The database package does not depend on `auth-providers`; an adapter is one line: `{ kind: 'token', token: async () => (await provider.getTokens()).authorizationToken }`.
- **Placement.** Both contracts are accepted by two packages, so they go to `interfaces-auth`. A method only one database admits (X.509 for HANA) stays in that database's package until a second one accepts it.
- **No authentication** is one more member, `{ kind: 'none' }`; each provider decides whether its union includes it.
- **Whose credential.** Normally the service's: one object per provider, with user isolation done by the consumer (cloud-llm-hub). Passing an end user's token to the database (HANA JWT single sign-on) means a provider per session built with that user's token — the same shape as an MCP server per session; the contract does not change.

What each database admits, as checked on 2026-09-15:

| package | today | the database also supports | union to adopt |
|---|---|---|---|
| `pg-vector-rag` | connection string, or host/port/user/password/database | a token as the password (Azure Entra ID) | `IUserPasswordCredential \| ITokenCredential` |
| `hana-vector-rag` | user and password (`uid`/`pwd`), both required | JWT, SAML, X.509 (SAP HANA Cloud; the `@sap/hana-client` 2.29.27 changelog mentions JWT, SAML and X.509 connections) | `IUserPasswordCredential \| ITokenCredential`, more once the client's connection properties are checked (§8.6) |

---

## 8. Open questions

1. ~~**LLM headers that are not `Authorization`.**~~ **Resolved:** where a key travels is the implementation's (§7). Credential contracts are per authentication method; no header-shaped contract is added.
2. **The unaccepted contracts (§3.5).** Four files, five header groups and five exports inside moved files that no package imports. Remove them in 45.0.0 instead of keeping them one more major? Only repositories under `~/prj` were searched; a consumer outside them would not have shown.
3. **A separate `interfaces-sap`.** §3.4 puts SAP/BTP configuration and authentication in `interfaces-adt` because only the ABAP family accepts them. If their release rate differs from ADT's as much as ADT's differs from the rest, they could be their own package.
4. **`IAuthorizationStrategy`** describes a generic interactive OAuth login but is accepted only by `auth-providers` today, so it stays in `interfaces-adt`. It moves to `interfaces-auth` when a package outside the SAP side accepts it.
5. **Decision entry.** This rule becomes decision 26 in `docs/architecture/DECISIONS.md` once agreed; ARCHITECTURE §1 and §4 are updated in the same change.
6. ~~**Database credentials.**~~ **Resolved (§7.1):** a vector-store provider accepts the union of method contracts its database supports. `auth-providers` stays a token source behind `ITokenCredential`: every provider there is a `BaseTokenProvider` yielding an OAuth/OIDC/SAML token, and its client-credentials configuration is XSUAA-shaped (`uaaUrl`). Still open inside this:
   - **HANA connection properties.** Which `@sap/hana-client` properties carry a JWT, SAML assertion or X.509 key decides what joins `HanaCredential`.
   - **Passwords in connection strings.** Both packages accept a connection string, which can carry the password — the credential travelling where the consumer can see it. Proposed: the connection string carries the address only, and authentication always comes as a credential object. A major release of both packages.
   - **One credential object for HTTP and databases.** `IAuthProvider` is HTTP-shaped (header, cookies, TLS material) and does not fit a database wire protocol. Should `connection`'s `BasicAuthProvider` and `TokenAuthProvider` be built from `IUserPasswordCredential` and `ITokenCredential`, so one object serves ADT and a database alike?

---

## 9. Out of scope

- Moving any implementation, or changing any contract's shape.
- The `llm-agent` per-session authentication design — its own spec, built on `interfaces-auth`.
- cloud-llm-hub still depends on `interfaces` 11.6.0 through `@mcp-abap-adt/lib` 10.2.0 (`connection ^1.10.2`, `interfaces ^13.1.0`); it adopts these packages with the new `lib`.
