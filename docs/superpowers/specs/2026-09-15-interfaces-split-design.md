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
  | `@mcp-abap-adt/interfaces` | what no package accepts (today: seven symbols) + a transitional re-export of everything | all of the above |

- **Migration.** `interfaces` 45.0.0 re-exports what moved, marked deprecated. The eight dependent packages move their imports when they next release. A later major removes the re-export.
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
- **Several accepting packages, all on the SAP side** — the ABAP family (`connection`, `lib`, `proxy`, `auth-*`, `adt-clients`, `header-validator`, `logger`) and the Cloud ALM family (`mcp-calm-client`, `mcp-calm-server`) → `interfaces-adt` or `interfaces-utils`, by what it is.
- **Accepted across families** (the ABAP family and `llm-agent` / the hub) → `interfaces-auth`, `interfaces-network` or `interfaces-utils`, by what it is.
- **Accepted by nobody** → not moved; a candidate for removal (decision 11: zero callers is evidence of an unused contract).

This extends decisions 11 and 24 from members and shapes to packages, and does not change decisions 3, 20 or 23: contracts stay atoms, composed at the point of use, never inherited.

**What would change it.** A second family that accepts most of `interfaces-adt`; then the split is along the wrong line and the family boundary should be redrawn.

---

## 3. Package map

Acceptors below were found by searching every repository under `~/prj` for the symbol, excluding `node_modules`, `dist`, worktrees, tests, scripts, the `mcp-abap-adt-workspace` mirrors, backups and `mcp-abap-adt-interfaces` itself. A name match is evidence, not proof: each move is re-checked against the importing file when it is planned.

### 3.1 `@mcp-abap-adt/interfaces-utils` — depends on nothing

| from | symbols | accepted by |
|---|---|---|
| `logging/` | `ILogger` | `logger`, `proxy`, `auth-broker`, `auth-providers`, `auth-stores`, `adt-clients`, `connection`, `lib`, `mcp-calm-server`, cloud-llm-hub (`llm-agent` declares its own `ILogger`) |
| `logging/` | `LogLevel` (enum) | `logger`, `proxy`, `mcp-sap-docs` |

### 3.2 `@mcp-abap-adt/interfaces-network` — depends on nothing

| from | symbols | accepted by |
|---|---|---|
| `connection/IWebSocketTransport.ts` | `IWebSocketTransport` and its message kinds | `adt-clients`, `connection` |
| `connection/NetworkErrors.ts` | `NETWORK_ERROR_CODES` | `connection` |
| `utils/ITimeoutConfig.ts` | `ITimeoutConfig` | `adt-clients`, `connection` |
| `Headers.ts` (generic part) | `HEADER_AUTHORIZATION`, `HEADER_CONTENT_TYPE`, `HEADER_ACCEPT`, `HEADER_SESSION_ID`, `HEADER_MCP_SESSION_ID`, `HEADER_X_MCP_SESSION_ID` | `proxy`, cloud-llm-hub |

### 3.3 `@mcp-abap-adt/interfaces-auth` — depends on nothing

Only what is not SAP- or BTP-specific.

| from | symbols | accepted by |
|---|---|---|
| `auth/IAuthProvider.ts` | `IAuthProvider`, `IRenewableCredential` | `connection` (`CredentialAbapConnection`, `AdtCloudConnector`, `AdtOnPremConnector`); next: `llm-agent-mcp` |
| `auth/ICertificateMaterialLoader.ts` (shape only) | `ICertificateMaterial` | `connection`; returned by `IAuthProvider.transportMaterial()` |

The file `auth/ICertificateMaterialLoader.ts` is **split**: `ICertificateMaterial` goes here, `ICertificateMaterialLoader` (whose `load(config: ISapConfig)` is SAP-specific) goes to `interfaces-adt`. Without the split, `interfaces-auth` would import `sap/ISapConfig` and depend on the ABAP package.

### 3.4 `@mcp-abap-adt/interfaces-adt` — depends on `interfaces-auth`, `interfaces-utils`

**ADT contracts** (ARCHITECTURE §4, unchanged): `adt/*`, `runtime/*`, `execution/*`, `feeds/*`, `service/*`, `shared/IReadOptions` (accepted by `adt-clients`).

