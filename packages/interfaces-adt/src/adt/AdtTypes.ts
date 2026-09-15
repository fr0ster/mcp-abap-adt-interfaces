/**
 * Shared ADT types for type-safe error handling and XML parsing.
 */

/**
 * Shape of HTTP errors thrown by the connection layer.
 * Used for type-safe catch blocks instead of `catch (error: any)`.
 *
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

/**
 * Recursive type for XML parser results.
 * Allows property access on deeply nested parsed XML structures.
 *
 * @example
 * ```typescript
 * const result = parser.parse(xmlData) as XmlNode;
 * const data = (result?.['asx:abap'] as XmlNode)?.['asx:values'];
 * ```
 */
export interface XmlNode {
  [key: string]: XmlNode | XmlNode[] | string | number | boolean | undefined;
}
