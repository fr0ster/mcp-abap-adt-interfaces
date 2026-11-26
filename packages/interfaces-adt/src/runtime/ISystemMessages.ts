import type { IAdtAnalyseOptions, IAnalyse } from '../adt/IAdtObject';
import type { IAdtError, IAdtResponse } from '../adt/IAdtResponse';
import type { IFeedQueryOptions } from '../feeds/types';

/**
 * The system messages feed (`GET /sap/bc/adt/runtime/systemmessages`). SAP's
 * handler serves the collection only (`CL_STSK_ADT_RES_APP` routes no
 * per-message resource), so there is no member reading one message by id.
 */
export interface ISystemMessages<TList> {
  /** Which runtime resource this is, for a consumer narrowing a union of them. */
  readonly kind: 'systemMessages';

  /** The messages this system is showing. */
  list<E extends IAdtError>(
    options: IFeedQueryOptions &
      IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TList, E | IAdtError>>;
  list(
    options?: IFeedQueryOptions & IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TList>>;
}
