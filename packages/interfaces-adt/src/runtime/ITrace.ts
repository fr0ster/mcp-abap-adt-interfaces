/**
 * Reading what a run left behind.
 *
 * Two atoms — a listing and a read — composed per trace family. A family that
 * has views composes {@link ITraceReading} in; a family that has none says
 * nothing about reading, which is the only truthful way for a type to say it.
 *
 * The shapes here are transcribed from measurements, not designed. `ITraceEntry`
 * is what an `abaptraces` feed entry carries — measured on a cloud tenant and on
 * an on-prem system, every field present in every entry of both. The systems,
 * releases and raw bodies are in the design spec and its evidence files.
 */

import type { IAdtAnalyseOptions, IAnalyse } from '../adt/IAdtObject';
import type { IAdtError, IAdtResponse } from '../adt/IAdtResponse';

/**
 * A trace's lifecycle state.
 *
 * A named type rather than an inline `{ value; text }`, because a consumer that
 * implements the contract has to *return* this, and an anonymous shape leaves it
 * re-declaring the same two fields in its own code — which is the duplication
 * this package exists to remove. Naming it costs one export.
 */
export interface ITraceState {
  /** `trc:state/@value` — `R` on every entry read. */
  value: string;
  /** `trc:state/@text` — `Finished` for `R`. */
  text: string;
}

/**
 * One trace, as every family can describe it.
 *
 * The optional members are optional because a family other than `abaptraces`
 * may not have them — not because that one sometimes omits them.
 */
export interface ITraceEntry {
  /** `atom:id` — a URI, not an opaque token. */
  id: string;
  /**
   * `atom:published`.
   *
   * Position in a feed is NOT age: measured, a feed's first entries were minutes
   * old while its last were eight days older, so anything picking "the first id
   * in the document" gets a trace chosen at random.
   */
  recordedAt: string;
  /** `trc:user`, which equals `atom:author/atom:name`. */
  user?: string;
  /** `trc:objectName` — the generated form, e.g. `ZCL_SOMETHING=========CP`. */
  objectName?: string;
  uri?: string;
  /**
   * `trc:state` — `R`/Finished on every entry seen.
   *
   * A trace has a lifecycle, so "it exists" and "it is readable" are not the
   * same claim.
   */
  state?: ITraceState;
  /**
   * `trc:expiration`. The system deletes traces — about four weeks out on both
   * systems measured, though that is a system setting and not a contract.
   * Reading one a week later is fine; a year later is not, and this says when.
   */
  expiresAt?: string;
}

/**
 * What a view yields, and what it must be given.
 *
 * A pair from the start: a map of result types alone has nowhere to keep
 * options, and nothing about a result implies them — cross-trace's
 * `recordContent` needs a record number that no result type mentions.
 */
export interface ITraceView<TResult, TOptions = void> {
  result: TResult;
  options: TOptions;
}

export type ViewResult<TViews, K extends keyof TViews> =
  TViews[K] extends ITraceView<infer TResult, infer _TOptions>
    ? TResult
    : never;

export type ViewOptions<TViews, K extends keyof TViews> =
  TViews[K] extends ITraceView<infer _TResult, infer TOptions>
    ? TOptions
    : never;

/**
 * Options are required when the view says so, and carry only `analyse` when it
 * says `void`.
 *
 * Until 10.0.0 a `void` view took no options at all. Every member takes the
 * error strategy with the call now (decision 36), so the parameter is always
 * there; what the view decides is whether it holds anything else, and whether
 * it may be left out.
 */
export type ViewArgs<
  TViews,
  K extends keyof TViews,
  E extends IAdtError = IAdtError,
> =
  ViewOptions<TViews, K> extends void
    ? [options?: IAdtAnalyseOptions<E>]
    : undefined extends ViewOptions<TViews, K>
      ? [options?: ViewOptions<TViews, K> & IAdtAnalyseOptions<E>]
      : [options: ViewOptions<TViews, K> & IAdtAnalyseOptions<E>];

/** A view's own options, or nothing to add when it has none. */
type ViewOwnOptions<TViews, K extends keyof TViews> =
  ViewOptions<TViews, K> extends void ? unknown : ViewOptions<TViews, K>;

/**
 * What traces exist.
 *
 * `TList` is the listing's own result, defaulting to the entries. Until 10.0.0
 * the member answered `TEntry[]` outright, so a result strategy could change
 * what an entry is but not that the answer is an array of them — a consumer who
 * wanted the feed whole had no type to put it in (decision 22).
 */
export interface ITraceListing<
  TEntry extends ITraceEntry = ITraceEntry,
  TOptions = void,
  TList = TEntry[],
