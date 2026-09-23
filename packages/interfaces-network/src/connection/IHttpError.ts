/**
 * The shape an HTTP client throws, for a typed `catch` instead of
 * `catch (error: any)`.
 *
 * It was `HttpError` in `@mcp-abap-adt/interfaces-adt` until that package's
 * 9.0.0, where nothing used it — it was declared, re-exported, and imported by
 * `@mcp-abap-adt/adt-clients` and by `sap-cloud-alm-odata-mcp`, which is not an
 * ADT consumer at all. Nothing about an HTTP error is ABAP.
 */
/**
 * @example
 * ```typescript
 * try {
 *   await connection.makeAdtRequest({ url: '...' });
 * } catch (error: unknown) {
 *   const e = error as HttpError;
 *   console.log(e.response?.status);
 * }
 * ```
 */
export interface HttpError {
  response?: {
    status?: number;
    statusText?: string;
    data?: unknown;
    headers?: Record<string, unknown>;
  };
  message?: string;
}
