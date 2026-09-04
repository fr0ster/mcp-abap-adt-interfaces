import type { IAdtResponse } from '../adt/IAdtResponse';
import type { IAdtWireResponse } from '../connection/IAbapConnection';
import type { IFeedQueryOptions } from '../feeds/types';

export interface IGatewayErrorLog<TList = string, TError = string> {
  /** Which runtime resource this is, for a consumer narrowing a union of them. */
  readonly kind: 'gatewayErrorLog';

  /** The errors the gateway has logged. */
  list(options?: IFeedQueryOptions): Promise<IAdtResponse<TList>>;

  getById(errorType: string, errorId: string): Promise<IAdtResponse<TError>>;
}
