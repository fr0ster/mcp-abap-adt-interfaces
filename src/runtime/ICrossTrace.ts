import type { IAdtWireResponse } from '../connection/IAbapConnection';
import type { IListableRuntimeObject } from './types';

export interface IListCrossTracesOptions {
  traceUser?: string;
  actCreateUser?: string;
  actChangeUser?: string;
}

export interface ICrossTrace
  extends IListableRuntimeObject<
    IAdtWireResponse,
    IListCrossTracesOptions,
    'crossTrace'
  > {
  getById(
    traceId: string,
    includeSensitiveData?: boolean,
  ): Promise<IAdtWireResponse>;
  getRecords(traceId: string): Promise<IAdtWireResponse>;
  getRecordContent(
    traceId: string,
    recordNumber: number,
  ): Promise<IAdtWireResponse>;
  getActivations(): Promise<IAdtWireResponse>;
}
