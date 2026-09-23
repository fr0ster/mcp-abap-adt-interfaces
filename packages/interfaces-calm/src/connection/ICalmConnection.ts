import type { IHttpWireResponse } from '@mcp-abap-adt/interfaces-network';
import type { CalmService } from './CalmService';
import type { ICalmRequestOptions } from './ICalmRequestOptions';

/**
 * What a Cloud ALM call answers: the HTTP frame, unchanged.
 *
 * It used to alias `IAdtWireResponse` — an *ADT* type — which is the whole
 * reason these contracts sat in the ADT package. The frame is
 * `IHttpWireResponse` in `@mcp-abap-adt/interfaces-network`, and nothing about
 * Cloud ALM needs ADT.
 */
export type ICalmResponse<T = unknown, D = unknown> = IHttpWireResponse<T, D>;

/**
 * Minimal connection interface for SAP Cloud ALM HTTP APIs.
 *
 * Implementations encapsulate auth, token refresh, service route resolution,
 * and request execution so resource clients depend on one narrow contract.
 */
export interface ICalmConnection {
  /**
   * Initialize the connection and prepare any internal auth state.
   */
  connect(): Promise<void>;

  /**
   * Get the tenant-level base URL.
   */
  getBaseUrl(): Promise<string>;

  /**
   * Resolve the effective base URL for a concrete Cloud ALM service.
   */
  getServiceUrl(service: CalmService): Promise<string>;

  /**
   * Execute a request against Cloud ALM.
   */
  makeRequest<T = unknown, D = unknown>(
    options: ICalmRequestOptions,
  ): Promise<ICalmResponse<T, D>>;
}
