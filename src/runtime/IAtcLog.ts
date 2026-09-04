import type { IAdtResponse } from '../adt/IAdtResponse';

export interface IGetCheckFailureLogsOptions {
  displayId?: string;
  objName?: string;
  objType?: string;
  moduleId?: string;
  phaseKey?: string;
}

export interface IAtcLog<TCheckFailures, TExecutionLog> {
  /** Which runtime resource this is, for a consumer narrowing a union of them. */
  readonly kind: 'atcLog';

  getCheckFailureLogs(
    options?: IGetCheckFailureLogsOptions,
  ): Promise<IAdtResponse<TCheckFailures>>;
  getExecutionLog(executionId: string): Promise<IAdtResponse<TExecutionLog>>;
}
