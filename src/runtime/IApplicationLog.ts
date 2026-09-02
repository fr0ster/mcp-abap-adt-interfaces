import type { IAdtWireResponse } from '../connection/IAbapConnection';
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
  ): Promise<IAdtWireResponse>;
  getSource(
    objectName: string,
    options?: IGetApplicationLogSourceOptions,
  ): Promise<IAdtWireResponse>;
  validateName(objectName: string): Promise<IAdtWireResponse>;
}
