/**
 * Batch payload shapes — the contract a consumer sees when it builds or
 * inspects a multipart/mixed ADT batch.
 *
 * Declared here rather than in adt-clients because a consumer must import
 * these to build or inspect a batch payload at all, and the point of this
 * package is that there is one place to import from and one place to
 * override.
 *
 * These shapes back the batch layer: a recording connection collects
 * individual ADT requests as IBatchRequestPart entries, they are serialized
 * into a single multipart/mixed IBatchPayload, and the server's multipart
 * response is parsed back into one IBatchResponsePart per recorded request.
 */

export interface IBatchRequestPart {
  method: string;
  url: string;
  headers: Record<string, string>;
  data?: string;
  params?: Record<string, string>;
}

export interface IBatchPayload {
  boundary: string;
  body: string;
}

export interface IBatchResponsePart {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: string;
}
