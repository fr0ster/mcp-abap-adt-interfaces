# One `IAuthProvider` contract: the process calls the same moments, the provider does the work

**Status:** draft for review. No plan yet.
**Package:** `@mcp-abap-adt/interfaces-auth` — a major (3.0.0).
**Consumers that change with it:** `@mcp-abap-adt/auth-providers` (every
implementation lives there), `@mcp-abap-adt/connection` (the process),
`@mcp-abap-adt/auth-broker`, `mcp-abap-adt` (the server).
**Follows from:** the SNC logon design in auth-providers PR #55, which needed a
consumer-side branch for a new way in — the thing this removes.

## Principle

A provider is **injected** into the process, and the process **delegates**
authentication to it through a contract it calls the same way for every
provider — basic, authorization code, SAML, a certificate, passwordless SNC or
anything later. The process never asks what it was given, never narrows, never
branches on a kind. Each call answers the same way: **"Ok, go on"** or **"Oops,
not authenticated — here is why and what to do"**. Everything specific to a
way in is the provider's.

Isolation is at the contract: the process depends on `IAuthProvider`; a
provider depends on the targets the wire hands it; neither knows the other's
implementation.

## What is wrong today

Measured on the default branches (interfaces `c4174ce`, connection 9.4.2,
auth-providers 4.2.1, auth-broker 3.0.4, server `0c65bb5e`):

1. **The process interrogates the credential.** `CredentialAbapConnection`
   asks `authorizationHeader()` and `cookies()` per request and
   `transportMaterial()` for TLS, and branches on `null` / `{}` — most
   credentials answer "nothing" to most questions.
2. **Renewal is a runtime narrowing.** `IRenewableCredential` is a separate
   atom (decision 23), so every consumer that meets a 401 writes
   `typeof c.renew === 'function'` — the "what did we get" check.
3. **The RFC logon bypasses the credential.** `rfcParamsFrom(config)` reads
   `username`/`password` from the config; the credential handed to the
   connector does not take part in an RFC logon at all.
4. **Two provider contracts.** auth-providers implements `ITokenProvider`
   (tokens); connection implements `IAuthProvider` (Basic, Token, Saml,
   Certificate) and wraps tokens in `TokenAuthProvider`. The broker hands out
   token strings, and the server builds a credential per auth type.