> {
  list<E extends IAdtError>(
    options: ([TOptions] extends [void] ? unknown : TOptions) &
      IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TList, E>>;
  list(
    options?: ([TOptions] extends [void] ? unknown : TOptions) &
      IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TList>>;
}

/**
 * What is inside one trace.
 *
 * The constraint is self-mapped — every property of the map must BE a view.
 * `Record<string, unknown>` cannot be used, because an `interface` has no
 * implicit index signature and would be rejected; a bare `object` would accept
 * anything, so a map with a non-view member would compile and fail later,
 * silently, with a result of `never` at the call site. This form needs no index
 * signature and refuses the bad map where it is written.
 */
export interface ITraceReading<
  TViews extends { [K in keyof TViews]: ITraceView<unknown, unknown> },
> {
  read<K extends keyof TViews, E extends IAdtError>(
    traceId: string,
    view: K,
    options: ViewOwnOptions<TViews, K> &
      IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<ViewResult<TViews, K>, E>>;
  read<K extends keyof TViews>(
    traceId: string,
    view: K,
    ...args: ViewArgs<TViews, K>
  ): Promise<IAdtResponse<ViewResult<TViews, K>>>;
}

/**
 * Reading a trace differently is a strategy, not a member.
 *
 * `ITraceReadingWithParser` stood here until 30.0.0, taking
 * `parse: (data: unknown) => T` at the call. It is gone for the reason decision
 * 22 gives: a reading is chosen once, when the implementation is constructed,
 * and the member's result type follows it. A consumer that needs a trace read
 * differently — or that runs against a system answering in a shape the default
 * does not fit — supplies an `IResultStrategy` and keeps a type, exactly as
 * before, without every implementer owing a second signature.
 *
 * What has not changed is what this is *not* for. Searching and filtering
 * belong to the server, which has endpoints for them.
 */

/**
 * Removing a trace.
 *
 * Its own atom, beside {@link ITraceListing} and {@link ITraceReading}, because
 * not every family need offer it and a composition should say which does.
 *
 * ADT advertises this itself: every entry in the ABAP trace feed carries
 * `<atom:link rel="http://www.sap.com/adt/relations/delete">` next to the links
 * for its three views, and the `DELETE` it points at answers `200` — measured
 * on an on-prem system, 2026-08-30, on a trace produced by a profiled run.
 *
 * The value is `void`: a caller has nothing to read from a deletion. The
 * *answer* is not — it is {@link IAdtResponse} like everything else, so whether
 * the deletion happened is asked of `ok`, not caught. Until 30.0.0 this member
 * resolved with nothing and rejected on failure, and a consumer migrating from
 * that contract replaces the `catch` with the check.
 *
 * **What deleting an id that is not there does has NOT been measured.** Only the
 * `200` above was: one existing trace, once. An earlier draft said a trace that
 * is gone and one that never was leave the caller in the same place, and a
 * caller writing cleanup would have relied on that.
 *
 * Note what the HTTP definition does and does not give here. `DELETE` is
 * idempotent (RFC 9110 §9.2.2), but that is a statement about the **effect on
 * the server** — the resource ends up absent either way. It promises nothing
 * about the **status returned**, and the status is what a strategy reads to
 * decide whether this is a failure. So idempotence is true and useless to a
 * caller.
 *
 * What a caller needs to know is still unmeasured: whether a second delete
 * answers `200` or `404`. What has changed is what to do about it — code that
 * must tolerate a missing id reads `ok` and decides, instead of catching.
 *
 * **The verdict is the caller's, given with the call.** A consumer who wants a
 * repeat delete counted as success passes an `analyse` that says so. Until
 * 10.0.0 this member took no options and this note sent that consumer to the
 * error strategy an implementation is constructed with; decision 36 settled the
 * other way — the result strategy is given at construction, the error strategy
 * with every call — and this member takes it like every other.
 */
export interface ITraceDeletion {
  delete<E extends IAdtError>(
    traceId: string,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<void, E>>;
  delete(
    traceId: string,
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<void>>;
}

/**
 * What a trace family is called.
 *
 * Nothing is extended in here. Until 30.0.0 this carried `ITraceListing` along
 * with the name, so a family that only lists and one that also reads could not
 * be told apart by their types — inheritance decides for the composer what
 * belongs together. `IProfiler` and `ICrossTrace` are published compositions of
 * this with listing, reading and deletion — the composition is a contract, and
 * the readings it is instantiated with are the implementation's.
 */
export interface ITraceFamily<TKind extends string> {
  /** Literal, so it still discriminates when several families share a shape. */
  readonly kind: TKind;
}
