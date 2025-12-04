export interface IAbapRequestOptions {
  url: string;
  method: string;
  timeout: number;
  data?: any;
  params?: any;
  headers?: Record<string, string>;
}

