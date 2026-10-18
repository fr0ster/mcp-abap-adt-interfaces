import type { IAdtHeaders } from '../adt/IAdtContentTypes';
import type { IAdtAnalyseOptions, IAnalyse } from '../adt/IAdtObject';
import type { IAdtError, IAdtResponse } from '../adt/IAdtResponse';

/**
 * The ids a request carries so that a terminal-mode listener catches it: the
 * listener's `terminalId` and `ideId`, 32 upper-case hex characters each, as in
 * {@link IDebuggerIdentity}.
 *
 * They travel in the request's `SAP-PASSPORT` header (the DSR passport), as two
 * system variable items, terminal id and IDE id — the way the ADT client sends
 * them. A run URL has no parameter for them. Measured on premise (2026-10-12,
 * BASIS 816):
 *
 * - a class run carrying the ids is caught by the terminal-mode listener with
 *   those ids, with `terminalId` equal to `ideId` or not; without them it is not
 *   caught;
 * - two listeners of one SAP user in terminal mode, with other ids, both listen,
 *   and each run is caught only by the listener whose ids it carries;
 * - the ids do not separate the breakpoints: `setBreakpoints` under other ids
 *   still replaces the set of that SAP user.
 */
export interface IDebuggeeIds {
  terminalId: string;
  ideId: string;
}

/**
 * Who is debugging, by mode: the values SAP keys a listener and the
 * breakpoints armed for it on. `ideId` is 32 upper-case hex characters, chosen
 * by the caller and kept for the whole session. In `user` mode so is
 * `terminalId`; in `terminal` mode it is the target's terminal id (for SAP GUI,
 * the one its settings show).
 *
 * - `user` catches the requests of `requestUser`. Debugging another user
 *   needs `S_DEVELOP` with the DEBUG activity 90 on them.
 * - `terminal` catches the requests that carry `terminalId` (for SAP GUI, its
 *   terminal id). The server reads no `requestUser` there, so the type has
 *   none. No catch was measured in this mode as of 2026-10-11.
 *
 * A `terminalId` equal to `ideId` keys on the IDE id alone.
 *
 * In `user` mode (measured on premise, 2026-10-10), a conflict between two
 * listeners of one SAP user is decided by `ideId`: the same `ideId` never
 * conflicts, another one either refuses the newcomer or is displaced by it, as
 * the implementation is told to. It was not measured in `terminal` mode.
 */
export type IDebuggerIdentity =
  | {
      debuggingMode: 'user';
      requestUser: string;
      terminalId: string;
      ideId: string;
    }
  | {
      debuggingMode: 'terminal';
      terminalId: string;
      ideId: string;
      requestUser?: never;
    };

interface IBreakpointCommon {
  /**
   * The caller's own tag for this breakpoint, sent with it and echoed by the
   * server on the breakpoint's row of the answer, on a placed row and on a
   * refused row alike. It pairs the answer with the request whatever order the
   * server answers the rows in (measured on premise (2026-10-11), BASIS 816:
   * the server answered refused rows before placed ones, out of the request's
   * order, and echoed every `clientId`). Unique per request is the caller's
   * responsibility.
   */
  clientId?: string;
}

/** A line breakpoint; the only kind the server evaluates a condition on. */
export type IDebuggerLineBreakpoint = IBreakpointCommon & {
  kind: 'line';
  /** The source URI with `#start=<line>`. */
  uri: string;
  /** An ABAP condition; the breakpoint stops only where it holds. */
  condition?: string;
};

/**
 * `condition?: never` rejects a pre-typed value carrying a condition, not only
 * a fresh literal.
 */
type NoCondition = { condition?: never };

/**
 * The kinds of breakpoint. Only a line breakpoint is tied to an object; the
 * others fire wherever the user's code reaches them, framework included.
 *
 * A message breakpoint names all three of id, number and type: one without the
 * type makes SAP refuse the whole set.
 */
