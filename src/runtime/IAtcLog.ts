import type { IAdtWireResponse } from '../connection/IAbapConnection';
import type { IRuntimeAnalysisObject } from './types';

export interface IGetCheckFailureLogsOptions {
  displayId?: string;
  objName?: string;
  objType?: string;
  moduleId?: string;
  phaseKey?: string;
}

export interface IAtcLog extends IRuntimeAnalysisObject<'atcLog'> {
  getCheckFailureLogs(
    options?: IGetCheckFailureLogsOptions,
  ): Promise<IAdtWireResponse>;
  getExecutionLog(executionId: string): Promise<IAdtWireResponse>;
}
