/**
 * The parts an interactive authorization is composed of (since 7.4.0):
 * a presentation (how the URL reaches the user), a transport (how the answer
 * reaches us) and a protocol (what an answer is and how it is checked).
 * `IAuthorizationStrategy` is what they compose into; it does not change.
 *
 * Types and constants only: the parts, the composer and the named
 * compositions are implemented elsewhere (`@mcp-abap-adt/auth-providers`).
 * These contracts replace `ICallbackServer`, which is deprecated.
 */

import type { ILogger } from '@mcp-abap-adt/interfaces-utils';
import type { IAuthProviderError } from '../error/IAuthProviderError';
import type { InteractiveLoginStrategy } from '../error/kinds';

// ---- what travels between transport and protocol -----------------------

/** Read-only parameters; `URLSearchParams` satisfies it. */
export interface AnswerParameters {
  getAll(name: string): string[];
}

/** One arrival, as the transport received it. */
export type AuthorizationAnswer =
  /** A request to the listener's callback route. */
  | {
      readonly via: 'redirect';
      readonly method: 'GET' | 'POST';
      /** The query of a GET; the urlencoded body of a POST. */
      readonly params: AnswerParameters;
    }
  /**
   * A text the user gave: through the listener's paste page, its form token
   * already checked (`form`); typed into a terminal (`terminal`); returned
   * by the consumer's code (`consumer`).
   */
  | {
      readonly via: 'form' | 'terminal' | 'consumer';
      readonly text: string;
    };

/** Why an answer is refused while the login keeps waiting. Fixed words. */
export const ANSWER_REFUSALS = Object.freeze([
  'not-armed', // arrived before the channel was armed (transport)
  'host', // a Host the listener does not answer for (transport)
  'form-token', // no or another form token (transport)
  'state', // a redirect without this login's state (protocol)
  'pasted-state', // a pasted URL from another login (protocol)
  'no-payload', // nothing this protocol reads (protocol)
  'unreadable', // a text no payload could be read from (protocol)
  'already-answered', // after the first accepted answer (composer)
] as const);
export type AnswerRefusal = (typeof ANSWER_REFUSALS)[number];

/** The protocol's decision on one answer. */
export type AnswerVerdict<TPayload> =
  | { readonly verdict: 'accept'; readonly payload: TPayload }
  | { readonly verdict: 'refuse'; readonly reason: AnswerRefusal }
  | {
      readonly verdict: 'end';
      /** Minted through auth-errors; the composer re-mints anything else. */
      readonly error: IAuthProviderError;
      /**
       * Text for the listener's escaped error page only (the IdP's
       * `error` and `error_description`). Never logged, never in an error,
       * never printed to a terminal.
       */
      readonly shown?: string | undefined;
    };

export type AnswerJudge<TPayload> = (
  answer: AuthorizationAnswer,
) => AnswerVerdict<TPayload>;

/** The words a paste page and a terminal prompt show. The protocol's. */
export interface PasteWords {
  /** One line: the terminal prompt, and the page's field label. */
  readonly prompt: string;
  /** One paragraph on the page: where the user finds what to paste. */
  readonly instructions: string;
}

// ---- protocol ------------------------------------------------------------

/** What an answer is and how it is checked. Knows no socket, no terminal. */
export interface IAuthorizationProtocol<TPayload> {
  /**
   * `required`: the authorization URL carries a redirect, so the
   * transport must give one. `unused`: it does not (a passcode).
   */
  readonly redirect: 'required' | 'unused';
  /** The methods its redirect arrives with; `[]` when it takes none. */
  readonly callbackMethods: readonly ('GET' | 'POST')[];
  /** Absent: no paste page, and a terminal cannot be used with it. */
  readonly paste?: PasteWords | undefined;
  /**
   * One attempt: called once the URL is built, before anything is shown.
   * Reads what binds an answer to it (the `state`) from the URL. Throws a
   * minted `configuration` error for a URL it cannot read.
   */
  begin(authorizationUrl: string): AnswerJudge<TPayload>;
}

// ---- transport ---------------------------------------------------------

export interface AnswerTransportOptions {
  /** The composition's signal: aborts at the abort, the dispose. */
  readonly signal: AbortSignal;
  readonly logger?: ILogger | undefined;
  /** From the protocol. */
  readonly paste?: PasteWords | undefined;
  /** From the protocol. */
  readonly callbackMethods: readonly ('GET' | 'POST')[];
  /**
   * The endpoint path the redirect arrives at (`/callback`), from the
   * composition. The transport owns everything else of the redirect —
   * scheme, address, port, any prefix of its own — and builds it.
   */
  readonly endpoint: string;
}

/** An open channel, valid inside `open`'s callback. */
export interface IAnswerChannel {
  /**
   * The redirect this transport advertises, built by the transport from its
   * own origin and `endpoint`: it reaches only what this transport listens
   * on (a listener), or is the consumer's (`terminalPaste`,
   * `consumerAnswer`); `undefined` when it has none.
   */
  readonly redirectUri: string | undefined;
  /** Where a listener waits, for the "waiting on" line; else absent. */
  readonly waitingOn?: string | undefined;
  /** How a user elsewhere reaches this channel, fixed words; else absent. */
  readonly routeHint?: string | undefined;
  /**
   * Arms the channel with this attempt's judge — once. Until then every
   * arrival is refused (`not-armed`). Returns the wait.
   */
  arm(judge: AnswerJudge<unknown>): IArmedChannel;
}

export interface IArmedChannel {
  /**
   * Resolves once the judge accepted an answer — with nothing: the
   * composer holds the payload. Rejects on an `end` verdict (with its
   * error), on the signal, on a failure of the channel.
   */
  answer(): Promise<void>;
}

/** How the user's answer reaches us. Knows no payload. */
export interface IAnswerTransport {
  /** For the `aborted` / `disposed` facts. */
  readonly label: InteractiveLoginStrategy;
  /**
   * Opens (binds, starts a reader), runs `use`, releases. Settles on the
   * first terminal outcome — `use` returning or throwing, the signal — and
   * only once released: a settled `open` means the port is free and the
   * reader closed. Never stops a running `use`; a late settlement of an
   * abandoned `use` is discarded.
   */
  open<TReturn>(
    options: AnswerTransportOptions,
    use: (channel: IAnswerChannel) => Promise<TReturn>,
  ): Promise<TReturn>;
}

// ---- presentation ------------------------------------------------------

export interface PresentationContext {
  readonly redirectUri: string | undefined;
  readonly waitingOn?: string | undefined;
  readonly routeHint?: string | undefined;
  readonly signal: AbortSignal;
  /** For prompts. Absent: stderr — never stdout. */
  readonly logger?: ILogger | undefined;
}

/** How the URL reaches the user. Knows no payload, no transport. */
export interface IAuthorizationPresentation {
  /**
   * Not awaited by the composer. A synchronous throw, or a rejection of
   * what it returns (a promise or any thenable), is a presentation
   * failure: logged and answered by a prompt of the URL.
   */
  present(authorizationUrl: string, context: PresentationContext): unknown;
}
