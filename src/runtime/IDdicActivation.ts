import type { IAdtResponse } from '../connection/IAbapConnection';
import type { IRuntimeAnalysisObject } from './types';

export interface IGetActivationGraphOptions {
  objectName?: string;
  objectType?: string;
  logName?: string;
}

export interface IDdicActivation
  extends IRuntimeAnalysisObject<'ddicActivation'> {
  getGraph(options?: IGetActivationGraphOptions): Promise<IAdtResponse>;
}
