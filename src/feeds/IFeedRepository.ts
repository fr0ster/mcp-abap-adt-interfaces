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
  variants(): Promise<IFeedVariant[]>;
  dumps(options?: IFeedQueryOptions): Promise<IFeedEntry[]>;
  systemMessages(options?: IFeedQueryOptions): Promise<ISystemMessageEntry[]>;
  gatewayErrors(options?: IFeedQueryOptions): Promise<IGatewayErrorEntry[]>;
  gatewayErrorDetail(feedUrl: string): Promise<IGatewayErrorDetail>;
}
