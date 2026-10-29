/**
 * Unit Test ADT operation parameter interfaces (snake_case, low-level)
 */

import type { IAdtRunnable } from '../execution/IAdtRunnable';
import type { AbapUnitRunTarget } from './AbapUnitRunTypes';
import type { IAdtHeaders } from './IAdtContentTypes';
import type { IAdtAnalyseOptions, IAnalyse } from './IAdtObject';
import type { IAdtError, IAdtResponse } from './IAdtResponse';

/**
 * Which tests a run covers.
 *
 * Named rather than inlined so a caller can hold one before they call — an
 * anonymous shape inside `IClassUnitTestRunOptions` could be passed but never
 * declared, which is the difference between a contract and a convenience.
 */
export interface IUnitTestScope {
  ownTests?: boolean;
  foreignTests?: boolean;
  addForeignTestsAsPreview?: boolean;
}

/** Which risk levels a run accepts. */
export interface IUnitTestRiskLevel {
  harmless?: boolean;
  dangerous?: boolean;
  critical?: boolean;
}

/** Which durations a run accepts. */
export interface IUnitTestDuration {
  short?: boolean;
  medium?: boolean;
  long?: boolean;
}

/**
 * A unit test, as an object a caller manages.
 *
 * The subject is the container class and its `testclasses` include — the class
 * that holds the tests, and the source of every local test class inside it.
 * Running is not described here: `run` takes its arguments directly, and asking
 * about a run is {@link ITestRunInformation}.
 */
export interface IUnitTestConfig {
  /** The class whose testclasses include holds the tests — CLAS/OC. */
  className: string;

  /**
   * Source of the **whole** testclasses include, every local test class in it.
   *
   * ADT addresses the include, never one class inside it: reading GETs it
   * whole, writing PUTs a source that replaces it whole, and deleting PUTs an
   * empty one. A field naming a single test class would promise an addressing
   * this contract does not have.
   */
  source?: string;

  /** Where the container class goes, when `create` has to make it. */
  packageName?: string;
  /** What the container class is, when `create` has to make it. */
  description?: string;
  /** Template the container class is created from, when `create` has to make it. */
  classTemplate?: string;

  transportRequest?: string;
}

// Unit test definition types (local to adt-clients)
export interface IClassUnitTestDefinition {
  containerClass: string;
  testClass: string;
}

export interface IClassUnitTestRunOptions {
  title?: string;
  context?: string;
  scope?: IUnitTestScope;
  riskLevel?: IUnitTestRiskLevel;
  duration?: IUnitTestDuration;
}

/**
 * A unit test against a CDS view.
 *
 * Everything about the container class and its include is inherited: a CDS test
 * lives in a global class exactly as a class's own tests do — the view cannot
 * hold a test class, so one is generated for it. Only the view itself is
 * CDS-specific.
 */
export type ICdsUnitTestConfig = IUnitTestConfig & {
  /** The CDS view under test. */
  cdsViewName?: string;
};

/** The CDS variant adds nothing to a run's result that a contract can name. */
/** Options for fetching a finished run's result document. */
export interface IUnitTestResultOptions {
  /** Ask ADT to embed navigation URIs for each reported item. */
  withNavigationUris?: boolean;
  /** Result document flavour. */
  format?: 'abapunit' | 'junit';
}

/**
 * Asking about a test run.
 *
 * Separate from running on purpose: a run is started once and asked about
 * whenever, by whoever holds its id. Nothing in ADT is "the run this handler
 * happened to start last", so nothing here reads a handler's memory — every
 * method takes the run it is about.
 *
 * What this does **not** declare is a listing. ADT addresses runs one at a
 * time in every request this package makes — `POST /abapunit/runs`,
 * `GET /abapunit/runs/{id}`, `GET /abapunit/results/{id}` — and whether it
 * answers a collection GET is unverified. An unproven method is exactly what
 * this contract exists not to promise.
 */
export interface ITestRunInformation<TStatus, TResult> {
  /**
   * Poll a run.
   * @param runId the run to ask about
   * @param withLongPolling let ADT hold the request until the run progresses
   */
  getStatus<E extends IAdtError>(
    runId: string,
    withLongPolling: boolean | undefined,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TStatus, E>>;
  getStatus(
    runId: string,
    withLongPolling?: boolean,
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TStatus>>;

  /** Fetch the result document of a finished run. */
  getResult<E extends IAdtError>(
    runId: string,
    options: IUnitTestResultOptions &
      IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TResult, E>>;
  getResult(
    runId: string,
    options?: IUnitTestResultOptions & IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TResult>>;
}

/**
 * The generic ABAP Unit runner: a run of anything ABAP Unit runs, named by
 * the registry rather than fixed by the runner.
 *
 * - `run` starts a run of one {@link AbapUnitRunTarget} — an object by its
 *   `osl:object type` (`AbapUnitRunObjectType`), or a package — with
 *   `POST /sap/bc/adt/abapunit/runs`, and answers the started run (`TRun`):
 *   the run id `getStatus` and `getResult` take. It sets only its request's
 *   `Content-Type`, so it takes no `headers`, as the per-object runners' `run`.
 * - `runSync` runs the objects named by their ADT URIs with
 *   `POST /sap/bc/adt/abapunit/testruns`, the synchronous runner and the only
 *   one SAP_BASIS 7.40 has, and answers the finished result (`TResult`, the
 *   document `getResult` answers). Its request sets both `Accept` and
 *   `Content-Type`, so it takes them as the required pair `options.headers`.
 *   At least one URI: a run of nothing is not a run.
 * - `getStatus` and `getResult` are {@link ITestRunInformation}'s.
 *
 * The scope, risk levels and durations are the caller's
 * (`IClassUnitTestRunOptions`); an object whose registry entry runs
 * `'assignedTests'` runs nothing unless the scope sets `foreignTests: true`.
 * `title` and `context` have no place in the `testruns` format.
 */
export interface IAbapUnitRunner<TRun, TStatus, TResult>
  extends IAdtRunnable<AbapUnitRunTarget, TRun, IClassUnitTestRunOptions>,
    ITestRunInformation<TStatus, TResult> {
  /**
   * Run the objects the URIs name and answer the finished result.
   * @param uris the objects' ADT URIs, at least one
   * @param options the run's scope, risk levels and durations, the request's
   *                `headers`, and `analyse` for the verdict
   */
  runSync<E extends IAdtError>(
    uris: readonly [string, ...string[]],
    options: { headers: IAdtHeaders } & IClassUnitTestRunOptions &
      IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TResult, E>>;
  runSync(
    uris: readonly [string, ...string[]],
    options: { headers: IAdtHeaders } & IClassUnitTestRunOptions &
      IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TResult>>;
}

/**
 * Checking whether a CDS view can be tested with test doubles.
 *
 * Its own capability rather than part of running: it answers a question about
 * the view, and it is asked before there is anything to run.
 */
export interface ICdsTestDoubleCheckable<TResult> {
  /**
   * Check whether a CDS view can be tested with test doubles.
   * @param cdsViewName the view to inspect
   */
  checkCdsTestDoubles<E extends IAdtError>(
    cdsViewName: string,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TResult, E>>;
  checkCdsTestDoubles(
    cdsViewName: string,
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TResult>>;
}
