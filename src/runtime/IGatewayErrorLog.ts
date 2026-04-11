import type { IAdtResponse } from '../connection/IAbapConnection';
import type { IFeedQueryOptions } from '../feeds/types';
import type { IListableRuntimeObject } from './types';

export interface IGatewayErrorLog
  extends IListableRuntimeObject<
    IAdtResponse,
    IFeedQueryOptions,
    'gatewayErrorLog'
  > {
  getById(errorType: string, errorId: string): Promise<IAdtResponse>;
}
