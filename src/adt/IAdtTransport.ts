/**
 * Transport ADT operation parameter interfaces (snake_case, low-level)
 */

import type { IAdtResponse } from './IAdtResponse';

export interface ICreateTransportParams {
  transport_type?: string;
  description: string;
  target_system?: string;
  owner?: string;
}

/**
 * Low level. `configUri` is REQUIRED: this layer requests, it does not resolve.
 *
 * The five filter fields this replaces were never read by the server. Probed on
 * the trial 2026-08-07: `/sap/bc/adt/cts/transportrequests` answers with the
 * same 309-byte empty root for `?user=`, for `?status=`, for the configuration's
 * own property spellings, and for no parameters at all — while 15 requests
 * existed. The transport list is a saved-configuration search: reference the
 * search, do not restate it.
 */
export interface IListTransportsParams {
  /** href of a saved search configuration, verbatim from the configurations document. */
  configUri: string;
}

/** High level. Omitting `configUri` opts into the resolution rule in `AdtRequest`. */
export interface IListTransportsOptions {
  configUri?: string;
}

/**
 * One saved transport search configuration.
 *
 * The payload carries no name and no default marker: the element holds
 * authorship and client, while the href and its etag live on an `atom:link`
 * child. Attributes are handed back verbatim — naming them is the consumer's
 * decision, not this library's.
 */
export interface ITransportSearchConfiguration {
  /** href from the `atom:link` child, verbatim — pass back as `configUri`. */
  uri: string;
  /** etag from the same link, when present. */
  etag?: string;
  /** createdBy, createdAt, changedBy, changedAt, client — verbatim, no renaming. */
  attributes: Record<string, string>;
}

/** Where saved transport searches live. Named so an error message can quote it. */
export const TRANSPORT_SEARCH_CONFIGURATIONS_URL =
  '/sap/bc/adt/cts/transportrequests/searchconfiguration/configurations';

// Transport request configuration (camelCase)
export interface ITransportConfig {
  description: string;
  transportType?: 'workbench' | 'customizing';
  targetSystem?: string;
  owner?: string;
  transportNumber?: string; // Set after create, used for read operations
}

// Transport state
/**
 * The transport request handler, as a contract rather than a class.
 *
 * `AdtClient.getRequest()` handed back a concrete `AdtRequest`, which is the one
 * thing a consumer cannot replace: no declared type to implement, nothing to
 * compose their own reader into, and — in `@mcp-abap-adt/adt-clients` — a
 * capability guard with nothing to compare the manifest against, because the
 * declared type *was* the implementation.
 *
 * The CRUD half is the four atoms with the transport's own config; the two
 * methods below are the transport's alone, and neither has an atom because
 * nothing else lists a collection this way.
 */
export interface IAdtRequest<TList> {
  /**
   * The transport requests the server lists.
   *
   * Until 30.0.0 this resource had three members: `list` and `listNodes`, which
   * answered the identical parsed tree, and a
   * `listNodes<T>(parse, …)` overload. One request, one member (decision 16);
   * a caller wanting the request numbers alone, the tree, or the document
   * untouched injects an {@link IResultStrategy} when the implementation is
   * constructed (decision 22).
   *
   * The tree is the reading that carries the containers, the description and
   * the **language** a request holds — none of which a consumer could reach
   * before without re-fetching and parsing the document themselves.
   *
   * `configUri` is required by the layer beneath — see `IListTransportsParams`,
   * where the measurement is. This resolves it; that one does not.
   */
  list(options?: IListTransportsOptions): Promise<IAdtResponse<TList>>;
}
