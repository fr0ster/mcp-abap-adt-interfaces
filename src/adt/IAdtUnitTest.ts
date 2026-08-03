/**
 * Unit Test ADT operation parameter interfaces (snake_case, low-level)
 */

import type { IAdtResponse } from '../connection/IAbapConnection';
import type { IClassState } from './IAdtClass';
import type { IAdtObjectState } from './IAdtObjectState';

export interface IUnitTestScope {
  own_tests?: boolean;
  foreign_tests?: boolean;
  add_foreign_tests_as_preview?: boolean;
}

export interface IUnitTestRiskLevel {
  harmless?: boolean;
  dangerous?: boolean;
  critical?: boolean;
}

export interface IUnitTestDuration {
  short?: boolean;
  medium?: boolean;
  long?: boolean;
}

// Unit test configuration (camelCase)
export interface IUnitTestConfig {
  tests?: Array<{
    containerClass: string;
    testClass: string;
  }>; // Optional: required for test run, not needed for test class creation
  options?: {
    title?: string;
    context?: string;
    scope?: {
      ownTests?: boolean;
      foreignTests?: boolean;
      addForeignTestsAsPreview?: boolean;
    };
    riskLevel?: {
      harmless?: boolean;
      dangerous?: boolean;
      critical?: boolean;
    };
    duration?: {
      short?: boolean;
      medium?: boolean;
      long?: boolean;
    };
  };
  runId?: string; // Set after create, used for read operations
  status?: unknown;
  result?: unknown;
}

// Unit test state
export interface IUnitTestState extends IAdtObjectState {
  runId?: string;
  runStatus?: unknown;
  runResult?: unknown;
}

// Unit test definition types (local to adt-clients)
export interface IClassUnitTestDefinition {
  containerClass: string;
  testClass: string;
}

export interface IClassUnitTestRunOptions {
  title?: string;
  context?: string;
  scope?: {
    ownTests?: boolean;
    foreignTests?: boolean;
    addForeignTestsAsPreview?: boolean;
  };
  riskLevel?: {
    harmless?: boolean;
    dangerous?: boolean;
    critical?: boolean;
  };
  duration?: {
    short?: boolean;
    medium?: boolean;
    long?: boolean;
  };
}

// Re-export with aliases for backward compatibility
export type ClassUnitTestDefinition = IClassUnitTestDefinition;
export type ClassUnitTestRunOptions = IClassUnitTestRunOptions;

// CDS unit-test config/state — promoted verbatim from adt-clients
// src/core/unitTest/AdtCdsUnitTest.ts (publicly exported, IAdtObject config/state).
export interface ICdsUnitTestConfig extends IUnitTestConfig {
  // CDS-specific fields
  className?: string;
  packageName?: string;
  cdsViewName?: string;
  classTemplate?: string;
  testClassSource?: string;
  description?: string;
  transportRequest?: string;
}

export interface ICdsUnitTestState extends IUnitTestState {
  testClassState?: IClassState;
  cdsCheckResponse?: IAdtResponse;
}

/** Options for fetching a finished run's result document. */
export interface IUnitTestResultOptions {
  /** Ask ADT to embed navigation URIs for each reported item. */
  withNavigationUris?: boolean;
  /** Result document flavour. */
  format?: 'abapunit' | 'junit';
}

/**
 * Running ABAP Unit and collecting the outcome.
 *
 * This is the reason a unit-test handler exists, and until 13.1.0 no interface
 * described it: the handler was typed as an ADT object, which covers creating
 * and reading a run but says nothing about starting one or fetching its result.
 * Consumers reached the methods by casting past the declared type.
 *
 * `getStatus` and `getResult` hand back the raw ADT response rather than a
 * parsed report. That is what the operation currently is, and the contract says
 * so instead of promising a shape nothing produces.
 */
export interface IAdtTestRunnable {
  /**
   * Start a run and return its run id.
   * @param tests the test classes to execute, each with its container class
   */
  run(
    tests: IClassUnitTestDefinition[],
    options?: IClassUnitTestRunOptions,
  ): Promise<string>;

  /** Run id of the most recent {@link run}, if one has been started. */
  getRunId(): string | undefined;

  /**
   * Poll a run.
   * @param withLongPolling let ADT hold the request until the run progresses
   */
  getStatus(runId: string, withLongPolling?: boolean): Promise<IAdtResponse>;

  /** Response of the most recent {@link getStatus}, if one has been made. */
  getStatusResponse(): IAdtResponse | undefined;

  /** Fetch the result document of a finished run. */
  getResult(
    runId: string,
    options?: IUnitTestResultOptions,
  ): Promise<IAdtResponse>;

  /** Response of the most recent {@link getResult}, if one has been made. */
  getResultResponse(): IAdtResponse | undefined;
}

/**
 * ABAP Unit against a CDS view.
 *
 * Adds the test-double check that has no equivalent for a plain class, and
 * widens `run` to accept a class name — a CDS run is normally started from the
 * generated test class rather than from an explicit test list.
 */
export interface IAdtCdsTestRunnable extends IAdtTestRunnable {
  run(
    testsOrClassName: IClassUnitTestDefinition[] | string,
    options?: IClassUnitTestRunOptions,
  ): Promise<string>;

  /**
   * Check whether a CDS view can be tested with test doubles.
   * @param cdsViewName the view to inspect
   */
  checkCdsTestDoubles(cdsViewName: string): Promise<ICdsUnitTestState>;

  /** Name of the generated test class, once one is known. */
  getClassName(): string | undefined;

  /** Name of the CDS view under test, once one is known. */
  getCdsViewName(): string | undefined;
}
