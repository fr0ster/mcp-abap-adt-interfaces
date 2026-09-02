import type { IAdtWireResponse } from '../connection/IAbapConnection';
import type { IFeedQueryOptions } from '../feeds/types';
import type { IListableRuntimeObject } from './types';

export interface ISystemMessages
  extends IListableRuntimeObject<
    IAdtWireResponse,
    IFeedQueryOptions,
    'systemMessages'
  > {
  getById(messageId: string): Promise<IAdtWireResponse>;
}
