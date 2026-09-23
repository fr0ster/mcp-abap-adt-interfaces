# @mcp-abap-adt/interfaces-auth

Authentication: credentials, OAuth grants, tokens and the contracts around them. Nothing SAP-specific — that is [`interfaces-auth-sap`](../interfaces-auth-sap).

## TL;DR

- **Credentials** — `IAuthProvider`, `IRenewableCredential`, `ICertificateMaterial`, `IApiKeyCredential`, `IBearerCredential`, `ISecretLoginCredential`.
- **Tokens and grants** — `ITokenProvider`, `ITokenRefresher`, `ITokenResult`, `ITokenRefreshResult`, `ITokenProviderOptions`, `TOKEN_PROVIDER_ERROR_CODES`, `OAuth2GrantType` and the OAuth2 grant constants.
- **Interactive login** — `IAuthorizationStrategy`, the callback-server contracts.
- **SAML assertions** — `IAssertionValidator`, `ASSERTION_ERROR_CODES`.
- **`AUTH_TYPE_JWT` and `AUTH_TYPE_BASIC`** — a bearer token and a user with a password. `AUTH_TYPE_XSUAA` is *not* here: XSUAA is a BTP service, so it and the union over all three are in `interfaces-auth-sap`.
- **Arrived in 1.2.0 from `@mcp-abap-adt/interfaces-adt`**, where three repositories — `auth-broker`, `auth-stores`, `auth-providers` — imported 10, 7 and 17 names and not one was an ADT contract. They tracked the ADT contract's release rate to describe authentication.
- Depends on `@mcp-abap-adt/interfaces-utils`, for `ILogger`. Types and constants; no implementation.

## Install

```bash
npm install @mcp-abap-adt/interfaces-auth
```

## Use

```typescript
import type {
  IAuthProvider,
  ICertificateMaterial,
  IRenewableCredential,
} from '@mcp-abap-adt/interfaces-auth';
```

`@mcp-abap-adt/connection` ships implementations (`BasicAuthProvider`, `TokenAuthProvider`, …); a consumer can write its own against this contract.

## What belongs here

A contract whose own fields name nothing SAP or BTP — that is the rule, and it is decision 35. `AUTH_TYPE_BASIC` is a user and a password anywhere; `AUTH_TYPE_XSUAA` names a BTP service, so it is not here.

Everything SAP- or BTP-specific is `@mcp-abap-adt/interfaces-auth-sap`, which depends on this package: `ISapConfig`, `SapAuthType`, `AuthType`/`AUTH_TYPES`, `IAuthorizationConfig`, `IConfig`, `IConnectionConfig` (it carries `sapClient`), `ITokenProviderResult`, `IServiceKeyStore`, `ISessionStore` and the two validation results. Nothing authentication-related is in `@mcp-abap-adt/interfaces-adt` any more, as of its 9.0.0.

## Coming from `@mcp-abap-adt/interfaces`

Replace the package name in the import. The facade is **deleted** as of its 52.0.0, which was never published — npm still serves 51.0.0, with every symbol re-exported and deprecated, to anyone pinned to it. There is nothing further to move to: take the package that declares the name.

## Licence

`LGPL-3.0-only`.
