/**
 * Unit Test ADT operation parameter interfaces (snake_case, low-level)
 */

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

export interface IRunUnitTestParams {
  tests: Array<{
    container_class: string;
    test_class: string;
  }>;
  title?: string;
  context?: string;
  scope?: IUnitTestScope;
  risk_level?: IUnitTestRiskLevel;
  duration?: IUnitTestDuration;
}

export interface IReadUnitTestParams {
  run_id: string;
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
