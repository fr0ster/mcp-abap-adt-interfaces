import type { ISapConfig } from '../sap/ISapConfig';
import type { IAbapRequestOptions } from './IAbapRequestOptions';

/**
 * Axios response type - using any to avoid dependency on axios package
 * Consumers should use proper AxiosResponse type from axios
 */
export type AxiosResponse = any;

export interface IAbapConnection {
  getConfig(): ISapConfig;
  getBaseUrl(): Promise<string>;
  getAuthHeaders(): Promise<Record<string, string>>;
  getSessionId(): string | null;
  setSessionType(type: "stateful" | "stateless"): void;
  makeAdtRequest(options: IAbapRequestOptions): Promise<AxiosResponse>;
  connect(): Promise<void>;
  reset(): void;
}

