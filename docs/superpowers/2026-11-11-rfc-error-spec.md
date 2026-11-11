# Spec: the connection contract types an RFC call's error

Implements `docs/superpowers/2026-11-11-rfc-error-goal.md`. Package:
`packages/interfaces-adt-connection`. Types and constants only; nothing with a body.

## 1. Version

`origin/master` holds the package at **4.0.0** (tag `interfaces-adt-connection-v4.0.0`); this
release is **4.1.0**, a minor: everything below is added, nothing existing changes. This
repository releases often — the implementation re-reads `master` first, rebases this branch,
and takes the next minor of whatever version it finds (4.1.0 if it is still 4.0.0). No other
package of the repository changes version; `interfaces-adt`'s range (`^3.0.0 || ^4.0.0`)
already admits 4.1.0.

## 2. Names

| name | kind | what it is |
|---|---|---|
| `IAbapConnectionError` | interface | the error a connection throws, as a consumer reads it: `code?`, `rfc?` |
| `IRfcErrorInfo` | interface | the RFC SDK's fields of a failed call: `key`, `group`, `code`, `codeString` |
| `RFC_RCS` | const (readonly tuple) | the SDK's `RFC_RC` names, in the header's order |
| `RfcReturnCodeName` | type | one of `RFC_RCS`: the type of `IRfcErrorInfo.codeString` |

The prefixes follow the package: `IAbap…` for what the connection is (`IAbapConnection`,
`IAbapRequestOptions`), an `UPPER_SNAKE` const with a `PascalCase` union derived from it
(`ADT_SESSION_ERROR` / `AdtSessionErrorCode`). The RFC names carry `Rfc`, not `Adt`: the
fields are the SDK's, not ADT's. `RfcReturnCodeName`, not `RfcReturnCode`: `code` is the
return code (a number); `codeString` is its name.

## 3. Declarations — `src/IAbapConnectionError.ts` (new file)

```ts
/**
 * The return codes of the SAP NetWeaver RFC SDK, by name: `RFC_RC` in the SDK's
 * header `sapnwrfc.h`, every member in its order (index = the numeric code),
 * without the header's `_RFC_RC_max_value` sentinel.
 *
 * A failed RFC call reports its code twice — as the number (`code`) and as the
 * name the SDK renders for it (`codeString`, from `RfcGetRcAsString`). The name
 * is what a consumer compares, so it is this closed list.
 */
export const RFC_RCS = [
  'RFC_OK',
  'RFC_COMMUNICATION_FAILURE',
  'RFC_LOGON_FAILURE',
  'RFC_ABAP_RUNTIME_FAILURE',
  'RFC_ABAP_MESSAGE',
  'RFC_ABAP_EXCEPTION',
  'RFC_CLOSED',
  'RFC_CANCELED',
  'RFC_TIMEOUT',
  'RFC_MEMORY_INSUFFICIENT',
  'RFC_VERSION_MISMATCH',
  'RFC_INVALID_PROTOCOL',
  'RFC_SERIALIZATION_FAILURE',
  'RFC_INVALID_HANDLE',
  'RFC_RETRY',
  'RFC_EXTERNAL_FAILURE',
  'RFC_EXECUTED',
  'RFC_NOT_FOUND',
  'RFC_NOT_SUPPORTED',
  'RFC_ILLEGAL_STATE',
  'RFC_INVALID_PARAMETER',
  'RFC_CODEPAGE_CONVERSION_FAILURE',
  'RFC_CONVERSION_FAILURE',
  'RFC_BUFFER_TOO_SMALL',
  'RFC_TABLE_MOVE_BOF',
  'RFC_TABLE_MOVE_EOF',
  'RFC_START_SAPGUI_FAILURE',
  'RFC_ABAP_CLASS_EXCEPTION',
  'RFC_UNKNOWN_ERROR',
  'RFC_AUTHORIZATION_FAILURE',
  'RFC_AUTHENTICATION_FAILURE',
  'RFC_CRYPTOLIB_FAILURE',
  'RFC_IO_FAILURE',
  'RFC_LOCKING_FAILURE',
] as const;

/** One of {@link RFC_RCS}: the name of an RFC SDK return code. */
export type RfcReturnCodeName = (typeof RFC_RCS)[number];

/**
 * What the RFC SDK said about a failed call, as fields — its `RFC_ERROR_INFO`
 * as `@mcp-abap-adt/sap-rfc-lite` hands it over, without the message and the
 * ABAP message variables.
 *
 * Read a failure from these, never from the error's words:
 *
 * ```typescript
 * if (error.rfc?.codeString === 'RFC_CLOSED') {
 *   // the other side closed the conversation
 * }
 * ```
 */
export interface IRfcErrorInfo {
  /** The SDK's error key: free text the SDK fills (up to 128 characters). */
  readonly key: string;
  /** The SDK's error group (`RFC_ERROR_GROUP`), as its number. */
  readonly group: number;
  /** The SDK's return code (`RFC_RC`), as its number. */
  readonly code: number;
  /** The return code's name, e.g. `RFC_CLOSED`. */
  readonly codeString: RfcReturnCodeName;
}

/**
 * The error a connection throws, as a consumer reads it: a caught value
 * narrowed to this, never parsed out of its message.
 *
 * A connection throws an `Error` that carries these fields; it does not throw
 * this type as such. Every field is optional, so an error that names neither —
 * an HTTP failure, a programming error — still conforms.
 */
export interface IAbapConnectionError {
  /**
   * What the failure is called: one of `ADT_SESSION_ERROR` for a session
   * failure, or a Node network code (`ECONNREFUSED`, …). Unchanged by
   * {@link rfc}: an RFC failure keeps the code it would have without it.
   */
  readonly code?: string | undefined;
  /**
   * The RFC SDK's fields, when the request failed in an RFC call that the SDK
   * reported; absent for an HTTP failure and for anything raised before a
   * call was made.
   */
  readonly rfc?: IRfcErrorInfo | undefined;
}
```