**ABAP connection:** `connection/IAbapConnection` (with `IAdtWireResponse`) and `IAbapRequestOptions` — accepted by cloud-llm-hub, `lib`, `adt-clients`, `connection`.

**Cloud ALM connection:** `ICalmConnection`, `ICalmRequestOptions`, `CalmService` + `CALM_SERVICES` — accepted by `mcp-calm-client`, `mcp-calm-server`.

**SAP/BTP configuration and authentication** — accepted only by SAP-side packages:

| from | symbols | accepted by |
|---|---|---|
| `sap/` | `ISapConfig` · `SapAuthType`, `SapConnectionType` | `connection` · `connection`, `lib` |
| `auth/` (SAP/BTP part) | `IConnectionConfig` (`sapClient`, `language`, `sessionCookies`, …) | `lib`, `auth-broker`, `auth-stores` |
| | `IAuthorizationConfig` (UAA) | `lib`, `auth-broker`, `auth-providers`, `auth-stores`, `proxy` |
| | `IConfig` | `auth-broker`, `auth-stores` |
| | `AuthType` (`jwt` · `xsuaa` · `basic`) | `auth-broker`, `header-validator` |
| | `IAuthorizationStrategy` | `auth-providers` |
| | `ICertificateMaterialLoader` | `connection` |
| `token/` | `ITokenProvider` | `lib`, `auth-broker`, `auth-providers`, `mcp-calm-server` |
| | `ITokenRefresher` | cloud-llm-hub, `lib`, `auth-broker`, `connection`, `mcp-calm-server` |
| | `ITokenResult` | `lib`, `auth-broker`, `auth-providers` |
| | `ITokenProviderOptions` | `auth-broker` |
| | the token `AuthType` constants (`AUTH_TYPE_AUTHORIZATION_CODE`, …), `TOKEN_PROVIDER_ERROR_CODES` | `auth-providers` |
| `session/` | `ISessionStore` | `lib`, `auth-broker`, `auth-stores`, `proxy`, `mcp-calm-server` |
| `serviceKey/` | `IServiceKeyStore` | `lib`, `auth-broker`, `auth-stores`, `proxy` |
| `store/` | `STORE_ERROR_CODES` | `auth-broker`, `auth-stores` |
| `validation/` | `IHeaderValidationResult`, `IValidatedAuthConfig`, `AuthMethodPriority` | `header-validator` |
| `utils/ITokenRefreshResult.ts` | `ITokenRefreshResult` | `connection` |
| `Headers.ts` (SAP/BTP part) | `HEADER_SAP_*`, `HEADER_BTP_DESTINATION`, `HEADER_MCP_DESTINATION`, `HEADER_MCP_URL`, UAA headers, the header groups (`SAP_CONNECTION_HEADERS`, `UAA_HEADERS`, `PRESERVED_HEADERS`, `PROXY_MODIFIED_HEADERS`), `AUTH_TYPE_JWT` · `_BASIC` · `_XSUAA` | `header-validator` (e.g. `HEADER_SAP_URL`), `proxy` |

`AdtObjectErrorCodes`, `SERVICE_BINDING_VARIANT_MAP`, `ADT_NO_FAILURE`, `TRANSPORT_SEARCH_CONFIGURATIONS_URL` stay with their `adt/` contracts.

### 3.5 `@mcp-abap-adt/interfaces` — the rest

- **Unaccepted** — no package outside this repository names them: `storage/ISessionState`, `storage/ISessionStorage`, `auth/ICallbackServer`, `token/ITokenProviderResult`, `connection/IConnectionCapabilities` (with `ADT_SESSION_ERROR`, unless a use of the constant is found), `PROXY_ROUTING_HEADERS`, `AUTH_TYPES` (its derived `AuthType` in `Headers.ts` is unaccepted with it). Kept for one major, marked deprecated; removed with the re-export (open question 2).
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

