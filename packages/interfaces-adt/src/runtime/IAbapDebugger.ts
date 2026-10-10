import type { IAdtAnalyseOptions, IAnalyse } from '../adt/IAdtObject';
import type { IAdtError, IAdtResponse } from '../adt/IAdtResponse';

/**
 * Who is debugging: the values SAP keys a user-mode listener and the
 * breakpoints armed for it on. `terminalId` and `ideId` are 32 upper-case hex
 * characters, chosen by the caller and kept for the whole session.
 *
 * A conflict between two listeners of one SAP user is decided by `ideId`: the
 * same `ideId` never conflicts, another one either refuses the newcomer or is
 * displaced by it, as the implementation is told to.
 */
export interface IDebuggerIdentity {
  requestUser: string;
  terminalId: string;
  ideId: string;
}

interface IBreakpointCommon {
  /** An ABAP condition; the breakpoint stops only where it holds. */
  condition?: string;
}

/**
 * The kinds of breakpoint. Only a line breakpoint is tied to an object; the
 * others fire wherever the user's code reaches them, framework included.
 *
 * A message breakpoint names all three of id, number and type: one without the
 * type makes SAP refuse the whole set.
 */
export type IDebuggerBreakpoint =
  | (IBreakpointCommon & {
      kind: 'line';
      /** The source URI with `#start=<line>`. */
      uri: string;
    })
  | (IBreakpointCommon & { kind: 'exception'; exceptionClass: string })
  | (IBreakpointCommon & { kind: 'statement'; statement: string })
  | (IBreakpointCommon & {
      kind: 'message';
      msgId: string;
      msgNo: string;
      msgTy: string;
    });

/** The steps that go from where the debuggee stands. */
export type IDebuggerStepMethod =
  | 'stepInto'
  | 'stepOver'
  | 'stepReturn'
  | 'stepContinue';

/**
 * The steps that go to a line, which they name. Without the line SAP answers
 * 400 — and on one release (BASIS 758) let the program run to its end in the
 * same moment, losing the stop, while another (BASIS 816, 2026-10-10) kept it
 * suspended. The line is therefore an argument, not an option.
 */
export type IDebuggerStepToLineMethod = 'stepRunToLine' | 'stepJumpToLine';

type WithAnalyse<E extends IAdtError, O = unknown> = O &
  IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> };
type WithoutAnalyse<O = unknown> = O & IAdtAnalyseOptions;

/**
 * The ABAP debugger in user mode, one member per request.
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
 * variables, a step, an answer with nothing to read, watchpoints, memory.
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
> {
  /** Which runtime resource this is, for a consumer narrowing a union of them. */
  readonly kind: 'abapDebugger';

  /** Arm breakpoints for the identity. Answers each one placed or refused. */
  setBreakpoints<E extends IAdtError>(
    identity: IDebuggerIdentity,
    breakpoints: readonly IDebuggerBreakpoint[],
    options: WithAnalyse<E, { validationOnly?: boolean }>,
  ): Promise<IAdtResponse<TBreakpoints, E>>;
  setBreakpoints(
    identity: IDebuggerIdentity,
    breakpoints: readonly IDebuggerBreakpoint[],
    options?: WithoutAnalyse<{ validationOnly?: boolean }>,
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

  stopListener<E extends IAdtError>(
    identity: IDebuggerIdentity,
    options: WithAnalyse<E>,
  ): Promise<IAdtResponse<TDone, E>>;
  stopListener(
    identity: IDebuggerIdentity,
    options?: WithoutAnalyse,
  ): Promise<IAdtResponse<TDone>>;

  /** Take over a caught debuggee, on a session of its own. */
  attach<E extends IAdtError>(
    requestUser: string,
    debuggeeId: string,
    options: WithAnalyse<E, IAttachOptions>,
  ): Promise<IAdtResponse<TAttach, E>>;
  attach(
    requestUser: string,
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
    options: WithAnalyse<E>,
  ): Promise<IAdtResponse<TVariables, E>>;
  getChildVariables(
    parentIds: readonly string[],
    options?: WithoutAnalyse,
  ): Promise<IAdtResponse<TVariables>>;

  getVariables<E extends IAdtError>(
    variableIds: readonly string[],
    options: WithAnalyse<E>,
  ): Promise<IAdtResponse<TVariables, E>>;
  getVariables(
    variableIds: readonly string[],
    options?: WithoutAnalyse,
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

  /** End the debuggee where it stands. */
  terminateDebuggee<E extends IAdtError>(
    options: WithAnalyse<E>,
  ): Promise<IAdtResponse<TDone, E>>;
  terminateDebuggee(options?: WithoutAnalyse): Promise<IAdtResponse<TDone>>;

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
