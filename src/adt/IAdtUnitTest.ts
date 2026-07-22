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
