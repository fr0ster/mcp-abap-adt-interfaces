/**
 * Capability atoms for the connection — session lifecycle and lock windows,
 * partitioned so each method belongs to exactly one small interface.
 *
 * The same shape as the ADT capability atoms, for the same reason: `IAbapConnection`
 * is the minimum every transport can honour, and these are the things only some
 * can. An RFC connection, a batch recorder and a test stub are all legitimate
 * `IAbapConnection`s that own no HTTP session and can open no lock window; making
 * these methods mandatory would force each of them to implement a lie.
 *
 * ADDITIVE. `IAbapConnection` is unchanged — an implementation adds an atom when
 * it genuinely supports it, and a consumer narrows to the atom it needs.
 */

/**
 * What a teardown could not finish.
 *
 * A teardown resolves with this rather than throwing, because "the session is
 * gone" and "two locks were left behind" are different facts and the caller
 * needs both.
 */
export interface ITeardownReport {
  /**
   * Labels of the lock windows still open when the bounded wait gave up.
   *
   * These are the locks nobody released. Whoever tears the session down learns
   * which objects need unlocking by hand, instead of the next developer finding
   * them locked and inactive with no record of why.
   */
  abandonedWindows: string[];
  /** A transport release did not complete and is still outstanding. */
  releasePending: boolean;
}

/**
 * Handle for one open lock window.
 *
 * A symbol rather than a string: two windows may carry the same label — the same
 * object locked twice in a chain — and they must still close independently.
 * Symbols are unique per occurrence, so a stale handle cannot close a window it
 * did not open.
 */
export type WindowToken = symbol;

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
   * Tears the session down and reports what could not be finished.
   *
   * Resolves rather than throws — the report carries the failures. In-flight
   * requests are drained first, so a teardown never pulls the session out from
   * under a request already running.
   */
  disconnect(): Promise<ITeardownReport>;

  /** Whether a caller may start work. False throughout a pending teardown. */
  isConnected(): boolean;

  /**
   * Which server session the connection is on, or null when it holds none.
   *
   * Identifies the SESSION, not the conversation: a stable client-side
   * conversation id says nothing about whether the server replaced the session
   * underneath it, which is precisely the failure this exists to expose.
   * Compare two readings across an operation to detect a replacement.
   */
  getSessionIdentity(): string | null;
}

/**
 * A connection that can be told which spans must not lose their session.
 *
 * A lock outlives the request that takes it, so a teardown between LOCK and
 * UNLOCK strands the lock rather than merely failing a request. A window marks
 * that span: a teardown requested while one is open waits for it, bounded, and
 * reports it as abandoned rather than dropping it silently.
 */
export interface ILockWindowAware {
  /** Opens a window. The label identifies it in {@link ITeardownReport.abandonedWindows}. */
  beginWindow(label: string): WindowToken;
  /** Closes the window. A token matching no open window is ignored. */
  endWindow(token: WindowToken): void;
}
