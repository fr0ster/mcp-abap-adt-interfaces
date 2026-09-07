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
   * call performs whatever is still owed.
   *
   * **Calling it again does not wait for the goodbye either**, which is what
   * {@link flushGoodbye} is for. A caller about to reconnect wants both, in
   * this order:
   *
   * ```typescript
   * await conn.disconnect();
   * await conn.flushGoodbye();
   * await conn.connect();
   * ```
   *
   * Without the middle line the next session opens while the previous one's
   * goodbye is still being assembled, and the server keeps both. With it, the
   * goodbye is given up to the budget to finish first.
   *
   * In-flight requests are NOT waited for. They continue as their caller
   * arranged and nothing is aborted; their results can no longer affect this
   * connection.
   */
  disconnect(): Promise<void>;

  /**
   * Wait for the goodbye {@link disconnect} sent, within a budget.
   *
   * `disconnect()` dispatches the logoff and does not await it, deliberately: a
   * goodbye carries no request timeout, and a server that never answers must
   * not hold a teardown open. That is right for teardown and wrong for the one
   * caller who reconnects — `disconnect()` then `connect()` opens the next
   * session while the previous one's goodbye is still being assembled, and the
   * server keeps both.
   *
   * Measured on E19 through `@mcp-abap-adt/adt-clients`, whose harness recycled
   * the session after each test: a new ABAP session every one to two seconds
   * for the length of a run, none released, each living to its own thirty
   * minute idle timeout. Turning the recycling off left one session for the
   * whole run, which is what the harness intended all along.
   *
   * **Bounded, and it resolves rather than throws.** The reason not to await
   * inside `disconnect()` applies here too, so the wait has a budget and gives
   * up quietly: "the goodbye has not arrived yet" is not a failure of whatever
   * the caller does next. A goodbye that failed is likewise not the caller's
   * problem — it is absorbed, not rethrown.
   *
   * **So a return is not a confirmation, and not even of dispatch.** Waiting out
   * the budget resolves the same way as the goodbye finishing, and at that
   * point the request may not have reached the wire at all — the promise it
   * waits on covers assembling and sending, not just answering.
   *
   * The guarantee is exactly this: **the caller gives the goodbye up to the
   * budget to finish before carrying on.** If it finishes in time there is no
   * overlap with the next `connect()`. If it does not, the caller proceeds and
   * the goodbye stays outstanding for as long as it takes — the budget bounds
   * the waiting, not the overlap. Whether the server then releases the session
   * is the server's affair, exactly as it is for `disconnect()`.
   *
   * Returns immediately when nothing was dispatched.
   *
   * @param timeoutMs how long to wait; an implementation chooses its default.
   */
  flushGoodbye(timeoutMs?: number): Promise<void>;

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

/**
 * A connection whose ordinary per-request deadline can be suspended.
 *
 * A `lock` → write → `unlock` sequence wants to run to completion. Aborting one
 * of its requests part way ends nothing on the server — the server ends an ABAP
 * session on its own idle timeout, which this side cannot see — it ends what
 * this side *knows*: whether the write was applied becomes unanswerable, and
 * the handle `unlock` needs is lost while the lock lives on in that session.
 *
 * Measured on a BTP trial: a `POST /sap/bc/adt/deletion/delete` abandoned at
 * 45 s was followed by `400 … Session Timed Out or Not Found` carrying a *new*
 * session cookie. Over HTTP a session is two layers — the ICF one the cookie
 * addresses and the ABAP one beneath it holding the enqueue locks — and the
 * abort replaces the first while stranding the second.
 *
 * **What this promises, exactly.** Inside a section the connection's ordinary
 * per-request deadline does not apply. It does **not** promise that no request
 * can ever be cut short: an implementation is free to keep a far larger ceiling
 * — `@mcp-abap-adt/connection` raises it to `SAP_TIMEOUT_CRITICAL`, ten minutes
 * by default — and a socket, a proxy or the process itself ends a request
 * whatever a contract says. The guarantee is that the short deadline is out of
 * the way, not that time is.
 *
 * Sections nest: the ceiling lifts on the outermost `begin` and ordinary
 * deadlines resume after the matching `end`.
 *
 * Separate from {@link ISessionLifecycleAware} because it answers a different
 * question: that one is *whose session is this*, this one is *may this request
 * be cut short*. A batch recorder honours the first and has nothing to protect.
 */
export interface ICriticalSection {
  /**
   * Enter a section in which the ordinary per-request deadline is suspended.
   *
   * Nests. Every call needs its own {@link endCriticalSection}, and the usual
   * shape is a `try`/`finally` so a throw inside the window still ends it.
   */
  beginCriticalSection(): void;

  /** Leave it. Ordinary deadlines resume when the outermost section ends. */
  endCriticalSection(): void;
}

/**
 * A connection that can be told what to ask the server to report about itself.
 *
 * `X-sap-adt-profiling` asks the server for its own processing time, and
 * Eclipse sends it on every request. It is a per-connection default: a single
 * request overrides it through `headers` on the request options, which every
 * connection already accepts, so this atom exists for the *default* and not for
 * the one-off.
 *
 * `null` asks for nothing. The value is a string rather than an enum because
 * what a server accepts there is the server's business and grows without this
 * package: `'server-time'` is what Eclipse asks for and is the sensible
 * default.
 *
 * Worth stating: an implementation is not expected to read the answer back.
 * The measurement is for whoever is looking at the wire, and being able to turn
 * it off matters more than being able to consume it.
 */
export interface IRequestProfiling {
  /**
   * What to ask for on every request from now on, or `null` to ask nothing.
   *
   * @param what the `X-sap-adt-profiling` value; `'server-time'` is Eclipse's.
   */
  setProfilingRequest(what: string | null): void;

  /** What this connection is currently asking for. */
  getProfilingRequest(): string | null;
}
