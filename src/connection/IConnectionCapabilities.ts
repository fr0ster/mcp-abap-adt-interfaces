/**
 * Capability atoms for the connection.
 *
 * The same shape as the ADT capability atoms, for the same reason:
 * `IAbapConnection` is the minimum every transport can honour, and this is a
 * thing only some can. An RFC connection, a batch recorder and a test stub are
 * all legitimate `IAbapConnection`s that own no HTTP session; making these
 * methods mandatory would force each of them to implement a lie.
 *
 * ADDITIVE to `IAbapConnection`, which is unchanged — an implementation adds the
 * atom when it genuinely supports it, and a consumer narrows to it.
 */

/** Error codes a session-aware connection raises. Match on these, not on messages. */
export const ADT_SESSION_ERROR = {
  /** No usable session: never connected, or torn down since. */
  NOT_CONNECTED: 'ADT_NOT_CONNECTED',
  /**
   * The server put us on a DIFFERENT session than the one we were using.
   *
   * Anything locked over the old session is orphaned: the lock handle refers to
   * a session that no longer exists, so it can be neither used nor released.
   */
  SESSION_REPLACED: 'ADT_SESSION_REPLACED',
  /** A transport release is still pending; the session cannot yet be reused. */
  RELEASE_PENDING: 'ADT_RELEASE_PENDING',
} as const;

export type AdtSessionErrorCode =
  (typeof ADT_SESSION_ERROR)[keyof typeof ADT_SESSION_ERROR];

/**
 * A connection whose session is owned, observable and explicitly torn down.
 *
 * Without this, "is my session still the one I locked over?" is unanswerable
 * from the consumer's side: a connection can be handed a new server session
 * silently, and a caller holding a lock has no way to notice.
 */
export interface ISessionLifecycleAware {
  /**
   * Tells the server this session is finished.
   *
   * **It notifies; it does not confirm.** Whether and when the session is
   * actually freed is the server's affair, and nothing here checks afterwards.
   * That is why there is no deadline to pass: waiting for the answer to a
   * message whose answer is not acted on buys the caller nothing, and a
   * goodbye carries no request timeout by design — so waiting is the one thing
   * that could make a teardown unbounded.
   *
   * Resolves rather than throws, and **always settles**: whatever it could not
   * finish is the connection's own state, not the caller's problem. A repeat
   * call performs whatever is still owed, so a caller that wants the connection
   * fully released simply calls it again.
   *
   * In-flight requests are NOT waited for. They continue as their caller
   * arranged and nothing is aborted; their results can no longer affect this
   * connection.
   */
  disconnect(): Promise<void>;

  /** Whether a caller may start work. False throughout a pending teardown. */
  isConnected(): boolean;

  /**
   * Which server session the connection is on — or `null`, which says nothing
   * about whether the connection is usable. **Use {@link isConnected} for that.**
   *
   * `null` means only that no identity is known, and there are two ways to get
   * there: no session exists, or the connection is live over a server that
   * issued no session cookie — some do not. So a live, working connection can
   * return `null` here, and a consumer that reads `null` as "session lost"
   * would tear down a connection that was fine.
   *
   * What it does identify is the SESSION, not the conversation: a stable
   * client-side conversation id says nothing about whether the server replaced
   * the session underneath it, which is precisely the failure this exists to
   * expose. Compare two readings across an operation to detect a replacement.
   *
   * Only a CHANGED value is a replacement. `null` → non-null is an identity
   * being learned, not a new session: the LOCK response is often the first to
   * carry a session cookie, and reading that as a replacement would condemn the
   * operation it just covered.
   */
  getSessionIdentity(): string | null;
}

/**
 * A connection whose responses resolve only after a later flush.
 *
 * A batch recorder collects requests and settles their promises when the batch
 * executes. Awaiting one of those promises mid-recording deadlocks: the caller
 * is blocked inside the very code that would have reached `execute()`.
 *
 * Deferral belongs to the connection, not to how a client was configured —
 * which is why it is declared here rather than passed as an option. A consumer
 * that wraps a recorder itself, without going through the batch client, still
 * gets the guard.
 */
export interface IDeferredResponseConnection {
  /** Always `true`. "Sometimes deferred" is not a state a caller could act on. */
  readonly responsesAreDeferred: true;
}
