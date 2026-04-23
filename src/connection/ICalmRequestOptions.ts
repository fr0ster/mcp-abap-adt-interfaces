import type { CalmService } from './CalmService';

export interface ICalmRequestOptions {
  url: string;
  method: string;
  timeout?: number;
  service?: CalmService;
  data?: unknown;
  params?: unknown;
  headers?: Record<string, string>;
}
