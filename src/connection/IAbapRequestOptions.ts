export interface IAbapRequestOptions {
  url: string;
  method: string;
  timeout: number;
  data?: unknown;
  params?: unknown;
  headers?: Record<string, string>;
}