export type IDebuggerBreakpoint =
  | IDebuggerLineBreakpoint
  | (IBreakpointCommon &
      NoCondition & { kind: 'exception'; exceptionClass: string })
  | (IBreakpointCommon & NoCondition & { kind: 'statement'; statement: string })
  | (IBreakpointCommon &
      NoCondition & {
        kind: 'message';
        msgId: string;
        msgNo: string;
        msgTy: string;
      });

/**
 * Replace breakpoints, explicitly. Both scopes touch every IDE that shares the
 * identity's key. The key is the IDE user and `requestUser` in `user` mode, and
 * the IDE user and `terminalId` in `terminal` mode; a `terminalId` equal to
 * `ideId` selects the IDE-id-only key. At most 30 breakpoints per key.
 *
 * `setBreakpoints` without a sync scope replaces the whole set of the key too
 * (measured on premise (2026-10-11), BASIS 816, also with `validationOnly`).
 * What this adds is an explicit name for a destructive call, `full` with an
 * empty set to clear the key, and `partial` scoped to the main programs of the
 * named objects.
 *
 * Measured on premise (2026-10-11), BASIS 816:
 * - `full` replaces all of the key's breakpoints.
 * - `full` with an empty `breakpoints` clears the key.
 * - `partial` keeps the breakpoints of other programs.
 * - `partial` scopes by main program and refuses a line breakpoint outside
 *   its scope.
 *
 * Server source, BASIS 816, read 2026-10-11 (not observed on a system):
 * - `partial` maps its objects to main programs (two objects of one class
 *   pool are one program).
 * - An empty `partial` `breakpoints` clears that scope.
 * - An object that maps to no program leaves the body's line breakpoints
 *   unset.
 */
export type IDebuggerBreakpointSync =
  | { scope: 'full'; breakpoints: readonly IDebuggerBreakpoint[] }
  | {
      scope: 'partial';
      objects: readonly [string, ...string[]];
      breakpoints: readonly IDebuggerLineBreakpoint[];
    };

/**
 * What to change in the debugger settings; a field left out keeps its current
 * value. The exception is `showDataAging`: the server does not merge it, takes
 * it from each request, and turns it off when left out. It only steers how the
 * variables present data aging. This is (server source, BASIS 816, read 2026-10-11).
 */
export interface IDebuggerSettings {
  systemDebugging?: boolean;
  updateDebugging?: boolean;
  createExceptionObject?: boolean;
  backgroundRFC?: boolean;
  sharedObjectDebugging?: boolean;
  showDataAging?: boolean;
}

/** The steps that go from where the debuggee stands. */
export type IDebuggerStepMethod =
  | 'stepInto'
  | 'stepOver'
  | 'stepReturn'
  | 'stepContinue';

/**
 * The steps that go to a line, which they name. Without the line SAP answers
 * 400 — and on one release (BASIS 758) let the program run to its end in the
 * same moment, losing the stop, while BASIS 816 and SAP BTP ABAP Environment
 * (2026-10-10) kept it suspended. The line is therefore an argument, not an option.
 */
export type IDebuggerStepToLineMethod = 'stepRunToLine' | 'stepJumpToLine';

type WithAnalyse<E extends IAdtError, O = unknown> = O &
  IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> };
type WithoutAnalyse<O = unknown> = O & IAdtAnalyseOptions;

/**
 * The ABAP debugger, by the mode its identity names, one member per request.
 *
 * **Two sessions, both stateful, both the caller's.** The listener holds one.
 * Each debuggee caught is attached on another, opened for it; every member
 * after {@link attach} addresses the debuggee through that one. On a system
 * with more than one application server, an attach on the listener's session
 * is refused whenever the debuggee runs elsewhere: the attach names the
 * debuggee's server ({@link attach}'s `server`), and a session that has
 * attached once cannot attach again.
 *
 * Every type parameter is what the implementation answers for that kind of
 * request: the breakpoints set, the listener's catch, the attach, the stack,
 * variables, a step, an answer with nothing to read, watchpoints, memory,
 * settings.
 */
