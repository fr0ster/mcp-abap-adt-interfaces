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
 *
 * if (answer.ok) {
 *   answer.getResult().value;    // ISearchResult[]
 * } else {
 *   answer.getError().origin;    // connection, refusal, parse
 *   answer.getError().message;   // what SAP said, when SAP said anything
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
 * The answer to a call: a result **or** a failure, never both and never neither.
 *
 * A union rather than one shape with two optional halves, and that is not a
 * detail. Two independently-optional methods let an implementation answer both
 * or answer nothing, and — worse — checking one does not narrow the other, so
 * the claim "a caller cannot reach a result without being told an error exists"
 * was a sentence in a comment rather than a thing the compiler did.
 *
 * ```typescript
 * const answer = await utils.search({ query: 'ZCL_*' });
 *
 * if (answer.ok) {
 *   answer.getResult().value;    // ISearchResult[] — not `| undefined`
 * } else {
 *   answer.getError().origin;    // IAdtError — not `| undefined`
 * }
 * ```
 *
 * `ok` exists because TypeScript cannot narrow an object from what a method
 * returns. It is the smallest thing that makes the guarantee real: one field,
 * and both methods stop being maybes.
 *
 * **A strategy chooses how much, never what it is.** `brief`, `medium` and
 * `full` are three amounts of one contract, so a caller writes against
 * `IAdtError` once and reads whatever their strategy provided.
 *
 * **The type parameter has no default.** A member answering `IAdtResponse` and
 * promising nothing is the free type this design refuses, reached by omission.
 */
export interface IAdtSuccess<T> {
  readonly ok: true;
  getResult(): IAdtResult<T>;
  getError(): undefined;
}

/** The other half of {@link IAdtResponse}: a failure, and no result. */
export interface IAdtFailure {
  readonly ok: false;
  getResult(): undefined;
  getError(): IAdtError;
}

/**
 * A result, as the contract it is — the other half of the pair with
 * {@link IAdtError}.
 *
 * Symmetric on purpose, and the symmetry is the design rather than tidiness. A
 * **result strategy** chooses how much to fill in exactly as an error strategy
 * does: `value` is what the member promised and is always there, and `response`
 * is what a fuller strategy adds for a caller who wants the answer it was read
 * out of. `brief` and `full` are two amounts of this one contract.
 *
 * A bare `T` was tried here and is wrong for the reason a bare `TError` was
 * wrong: a member that hands back an unwrapped value has no room to say anything
 * about it, so "how much" becomes a question only the error side can ask. Both
 * sides of an answer are contracts, or neither is.
 */
export interface IAdtResult<T> {
  /** What the member promised — `ISearchResult[]`, `IPackageHierarchyNode`. */
  readonly value: T;

  /**
   * The answer it was read out of, when the strategy was asked for that much.
   *
   * Not a duplicate of `value`: one is what the member means, the other is what
   * arrived. A caller passing the document on, or logging it, needs the second
   * without giving up the first.
   */
  readonly response?: IAdtWireResponse;
}

/**
 * What a member answers with.
 *
 * The direction for all of them, and reached member by member — decision 19 says
 * nothing forces them to move together. As of 28.0.0 the 22 asynchronous members
 * of `IAdtUtilities` have; 169 elsewhere have not, and still answer their result
 * or a frame directly. Each converges when it is next touched.
 *
 * `T` is that member's own result contract — `ISearchResult[]` here,
 * `IPackageHierarchyNode` there. A result strategy chooses how much of it to
 * fill in; it may not hand back something else, or two implementations of one
 * member stop being interchangeable.
 */
export type IAdtResponse<T> = IAdtSuccess<T> | IAdtFailure;
