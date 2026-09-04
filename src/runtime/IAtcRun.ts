/**
 * ATC (ABAP Test Cockpit): starting a check run, asking whether it is done,
 * and reading what it found.
 *
 * Separate from `IAtcLog`, which reads the execution log and the check-failure
 * logs. Same subject, different resources — a worklist is not a log, and
 * nothing here takes an execution id.
 */

import type { IAdtResponse } from '../adt/IAdtResponse';

/**
 * The object kinds ATC will check, at a URI a client can build for them.
 *
 * **Confirmed on an ABAP Cloud trial**, each by a run submitted at the URI the
 * client builds whose finished worklist then listed that object under that
 * type. A run being *accepted* proves nothing: a URI that cannot exist is
 * answered `201` too.
 *
 * **This set is expected to grow, and growing it is a breaking change.**
 * `program` and `include` are absent because ABAP Cloud refuses to hold either
 * (`403`, authorization object `S_DEVELOP`), so nothing there could confirm
 * them; an on-prem system would. Adding a member does not disturb a caller
 * *passing* a value, but it does break one *exhausting* the union —
 * `Record<AtcObjectType, …>`, or a `switch` with a `never` check. Do not build
 * an exhaustive structure over this without meaning to revisit it.
 */
export type AtcObjectType =
  | 'class'
  | 'interface'
  | 'function_group'
  | 'package'
  | 'ddl_source'
  | 'table'
  | 'behavior_definition';

/** One object to check, by kind and name. The client builds the URI. */
export interface IAtcObjectRef {
  objectType: AtcObjectType;
  objectName: string;
}

export interface IAtcRunTarget {
  /**
   * One or more objects to check, as one inclusive object set.
   *
   * A non-empty tuple rather than an array: "one or more" in a doc comment
   * over a type that admits `[]` is a promise the compiler does not keep, and
   * an empty object set would start a run over nothing.
   */
  objects: readonly [IAtcObjectRef, ...IAtcObjectRef[]];
}

export interface IAtcRunOptions {
  /**
   * Have the server hold the request until the checks finish (`clientWait`).
   *
   * Defaults to **false**: that is the mode which answers with a run id, and a
   * run id is the only thing that can be polled, reported on while it runs, or
   * abandoned on the caller's own timetable. `true` is one request instead of
   * a loop, at the cost of a connection held for as long as the checks take —
   * which nothing bounds, and which grows with the object set.
   *
   * The two modes answer with different shapes, and what those shapes are is the
   * implementation's since 31.0.0.
   */
  wait?: boolean;

  /**
   * The check variant to run.
   *
   * Omitted, the client reads `systemCheckVariant` from ATC customizing. That
   * is not a convenience: on a system where the variant list comes back empty,
   * customizing is the only source of a usable one, and a contract demanding
   * the caller supply it would be unusable there.
   */
  checkVariant?: string;

  /**
   * `maximumVerdicts` in the run payload: a **cap on results**, not a page
   * size. Defaults to 100.
   *
   * A caller wanting everything raises it rather than paging — nothing
   * observed says what happens at the boundary, so a truncated worklist is
   * the failure to design against. Must be a positive integer; the server
   * answers `0` with a 400.
   */
  maximumVerdicts?: number;
}

export interface IAtcRunStatusReadable<TStatus> {
  /**
   * Status of a run started with `wait: false`.
   *
   * **Poll it under a bound you choose.** There is no `waitForRun` helper here
   * and that is deliberate: waiting needs a stopping condition for the case
   * where a run does not finish, no failed run has ever been observed, and a
   * helper would have to invent one. Whoever knows how long their checks take
   * is the one who can decide when to give up — and `status` travels beside
   * `isFinished` so they can report the state they last saw.
   */
  getRunStatus(runId: string): Promise<IAdtResponse<TStatus>>;
}

export interface IAtcFindings<TFindings> {
  /**
   * The worklist for a run: every object it checked, each with its findings,
   * empty for the ones that were clean.
   *
   * Read it after the run reports finished. Read earlier it is empty whatever
   * happened, which is indistinguishable from a run that found nothing.
   */
  getFindings(worklistId: string): Promise<IAdtResponse<TFindings>>;
}
