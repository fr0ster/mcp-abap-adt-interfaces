/**
 * ATC (ABAP Test Cockpit): starting a check run, asking whether it is done,
 * and reading what it found.
 *
 * Separate from `IAtcLog`, which reads the execution log and the check-failure
 * logs. Same subject, different resources — a worklist is not a log, and
 * nothing here takes an execution id.
 */

import type { IAdtResponse } from '../adt/IAdtResponse';
import type { IAdtWireResponse } from '../connection/IAbapConnection';

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
   * The two modes answer with different shapes; see `IAtcRunResult`.
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

/**
 * What a started run answers with — two shapes, because the server has two.
 *
 * A discriminated union rather than one interface with four optional fields:
 * which fields exist is decided by `options.wait`, known at the call site, and
 * optional fields would let a caller write `result.runId!` and be wrong
 * exactly when they waited.
 */
export type IAtcRunResult =
  | {
      /**
       * The server answered **without waiting**.
       *
       * Not "the checks are still running": a short run can finish before this
       * result reaches the caller. Ask `getRunStatus(runId)`.
       */
      waited: false;
      /** The worklist the findings will appear in. */
      worklistId: string;
      /**
       * The run's own id, distinct from the worklist id.
       *
       * Poll `getRunStatus(runId)` until it reports finished — under a bound
       * of your choosing, see below — then read `getFindings(worklistId)`.
       */
      runId: string;
    }
  | {
      /** The server held the request until the checks were done. */
      waited: true;
      /** The worklist the findings are in. */
      worklistId: string;
      /**
       * `FINDING_STATS` as the server sent it — a comma-separated triple, for
       * example `"0,0,1"`.
       *
       * Not parsed into named counts. Which position is which severity has
       * been seen once, in a worklist with a single finding at priority 3,
       * which fits several orderings; inventing `{ errors, warnings, infos }`
       * would publish two guesses to save a caller one `split(',')`.
       */
      findingStats: string;
    };

/** What the run resource says about a run in progress or done. */
export interface IAtcRunStatus {
  /**
   * `runs:status` verbatim.
   *
   * A string and not a union: only `"finished"` has been observed, and
   * enumerating the states a server may report, from one state, is how a
   * caller ends up matching against names nothing ever sends.
   */
  status: string;

  /**
   * True when `status` is exactly `finished`, case-normalised.
   *
   * **Completion, not success.** It says the run reached an end, not that the
   * end was a good one: a run can finish having checked nothing, with the
   * reason recorded in the worklist, the run result or one of the logs rather
   * than here.
   *
   * **There is deliberately no `isTerminal` and no `isFailed`.** No failed or
   * cancelled run has been observed, so any state named for one would be
   * invented — and a caller branching on a name the server never sends is
   * worse off than one branching on nothing.
   */
  isFinished: boolean;

  /**
   * From the `worklistid` link, when the response carries one.
   *
   * Optional on purpose: the only status response captured was already
   * `finished`, and this method exists to be polled, so it will be called on
   * states nobody has seen. Requiring the link would throw at exactly the
   * moment polling matters. The worklist id is already in `IAtcRunResult`;
   * this is a convenience, not the source.
   */
  worklistId?: string;

  /** From the `displayid` link — a third id, and the one `IAtcLog` reads by. */
  resultId?: string;
}

export interface IAtcRunStatusReadable {
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
  getRunStatus(runId: string): Promise<IAdtResponse<IAtcRunStatus>>;
}

export interface IAtcFindings<TFindings = string> {
  /**
   * The worklist for a run: every object it checked, each with its findings,
   * empty for the ones that were clean.
   *
   * Read it after the run reports finished. Read earlier it is empty whatever
   * happened, which is indistinguishable from a run that found nothing.
   */
  getFindings(worklistId: string): Promise<IAdtResponse<TFindings>>;
}