5. **A new way in is a new branch.** SNC needed a new optional interface, a
   guard, and a server case (auth-providers PR #55, first design).

## The contract

In `@mcp-abap-adt/interfaces-auth`:

```ts
/** What every call answers. */
export type AuthOutcome = { ok: true } | { ok: false; refusal: IAuthRefusal };

export interface IAuthRefusal {
  /** What went wrong, for a log and a user: "the SAP Secure Login Client has no certificate". */
  reason: string;
  /** What to do about it, when the provider knows: "log on in the Secure Login Client". */
  hint?: string;
}

export interface IAuthProvider {
  /** For logs, so which provider ran is never inferred from behaviour. */
  readonly kind: string;

  /** Once per connect, before anything is sent: load material, log in, find a library. */
  prepare(): Promise<AuthOutcome>;

  /** At every logon the wire performs — an HTTP session's establishment, each RFC conversation's open. */
  establish(logon: ILogonTarget): Promise<AuthOutcome>;

  /** Before every request attempt, the establishing one included. */
  authorize(request: IRequestTarget): Promise<AuthOutcome>;

  /** The system refused. Ok: the provider fixed it, try once more. Oops: give up with this refusal. */
  rejected(rejection: IAuthRejection): Promise<AuthOutcome>;
}

/** Implemented by the wire. What a logon can be given. */
export interface ILogonTarget {
  /** TLS client material for the connection being opened. */
  tlsMaterial(material: ICertificateMaterial): AuthOutcome;
  /** Named logon parameters — for RFC, what replaces or accompanies `user`/`passwd`. */
  logonParameters(parameters: Readonly<Record<string, string>>): AuthOutcome;
}

/** Implemented by the wire. What a request can be given. */
export interface IRequestTarget {
  header(name: string, value: string): void;
  cookies(value: string): void;
}

export interface IAuthRejection {
  /** Where the system said no. */
  at: 'logon' | 'request';
  /** The HTTP status, when there is one (401). */
  status?: number;
  /** The wire's error, whole — a provider reads what it recognises (e.g. a GSS code). */
  error: unknown;
}
```

`ICertificateMaterial` stays as it is. `authorizationHeader()`, `cookies()`,
`transportMaterial()` and `IRenewableCredential` are removed.

### Rules the contract carries

- **No throwing across the contract.** A provider that fails returns Oops with
  a refusal; an exception out of a provider is a bug in the provider, and the
  process reports it as one (the refusal names the provider's `kind`).
- **A target answers too.** `tlsMaterial()` / `logonParameters()` return Ok when
  the wire can use what it was given, and Oops when it cannot — an HTTP wire
  given logon parameters answers `"this connection logs on over HTTP; <kind>
  needs a wire that takes logon parameters (RFC)"`. The provider returns that
  outcome from `establish()` as it is. So a credential and a wire chosen
  independently (they are two axes, by design) meet at the first logon, and a
  mismatch is an Oops at `connect()`, before any request — never a request
  sent without its credential.
- **Nothing to add is not an answer to check.** A provider with nothing for a
  moment calls no target and returns Ok. The process does the same thing
  whether it did or not.
- **`authorize()` is per attempt.** A provider that renews on expiry does it
  here; a token asked for once and kept by the process would be the stale
  one. The wire asks per attempt already (`authHeaders` in the establishing
  context).
- **`rejected()` is the only renewal.** It replaces `IRenewableCredential`:
  every provider answers it — a token provider renews and says Ok; a password
  cannot be renewed and says Oops "user or password refused"; SNC says Oops
  with the GSS cause and what to do. The process retries **once** after Ok.

### What the process does — always the same

```
connect():
  prepare()                        Oops → connect() fails with the refusal
  for each logon the wire makes:
    establish(logon target)        Oops → that logon fails with the refusal
  logon refused by the system      → rejected({ at: 'logon', error })
                                     Ok → retry the logon once; Oops → fail
request():
  authorize(request target)        Oops → nothing is sent; fail with the refusal
  401                              → rejected({ at: 'request', status: 401, error })
                                     Ok → retry once; Oops → fail with the refusal
```

No `kind` comparison, no `typeof`, no `null` check on a provider anywhere in
the process.

## Every way in, on the one contract

| Provider | `prepare` | `establish` | `authorize` | `rejected` |
|---|---|---|---|---|
| Basic | Ok | RFC: `logonParameters({ user, passwd })`; HTTP: — | HTTP: `header('Authorization', 'Basic …')` | Oops "user or password refused" |
| Token (authorization code, OIDC, client credentials, UAA passcode, SAML bearer) | `getTokens()` — cached, refreshed or logged in | — | `header('Authorization', 'Bearer …')` from the current token | `refreshTokens()` → Ok; refused → Oops |
| SAML session cookies | log in, hold the cookies | — | `cookies(…)` | log in again → Ok / Oops |
| Certificate (file) | load the material | `tlsMaterial(…)` | — | Oops "certificate refused" |
| SNC (Secure Login Client, …) | find the library, check the product | `logonParameters({ snc_mode, snc_partnername, snc_qop, snc_lib })` | — | Oops with the GSS cause and hint |

"—" means the provider calls no target at that moment and returns Ok.

**Basic over RFC through the provider** fixes item 3: the RFC wire gets `user`
and `passwd` from the credential it was handed, like every other logon
parameter, and `rfcParamsFrom` stops reading them from the config.

## Where the pieces live

- **`interfaces-auth`**: the contract above. Nothing else moves.
- **`auth-providers`**: **every** `IAuthProvider` implementation. The token
  providers implement it natively on top of `BaseTokenProvider`
  (`getTokens()` / `refreshTokens()`); Basic, Certificate and the SAML-cookie
  provider move here from `connection`; `TokenAuthProvider` is no longer
  needed. The package's scope becomes "credentials for the process", no longer
  "token providers only".
- **`connection`**: the process only. It consumes `IAuthProvider`, implements
  `ILogonTarget` / `IRequestTarget` in each wire, and contains no provider.
- **`auth-broker`**: `getProvider(destination): Promise<IAuthProvider>` — the
  provider for a destination, already paired with the stores. Tokens a
  provider renews inside `prepare()` or `rejected()` reach the session store
  before the provider answers Ok; the broker injects that persistence into the
  provider (the exact mechanism is the broker's PR). The token-string API
  stays for consumers that want only a token.
- **Server**: `provider = await broker.getProvider(destination)` → connector.
  Choosing a way in is configuration (`authType`); adding one is a new
  provider in auth-providers and a new case in the broker's factory — never a
  change in the process or the server.

## SNC is part of this development

Not a follow-up: SNC is the provider this contract was drawn for, and it ships
in step 2 with the rest.

- **Unchanged from auth-providers PR #55** (spec and plans reviewed and
  approved there): SNC library discovery (explicit `sncLib` only; automatic
  candidates `SNC_LIB_64` / `SNC_LIB` / registry / macOS bundle, the unusable
  skipped; architecture from the PE / Mach-O incl. `FAT_MAGIC_64` / ELF
  header), the Secure Login Client probe scoped to its own library, `snc_qop`
  from `1, 2, 3, 8, 9` with default `9`, and the explanations of `A2200019`
  and `SNCERR_INIT`.
- **Replaced by this contract:** `IRfcLogonCredential`, the `rfcLogonParams()`
  thunk into `rfcConversationFrom`, and the server case. SNC's
  `establish()` calls `logonParameters(…)`; its `rejected()` turns the GSS
  error into the Oops those explanations already word; its `prepare()` is
  discovery plus the probe.
- **Kept from PR #55's contract step:** `'snc'` in `SapAuthType` and
  `IConnectionConfig.authType`, and the `snc*` settings on `ISapConfig` and
  `IConnectionConfig` — that is how the broker learns a destination is SNC.
  They ship in `interfaces-auth-sap` (a minor) beside step 1.

PR #55's spec and plans are rewritten against this contract once it is
approved: the SNC-specific parts carry over as they are, the wiring parts go.

## The decisions this changes

A new decision, **31. The process's contract with a credential is its
lifecycle, not the credential's capabilities**:

- **Against decision 23's treatment of renewal.** `IRenewableCredential` was
  made an atom so a password would not "implement a lie". The cost was that
  every consumer meeting a 401 narrows at runtime — the check this principle
  forbids — and the consumer is not the one who knows. Answering `rejected()`
  with Oops "user or password refused" is not a lie; it is the truthful answer
  from the only party that knows it.
- **Decision 3 (atoms) still holds for capabilities that vary per
  implementation.** What does not vary here is the process: every connection
  prepares, logs on, sends requests and meets refusals. A contract over those
  moments is one every implementation can answer truthfully, and no member is
  there "because a sibling has it" (decision 11): the process calls all four,
  for every provider.
- **Decision 2 (absence by omission, no throwing "not supported") and
  decision 29 (no call that cannot work).** A provider that has nothing for a
  moment does nothing and says Ok — no negative member, no throw. The one call
  that can fail for a combination — logon parameters on a wire that has none —
  is not a throw in front of a user but an Oops the wire returns at the first
  logon, naming both sides. It cannot be made a compile-time error while the
  credential and the wire are independent axes chosen by configuration; the
  earliest honest point is `connect()`, and that is where it lands.

`docs/architecture/DECISIONS.md` gets decision 31, and decision 23's paragraph
on `IRenewableCredential` a note pointing to it.

## Migration

A major for every package on the contract; no deprecation cycle (decision 30:
the old shape is only ever accepted by implementations):

1. `interfaces-auth` 3.0.0 — the contract; typechecks. With it,
   `interfaces-auth-sap` 1.1.0 — `'snc'` and the `snc*` settings (no
   `IRfcLogonCredential`).
2. `auth-providers` 5.0.0 — every provider on the contract, Basic /
   Certificate / SAML cookies moved in; SNC (PR #55, re-scoped) is one more
   provider here.
3. `connection` 10.0.0 — the process on the contract; wires implement the
   targets; `rfcParamsFrom` takes no credential from the config; its own
   providers removed.
4. `auth-broker` 4.0.0 — `getProvider(destination)`.
5. `mcp-abap-adt` — the provider from the broker, the per-auth-type
   construction removed; the server's move from the broker 2.x API to 4.x
   happens here.

Steps 3 and 4 are independent of each other; both need step 2.

## Testing

| What | How | Where |
|---|---|---|
| Every provider shape in the table type-checks against `IAuthProvider`; the removed members are gone (`@ts-expect-error` on `authorizationHeader`, `transportMaterial`, `IRenewableCredential`) | `src/__typechecks__/` | interfaces |
| The process calls `prepare` → `establish` per logon → `authorize` per attempt → `rejected` on refusal, in that order, for a recording fake provider — identical call sequence whatever the fake's `kind` | unit | connection |
| Each outcome path: Oops from each of the four stops the right thing with the provider's refusal; Ok from `rejected` retries exactly once; an exception from a provider becomes a refusal naming its `kind` | unit | connection |
| An HTTP wire given logon parameters answers Oops at `connect()`, before any request | unit | connection |
| The process holds no provider-specific check: no `.kind ===`, no `typeof … === 'function'` on the credential | a source test over `src/connection` | connection |
| Basic over RFC: `user`/`passwd` reach every conversation from the provider, none from the config | unit, recording fake client | connection |
| Each provider's four answers as in the table | unit | auth-providers |
| Renewed tokens reach the session store before Ok | unit, in-memory stores | broker |
| End to end: basic over HTTP and RFC, a token destination, SNC over RFC — the same server code path | live, manual | server |

## Open questions

1. `rejected()` from a token provider whose refresh token has also expired
   opens an interactive login mid-request, as the broker does today. Should
   the process give `rejected()` a deadline, or is that the provider's
   (its strategy's timeout)?
2. Is a 403 a rejection? Today it is an authorization answer, not an
   authentication one, and is returned as is. The draft keeps that.
3. A SAML session cookie and the wire's own session cookies both travel as
   `Cookie`. `IRequestTarget.cookies()` merges, as `mergeCookieHeaders` does
   today — to be confirmed against the SAML live test.
4. Does the cloud path (`AdtCloudConnector`) need anything beyond Token on
   this contract? Nothing found so far.
