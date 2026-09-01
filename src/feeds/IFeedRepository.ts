/**
 * Feed Repository Interface
 *
 * Domain-facing interface for feed access.
 * All methods return domain types (no raw IAdtResponse).
 */

import type {
  IFeedDescriptor,
  IFeedEntry,
  IFeedQueryOptions,
  IFeedVariant,
  IGatewayErrorDetail,
  IGatewayErrorEntry,
  ISystemMessageEntry,
} from './types';

export interface IFeedRepository {
  list(): Promise<IFeedDescriptor[]>;
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
  variants(category: string): Promise<IFeedVariant[]>;
  dumps(options?: IFeedQueryOptions): Promise<IFeedEntry[]>;
  systemMessages(options?: IFeedQueryOptions): Promise<ISystemMessageEntry[]>;
  gatewayErrors(options?: IFeedQueryOptions): Promise<IGatewayErrorEntry[]>;
  gatewayErrorDetail(feedUrl: string): Promise<IGatewayErrorDetail>;
}