export interface IAbapDebugger<
  TBreakpoints,
  TListener,
  TAttach,
  TStack,
  TVariables,
  TStep,
  TDone,
  TWatchpoints,
  TMemory,
  TSettings,
> {
  /** Which runtime resource this is, for a consumer narrowing a union of them. */
  readonly kind: 'abapDebugger';

  /**
   * Arm breakpoints for the identity. This replaces the key's set, it does not
   * add to it (measured on premise (2026-10-11), BASIS 816, also with
   * `validationOnly`). Answers each one placed or refused; `clientId` pairs a
   * row with its request. {@link stopListener} deletes the key's breakpoints.
   */
  setBreakpoints<E extends IAdtError>(
    identity: IDebuggerIdentity,
    breakpoints: readonly IDebuggerBreakpoint[],
    options: { headers: IAdtHeaders } & WithAnalyse<
      E,
      { validationOnly?: boolean }
    >,
  ): Promise<IAdtResponse<TBreakpoints, E>>;
  setBreakpoints(
    identity: IDebuggerIdentity,
    breakpoints: readonly IDebuggerBreakpoint[],
    options: { headers: IAdtHeaders } & WithoutAnalyse<{
      validationOnly?: boolean;
    }>,
  ): Promise<IAdtResponse<TBreakpoints>>;

  deleteBreakpoint<E extends IAdtError>(
    identity: IDebuggerIdentity,
    breakpointId: string,
    options: WithAnalyse<E>,
  ): Promise<IAdtResponse<TDone, E>>;
  deleteBreakpoint(
    identity: IDebuggerIdentity,
    breakpointId: string,
    options?: WithoutAnalyse,
  ): Promise<IAdtResponse<TDone>>;

  /**
   * Wait for a debuggee to stop at a breakpoint, up to `holdSeconds`. Nothing
   * else may go out on this session while it waits.
   */
  listen<E extends IAdtError>(
    identity: IDebuggerIdentity,
    options: WithAnalyse<E, { holdSeconds?: number }>,
  ): Promise<IAdtResponse<TListener, E>>;
  listen(
    identity: IDebuggerIdentity,
    options?: WithoutAnalyse<{ holdSeconds?: number }>,
  ): Promise<IAdtResponse<TListener>>;

  /**
   * Release the listener. This also deletes the identity key's breakpoints,
   * whether or not a listener was running (measured on premise (2026-10-11),
   * BASIS 816).
   */
  stopListener<E extends IAdtError>(
    identity: IDebuggerIdentity,
    options: WithAnalyse<E>,
  ): Promise<IAdtResponse<TDone, E>>;
  /**
   * Release the listener. This also deletes the identity key's breakpoints,
   * whether or not a listener was running (measured on premise (2026-10-11),
   * BASIS 816).
   */
  stopListener(
    identity: IDebuggerIdentity,
    options?: WithoutAnalyse,
  ): Promise<IAdtResponse<TDone>>;

  /** Take over a caught debuggee, on a session of its own. */
  attach<E extends IAdtError>(
    identity: IDebuggerIdentity,
    debuggeeId: string,
    options: WithAnalyse<E, IAttachOptions>,
  ): Promise<IAdtResponse<TAttach, E>>;
  attach(
    identity: IDebuggerIdentity,
    debuggeeId: string,
    options?: WithoutAnalyse<IAttachOptions>,
  ): Promise<IAdtResponse<TAttach>>;

  getStack<E extends IAdtError>(
    options: WithAnalyse<E>,
  ): Promise<IAdtResponse<TStack, E>>;
  getStack(options?: WithoutAnalyse): Promise<IAdtResponse<TStack>>;

  /** The variables under each parent id: locals, globals, an object's attributes. */
  getChildVariables<E extends IAdtError>(
    parentIds: readonly string[],
    options: { headers: IAdtHeaders } & WithAnalyse<E>,
  ): Promise<IAdtResponse<TVariables, E>>;
  getChildVariables(
    parentIds: readonly string[],
    options: { headers: IAdtHeaders } & WithoutAnalyse,
  ): Promise<IAdtResponse<TVariables>>;

  getVariables<E extends IAdtError>(
    variableIds: readonly string[],
    options: { headers: IAdtHeaders } & WithAnalyse<E>,
  ): Promise<IAdtResponse<TVariables, E>>;
  getVariables(
    variableIds: readonly string[],
    options: { headers: IAdtHeaders } & WithoutAnalyse,
  ): Promise<IAdtResponse<TVariables>>;

  step<E extends IAdtError>(
    method: IDebuggerStepMethod,
    options: WithAnalyse<E>,
  ): Promise<IAdtResponse<TStep, E>>;
  step(
    method: IDebuggerStepMethod,
    options?: WithoutAnalyse,
  ): Promise<IAdtResponse<TStep>>;

  /** Run to, or jump to, the line `uri` names (`#start=<line>`). */
  stepToLine<E extends IAdtError>(
    method: IDebuggerStepToLineMethod,
    uri: string,
    options: WithAnalyse<E>,
  ): Promise<IAdtResponse<TStep, E>>;
  stepToLine(
    method: IDebuggerStepToLineMethod,
    uri: string,
    options?: WithoutAnalyse,
  ): Promise<IAdtResponse<TStep>>;

  /** Make a frame of the stack the one variables are read in. */
  setStackPosition<E extends IAdtError>(
    position: number,
    options: WithAnalyse<E>,
  ): Promise<IAdtResponse<TDone, E>>;
  setStackPosition(
    position: number,
    options?: WithoutAnalyse,
  ): Promise<IAdtResponse<TDone>>;

  setVariableValue<E extends IAdtError>(
    variableName: string,
    value: string,
    options: WithAnalyse<E>,
  ): Promise<IAdtResponse<TVariables, E>>;
  setVariableValue(
    variableName: string,
    value: string,
    options?: WithoutAnalyse,
  ): Promise<IAdtResponse<TVariables>>;

  /**
   * End the debuggee where it stands. Compare {@link detachDebugger}, where the
   * debugger leaves and the program runs on, and {@link terminateDebugger},
   * which frees the debugger.
   */
  terminateDebuggee<E extends IAdtError>(
    options: WithAnalyse<E>,
  ): Promise<IAdtResponse<TDone, E>>;
  terminateDebuggee(options?: WithoutAnalyse): Promise<IAdtResponse<TDone>>;

  /**
   * Replace the breakpoints of the identity's key (`full`; an empty set clears
   * it), or the line breakpoints of the named objects' programs (`partial`).
   * Unlike a bare {@link setBreakpoints}, it names the destructive call. The
   * key is the IDE user and `requestUser` in `user` mode, the IDE user and
   * `terminalId` in `terminal` mode (a `terminalId` equal to `ideId` selects
   * the IDE-id-only key). Reaches every IDE sharing the key.
   */
  syncBreakpoints<E extends IAdtError>(
    identity: IDebuggerIdentity,
    sync: IDebuggerBreakpointSync,
    options: { headers: IAdtHeaders } & WithAnalyse<E>,
  ): Promise<IAdtResponse<TBreakpoints, E>>;
  syncBreakpoints(
    identity: IDebuggerIdentity,
    sync: IDebuggerBreakpointSync,
    options: { headers: IAdtHeaders } & WithoutAnalyse,
  ): Promise<IAdtResponse<TBreakpoints>>;

  /**
   * Ask whether a listener for the identity would conflict, without starting
   * one. A conflict is the failure (409).
   */
  checkListener<E extends IAdtError>(
    identity: IDebuggerIdentity,
    options: WithAnalyse<E>,
  ): Promise<IAdtResponse<TDone, E>>;
  checkListener(
    identity: IDebuggerIdentity,
    options?: WithoutAnalyse,
  ): Promise<IAdtResponse<TDone>>;

  /**
   * The debugger leaves and the program runs on. With `debuggeeId`, a caught
   * debuggee not attached on this session. (server source, BASIS 816, read 2026-10-11):
   * with a `debuggeeId` the server tries to attach that debuggee; if that
   * fails it deletes the debuggee's activation and still answers success, so
   * success does not prove the debuggee was attached and released.
   */
  detachDebugger<E extends IAdtError>(
    options: WithAnalyse<E, { debuggeeId?: string }>,
  ): Promise<IAdtResponse<TDone, E>>;
  detachDebugger(
    options?: WithoutAnalyse<{ debuggeeId?: string }>,
  ): Promise<IAdtResponse<TDone>>;

  /**
   * Free the debugger; the program runs on. (server source, BASIS 816, read 2026-10-11).
   */
  terminateDebugger<E extends IAdtError>(
    options: WithAnalyse<E>,
  ): Promise<IAdtResponse<TDone, E>>;
  terminateDebugger(options?: WithoutAnalyse): Promise<IAdtResponse<TDone>>;

  /**
   * Change the debugger settings at the current stop; answers the settings in
   * force. The first call after an attach ignores `systemDebugging=false`
   * (server source).
   */
  setDebuggerSettings<E extends IAdtError>(
    settings: IDebuggerSettings,
    options: { headers: IAdtHeaders } & WithAnalyse<E>,
  ): Promise<IAdtResponse<TSettings, E>>;
  setDebuggerSettings(
    settings: IDebuggerSettings,
    options: { headers: IAdtHeaders } & WithoutAnalyse,
  ): Promise<IAdtResponse<TSettings>>;

  createWatchpoint<E extends IAdtError>(
    variableName: string,
    options: WithAnalyse<E, { condition?: string }>,
  ): Promise<IAdtResponse<TWatchpoints, E>>;
  createWatchpoint(
    variableName: string,
    options?: WithoutAnalyse<{ condition?: string }>,
  ): Promise<IAdtResponse<TWatchpoints>>;

  listWatchpoints<E extends IAdtError>(
    options: WithAnalyse<E>,
  ): Promise<IAdtResponse<TWatchpoints, E>>;
  listWatchpoints(
    options?: WithoutAnalyse,
  ): Promise<IAdtResponse<TWatchpoints>>;

  deleteWatchpoint<E extends IAdtError>(
    watchpointId: string,
    options: WithAnalyse<E>,
  ): Promise<IAdtResponse<TDone, E>>;
  deleteWatchpoint(
    watchpointId: string,
    options?: WithoutAnalyse,
  ): Promise<IAdtResponse<TDone>>;

  /** The debuggee's memory at the current stop. */
  getMemorySizes<E extends IAdtError>(
    options: WithAnalyse<E, { includeAbap?: boolean }>,
  ): Promise<IAdtResponse<TMemory, E>>;
  getMemorySizes(
    options?: WithoutAnalyse<{ includeAbap?: boolean }>,
  ): Promise<IAdtResponse<TMemory>>;

  /**
   * Write a memory snapshot of the debuggee at the current stop. The answer
   * names a file, not an id; the snapshot is read through
   * {@link IMemorySnapshots} once it is listed there.
   */
  createMemorySnapshot<E extends IAdtError>(
    options: WithAnalyse<E>,
  ): Promise<IAdtResponse<TMemory, E>>;
  createMemorySnapshot(
    options?: WithoutAnalyse,
  ): Promise<IAdtResponse<TMemory>>;
}

export interface IAttachOptions {
  dynproDebugging?: boolean;
  /** The debuggee's application server, as the listener's catch names it. */
  server?: string;
}
