import type { IAdtResponse } from '../adt/IAdtResponse';
import type { IAdtWireResponse } from '../connection/IAbapConnection';
import type { IFeedQueryOptions } from '../feeds/types';

export interface ISystemMessages<TList, TMessage> {
  /** Which runtime resource this is, for a consumer narrowing a union of them. */
  readonly kind: 'systemMessages';

  /** The messages this system is showing. */
  list(options?: IFeedQueryOptions): Promise<IAdtResponse<TList>>;

  getById(messageId: string): Promise<IAdtResponse<TMessage>>;
}
