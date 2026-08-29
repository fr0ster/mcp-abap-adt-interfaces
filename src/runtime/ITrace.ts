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
  state?: { value: string; text: string };
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

  /**
   * The same read, parsed by the caller.
   *
   * A library that speaks ADT should not also be the place where somebody
   * else's XML gets filtered and reshaped. The default {@link read} is
   * deliberately plain: it maps the document onto the view's type and does
   * nothing else. A consumer that needs the document read differently — or that
   * runs against a system answering in a shape the default does not fit —
   * passes its own reader **and keeps a type**. Telling it to fall back on the
   * raw response would be telling it to go untyped.
   *
   * Searching and filtering are not what this is for either. Those belong to
   * the server, which has endpoints for them.
   *
   * **Why a second method rather than an overload on `read`.** The transport
   * tree's `listNodes()` uses an overload, but that lives on a concrete class
   * that nobody else implements. This interface is implemented by consumers —
   * that is the whole point of this package — and an overloaded method cannot
   * be satisfied by an object literal, which the `__typechecks__` file proved
   * the moment it was tried. A contract that is awkward to implement is a
   * contract that gets worked around.
   *
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
