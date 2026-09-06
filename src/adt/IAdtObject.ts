/**
 * Operation options, version entries and error codes shared by the capability
 * atoms.
 *
 * The wide `IAdtObject` this file was named for was removed in 29.0.0; what an
 * object can do is now stated by the atoms it declares in `IAdtCapabilities.ts`.
 * Nothing here declares an operation — these are the pieces the atoms refer to:
 * {@link IAdtOperationOptions} carries the strategy a caller injects,
 * a version history's entries are the implementation's since 31.0.0, and
 * {@link AdtObjectErrorCodes} names failures a strategy can put in
 * {@link IAdtError.code}.
 */

import type { IAdtWireResponse } from '../connection/IAbapConnection';
import type { AdtNoFailure, IAdtError } from './IAdtResponse';

/**
 * The codes a failure can name itself by.
 *
 * **No member of this contract throws** since 30.0.0 — which is about what the
 * server's answer becomes, not about what an implementation does when its own
 * reading fails. Every member answers
 * {@link IAdtResponse}, so a failure comes back rather than flying past, and it
 * is read from the contract:
 *
 * ```typescript
 * const answer = await adtObject.read({ className: 'ZTEST' });
 *
 * if (answer.ok) {
 *   answer.getResult().value;    // what the endpoint produced
 * } else {
 *   const failure = answer.getError();
 *   failure.origin;              // 'connection' | 'refusal'
 *   failure.message;             // what SAP said, in SAP's words
 *   failure.code;                // one of these, when the strategy named one
 *   failure.response;            // the answer it was read from, untouched
 * }
 * ```
 *
 * These are for the failures the contract promises in a specific place, where
 * `origin` alone cannot tell two apart: a version resource a system does not
 * expose is `UNSUPPORTED_OPERATION` rather than merely a refusal, and a lock
 * another user holds is `LOCK_FAILED`. A consumer branches on the code without a
 * cast, which until 30.0.0 they could not — the promise was made by members that
 * threw, and the failure contract had nowhere to carry it.
 *
 * `code` is optional, and deliberately: what a strategy chooses is how much of a
 * failure to fill in, not whether to be one. An implementation is free to name
 * codes of its own beside these; this package ships no error class to narrow
 * with, because a contract says what a thing is and shipping a class from it
 * would make "use your own implementation" untrue for that piece.
 *
 * Note what is *not* among them: "not found". ADT answers a request for a
 * missing object with **200 and an empty body** rather than a 404, so absence is
 * not a failure this library can report on its own authority — a read-modify-write
 * must treat it as one, since writing back what it read erases the object, while
 * a listing must treat it as an empty list. That reading is supplied through
 * {@link IAdtOperationOptions.analyse}.
 */
export const AdtObjectErrorCodes = {
  /** Object not found (404) */
  OBJECT_NOT_FOUND: 'ADT_OBJECT_NOT_FOUND',
  /** Object not ready yet (400) - e.g., just created, not available for reading */
  OBJECT_NOT_READY: 'ADT_OBJECT_NOT_READY',
  /** Object validation failed */
  VALIDATION_FAILED: 'ADT_VALIDATION_FAILED',
  /** Object creation failed */
  CREATE_FAILED: 'ADT_CREATE_FAILED',
  /** Object update failed */
  UPDATE_FAILED: 'ADT_UPDATE_FAILED',
  /** Object deletion failed */
  DELETE_FAILED: 'ADT_DELETE_FAILED',
  /** Object activation failed */
  ACTIVATE_FAILED: 'ADT_ACTIVATE_FAILED',
  /** Object check failed */
  CHECK_FAILED: 'ADT_CHECK_FAILED',
  /** Lock operation failed */
  LOCK_FAILED: 'ADT_LOCK_FAILED',
  /** Unlock operation failed */
  UNLOCK_FAILED: 'ADT_UNLOCK_FAILED',
  /** Operation not supported for this object type (e.g. version history on a non-source object) */
  UNSUPPORTED_OPERATION: 'ADT_UNSUPPORTED_OPERATION',
} as const;

