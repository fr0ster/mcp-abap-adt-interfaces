import type { IAdtHeaders } from '../adt/IAdtContentTypes';
import type { IAdtAnalyseOptions, IAnalyse } from '../adt/IAdtObject';
import type { IAdtError, IAdtResponse } from '../adt/IAdtResponse';
import type { IFeedQueryOptions } from '../feeds/types';

export interface IGatewayErrorLog<TList, TError> {
  /** Which runtime resource this is, for a consumer narrowing a union of them. */
  readonly kind: 'gatewayErrorLog';

  /** The errors the gateway has logged. */
  list<E extends IAdtError>(
    options: { headers: IAdtHeaders } & IFeedQueryOptions &
      IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TList, E>>;
  list(
    options: { headers: IAdtHeaders } & IFeedQueryOptions & IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TList>>;

  getById<E extends IAdtError>(
    errorType: string,
    errorId: string,
    options: { headers: IAdtHeaders } & IAdtAnalyseOptions<E> & {
        analyse: IAnalyse<E>;
      },
  ): Promise<IAdtResponse<TError, E>>;
  getById(
    errorType: string,
    errorId: string,
    options: { headers: IAdtHeaders } & IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TError>>;
}
