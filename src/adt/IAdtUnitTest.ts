/**
 * Unit Test ADT operation parameter interfaces (snake_case, low-level)
 */

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
