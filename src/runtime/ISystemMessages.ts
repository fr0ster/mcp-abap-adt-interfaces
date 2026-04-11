import type { IAdtResponse } from '../connection/IAbapConnection';
import type { IFeedQueryOptions } from '../feeds/types';
import type { IListableRuntimeObject } from './types';

export interface ISystemMessages
  extends IListableRuntimeObject<
    IAdtResponse,
    IFeedQueryOptions,
    'systemMessages'
  > {
  getById(messageId: string): Promise<IAdtResponse>;
}
