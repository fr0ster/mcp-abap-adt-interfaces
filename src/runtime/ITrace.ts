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

/** Options are required when the view says so, and absent when it says `void`. */
export type ViewArgs<TViews, K extends keyof TViews> =
  ViewOptions<TViews, K> extends void
    ? [options?: undefined]
    : undefined extends ViewOptions<TViews, K>
      ? [options?: ViewOptions<TViews, K>]
      : [options: ViewOptions<TViews, K>];

/** What traces exist. */
export interface ITraceListing<
  TEntry extends ITraceEntry = ITraceEntry,
  TOptions = void,
> {
  list(options?: TOptions): Promise<TEntry[]>;
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
  read<K extends keyof TViews>(
    traceId: string,
    view: K,
    ...args: ViewArgs<TViews, K>
  ): Promise<ViewResult<TViews, K>>;
}

/**
 * Reading a trace with a parser the caller supplies.
 *
 * A separate atom, not a member of {@link ITraceReading}, because it is a
 * separate capability: a family may offer the plain read and not this one, and
 * a type that lists what IS supported says the rest by omission. Composed in
 * where it is true — which is also the only honest way to say it, since an
 * optional method would mean "perhaps".
 *
 * **What it is for.** A library that speaks ADT should not also be the place
 * where somebody else's XML gets filtered and reshaped. {@link ITraceReading.read}
 * stays deliberately plain: it maps the document onto the view's type and does
 * nothing more. A consumer that needs it read differently — or that runs against
 * a system answering in a shape the default does not fit — passes its own reader
 * **and keeps a type**. Telling it to fall back on the raw response would be
 * telling it to go untyped.
 *
 * Searching and filtering are not what this is for. Those belong to the server,
 * which has endpoints for them.
 *
 * **Why a method and not an overload on `read`.** The transport tree's
 * `listNodes()` uses an overload, but that sits on a concrete class nobody else
 * implements. This is implemented by consumers — the whole point of this
 * package — and an overloaded method cannot be satisfied by an object literal,
 * which the `__typechecks__` file proved the moment it was tried.
 */
export interface ITraceReadingWithParser<
  TViews extends { [K in keyof TViews]: ITraceView<unknown, unknown> },
> {
  /**
   * @param parse receives the response body exactly as it arrived, unopened
   */
  readWith<K extends keyof TViews, T>(
    parse: (data: unknown) => T,
    traceId: string,
    view: K,
    ...args: ViewArgs<TViews, K>
  ): Promise<T>;
}

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
 * `void`, not a response: a caller has nothing to read from a deletion, and
 * handing back a raw body is the thing this family stopped doing in 23.0.0.
 *
 * **What deleting an id that is not there does has NOT been measured.** Only the
 * `200` above was: one existing trace, once. An earlier draft said a trace that
 * is gone and one that never was leave the caller in the same place, and a
 * caller writing cleanup would have relied on that.
 *
 * Note what the HTTP definition does and does not give here. `DELETE` is
 * idempotent (RFC 9110 §9.2.2), but that is a statement about the **effect on
 * the server** — the resource ends up absent either way. It promises nothing
 * about the **status returned**, and the status is what decides whether this
 * promise resolves or rejects. So idempotence is true and useless to a caller.
 *
 * What a caller needs to know is unmeasured: whether a second delete answers
 * `200` or `404`. `void` describes the resolved value and says nothing about
 * failure — a `404`, or any transport error, **rejects**. Until somebody
 * measures a repeat, code that must tolerate a missing id has to catch.
 */
export interface ITraceDeletion {
  delete(traceId: string): Promise<void>;
}

/**
 * A trace family: what it is called, and what it lists.
 *
 * Reading is deliberately NOT extended in here — see {@link ITraceReading}.
 * This is also NOT the name a consumer imports: `IProfiler` and `ICrossTrace`
 * keep their names and are compositions of this with reading.
 */
export interface ITraceFamily<
  TKind extends string,
  TEntry extends ITraceEntry = ITraceEntry,
  TOptions = void,
> extends ITraceListing<TEntry, TOptions> {
  /** Literal, so it still discriminates when several families share a shape. */
  readonly kind: TKind;
}
