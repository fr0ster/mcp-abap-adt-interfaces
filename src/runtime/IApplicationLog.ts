import type { IAdtResponse } from '../connection/IAbapConnection';
import type { IRuntimeAnalysisObject } from './types';

export interface IGetApplicationLogObjectOptions {
  corrNr?: string;
  lockHandle?: string;
  version?: string;
  accessMode?: string;
  action?: string;
}

export interface IGetApplicationLogSourceOptions {
  corrNr?: string;
  lockHandle?: string;
  version?: string;
}

export interface IApplicationLog
  extends IRuntimeAnalysisObject<'applicationLog'> {
  getObject(
    objectName: string,
    options?: IGetApplicationLogObjectOptions,
  ): Promise<IAdtResponse>;
  getSource(
    objectName: string,
    options?: IGetApplicationLogSourceOptions,
  ): Promise<IAdtResponse>;
  validateName(objectName: string): Promise<IAdtResponse>;
}
