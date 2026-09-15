/**
 * Unit Test ADT operation parameter interfaces (snake_case, low-level)
 */

import type { IAdtResponse } from './IAdtResponse';

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
  testClassSource?: string;

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
  getStatus(
    runId: string,
    withLongPolling?: boolean,
  ): Promise<IAdtResponse<TStatus>>;

  /** Fetch the result document of a finished run. */
  getResult(
    runId: string,
    options?: IUnitTestResultOptions,
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
  checkCdsTestDoubles(cdsViewName: string): Promise<IAdtResponse<TResult>>;
}
