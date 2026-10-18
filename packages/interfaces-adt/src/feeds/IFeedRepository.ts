/**
 * Feed Repository Interface
 *
 * Domain-facing interface for feed access.
 * All methods return domain types (no raw IAdtWireResponse).
 */

import type { IAdtAnalyseOptions, IAnalyse } from '../adt/IAdtObject';
import type { IAdtError, IAdtResponse } from '../adt/IAdtResponse';
import type { IFeedQueryOptions } from './types';

export interface IFeedRepository<
  TFeeds,
  TVariants,
  TEntries,
  TSystemMessages,
  TGatewayErrors,
  TGatewayErrorDetail,
> {
  list<E extends IAdtError>(
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TFeeds, E>>;
  list(options?: IAdtAnalyseOptions): Promise<IAdtResponse<TFeeds>>;
  /**
   * Feed variants for a category.
   *
   * `category` is required because the endpoint requires it: measured on an
   * on-prem system, `GET /sap/bc/adt/feeds/variants` answers **400**
   * `ExceptionParameterNotFound` — "Parameter category could not be found." —
   * and the same request with any category answers 200. A method matching the
   * parameterless signature this replaces could not work: called the only way
   * that contract allowed, it always failed.
   *
   * The type is `string` and not a union. Every value tried on that system —
   * feed ids read from the feeds collection, and invented ones — answered 200
   * with an empty body, so there was nothing to enumerate from. A union would
   * be a guess dressed as a contract.
   */
  variants<E extends IAdtError>(
    category: string,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TVariants, E>>;
  variants(
    category: string,
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TVariants>>;
  dumps<E extends IAdtError>(
    options: IFeedQueryOptions &
      IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TEntries, E>>;
  dumps(
    options?: IFeedQueryOptions & IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TEntries>>;
  systemMessages<E extends IAdtError>(
    options: IFeedQueryOptions &
      IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TSystemMessages, E>>;
  systemMessages(
    options?: IFeedQueryOptions & IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TSystemMessages>>;
  gatewayErrors<E extends IAdtError>(
    options: IFeedQueryOptions &
      IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TGatewayErrors, E>>;
  gatewayErrors(
    options?: IFeedQueryOptions & IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TGatewayErrors>>;
  gatewayErrorDetail<E extends IAdtError>(
    feedUrl: string,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TGatewayErrorDetail, E>>;
  gatewayErrorDetail(
    feedUrl: string,
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TGatewayErrorDetail>>;
}
