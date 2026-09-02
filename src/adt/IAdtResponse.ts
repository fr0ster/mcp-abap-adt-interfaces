/**
 * What a member answers with, once the envelope stops being the answer.
 *
 * `IAdtResponse` used to be the transport frame — status, headers, body — handed
 * to a caller as though it were a result. Decisions 13 to 19 are all consequences
 * of that one thing, and this is the shape they arrive at: **a response says
 * whether there is a result and whether there is an error, and both are
 * contracts.**
 *
 * ```typescript
 * const answer = await utils.search({ query: 'ZCL_*' });
 * const error = answer.getError();
 * if (error) {
 *   error.origin;   // connection, refusal, parse — different remedies
 *   error.message;  // what SAP said, when SAP said anything
 * } else {
 *   answer.getResult().value;  // ISearchResult[]
 * }
 * ```
 *
 * **Why two methods and not one.** A result can be a normal answer or a failure,
 * and a contract that names only the first pushes the second somewhere the
 * compiler cannot see — which is the family of defects this line of decisions
 * came from, restated as a type. Here a caller cannot reach a result without the
 * contract having told them an error is a thing that exists.
 *
 * **Why the error is a contract and not a class.** A consumer swapping in their
 * own implementation must be able to produce a failure this package describes,
 * and `instanceof` against a class shipped from here would make "swap in your
 * own" untrue. The classes that *are* these shapes live in
 * `@mcp-abap-adt/adt-clients`, where a consumer takes them from if they want
 * `instanceof` as a convenience.
 */

import type { IAdtWireResponse } from '../connection/IAbapConnection';

/**
 * Where a failure came from, because the three have different remedies.
 *
 * A caller cannot act on "something went wrong". Reauthenticate, ask the server
 * something else, or fix a parser are three different days of work, and flattening
 * them into one message makes the caller guess which.
 */
export type AdtFailureOrigin =
  /** No usable answer exists — unreachable host, expired session, no authority. */
  | 'connection'
  /** SAP answered, about this object, and said no. */
  | 'refusal'
  /** An answer arrived and could not be read. */
  | 'parse';

/**
 * A failure, whichever strategy produced it.
 *
 * Every error strategy returns this — the shipped ones and a consumer's own. What
 * a strategy chooses is **how much of it to fill in**, not whether to be it: a
 * `brief` strategy answers `origin` and `message`, a `full` one adds the response,
 * the request and the server's own classification. A caller writes against this
 * once and reads whatever their strategy chose to provide.
 *
 * Two fields are required because they are the least a failure can say and still
 * be actionable: what kind of failure it was, and what was said about it.
 *
 * **The point is that the methods do not change.** An implementation may fill
 * this in however it likes — parse the document differently, classify `origin`
 * by its own rules, decide what "brief" means for the systems it talks to — and
 * a consumer's code is untouched, because what they call and what they read is
 * the same either way. That is the difference between a contract and a shape
 * agreed by luck.
 *
 * Everything here is what the library was given rather than what it concluded.
 * The one judgement in it is `origin`, and that judgement is the strategy's —
 * replace the strategy and it goes with it.
 */
export interface IAdtError {
  /** Which of the three this is. */
  readonly origin: AdtFailureOrigin;

  /**
   * What SAP said, verbatim where SAP said anything.
   *
   * Not a summary and not a translation. A refusal that names the user holding a
   * lock is only useful if that name survives. The document it was read out of
   * is `response.data`.
   */
  readonly message: string;

  /**
   * `<type id="…">` — the server's own classification, when it gave one.
   *
   * Derived from the document and kept anyway: it is the one part every consumer
   * would otherwise parse out for themselves, and it is the server's word rather
   * than ours. The document itself is not repeated — it is `response.data`, and
   * two fields for one thing is the fault this design has been removing.
   */
  readonly adtType?: string;

  /** `<namespace id="…">`, when the document names one. */
  readonly namespace?: string;

  /** The response it arrived on, when an answer arrived at all. */
  readonly response?: IAdtWireResponse;

  /**
   * The call that produced it.
   *
   * A chain issues several: `delete()` sends two, `create()` six. "Object is
   * locked" means a different thing depending on which asked, and a caller
   * cannot analyse what they cannot locate.
   */
  readonly request?: {
    readonly method?: string;
    readonly url?: string;
  };

  /** Whatever the transport or a parser threw, when something did. */
  readonly cause?: unknown;
}

/**
 * The answer to a call: a result, or a failure, and both are contracts.
 *
 * **A strategy chooses how much, never what it is.** That distinction is the
 * whole of it. `brief`, `medium` and `full` are not three types — they are three
 * amounts of one contract, and a caller written against `IAdtError` works with
 * all of them. A strategy free to return *any* type would leave a caller with
 * nothing to write against, and "swap in your own implementation" would mean
 * "rewrite everything that catches".
 *
 * So `origin` and `message` are always there — the least any failure can say —
 * and the rest is what a fuller strategy fills in.
 *
 * ```typescript
 * const answer = await utils.search({ query: 'ZCL_*' });
 * const failure = answer.getError();
 * if (failure) {
 *   failure.origin;    // always
 *   failure.message;   // always
 *   failure.document;  // if the strategy was asked for that much
 * }
 * ```
 *
 * `TResult` stays a parameter because each member names its own result contract —
 * `ISearchResult[]` here, `IPackageHierarchyNode` there. It is not a free type
 * either: it is whatever that member promises.
 *
 * `undefined` on each side is what "there is none" looks like: after a refusal
 * there is no result, and on a clean answer there is no failure.
 */
export interface IAdtResponse<TResult = unknown> {
  /** The member's own result contract. Absent when the answer was a failure. */
  getResult(): TResult | undefined;

  /** The failure, as much of it as the strategy was asked for. */
  getError(): IAdtError | undefined;
}
