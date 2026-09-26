/**
 * Transport ADT operation parameter interfaces (snake_case, low-level)
 */

import type {
  IAdtAnalyseOptions,
  IAdtOperationOptions,
  IAnalyse,
} from './IAdtObject';
import type { IAdtError, IAdtResponse } from './IAdtResponse';

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
 * The task types CTS accepts, keyed by what each one means.
 *
 * **The vocabulary is the server's**, measured against BTP ABAP on
 * 2026-09-23 by sending each value to `changetasktype` and reading the task
 * back. It is a constant here rather than a literal at each call site because
 * SAP chose the letters; a consumer writing `'S'` is repeating a measurement
 * they did not make.
 *
 * The three below are the ones that work. Two more were tried and refused,
 * and the refusals are worth keeping: `'Q'` is a customizing type — *"You can
 * only change the type of tasks in workbench requests"* — and `'K'`/`'W'` are
 * REQUEST types, answered as unknown. The message names the value when one
 * arrives (`… type K is unknown`), which is how a wrong value was told apart
 * from an empty one.
 */
export const ADT_TASK_TYPE = {
  /** `S` — the type a task needs before an object can be put in it by hand. */
  developmentCorrection: 'S',
  /** `R` — a repair of an object this system does not own. */
  repair: 'R',
  /** `X` — back to the state every task is created in. */
  unclassified: 'X',
} as const;

/** One of {@link ADT_TASK_TYPE}'s values. */
export type AdtTaskType = (typeof ADT_TASK_TYPE)[keyof typeof ADT_TASK_TYPE];

