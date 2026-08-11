/**
 * Transport ADT operation parameter interfaces (snake_case, low-level)
 */

import type { IAdtResponse } from '../connection/IAbapConnection';
import type { IAdtObjectState } from './IAdtObjectState';

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

/**
 * A system with no saved transport search has nothing for `list()` to run.
 *
 * Named rather than a bare Error because a caller may reasonably want to react
 * to it — by creating a configuration in Eclipse, or by supplying a configUri
 * it already knows.
 */
export class TransportSearchConfigurationMissing extends Error {
  constructor(public readonly endpoint: string) {
    super(
      'No transport search configuration exists on this system. The transport ' +
        'list is a saved-configuration search, so there is nothing to run: create ' +
        'a configuration in Eclipse, or pass configUri explicitly. Configurations ' +
        `live at ${endpoint}`,
    );
    this.name = 'TransportSearchConfigurationMissing';
  }
}

// Transport request configuration (camelCase)
export interface ITransportConfig {
  description: string;
  transportType?: 'workbench' | 'customizing';
  targetSystem?: string;
  owner?: string;
  transportNumber?: string; // Set after create, used for read operations
}

// Transport state
export interface ITransportState extends IAdtObjectState {
  transportNumber?: string;
  taskNumber?: string;
  listResult?: IAdtResponse;
}
