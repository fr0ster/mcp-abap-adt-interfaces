import type { IAdtAnalyseOptions, IAnalyse } from '../adt/IAdtObject';
import type { IAdtError, IAdtResponse } from '../adt/IAdtResponse';

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

  getCheckFailureLogs<E extends IAdtError>(
    options: IGetCheckFailureLogsOptions &
      IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TCheckFailures, E>>;
  getCheckFailureLogs(
    options?: IGetCheckFailureLogsOptions & IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TCheckFailures>>;
  getExecutionLog<E extends IAdtError>(
    executionId: string,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TExecutionLog, E>>;
  getExecutionLog(
    executionId: string,
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TExecutionLog>>;
}
