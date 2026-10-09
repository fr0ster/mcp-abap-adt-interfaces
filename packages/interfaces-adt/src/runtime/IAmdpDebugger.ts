import type { IAdtAnalyseOptions, IAnalyse } from '../adt/IAdtObject';
import type { IAdtError, IAdtResponse } from '../adt/IAdtResponse';

export interface IStartAmdpDebuggerOptions {
  /**
   * End a debug session the user already has. One left behind by an
   * interrupted run keeps the user locked out until it is ended.
   */
  stopExisting?: boolean;
  /** Eclipse sends `NONE`. */
  cascadeMode?: string;
}

/**
 * An AMDP breakpoint: the AMDP class's source URI with `#start=<line>` of a
 * SQLScript statement, and an id of the caller's choosing that the events
 * name it by.
 */
export interface IAmdpBreakpoint {
  uri: string;
  clientId: string;
}

export type IAmdpStepMethod = 'over' | 'continue';

/** Which table variable of a stopped debuggee to read, and how. */
export interface IGetAmdpDataPreviewOptions {
  /** The HANA session the debugger runs in, as `start` answered it. */
  sessionId: string;
  /** The debugger, as `start` answered it. */
  debuggerId: string;
  debuggeeId: string;
  variableName: string;
  rowNumber?: number;
  provideRowId?: boolean;
  /**
   * A SELECT over the variable. Without one the server selects every column.
   */
  query?: string;
}

type WithAnalyse<E extends IAdtError, O = unknown> = O &
  IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> };
type WithoutAnalyse<O = unknown> = O & IAdtAnalyseOptions;

/**
 * The AMDP debugger, one member per request. A protocol of its own: nothing
 * of it goes through the ABAP debugger.
 *
 * **Two sessions.** {@link start} and {@link getEvents} go on one stateful
 * session; every command — breakpoints, steps, ending a debuggee, stopping —
 * goes on another, and is answered with the request it became, not with its
 * outcome. The outcome arrives as an event.
 *
 * **A stop never releases a suspended debuggee.** It is released by
 * continuing it (to its end) or by deleting it (cancelling the execution).
 */
export interface IAmdpDebugger<TStarted, TEvents, TCommand, TPreview> {
  /** Which runtime resource this is, for a consumer narrowing a union of them. */
  readonly kind: 'amdpDebugger';

  start<E extends IAdtError>(
    requestUser: string,
    options: WithAnalyse<E, IStartAmdpDebuggerOptions>,
  ): Promise<IAdtResponse<TStarted, E>>;
  start(
    requestUser: string,
    options?: WithoutAnalyse<IStartAmdpDebuggerOptions>,
  ): Promise<IAdtResponse<TStarted>>;

  /** Replace the breakpoints with these; none clears them. */
  syncBreakpoints<E extends IAdtError>(
    mainId: string,
    breakpoints: readonly IAmdpBreakpoint[],
    options: WithAnalyse<E>,
  ): Promise<IAdtResponse<TCommand, E>>;
  syncBreakpoints(
    mainId: string,
    breakpoints: readonly IAmdpBreakpoint[],
    options?: WithoutAnalyse,
  ): Promise<IAdtResponse<TCommand>>;

  /** Wait for what happened next: a stop, a warning, an end. */
  getEvents<E extends IAdtError>(
    mainId: string,
    options: WithAnalyse<E>,
  ): Promise<IAdtResponse<TEvents, E>>;
  getEvents(
    mainId: string,
    options?: WithoutAnalyse,
  ): Promise<IAdtResponse<TEvents>>;

  step<E extends IAdtError>(
    mainId: string,
    debuggeeId: string,
    step: IAmdpStepMethod,
    options: WithAnalyse<E>,
  ): Promise<IAdtResponse<TCommand, E>>;
  step(
    mainId: string,
    debuggeeId: string,
    step: IAmdpStepMethod,
    options?: WithoutAnalyse,
  ): Promise<IAdtResponse<TCommand>>;

  /** End a debuggee: its execution is cancelled. */
  deleteDebuggee<E extends IAdtError>(
    mainId: string,
    debuggeeId: string,
    options: WithAnalyse<E>,
  ): Promise<IAdtResponse<TCommand, E>>;
  deleteDebuggee(
    mainId: string,
    debuggeeId: string,
    options?: WithoutAnalyse,
  ): Promise<IAdtResponse<TCommand>>;

  stop<E extends IAdtError>(
    mainId: string,
    options: WithAnalyse<E, { hardStop?: boolean }>,
  ): Promise<IAdtResponse<TCommand, E>>;
  stop(
    mainId: string,
    options?: WithoutAnalyse<{ hardStop?: boolean }>,
  ): Promise<IAdtResponse<TCommand>>;

  /** A table variable's rows, answered at once, by column. */
  getDataPreview<E extends IAdtError>(
    options: WithAnalyse<E, IGetAmdpDataPreviewOptions>,
  ): Promise<IAdtResponse<TPreview, E>>;
  getDataPreview(
    options: WithoutAnalyse<IGetAmdpDataPreviewOptions>,
  ): Promise<IAdtResponse<TPreview>>;
}