`ADT_SESSION_ERROR` is named in code font, not as a `{@link}`, so the file imports nothing.

Why `IAbapConnectionError` does not extend `Error`: a consumer narrows a caught `unknown` to
it, and a connection throws `Error & IAbapConnectionError`. Extending `Error` would make every
stub and every narrowing name `name`, `message` and `stack` for nothing it reads. Not
extending it is also how `HttpError` (`interfaces-network`) is declared.

The constant is a plain `as const` array, like `ADT_CONNECTION_CAUSES` — not wrapped in
`Object.freeze` (as `interfaces-auth`'s lists are): the style mirrored is `interfaces-adt`'s, and
the type already refuses a change.
It is the file's one runtime member; `dist/IAbapConnectionError.js` holds it and nothing else.

## 4. Index exports — `src/index.ts`

Added after the `IAbapConnection` export lines, in the file's existing style:

```ts
export type {
  IAbapConnectionError,
  IRfcErrorInfo,
  RfcReturnCodeName,
} from './IAbapConnectionError';
export { RFC_RCS } from './IAbapConnectionError';
```

The file's header comment ("These four files…") is history and stays as it is.

## 5. `tools/package-map.json`

Four entries, each `"interfaces-adt-connection"`, inserted where their neighbours put them:

- `"IAbapConnectionError"` — right after `"IAbapConnection"`;
- `"IRfcErrorInfo"` — among the `IR…` entries, after `"IRequestTarget"`;
- `"RFC_RCS"` — right after `"RFC_KEYS"`;
- `"RfcReturnCodeName"` — right after `"RfcKey"`.

`npm run check:surface` then finds each declared where the map says.

`interfaces-auth` already has `RFC_KEYS` / `RfcKey` (eight SDK names an auth refusal's fact may
carry). It is a different list for a different purpose, in a package this one does not depend
on; neither changes, and neither re-exports the other.

## 6. Compile-only checks — `src/__typechecks__/rfcError.ts` (new file)

Compiled by `npm run test:check` (the package's `tsconfig.json` includes `src/**/*`), never
built into `dist` (as the existing `__typechecks__`). Each case below names the mutation of the
declaration that makes it fail to compile; the implementation applies each mutation once, sees
`test:check` fail, and reverts.

1. **The list is exact.** `Assert<Equal<typeof RFC_RCS, readonly [ …the 34 names, in order… ]>>`
   with the `Equal` helper of `interfaces-adt`'s `connectionCause.ts`. Mutation: drop a name,
   add `'_RFC_RC_max_value'`, or swap two — fails.
2. **The union is exact.** `Assert<Equal<RfcReturnCodeName, 'RFC_OK' | … | 'RFC_LOCKING_FAILURE'>>`.
   Mutation: declare `RfcReturnCodeName = string` — fails.
3. **An unlisted name is refused.** `// @ts-expect-error` on
   `const _x: RfcReturnCodeName = 'RFC_SOMETHING_ELSE'`. Mutation: `string` — the directive is
   unused, fails.
4. **The list cannot be added to.** `// @ts-expect-error` on `RFC_RCS.push('RFC_OK')`.
   Mutation: drop `as const` — fails.
5. **The measured debugger termination fits.** `const _closed: IRfcErrorInfo = { key:
   'RFC_CLOSED', group: 4, code: 6, codeString: 'RFC_CLOSED' }`, and
   `Assert<Equal<(typeof RFC_RCS)[6], 'RFC_CLOSED'>>` (index = numeric code). Mutation: move
   `RFC_CLOSED` in the list — fails.
6. **`codeString` is the closed name.** `// @ts-expect-error` on an `IRfcErrorInfo` whose
   `codeString` is a `declare`d `string`. Mutation: `codeString: string` — fails.
7. **`key` is any string.** An `IRfcErrorInfo` whose `key` is a `declare`d `string` compiles.
   Mutation: `key: RfcReturnCodeName` — fails.
8. **`group` and `code` are numbers.** `// @ts-expect-error` on `group: '4'` and, separately,
   on `code: '6'`. Mutation: either typed `number | string` — fails.
9. **All four fields are required.** `// @ts-expect-error` on an `IRfcErrorInfo` without
   `key`, and one without `codeString`. Mutation: either made optional — fails.
10. **No text field.** `// @ts-expect-error` on an `IRfcErrorInfo` literal carrying `message`
    (excess property). Mutation: add `message?: string` — fails.
11. **Readonly.** `// @ts-expect-error` on assigning `info.key`, and on assigning
    `error.rfc`. Mutation: drop either `readonly` — fails.
12. **An error without `rfc` conforms.** `const _plain: IAbapConnectionError = {}` and
    `{ code: 'ADT_NOT_CONNECTED' }`. Mutation: `rfc` required — fails.
13. **The keys with no value conform** under `exactOptionalPropertyTypes`:
    `{ code: undefined, rfc: undefined }`. Mutation: drop `| undefined` from either — fails.
14. **The connection's error is one.** A `declare`d `Error & { code: AdtSessionErrorCode }` (the
    shape the connection's `sessionError` returns today) is assignable to
    `IAbapConnectionError`, and so is `Error & { code: AdtSessionErrorCode; rfc:
    IRfcErrorInfo }`. Mutation: `code?: number` — fails.
15. **Reading gives the types.** From a `declare`d `IAbapConnectionError`:
    `const _c: RfcReturnCodeName | undefined = e.rfc?.codeString` and
    `const _k: string | undefined = e.rfc?.key`. Mutation: `rfc?: unknown` — fails.

Nothing in the existing `connectionCapabilities.ts` / `wireDefaults.ts` changes; they still
compile, which is the additive check for the 4.0.0 surface.

## 7. Package files

- `package.json`: `"version": "4.1.0"`; `description` becomes "The ABAP connection contract:
  IAbapConnection, its capability atoms, the wire response, the session error codes and the
  error a connection throws". Nothing else.
- `package-lock.json` of the package: only its own `version` changes, written by npm
  (`npm install --package-lock-only` in the package, no install of anything); never by hand.

## 8. Docs

### `packages/interfaces-adt-connection/README.md`

The opening sentence becomes "Types and two constants; no implementation." Two rows join the
table, after `ADT_SESSION_ERROR` / `AdtSessionErrorCode`:

| symbol | what it is |
|---|---|
| `IAbapConnectionError` | the error a connection throws, as a consumer reads it: `code` — a session error code or a Node network code — and, for a failed RFC call, `rfc`. Narrow a caught value to it; never read the message. Since 4.1.0 |
| `IRfcErrorInfo`, `RFC_RCS` / `RfcReturnCodeName` | what the RFC SDK said about a failed call: `key` (free text), `group` and `code` (numbers), `codeString` — the return code's name, one of the SDK's `RFC_RC` names. Since 4.1.0 |

and one example under the table:

```typescript
try {
  await connection.makeAdtRequest(options);
} catch (thrown) {
  const error = thrown as IAbapConnectionError;
  if (error.rfc?.codeString === 'RFC_CLOSED') {
    // the other side closed the RFC conversation
  }
}
```

### `packages/interfaces-adt-connection/CHANGELOG.md`

Under `## [Unreleased]`, a new entry dated the release day:

```markdown
## [4.1.0] - <release day>

### Added

- **`IAbapConnectionError`** — the error a connection throws, as a consumer
  reads it: `readonly code?: string | undefined` (a session error code from
  `ADT_SESSION_ERROR`, or a Node network code — unchanged) and
  `readonly rfc?: IRfcErrorInfo | undefined`. A connection throws an `Error`
  carrying these fields; a consumer narrows a caught value to the type and
  reads which failure it was from a field, never from the message.
- **`IRfcErrorInfo`** — what the SAP NetWeaver RFC SDK said about a failed
  call: `key` (the SDK's free-text error key), `group` (`RFC_ERROR_GROUP`, a
  number), `code` (`RFC_RC`, a number) and `codeString`, the return code's
  name. No message and no ABAP message variables. All fields readonly.
- **`RFC_RCS` / `RfcReturnCodeName`** — the SDK's 34 `RFC_RC` names, in the
  header's order (index = numeric code), and their union: the type of
  `codeString`, so `rfc.codeString === 'RFC_CLOSED'` is checked by the
  compiler.

Nothing a 4.0.0 consumer or implementer does changes: every field is optional,
and no existing name, type or constant moved.
```

### Repository `README.md`

The package's row names the new symbols: "…`ITimeoutConfig`, `ADT_SESSION_ERROR`,
`IAbapConnectionError` and the RFC error's fields (`IRfcErrorInfo`, `RFC_RCS`). What a
connector implements".

`docs/architecture/` is not changed: no decision moves, and the dependency graph is the same.

## 9. Release

`npm run check` green at the root (build, `test:check` of every package, surface, graph,
packed, publish dry run), then tag `interfaces-adt-connection-v4.1.0` and
`npm run release:publish`, which publishes this package alone. The connection and the ADT
strategies take `^4.1.0` only once the registry serves it.

## 10. Not in this change

The connection's run-time shape check of the SDK error, its thrown `Error`, and any reading of
the fields; `IAdtError` in `interfaces-adt`; the ABAP message fields; a const for
`RFC_ERROR_GROUP` (the owner's decision: `group` is a plain number).