/**
 * The caller's own reading of what counts as a failure.
 *
 * Handed the default's verdict **and** the answer it was reached from, so it can
 * overrule in either direction: name a failure the default let through, or clear
 * one it raised. Answering {@link ADT_NO_FAILURE} means "not a failure here" — a
 * token rather than `undefined`, so that the absence of a strategy and a
 * strategy's verdict of "fine" are not the same value.
 *
 * **It names its own failure type.** `IAdtFailure<TError extends IAdtError>` has
 * carried the parameter since the failure half existed, and it never arrived
 * anywhere, because the options pinned this return to `IAdtError`. A consumer
 * whose strategy answered something richer got it back narrowed and had to cast
 * at the call site — which is the one thing a parameterised failure exists to
 * prevent.
 *
 * The alternative was a field per case on `IAdtError`: a message id here, a
 * severity there, a job handle next time. A contract that grows a field for
 * every caller's special case is worse than one that lets a caller say what
 * their own failure is, and a consumer knows perfectly well which strategy they
 * injected.
 *
 * ```typescript
 * interface IT100Failure extends IAdtError {
 *   readonly t100: { msgid: string; msgno: string };
 * }
 * const t100: IAnalyse<IT100Failure> = (verdict, answer) => …;
 *
 * const answer = await client.getClass().activate(config, { analyse: t100 });
 * if (!answer.ok) answer.getError().t100;   // typed, no cast
 * ```
 *
 * The verdict handed in stays `IAdtError`: it is the library's own, built before
 * any strategy is consulted. Only what comes back is the caller's.
 */
export type IAnalyse<E extends IAdtError = IAdtError> = (
  verdict: IAdtError | AdtNoFailure,
  answer?: IAdtWireResponse,
) => E | AdtNoFailure;

/**
 * Options for ADT operations (create and update)
 * Unified interface for both create and update operations
 */
export interface IAdtOperationOptions<E extends IAdtError = IAdtError> {
  /**
   * {@link IAnalyse} — the caller's own reading of what counts as a failure.
   *
   * It exists because no single reading serves every caller. ADT answers a
   * request for a missing object with 200 and an empty body, and those same
   * bytes are a failure to a read-modify-write — writing back what it read
   * erases the object — and an empty list to a listing. Neither reading can be
   * the library's.
   *
   * The status is not the signal: a refusal arrives inside a 200, and what
   * decides is the message severity in the document, which is why the raw answer
   * is passed rather than a summary of it.
   */
  analyse?: IAnalyse<E>;

  /*
   * `activateOnCreate`, `activateOnUpdate` and `deleteOnFailure` were here.
   *
   * All three asked the caller what a member should do **after** its request:
   * activate as well, or undo what it made when a later step failed. That is a
   * dependency on steps, and steps are the implementation's — a contract names
   * the endpoint a member answers and the shape it answers with, and how many
   * requests an implementation makes to get there is nobody else's question.
   *
   * They existed because members had grown into chains: an `update` that locked,
   * checked, wrote, unlocked, checked again and could activate. Every one of
   * those is a member of its own — `lock`, `check`, `unlock`, `activate` are all
   * declared here — so a caller composes them in the order they want, and a
   * member that is one request has nothing to activate afterwards and nothing to
   * roll back.
   */

  /**
   * The body of this member’s request, where its endpoint takes one.
   *
   * For an update that is the source being written. For a create it depends on
   * the object: a DDL source, a table and a program are created *from* their
   * source, so it is the POST body; a class or an interface is created empty and
   * its source is written afterwards, by `update`, so passing it to their
   * `create` does nothing.
   *
   * It used to say "used in create operations for update after create" — that
   * described a create that wrote the source itself in a second request. A
   * member is one request now, so where the endpoint does not carry source,
   * writing it is a separate call the caller makes.
   */
  sourceCode?: string;

  /**
   * The body of this member’s request, for the objects whose editor content is
   * XML rather than source — a domain, a data element, a package, an
   * authorization field.
   *
   * Same rule as {@link IAdtOperationOptions.sourceCode}: it is the body of the
   * one request the member makes, where that endpoint takes one.
   */
  xmlContent?: string;

  /**
   * The lock handle to put on the write request.
   *
   * Nothing more. It used to say the update "will skip lock, check and unlock
   * operations" when provided, which implied that without one those still
   * happen — they did, and they no longer do: a member is one request and the
   * lock is the caller’s, taken with `lock` and released with `unlock`.
   *
   * **Leaving it out is not refused here.** Whether a write without a lock is
   * allowed is ADT’s judgement, and ADT answers it; a library that refused
   * first would be standing in front of the server with an opinion of its own.
   */
  lockHandle?: string;

  /**
   * HTTP request timeout for operations in milliseconds
   * @default 1000 (1 second)
   *
   * Note: This timeout is for HTTP request completion, not for waiting object readiness.
   * For waiting object readiness after create/update/activate operations, use `withLongPolling: true`
   * in read operations instead of fixed timeouts.
   *
   * The `timeout` parameter controls how long to wait for HTTP responses from the server.
   * Increase timeout for complex operations or slow systems.
   *
   * Example: timeout: 5000 for 5 seconds
   *
   * @see withLongPolling - Use long polling for waiting object readiness
   */
  timeout?: number;
}
