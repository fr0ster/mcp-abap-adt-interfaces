import type { IAdtResponse } from '../connection/IAbapConnection';
import type { IListableRuntimeObject } from './types';

export interface IListCrossTracesOptions {
  traceUser?: string;
  actCreateUser?: string;
  actChangeUser?: string;
}

export interface ICrossTrace
  extends IListableRuntimeObject<
    IAdtResponse,
    IListCrossTracesOptions,
    'crossTrace'
  > {
  getById(
    traceId: string,
    includeSensitiveData?: boolean,
  ): Promise<IAdtResponse>;
  getRecords(traceId: string): Promise<IAdtResponse>;
  getRecordContent(
    traceId: string,
    recordNumber: number,
  ): Promise<IAdtResponse>;
  getActivations(): Promise<IAdtResponse>;
}
