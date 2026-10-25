import type { NegotiateSourceProblem } from '../error/kinds';

/** What a token source is asked, besides the principal. */
export interface NegotiateTokenOptions {
  /** Ends the request: a source that honours it stops, one that cannot is dropped by the caller. */
  readonly signal?: AbortSignal | undefined;
}

/**
 * A source's answer: a token, or a fact from a closed list. The source never
 * mints an error and never returns text — the provider turns the problem into
 * its refusal, so nothing the source holds can reach one.
 */
export type NegotiateTokenAnswer =
  | {
      readonly ok: true;
      /** Base64, as it goes after `Negotiate ` in the header. */
      readonly token: string;
    }
  | { readonly ok: false; readonly problem: NegotiateSourceProblem };

/**
 * Where an SPNego (Kerberos) token comes from: the operating system's ticket
 * store through a native library, or whatever a consumer provides.
 *
 * `servicePrincipal` is the GSS host-based name, `service@host`
 * (`HTTP@sap.example.com`), as the consumer stated it. Turning it into the
 * library's form (SSPI's `HTTP/host`) is the source's.
 *
 * **A fresh token per call.** A source never caches one: a Kerberos
 * authenticator is single-use against a service that checks for replay.
 * A source that throws, or answers anything else, is `unknown` to the provider.
 */
export interface INegotiateTokenSource {
  token(
    servicePrincipal: string,
    options: NegotiateTokenOptions,
  ): Promise<NegotiateTokenAnswer>;
}