Measured cross-folder imports today that decide the arrows: `auth → logging` and `token → logging` (utils); `serviceKey`, `session`, `token`, `validation → auth` (all SAP/BTP, all in `interfaces-adt`); `adt → connection` is `IAdtWireResponse` only (inside `interfaces-adt`); `auth → sap` is `ICertificateMaterialLoader` only (split, §3.3). No arrow from `interfaces-adt` to `interfaces-network` exists today. No cycle.

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
3. **Dependents move when they next release**, not all at once: `connection`, `lib`, `proxy`, `auth-broker`, `auth-providers`, `auth-stores`, `header-validator`, `logger`. Each release is a manual publish, so batching them is not required.
4. **A later major of `interfaces`** removes the re-export and the unaccepted storage contracts, once no dependent imports moved symbols from it.
5. **Versions are independent** per package — no lockstep. The point of the split is that an ADT major does not bump `interfaces-auth`.

---

## 6. Repository layout

- **One repository, npm workspaces:** `packages/interfaces-utils`, `packages/interfaces-network`, `packages/interfaces-auth`, `packages/interfaces-adt`, and the existing package moved to `packages/interfaces`. History, `docs/architecture` and review stay in one place.
- **Each package keeps the existing guarantees:** biome + `tsc -p tsconfig.build.json`, its own `src/__typechecks__/` (the downstream-compiles checks move with the contracts they check), `LICENSE` (MIT) and `README.md`.
- **TypeScript project references** between packages, so a sibling is built before its dependent.
- **Root scripts** build and type-check all packages in dependency order.

---

## 7. New contracts this unblocks

Added only when their first accepting package is implemented (decision 11); sketched here so the placement is settled.

| contract | shape | accepted by | package |
|---|---|---|---|
| `AccessCheck<R>` | `(request: R) => Promise<boolean>` — passed or not; a throw inside counts as `false`; the null implementation answers `true` | `llm-agent` (session factory, collection registry and tools, server routes), cloud-llm-hub | `interfaces-auth` |
| request type `R` | per checking site: tool call, collection action, model, configuration | the one package that checks | that package |
| LLM credentials | API key, OAuth client credentials — each a small contract with a literal `kind` | several providers (`openai-llm`, `anthropic-llm`, `deepseek-llm`, `sap-aicore-llm`, embedders) | `interfaces-auth` |
| vector-store credentials | connection user/password | `pg-vector-rag`, `hana-vector-rag` | `interfaces-auth` |

Admission follows the pattern `connection` already uses: the accepting site constrains a type parameter (`AdtCloudConnector<TCredential extends IAuthProvider>`) and credentials carry a string-literal `kind`, never a `unique symbol` brand, so the same shape declared in two packages is satisfied by one object. Every contract has a do-nothing implementation.

---

## 8. Open questions

1. **LLM headers that are not `Authorization`.** Anthropic sends `x-api-key`, Qdrant `api-key`; `IAuthProvider.authorizationHeader()` answers only the `Authorization` value. A separate "authentication headers" contract, or a widened one — decided with the `llm-agent` spec.
2. **The unaccepted contracts (§3.5).** Seven symbols no package names. Remove them in 45.0.0 instead of keeping them one more major? The search excluded tests and scripts, so a test-only or script-only use would not have shown.
3. **A separate `interfaces-sap`.** §3.4 puts SAP/BTP configuration and authentication in `interfaces-adt` because only the ABAP family accepts them. If their release rate differs from ADT's as much as ADT's differs from the rest, they could be their own package.
4. **`IAuthorizationStrategy`** describes a generic interactive OAuth login but is accepted only by `auth-providers` today, so it stays in `interfaces-adt`. It moves to `interfaces-auth` when a package outside the SAP side accepts it.
5. **Decision entry.** This rule becomes decision 26 in `docs/architecture/DECISIONS.md` once agreed; ARCHITECTURE §1 and §4 are updated in the same change.

---

## 9. Out of scope

- Moving any implementation, or changing any contract's shape.
- The `llm-agent` per-session authentication design — its own spec, built on `interfaces-auth`.
- cloud-llm-hub still depends on `interfaces` 11.6.0 through `@mcp-abap-adt/lib` 10.2.0 (`connection ^1.10.2`, `interfaces ^13.1.0`); it adopts these packages with the new `lib`.
