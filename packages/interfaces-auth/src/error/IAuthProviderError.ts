/**
 * The error every auth provider, logon target and connection reports: a
 * frozen plain object with `kind`, `facts`, `reason`, `hint` and, for three
 * kinds, optional `diagnostics`.
 *
 * **Only `@mcp-abap-adt/auth-errors` produces one.** The `[minted]` property
 * is keyed by a symbol declared here and not exported, so no code outside
 * this file can write it: an object literal, a class instance or a parsed
 * JSON value is not an `IAuthProviderError` to the compiler. (A type
 * assertion elsewhere is refused by the producers' shape check, not by the
 * compiler.)
 *
 * **Narrow on `kind`, then `variant`.** For `saml-assertion`, `snc` and
 * `configuration` the value that decides which diagnostic may appear — the
 * rule, the problem, the case — is lifted onto the error as `variant` (and
 * stays in `facts` as `rule` / `problem` / `case`, the same value), so
 * `e.kind === 'saml-assertion' && e.variant === 'untrusted-issuer'` narrows
 * the whole object, `facts` and `diagnostics` included. Narrowing on
 * `e.facts.rule` does not: TypeScript narrows a union only by a discriminant
 * of its members, not of a nested object.
 *
 * **Handle every kind, checked by the compiler.** A consumer that decides on
 * `kind` uses one of the two patterns `@mcp-abap-adt/auth-errors` provides:
 * `matchKind(error, handlers)`, whose handler map does not compile with a kind
 * missing, or a `switch (error.kind)` whose `default` calls
 * `unreachableKind(error)`, which compiles only when every kind was handled.
 * A `switch` with neither is not checked by TypeScript, and is not a
 * supported way to read this type. A new kind is a major of this package, so
 * a consumer following either pattern stops compiling on the upgrade rather
 * than meeting the kind at run time; both also take an error of a kind this
 * build does not know (a newer producer) without throwing.
 */

import type {
  ConfigDiagnosticOf,
  ConfigDiagnosticValues,
  SamlDiagnosticOf,
  SamlDiagnosticValues,
  SncDiagnosticOf,
  SncDiagnosticValues,
} from './diagnostics';
import type {
  AuthProviderErrorFacts,
  ConfigFactsOf,
  SamlFactsOf,
  SncFactsOf,
} from './facts';
import type {
  AssertionRule,
  AuthProviderErrorKind,
  ConfigCase,
  PlainKind,
  SncProblem,
} from './kinds';

/** The brand: declared, not exported — unnameable outside this file. */
declare const minted: unique symbol;

interface Common<K extends AuthProviderErrorKind> {
  readonly kind: K;
  /** Rendered from kind and facts by the default renderer, at minting. */
  readonly reason: string;
  readonly hint?: string | undefined;
  readonly [minted]: true;
}

/**
 * The permitted diagnostic fields carry their type and every other field of
 * the kind is `?: never` — excluded, not merely omitted, so a non-literal
 * object (a spread, a variable) carrying a forbidden field does not assign.
 * A variant with none permitted: `diagnostics?: never`.
 */
type DiagOf<T, Allowed extends keyof T> = [Allowed] extends [never]
  ? { readonly diagnostics?: never }
  : {
      readonly diagnostics?: {
        readonly [F in keyof T]?: F extends Allowed ? T[F] : never;
      };
    };

/** A SAML assertion refused, one object type per rule. */
export type SamlAssertionError = {
  [R in AssertionRule]: Common<'saml-assertion'> & {
    readonly variant: R;
    readonly facts: SamlFactsOf<R>;
  } & DiagOf<SamlDiagnosticValues, SamlDiagnosticOf<R>>;
}[AssertionRule];

/** An SNC logon problem, one object type per problem. */
export type SncError = {
  [P in SncProblem]: Common<'snc'> & {
    readonly variant: P;
    readonly facts: SncFactsOf<P>;
  } & DiagOf<SncDiagnosticValues, SncDiagnosticOf<P>>;
}[SncProblem];

/** A configuration mistake, one object type per case. */
export type ConfigurationError = {
  [C in ConfigCase]: Common<'configuration'> & {
    readonly variant: C;
    readonly facts: ConfigFactsOf<C>;
  } & DiagOf<ConfigDiagnosticValues, ConfigDiagnosticOf<C>>;
}[ConfigCase];

/** Every other kind: one object type, no variant, no diagnostics. */
type PlainError<K extends PlainKind> = Common<K> & {
  readonly facts: AuthProviderErrorFacts[K];
  readonly variant?: never;
  readonly diagnostics?: never;
};

/** The error of one kind. */
export type AuthProviderErrorOf<K extends AuthProviderErrorKind> =
  K extends 'saml-assertion'
    ? SamlAssertionError
    : K extends 'snc'
      ? SncError
      : K extends 'configuration'
        ? ConfigurationError
        : K extends PlainKind
          ? PlainError<K>
          : never;

/** Any error of the contract. */
export type IAuthProviderError = {
  [K in AuthProviderErrorKind]: AuthProviderErrorOf<K>;
}[AuthProviderErrorKind];
