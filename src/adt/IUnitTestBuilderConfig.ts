/**
 * Unit Test Builder Configuration Interface
 */

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

export interface IUnitTestBuilderConfig {
  tests: IClassUnitTestDefinition[];
  options?: IClassUnitTestRunOptions;
  runId?: string; // Set after create, used for read operations
  status?: any; // Set after read (status)
  result?: any; // Set after read (result)
}
