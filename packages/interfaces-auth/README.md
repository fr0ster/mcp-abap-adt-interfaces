# @mcp-abap-adt/interfaces-auth

Authentication: credentials, OAuth grants, tokens and the contracts around them. Nothing SAP-specific — that is [`interfaces-auth-sap`](../interfaces-auth-sap).

## TL;DR

- **The error contract** (since 5.0.0, a major) — `IAuthProviderError`: a frozen object with a `kind` out of sixteen, `facts` drawn only from allowlists this package declares, the rendered `reason` and `hint`, and for three kinds a `variant` and optional `diagnostics`. `IAuthRefusal` *is* this error, and `IAuthProviderFailure` carries it as the rejection of `getTokens()` / `refreshTokens()`. Only `@mcp-abap-adt/auth-errors` produces one (a brand the compiler checks). See [The error contract](#the-error-contract).
- **Credentials** — `IAuthProvider` with `AuthOutcome`, `IAuthRefusal`, `ILogonTarget`, `IRequestTarget`, `IAuthRejection`; `ICertificateMaterial`, `IClientAuthentication` with `ITokenRequestDraft` and `ITokenRequestAuthentication` (how a token provider's client authenticates to the authorization server, since 3.1.0; the draft's optional `tokenEndpoint` since 3.2.0), `IApiKeyCredential`, `IBearerCredential`, `ISecretLoginCredential`. Since 3.0.0 `IAuthProvider` is the process's lifecycle — `prepare`, `establish`, `authorize`, `rejected` — answered by every provider with Ok or Oops.
- **Tokens and grants** — `ITokenProvider`, `IRefreshableTokenProvider`, `ITokenRefresher`, `ITokenResult`, `ITokenRefreshResult`, `ITokenProviderOptions`, `ITokenRequestOptions` (a caller's `signal`, since 5.0.0), `OAuth2GrantType` and the OAuth2 grant constants. A failure is an `IAuthProviderFailure`; its `error.kind` says what went wrong.
- **Interactive login** — `IAuthorizationStrategy`, the callback-server contracts. No built-in bound since 5.0.0: a login ends on a result, the identity provider's refusal, or an abort of a `signal` (see [Cancelling a login](#cancelling-a-login)).
- **SAML assertions** — `IAssertionValidator`; a refused assertion is an error of kind `saml-assertion`, one `variant` per rule. Since 2.0.0 `AssertionContext.expectedInResponseTo` is optional: absent means a login declared IdP-initiated, and a validator must then **refuse** an assertion carrying `InResponseTo`, not skip the check.
- **`AUTH_TYPE_JWT` and `AUTH_TYPE_BASIC`** — a bearer token and a user with a password. `AUTH_TYPE_XSUAA` is *not* here: XSUAA is a BTP service, so it and the union over all three are in `interfaces-auth-sap`.
- **Arrived in 1.2.0 from `@mcp-abap-adt/interfaces-adt`**, where three repositories — `auth-broker`, `auth-stores`, `auth-providers` — imported 10, 7 and 17 names and not one was an ADT contract. They tracked the ADT contract's release rate to describe authentication.
- **Optional fields accept an explicit `undefined`** (since 4.0.0, a major: under `exactOptionalPropertyTypes` it breaks assigning these objects to a consumer type that declares the field `?: T`) on the objects a provider hands out — `ITokenResult`, `AuthorizationRequest`, `ICallbackServerOptions`, `AssertionContext`, `ValidatedAssertion`, `ICertificateMaterial`: declared `?: T | undefined`, so under `exactOptionalPropertyTypes` a provider may build them with `refreshToken: undefined` and no cast. A consumer with that flag that assigns one to its own type declaring the field `?: T` widens that field the same way.
- Depends on `@mcp-abap-adt/interfaces-utils`, for `ILogger`. Types and constants; no implementation.

## Install

```bash
npm install @mcp-abap-adt/interfaces-auth
```

## Use

```typescript
import type {
  AuthOutcome,
  IAuthProvider,
  ILogonTarget,
  IRequestTarget,
} from '@mcp-abap-adt/interfaces-auth';
```

`@mcp-abap-adt/auth-providers` ships the implementations; a consumer can write its own against this contract. The ABAP connection calls `prepare()` → `establish()` per logon → `authorize()` per request attempt → `rejected()` on a refusal, the same for every provider.

## The error contract

What a provider, a logon target or the connection reports when it cannot authenticate — an Oops's `refusal`, and the `error` of the `IAuthProviderFailure` that `getTokens()` / `refreshTokens()` reject with — is one type, `IAuthProviderError`:

- **`kind`** — one of `AUTH_PROVIDER_ERROR_KINDS`: `configuration`, `client-certificate`, `client-authentication`, `request-failed`, `tls`, `interactive-login`, `saml-assertion`, `snc`, `credential-refused`, `system-refused`, `renewal-unchanged`, `token-binding`, `not-prepared`, `logon-target`, `connection`, `unknown`.
- **`facts`** — per kind, and only members of the allowlists declared here (`CONFIG_FIELDS`, `OPERATIONS`, `TLS_FAILURE_CODES`, `OAUTH_ERROR_CODES`, `RFC_KEYS`, `ASSERTION_RULES`, `SNC_PROBLEMS`, …, each a frozen `as const` array beside its union), the branded integers `HttpStatus`, `Count` and `Port`, or a flag. No message, no server text, no secret.
- **`variant`** — for `saml-assertion`, `snc` and `configuration`, the rule, the problem or the case, lifted beside `kind` so that `e.kind === 'snc' && e.variant === 'library-not-found'` narrows the whole object. Narrowing on `e.facts.problem` does not: TypeScript narrows a union only on a discriminant of its members.
- **`diagnostics`** — optional, for those three kinds only, and only the field the variant permits (`SAML_RULE_DIAGNOSTIC`, `SNC_PROBLEM_DIAGNOSTICS`, `CONFIG_CASE_DIAGNOSTICS`): the document value a SAML rule refused, the SNC library paths, the two redirect URIs that differ.
- **`reason`** and **`hint`** — the words, rendered from `kind` and `facts` when the error is minted. Show them; never decide on them.

**Produced only by `@mcp-abap-adt/auth-errors`.** The error carries a property keyed by a symbol this package declares and does not export, so an object literal, a class instance or a parsed JSON value is not an `IAuthProviderError` to the compiler. A provider, a logon target or a test double builds one with an `auth-errors` builder, and relays a refusal it received as the object it is — never a copy. `auth-errors` also reads anything thrown into this contract (`classify`, `readFailure`).

**What the compiler guarantees, and where it stops.** For an object literal and for declared fields, the pairing is checked: a `variant` decides which `facts` and `diagnostics` fields may appear, and every field another variant or kind carries is `?: never`, so naming one does not compile. TypeScript has no exact object types, though: a source typed with an index signature (`Record<string, string>` as `diagnostics`), or a spread of a minted error with another value, can carry keys the types never see. Two things close that at run time — the producers' shape check forbids spreading a minted error, and `@mcp-abap-adt/auth-errors` re-validates and rebuilds every error at each hand-off (`classifyOutcome`, `relayOutcome`, `readFailure`) from `kind` and its allowlisted facts only, so an extra key never survives. `src/__typechecks__/exactTypesLimit.ts` records the cases that compile, as the known limit.

### Handle every kind

A consumer that decides on an error handles **every** kind, in one of the two patterns `@mcp-abap-adt/auth-errors` provides — both checked by the compiler:

```typescript
import { matchKind, unreachableKind } from '@mcp-abap-adt/auth-errors';

// A: a handler per kind; a missing handler does not compile
const text = matchKind(error, {
  configuration: (e) => `check ${e.variant}`,
  'credential-refused': (e) => 'sign in again',
  // … every other kind …
  unknown: (e) => e.reason,
});

// B: a switch whose default compiles only when every kind was handled
switch (error.kind) {
  case 'configuration':
    return fix(error);
  // … every other kind …
  default:
    return fallback(unreachableKind(error));
}
```

A `switch` with neither is not checked by TypeScript, and is not a supported way to read this type. A new kind — or a new member of a discriminant you switch on (`variant`, `problem`, `outcome`, `verdict`, …) — is a major of this package, so code written either way stops compiling on the upgrade instead of meeting the kind at run time. Both helpers also take an error from a newer producer whose kind this build does not know, without throwing: `matchKind` sends it to the `unknown` handler, and `unreachableKind` returns it as an `unknown` error (`facts.operation: 'unfamiliar-error'`); a foreign error of a known kind with valid facts reaches that kind's handler. A new member of a **code list** (`SystemCode`, `TlsFailureCode`, `OAuthErrorCode`, `RfcKey`, `ConfigField`, `SamlStatusCode`) is a minor — do not assert exhaustiveness over a code list. A new **optional fact field** on an existing kind or variant is a minor too: a reader that does not read it is unaffected, and only `@mcp-abap-adt/auth-errors` builds facts. Making an optional field required, removing a field or narrowing its type is a major. In 5.1.0, `interactive-login`'s `aborted` gained `strategy?: 'browser' | 'manual'` (as `disposed` has) and `failed` gained `oauthError?: OAuthErrorCode` (a registered code only); every other outcome and kind declares both as `?: never`.

### Cancelling a login

There is no built-in timeout on a login (since 5.0.0). It ends on a result, the identity provider's explicit refusal, or an abort:

- **A caller** passes `getTokens({ signal })` / `refreshTokens({ signal })` (`ITokenRequestOptions`). An abort releases that caller only — its call rejects with an `IAuthProviderFailure` of kind `interactive-login`, outcome `aborted` (with `strategy: 'browser' | 'manual'` when the provider knows which, since 5.1.0) — while a login other callers still wait on runs on for them; the login itself is aborted once every caller waiting on it has aborted. A caller that wants a bound passes `AbortSignal.timeout(ms)`.
- **A strategy** receives the provider's signal for one login as `AuthorizationRequest.signal`, and **must** honour it as it honours its own option signal: end the login, release what it holds (a socket, a stdin reader), then reject.
- **A callback server** ends its scope on a result, `fail`, the identity provider's explicit error, or an abort of `ICallbackServerOptions.signal` — nothing else.

Every new parameter and field is optional, so a token provider or a strategy written for 4.x still satisfies the types; it just cannot be cancelled. `ITokenResult.refreshTokenDisposition` (`'keep'`, `'replace'`, `'clear'`) tells a store what to do with a refresh token it holds; absent, read it as 4.x did — a `refreshToken` present replaces, none keeps.

## What belongs here

A contract whose own fields name nothing SAP or BTP — that is the rule, and it is decision 35. `AUTH_TYPE_BASIC` is a user and a password anywhere; `AUTH_TYPE_XSUAA` names a BTP service, so it is not here.

Everything SAP- or BTP-specific is `@mcp-abap-adt/interfaces-auth-sap`, which depends on this package: `ISapConfig`, `SapAuthType`, `AuthType`/`AUTH_TYPES`, `IAuthorizationConfig`, `ICertificateMaterialLoader` and the two validation results. The destination and its stores — `IConfig`, `IConnectionConfig` (it carries `sapClient`), `ITokenProviderResult`, `IServiceKeyStore`, `ISessionStore` — are `@mcp-abap-adt/interfaces-auth-broker`, which stands on `interfaces-auth-sap` (since its 2.0.0). Nothing authentication-related is in `@mcp-abap-adt/interfaces-adt` any more, as of its 9.0.0.

## Migrating to 5.0.0

Breaks **whoever builds a refusal** (a provider, a logon target, a test double), **whoever imports the removed codes**, and **whoever passes `ICallbackServerOptions.timeoutMs`**. Reading `reason` and `hint` is unchanged.

| On 4.x a consumer… | On 5.0.0 |
|---|---|
| reads `refusal.reason` / `refusal.hint` | compiles unchanged |
| builds `{ ok: false, refusal: { reason, hint } }` (a provider, a target, a test double) | does not compile (the brand); build it with an `@mcp-abap-adt/auth-errors` builder |
| copies or spreads a refusal into a new object | compiles (the spread keeps the brand), but the producers' shape check refuses it; relay the error object itself |
| matches words to decide (`reason.includes('expired')`) | switches on `refusal.kind` and `facts`, through `matchKind` or `unreachableKind` ([Handle every kind](#handle-every-kind)) |
| catches `instanceof TokenProviderError` / `ValidationError` / `CertificateMaterialError` / … from `getTokens()` | `readFailure(thrown, operation)` from `auth-errors`, then switches on `error.kind` |
| calls `refusalWords(error, what)` (auth-providers) | `classify(error, operation)` from `auth-errors`; `.reason` / `.hint` |
| imports `TOKEN_PROVIDER_ERROR_CODES` / `TokenProviderErrorCode` or `ASSERTION_ERROR_CODES` / `AssertionErrorCode` | switches on `error.kind` (`saml-assertion` for a refused assertion); `STORE_ERROR_CODES` stays |
| passes `timeoutMs` to a callback server | passes `signal: AbortSignal.timeout(ms)`; without a signal the scope waits for a result or an abort |
| implements `ITokenProvider` / `IRefreshableTokenProvider` | nothing required; take `options?: ITokenRequestOptions` to honour cancellation, and set `refreshTokenDisposition` on each result |
| implements `IAuthorizationStrategy` | honour `request.signal`: end the login, release what it holds, then reject |

`@mcp-abap-adt/interfaces-auth-sap` 3.1.0 accepts `^4.0.0 || ^5.0.0` — nothing it declares reaches what changed — so a consumer moving to 5.0.0 keeps one copy of this package. The CHANGELOG lists every added symbol.

## Migrating to 4.0.0

Nothing to do without `exactOptionalPropertyTypes`. With it, a value of one of the widened types (`ITokenResult`, `AuthorizationRequest`, `ICallbackServerOptions`, `AssertionContext`, `ValidatedAssertion`, `ICertificateMaterial`) assigned into a type of your own declaring the same field `?: T` no longer compiles: widen your field to `?: T | undefined`, or copy only the fields that are present. The CHANGELOG has the details.

## Migrating to 3.0.0

Breaks **implementers of `IAuthProvider`** and anyone narrowing on `IRenewableCredential`. Each of the four moments returns an `AuthOutcome`; the old members map as the CHANGELOG's table shows — a header or cookies are written in `authorize()`, TLS material and RFC logon parameters in `establish()`, and renewal is `rejected()`. A process no longer asks a credential anything: it calls the four moments in order. Decision 40.

## Migrating to 2.0.0

One change, and it breaks only **implementers of `IAssertionValidator`**: `AssertionContext.expectedInResponseTo` is now `string | undefined`.

- **Present** — the AuthnRequest ID this response must answer. Compare `InResponseTo` with it, as before.
- **Absent** — the login was declared IdP-initiated; no request was sent. Refuse an assertion that carries `InResponseTo` at all. Treating absence as "nothing to check" is the mistake this contract exists to prevent: an SP-initiated assertion replayed into an IdP-initiated login would pass.

A caller that builds an `AssertionContext` changes nothing. Why the field became optional: UAA and XSUAA refuse, on the saml2-bearer grant, any assertion carrying `InResponseTo`, so an IdP-initiated assertion is the only kind a bearer flow can use, and the context has to be able to say so.

`ValidatedAssertion.raw` is now documented as the validator's unchanged input — a Response, or a bare Assertion where the validator accepts one — without promising that a flow forwards it verbatim. Its type is unchanged.

`@mcp-abap-adt/interfaces-auth-sap` 1.0.1 accepts `^1.2.0 || ^2.0.0`, so a consumer moving to 2.0.0 keeps one copy of this package.

## Coming from `@mcp-abap-adt/interfaces`

Replace the package name in the import. The facade is **deleted** as of its 52.0.0, which was never published — npm still serves 51.0.0, with every symbol re-exported and deprecated, to anyone pinned to it. There is nothing further to move to: take the package that declares the name.

## Licence

`LGPL-3.0-only`.
