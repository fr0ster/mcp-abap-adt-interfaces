/**
 * ATC (ABAP Test Cockpit): starting a check run, asking whether it is done,
 * and reading what it found.
 *
 * Separate from `IAtcLog`, which reads the execution log and the check-failure
 * logs. Same subject, different resources — a worklist is not a log, and
 * nothing here takes an execution id.
 */

import type { IAdtAnalyseOptions, IAnalyse } from '../adt/IAdtObject';
import type { IAdtError, IAdtResponse } from '../adt/IAdtResponse';

/**
 * The object kinds ATC will check, at a URI a client can build for them.
 *
 * Each was confirmed by a run submitted at the URI a client builds whose
 * finished worklist then listed that object. A run being *accepted* proves
 * nothing: a URI that cannot exist is answered `201` too.
 *
 * **An include is checked as the object that owns it.** Measured on an
 * on-premise and a cloud system (2026-10-01): a program include lists its main
 * program in the worklist, a function include its function group, a class
 * include its class, and the findings point into every include of that owner.
 * The include kinds exist so that a caller holding an include need not know its
 * owner's name — and because each include kind lives at an address of its own:
 * a function include is found under its group and **not** under
 * `/programs/includes/`. A program and a program include exist on premise only;
 * ABAP Cloud refuses to hold either (`S_DEVELOP`).
 *
 * **This set grows, and growing it is a breaking change** for a consumer
 * *exhausting* the union — `Record<AtcObjectType, …>`, or a `switch` with a
 * `never` check. A caller *passing* a value is not disturbed.
 */
export type AtcObjectType =
  | 'class'
  | 'interface'
  | 'function_group'
  | 'package'
  | 'ddl_source'
  | 'table'
  | 'behavior_definition'
  | 'program'
  | 'program_include'
  | 'function_include'
  | 'class_include';

/** The kinds a name alone addresses. */
export type AtcNamedObjectType =
  | 'class'
  | 'interface'
  | 'function_group'
  | 'package'
  | 'ddl_source'
  | 'table'
  | 'behavior_definition'
  | 'program'
  | 'program_include';

/** Which of a class's includes. */
export type AtcClassIncludeKind =
  | 'definitions'
  | 'implementations'
  | 'macros'
  | 'testclasses';

/**
 * One object to check. The client builds the URI, so each kind carries what
 * its address needs: a function include its group, a class include its class
 * and which include.
 */
export type IAtcObjectRef =
  | { objectType: AtcNamedObjectType; objectName: string }
  | {
      objectType: 'function_include';
      /** The include's name. */
      objectName: string;
      functionGroup: string;
    }
  | {
      objectType: 'class_include';
      /** The class's name. */
      objectName: string;
      includeKind: AtcClassIncludeKind;
    };

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
  getRunStatus<E extends IAdtError>(
    runId: string,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TStatus, E>>;
  getRunStatus(
    runId: string,
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TStatus>>;
}

export interface IAtcFindings<TFindings> {
  /**
   * The worklist for a run: every object it checked, each with its findings,
   * empty for the ones that were clean.
   *
   * Read it after the run reports finished. Read earlier it is empty whatever
   * happened, which is indistinguishable from a run that found nothing.
   */
  getFindings<E extends IAdtError>(
    worklistId: string,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TFindings, E>>;
  getFindings(
    worklistId: string,
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TFindings>>;
}
