/**
 * Transport ADT operation parameter interfaces (snake_case, low-level)
 */

import type { IAdtResponse } from '../connection/IAbapConnection';
import type { IAdtCrud } from './IAdtCapabilities';
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

/**
 * One container a request was nested under — `tm:workbench`, `tm:target`,
 * `tm:modifiable` and whatever else a system groups by.
 *
 * A list rather than named fields because the chain is not fixed: `?targets=true`
 * inserts a `tm:target` level, and a parser that assumed a shape would return
 * nothing on the other form.
 */
export interface ITransportTreeNode {
  /** Element name without its prefix: "workbench", "target", "modifiable" … */
  element: string;
  /** The container's own attributes, verbatim. */
  attributes: Record<string, string | undefined>;
}

/**
 * One `atom:link` on a request or a task.
 *
 * These are how ADT names its own operations — `release`, `addobject`,
 * `changeowner`, `merge`, `newtask` — so a caller follows an href rather than
 * assembling a URL by convention.
 */
export interface ITransportTreeLink {
  /** href, rel, type, title — verbatim, unprefixed of the parser's own marker. */
  attributes: Record<string, string | undefined>;
}

export interface ITransportTreeTask {
  /** tm:number, tm:parent, tm:owner, tm:desc, tm:type, tm:status … verbatim. */
  attributes: Record<string, string | undefined>;
  /**
   * Every `atom:link`, in document order. These carry the operation URIs —
   * release, reassign, addobject, consistencycheck — so dropping them would
   * force a consumer to rebuild ADT URLs by convention.
   */
  links: ITransportTreeLink[];
  /**
   * `tm:long_desc` text. `''` when present and empty, `undefined` when absent.
   */
  longDesc: string | undefined;
}

/**
 * One transport request, with its tasks and the containers it was found under.
 *
 * The containers are kept because they carry information the request does not:
 * `tm:target` has a human name (`"Local Change Requests"`) where the request has
 * `tm:target=""`. Dropping them would be this library deciding what a consumer
 * needs.
 */
export interface ITransportTreeRequest {
  /** Attributes verbatim — `tm:number`, not `number`. No renaming, no selection. */
  attributes: Record<string, string | undefined>;
  /** Ancestors, outermost first. Empty only if the server nested it under nothing. */
  containers: ITransportTreeNode[];
  /** Every `atom:link` on the request, in document order. */
  links: ITransportTreeLink[];
  /**
   * `tm:long_desc` text. `''` when the element is present and empty;
   * `undefined` when the element is absent. The two are not the same thing and
   * the type does not pretend they are.
   */
  longDesc: string | undefined;
  /** Empty when the request has no tasks — never undefined. */
  tasks: ITransportTreeTask[];
}

/**
 * The parsed transport tree. Empty `requests` is a legitimate answer, not a failure.
 *
 * `attributes` are the root's own — `adtcore:name` is the user the saved search
 * ran for, plus the four created/changed stamps. They are the only record of
 * *whose* list this is, so dropping them would leave a caller unable to tell two
 * lists apart.
 */
export interface ITransportTree {
  attributes: Record<string, string | undefined>;
  requests: ITransportTreeRequest[];
}

/**
 * The transport request handler, as a contract rather than a class.
 *
 * `AdtClient.getRequest()` handed back a concrete `AdtRequest`, which is the one
 * thing a consumer cannot replace: no declared type to implement, nothing to
 * compose their own reader into, and — in `@mcp-abap-adt/adt-clients` — a
 * capability guard with nothing to compare the manifest against, because the
 * declared type *was* the implementation.
 *
 * The CRUD half is `IAdtCrud` with the transport's own config and state; the two
 * methods below are the transport's alone, and neither has an atom because
 * nothing else lists a collection this way.
 */
export interface IAdtRequest
  extends IAdtCrud<ITransportConfig, ITransportState> {
  /**
   * The saved-configuration search, as state.
   *
   * `configUri` is required by the layer beneath — see `IListTransportsParams`,
   * where the measurement is. This resolves it; that one does not.
   */
  list(options?: IListTransportsOptions): Promise<ITransportState>;

  /** The tree the server sends, parsed by this package. */
  listNodes(options?: IListTransportsOptions): Promise<ITransportTree>;

  /**
   * The tree, parsed by the consumer.
   *
   * An overload rather than a second name, because that is the shape the
   * implementation already ships and this contract describes what exists. A
   * system whose answer the default parser does not fit is the reason it is
   * here: the document is handed over untouched, and nothing in this package
   * forms a second opinion about it.
   */
  listNodes<T>(
    parse: (data: unknown) => T,
    options?: IListTransportsOptions,
  ): Promise<T>;
}
