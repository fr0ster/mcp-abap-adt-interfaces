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

  /**
   * The failure's own code, when the strategy names one.
   *
   * {@link AdtObjectErrorCodes} holds the constants. It is here because the
   * contract promises specific failures in specific places — a version resource
   * a system does not expose is `UNSUPPORTED_OPERATION`, and a lock another user
   * holds is `LOCK_FAILED` — and until 30.0.0 those promises were made by
   * members that threw, so a consumer read the code off whatever was caught.
   * With nothing throwing, a promise the failure contract cannot carry is a
   * promise no consumer can keep without a cast.
   *
   * Optional, like `adtType` and `namespace` beside it: what a strategy chooses
   * is how much of this to fill in, not whether to be it. A `brief` strategy may
   * answer `origin` and `message` alone.
   *
   * ```typescript
   * const answer = await versionable.getVersions({ className: 'ZCL_X' });
   * if (!answer.ok && answer.getError().code === AdtObjectErrorCodes.UNSUPPORTED_OPERATION) {
   *   // this type has no version resource — ask something else
   * }
   * ```
   */
  readonly code?: string;
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
export interface IAdtSuccess<TValue> {
  readonly ok: true;
  getResult(): IAdtResult<TValue>;
  getError(): undefined;
}

/** The other half of {@link IAdtResponse}: a failure, and no result. */
export interface IAdtFailure<TError extends IAdtError = IAdtError> {
  readonly ok: false;
  getResult(): undefined;
  getError(): TError;
}

/**
 * A result, as the contract it is — the other half of the pair with
 * {@link IAdtError}.
 *
 * **The two halves are not symmetric in how they vary, and saying otherwise was
 * wrong.** An error strategy varies the *fullness of one contract*: `IAdtError`
 * has two required fields and five optional ones, so `brief` and `full` are
 * genuinely two amounts of it. A result cannot work that way — `ISearchResult`
 * requires `description`, so no strategy can return "fewer fields" of it without
 * the compiler refusing.
 *
 * A result strategy varies **`T` itself**. That is what the strategy overload
 * already does: `search(criteria)` answers
 * `IAdtResponse<ISearchResult[]>`, and `search(criteria, parse)`
 * answers `IAdtResponse<whatever the parser returns>`.
 * A shipped `brief` is a shipped parser with a narrower result contract, not the
 * same contract half-filled.
 *
 * So what does this interface buy, if it holds one field? It is the **named half
 * of an answer**, the counterpart to `IAdtError`, and it is where anything a
 * result needs to say *about itself* goes when a case for one appears — stated
 * as a contract, which is decision 19's rule for what a result may carry. What it must never hold is the
 * transport frame: a `response` field was in the first draft and put `status`,
 * `headers` and `data` back inside every result under one more layer of nesting.
 *
 * A caller who wants the document asks for it the way decision 19 says: a result
 * strategy of their own that answers the document, in a member whose contract
 * says that is what it gives.
 *
 * A bare `T` was tried here and is wrong for the reason a bare `TError` was
 * wrong: a member that hands back an unwrapped value has no room to say anything
 * about it, so "how much" becomes a question only the error side can ask. Both
 * sides of an answer are contracts, or neither is.
 */
export interface IAdtResult<T> {
  /** What the member promised — `ISearchResult[]`, `IPackageHierarchyNode`. */
  readonly value: T;
}

/**
 * How an answer becomes a value.
 *
 * {@link IAdtResult} says a result has a value; this says where that value came
 * from. One endpoint serves callers who want very different amounts of it — an
 * MCP server passing the answer to a language model, where size is a budget; a
 * backup tool that must keep the document byte for byte; a script that wants two
 * fields — and none of those readings is more correct than the others.
 *
 * So the reading is not the library's. It is injected into the implementation
 * once, and the member's result type follows it (decision 22). What is *not*
 * offered is a second member per reading — that is decision 16 — nor a parse
 * argument at the call, which was tried across 23 members and reverted.
 *
 * **It is handed the whole answer, not the body.** A reading may need the status
 * or a header, and {@link IAdtOperationOptions.analyse}, the strategy on the
 * error axis, already takes the answer for the same reason. The two axes are
 * symmetric: one decides whether an answer is a failure at all, the other what a
 * non-failure becomes.
 *
 * **It sees this member's own answer.** Requests an implementation issues on the
 * way — to obtain a node id, a scope document, a token — are its own business and
 * reach the consumer only as failures.
 *
 * ```typescript
 * const raw: IResultStrategy<string> = (answer) => String(answer.data);
 * ```
 */
export type IResultStrategy<T> = (answer: IAdtWireResponse) => T;

/**
 * What a member answers with.
 *
 * The direction for all of them, and reached member by member — decision 19 says
 * nothing forces them to move together. As of 28.0.0 the 22 asynchronous members
 * of `IAdtUtilities` have; 169 elsewhere have not, and still answer their result
 * or a frame directly. Each converges when it is next touched.
 *
 * **Both halves are parameters, and both are constrained to their contract.**
 * That is the difference between a type parameter and a free one: an
 * implementation may hand back `IAdtError & { retryAfter: number }` and say so in
 * the type, and a caller written against `IAdtError` still reads it. Fixing the
 * error half at `IAdtError` — which the first version did — left an
 * implementation with no way to describe what it actually returns, which is the
 * opposite of "swap in your own".
 *
 * `TValue` is what the member promised, typed all the way through: a caller
 * reads `getResult().value` and gets `ISearchResult[]`, never a cast. `IAdtResult`
 * is the contract carrying it, and it is not written at the call site — a member
 * that adds nothing writes `IAdtResponse<ISearchResult[]>` and no more.
 *
 * `TError` defaults to `IAdtError` and is constrained to it, which is what keeps
 * two implementations of one member interchangeable: a caller may read more than
 * the contract if their implementation offers more, and never less.
 */
export type IAdtResponse<TValue, TError extends IAdtError = IAdtError> =
  | IAdtSuccess<TValue>
  | IAdtFailure<TError>;
