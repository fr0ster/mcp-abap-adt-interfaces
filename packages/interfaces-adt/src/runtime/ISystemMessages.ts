import type { IAdtAnalyseOptions, IAnalyse } from '../adt/IAdtObject';
import type { IAdtError, IAdtResponse } from '../adt/IAdtResponse';
import type { IFeedQueryOptions } from '../feeds/types';

export interface ISystemMessages<TList, TMessage> {
  /** Which runtime resource this is, for a consumer narrowing a union of them. */
  readonly kind: 'systemMessages';

  /** The messages this system is showing. */
  list<E extends IAdtError>(
    options: IFeedQueryOptions &
      IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TList, E>>;
  list(
    options?: IFeedQueryOptions & IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TList>>;

  getById<E extends IAdtError>(
    messageId: string,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TMessage, E>>;
  getById(
    messageId: string,
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TMessage>>;
}