// Transport request configuration (camelCase)
export interface ITransportConfig {
  /**
   * **No `source` here, and that is the point.** This type's write takes its
   * body from `IAdtOperationOptions.source`, which is where the capability
   * atoms say a write's body goes. It used to be declared on this config as
   * well, with a comment telling the caller to pass the document "here" — two
   * channels, two sentences, and an implementation forced to guess. Nothing on
   * this type read it but the write: it has no `check` and no `validate` that
   * compiles a source the server does not hold yet, which is the one job a
   * `source` on a config still has.
   */

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
  list<E extends IAdtError>(
    options: IListTransportsOptions &
      IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TList, E>>;
  list(
    options?: IListTransportsOptions & IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TList>>;
}

/**
 * One entry in a transport request's object list, as the CTS object directory
 * holds it.
 *
 * **Not {@link IObjectReference}, though they look alike.** That one is ADT's
 * vocabulary — its `type` is an ADT object type code such as `CLAS/OC`, and it
 * carries a `uri` and a `parentName`. The object directory speaks a different
 * one: a program id, a two-to-four letter type and a name, `R3TR FUGR
 * ZMCP_BLD_FGR_H1`. Merging them would produce a type where half the fields
 * are always wrong and `type` means one thing or another depending on which
 * member was called.
 *
 * **A request parameter, which is why it belongs here** — the same reason
 * `IObjectReference` survived 31.0.0 while the result shapes left: a consumer
 * cannot call a member that takes one without being able to name the type.
 */
export interface IAbapObjectEntry {
  /** `tm:name` — the object's name, e.g. `ZCL_MY_CLASS`. */
  name: string;
  /** `tm:type` — the object-directory type, e.g. `CLAS`, `FUGR`, `TABL`. */
  type: string;
  /**
   * `tm:pgmid` — the program id, `R3TR` for a workbench object.
   *
   * Optional because an implementation may default it, not because the wire
   * omits it.
   */
  pgmid?: string;
  /** `tm:obj_desc` — the description ADT shows beside the entry. */
  description?: string;
  /**
   * `tm:position` — the entry's position in the task, e.g. `000025`.
   *
   * Optional here because an entry being described is not always an entry
   * being addressed: {@link IAdtTransportObjectActions.addObject} has no
   * position to give, since the entry does not exist yet.
   * {@link IAdtTransportObjectActions.removeObject} requires one, and says in
   * its own words what happens without it.
   */
  position?: string;
}

/**
 * What can be done to a request's object list, and to its tasks.
 *
 * **Why these are contracts at all.** A transport listing already answers
 * every `atom:link` a request and its tasks carry — `release`, `addobject`,
 * `changeowner`, `newtask` — so that a caller follows an href rather than
 * assembling a URL. Handing over the addresses of operations while declaring
 * nothing that performs one leaves the caller building `tm:root` documents by
 * hand, which is the layering this package exists to prevent.
 *
 * **What it costs to lack them.** Deleting an ABAP object does not free its
 * name: the object-directory entry stays on the request that carried it, and
 * until it is detached a create of the same name is refused with
 * `CTS_WBO_API 019` — even passing that same request as `corrNr`. Without
 * `removeObject` the ways out are releasing the whole request, shipping
 * everything else in it, or SE09.
 *
 * Six members and no composite: the order a caller uses them in, and what
 * they do when `addObject` is refused, is theirs. One of them,
 * {@link IAdtTransportObjectActions.readObjects}, is there because
 * {@link IAdtTransportObjectActions.removeObject} needs a value nothing else
 * here answers — which is a dependency between readings, not a composite.
 */
export interface IAdtTransportObjectActions<
  TRemoved,
  TAdded,
  TTask,
  TActionLog,
  TObjects,
  TTaskType,
> {
  /**
   * Detach one object from a request or task.
   *
   * Addressed at the **task** that holds the object: a request's objects live
   * on its tasks.
   *
   * **`position` is what identifies the entry, and the call does nothing
   * without it.** This took `IAbapObjectEntry` whole when it shipped, which
   * made the field optional. Measured against an on-premise system,
   * 2026-09-21: 22 objects asked for by `pgmid`/`type`/`name` alone each
   * answered `200` with the usual echo document, and a re-read of the task
   * found all 22 still on it. The same documents carrying `tm:position` — and
   * nothing else added — removed every one, 22 down to 0, each confirmed by a
   * re-read.
   *
   * The number comes from
   * {@link IAdtTransportObjectActions.readObjects}, which is the reading that
   * carries it.
   *
   * The answer echoes the object it was asked about and says nothing else, so
   * a `200` here is not evidence:
   * {@link IAdtTransportObjectActions.readActionLog}, or a re-read of the
   * object list, is what confirms the removal happened.
   */
  removeObject<E extends IAdtError = IAdtError>(
    transportNumber: string,
    object: IAbapObjectEntry & { position: string },
    options?: IAdtOperationOptions<E>,
  ): Promise<IAdtResponse<TRemoved, E>>;
  /**
   * Attach one object to a request or task.
   *
   * Refused when the object is already held by an unrelated task — a third
   * lock flavour, distinct from the enqueue lock and from the
   * request-versus-task one. That refusal is the server's verdict to read,
   * not a state an implementation checks for first.
   */
  addObject<E extends IAdtError = IAdtError>(
    transportNumber: string,
    object: IAbapObjectEntry,
    options?: IAdtOperationOptions<E>,
  ): Promise<IAdtResponse<TAdded, E>>;
  /**
   * Create a task under a request.
   *
   * The new task is itself a request resource: it reads, writes and releases
   * like one, and {@link IAdtTransportObjectActions.removeObject} addresses it
   * directly.
   *
   * **`targetUser` is required, and that is measured.** This shipped saying
   * the server would decide whose task it is when the attribute was absent.
   * It does not: sent without `tm:targetuser` against an on-premise system,
   * 2026-09-21, the owner resolved to an empty name and the call was refused
   * with `400 SCTS_ADT_MSG 009`, *"User  does not exist in the system (or
   * locked)"* — two spaces, because the name was empty. The same call carrying
   * the attribute answered 200 and a task number.
   *
   * No implementation can fill it in either. `IAbapConnection` does not say
   * who is authenticated, and finding out costs a second request — which is
   * what a member of this size does not do. So it is the caller's to name.
   */
  createTask<E extends IAdtError = IAdtError>(
    transportNumber: string,
    options: { targetUser: string } & IAdtOperationOptions<E>,
  ): Promise<IAdtResponse<TTask, E>>;
  /**
   * What has happened to this request: created, object added, object deleted,
   * owner changed — one entry per event.
   */
  readActionLog<E extends IAdtError = IAdtError>(
    transportNumber: string,
    options?: IAdtOperationOptions<E>,
  ): Promise<IAdtResponse<TActionLog, E>>;
  /**
   * The objects a request or task holds, each with the `tm:position` that
   * {@link IAdtTransportObjectActions.removeObject} needs.
   *
   * **A separate reading, not a separate request.** This member exists
   * because `removeObject` requires a position and nothing else here hands
   * one back: without it a caller has to parse a transport document
   * themselves to find a `tm:position`, which is the layering this package
   * exists to prevent. What it promises is therefore about the answer —
   * entries, each with its position as a value — and not about how an
   * implementation obtains them.
   *
   * **A claim that was here is retracted.** 2.0.0 said a metadata read gets a
   * representation carrying no `tm:abap_object`, because the request names no
   * `Accept`, and that positions therefore could not be read from it however
   * it was parsed. Measured against an on-premise system, 2026-09-22 — the
   * same URL with `application/vnd.sap.adt.transportorganizer.v1+xml` and
   * without it — the two answers are byte for byte identical: 95411 bytes and
   * 166 `tm:abap_object` for a request, 55549 and 88 for a task. The header
   * settles nothing, and a contract is no place to assert something about a
   * wire that was not measured.
   *
   * What an implementation sends is its own business either way. This says
   * what must come back.
   */
  readObjects<E extends IAdtError = IAdtError>(
    transportNumber: string,
    options?: IAdtOperationOptions<E>,
  ): Promise<IAdtResponse<TObjects, E>>;
  /**
   * Give a task its type.
   *
   * **A task is created without one**, and the call that creates it cannot
   * supply one: measured against BTP ABAP on 2026-09-23, `tm:type` on a
   * `newtask` is accepted and ignored, and every task on that system —
   * including ones created long before this contract existed — reads back as
   * `Unclassified`. CTS assigns the type when the first object lands; a
   * caller who wants it sooner asks for it here.
   *
   * The vocabulary is the server's and it is small — {@link ADT_TASK_TYPE}
   * carries it, along with the values that were refused and what they said.
   * The parameter is that union rather than `string` so a value SAP does not
   * accept does not compile.
   *
   * Addressed at the **task**, like `removeObject`: that is where the
   * listing offers the action. And like every action here, the answer says
   * the document was understood — a read is what shows the type.
   */
  changeTaskType<E extends IAdtError = IAdtError>(
    taskNumber: string,
    type: AdtTaskType,
    options?: IAdtOperationOptions<E>,
  ): Promise<IAdtResponse<TTaskType, E>>;
}
