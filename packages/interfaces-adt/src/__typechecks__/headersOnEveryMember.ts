// Compile-only. If this stops compiling, a member that sends a request stopped
// taking `headers?: IAdtHeaders`, or took it partial.
//
// requestHeaders.ts shows the shape on a few members; this holds it for all of
// them. For each contract below, every member answering a `Promise` must
// take `headers` in its last parameter on **every** overload — the full pair
// accepted, a partial pair refused. `Parameters<>` reads only the last overload,
// so the overloads are read with a four-signature pattern, which yields the
// parameter lists of up to four overloads as a union (members here have at most
// two). A function member that answers no `Promise` sends no request and must
// be named as an exclusion, so a new member cannot slip past as one. The list
// of contracts is the one in errorStrategyOnEveryMember.ts: a new contract with
// such a member belongs in both, and the check is only as wide as the list.

import type { IAdtHeaders } from '../adt/IAdtContentTypes';
import type {
  IAbapDebugger,
  IAdtAbapGitClient,
  IAdtActivatable,
  IAdtCheckable,
  IAdtCreatable,
  IAdtDataPreview,
  IAdtDeletable,
  IAdtDiscovery,
  IAdtEnhancementHost,
  IAdtGroupLifecycle,
  IAdtIncludeEnhancementHost,
  IAdtLockable,
  IAdtMetadataReadable,
  IAdtMetadataUpdatable,
  IAdtObjectAccess,
  IAdtObjectSearch,
  IAdtReadable,
  IAdtRepositoryStructure,
  IAdtRequest,
  IAdtRunnable,
  IAdtServiceBindingTypes,
  IAdtServiceGroupReadable,
  IAdtTransportAware,
  IAdtTransportMoveObjects,
  IAdtTransportObjectActions,
  IAdtTransportSearchConfigurations,
  IAdtTransportSortAndCompress,
  IAdtTypeCatalogue,
  IAdtUpdatable,
  IAdtValidatable,
  IAdtVersionable,
  IAdtVirtualFolders,
  IAdtWhereUsed,
  IAmdpDebugger,
  IApplicationLog,
  IAtcFindings,
  IAtcLog,
  IAtcRunStatusReadable,
  ICdsTestDoubleCheckable,
  ICrossTrace,
  ICrossTraceResults,
  IDdicActivation,
  IFeatureToggleObject,
  IFeatureToggleObjectResults,
  IFeedRepository,
  IGatewayErrorLog,
  IMemorySnapshots,
  IRunnableWithProfiler,
  IRunnableWithProfiling,
  IRuntimeDumps,
  ISt05Trace,
  ISystemMessages,
  ITestRunInformation,
  ITraceDeletion,
  ITraceEntry,
  ITraceListing,
  ITraceReading,
  ITraceScheduling,
  ITraceView,
  ViewArgs,
} from '../index';

type Assert<T extends true> = T;

/** Not `any`: `keyof any` holds every key, so a missing field would pass. */
interface Probe {
  readonly probe: true;
}

/** A trace view map with one view that takes options, and one that does not. */
interface ProbeViews {
  withOptions: ITraceView<Probe, Probe>;
  withoutOptions: ITraceView<Probe>;
}

/** The parameter lists of every overload (up to four), as a union. */
type OverloadParameters<F> = F extends {
  (...args: infer A1): unknown;
  (...args: infer A2): unknown;
  (...args: infer A3): unknown;
  (...args: infer A4): unknown;
}
  ? A1 | A2 | A3 | A4
  : never;

/**
 * Whether one overload's last parameter takes the pair whole and refuses a
 * partial one. `Required` first: an optional last element is invisible to
 * `[...X, infer L]`.
 */
type OverloadTakesHeaders<P> = P extends readonly unknown[]
  ? Required<P> extends [...unknown[], infer L]
    ? [NonNullable<L>] extends [never]
      ? false
      : 'headers' extends keyof NonNullable<L>
        ? [IAdtHeaders] extends [NonNullable<L>['headers']]
          ? [Partial<IAdtHeaders>] extends [NonNullable<L>['headers']]
            ? false
            : true
          : false
        : false
    : false
  : false;

/** `true` when every overload of a request-sending member takes the pair. */
type MemberTakesHeaders<F, Excluded extends boolean> = F extends (
  ...args: never[]
) => unknown
  ? Excluded extends true
    ? F extends (...args: never[]) => Promise<unknown>
      ? false
      : true
    : F extends (...args: never[]) => Promise<unknown>
      ? false extends OverloadTakesHeaders<OverloadParameters<F>>
        ? false
        : true
      : false
  : true;

/**
 * `true` when every member of the contract does. `Excluded` names the members
 * that send no request; each must indeed answer no `Promise`.
 */
type EveryMemberTakesHeaders<
  I,
  Excluded extends keyof I = never,
> = false extends {
  [K in keyof I]-?: MemberTakesHeaders<I[K], K extends Excluded ? true : false>;
}[keyof I]
  ? false
  : true;

export type _HeadersIAdtAbapGitClient = Assert<
  EveryMemberTakesHeaders<IAdtAbapGitClient<Probe, Probe, Probe, Probe>>
>;
export type _HeadersIAdtIncludeEnhancementHost = Assert<
  EveryMemberTakesHeaders<IAdtIncludeEnhancementHost<Probe, Probe, Probe>>
>;
export type _HeadersIAdtEnhancementHost = Assert<
  EveryMemberTakesHeaders<IAdtEnhancementHost<Probe, Probe, Probe>>
>;
export type _HeadersIAdtCreatable = Assert<
  EveryMemberTakesHeaders<IAdtCreatable<Probe, Probe>>
>;
export type _HeadersIAdtReadable = Assert<
  EveryMemberTakesHeaders<IAdtReadable<Probe, Probe>>
>;
export type _HeadersIAdtMetadataReadable = Assert<
  EveryMemberTakesHeaders<IAdtMetadataReadable<Probe, Probe>>
>;
export type _HeadersIAdtUpdatable = Assert<
  EveryMemberTakesHeaders<IAdtUpdatable<Probe, Probe>>
>;
export type _HeadersIAdtMetadataUpdatable = Assert<
  EveryMemberTakesHeaders<IAdtMetadataUpdatable<Probe, Probe>>
>;
export type _HeadersIAdtDeletable = Assert<
  EveryMemberTakesHeaders<IAdtDeletable<Probe, Probe, Probe>>
>;
export type _HeadersIAdtValidatable = Assert<
  EveryMemberTakesHeaders<IAdtValidatable<Probe, Probe>>
>;
export type _HeadersIAdtCheckable = Assert<
  EveryMemberTakesHeaders<IAdtCheckable<Probe, Probe>>
>;
export type _HeadersIAdtActivatable = Assert<
  EveryMemberTakesHeaders<IAdtActivatable<Probe, Probe>>
>;
export type _HeadersIAdtLockable = Assert<
  EveryMemberTakesHeaders<IAdtLockable<Probe>>
>;
export type _HeadersIAdtVersionable = Assert<
  EveryMemberTakesHeaders<IAdtVersionable<Probe, Probe, Probe>>
>;
export type _HeadersIAdtTransportAware = Assert<
  EveryMemberTakesHeaders<IAdtTransportAware<Probe, Probe>>
>;
export type _HeadersIFeatureToggleObject = Assert<
  EveryMemberTakesHeaders<IFeatureToggleObject<IFeatureToggleObjectResults>>
>;
export type _HeadersIAdtRequest = Assert<
  EveryMemberTakesHeaders<IAdtRequest<Probe>>
>;
export type _HeadersIAdtTransportObjectActions = Assert<
  EveryMemberTakesHeaders<
    IAdtTransportObjectActions<Probe, Probe, Probe, Probe, Probe, Probe>
  >
>;
export type _HeadersITestRunInformation = Assert<
  EveryMemberTakesHeaders<ITestRunInformation<Probe, Probe>>
>;
export type _HeadersICdsTestDoubleCheckable = Assert<
  EveryMemberTakesHeaders<ICdsTestDoubleCheckable<Probe>>
>;
export type _HeadersIAdtObjectSearch = Assert<
  EveryMemberTakesHeaders<IAdtObjectSearch<Probe>>
>;
export type _HeadersIAdtWhereUsed = Assert<
  EveryMemberTakesHeaders<IAdtWhereUsed<Probe, Probe>, 'modifyWhereUsedScope'>
>;
export type _HeadersIAdtVirtualFolders = Assert<
  EveryMemberTakesHeaders<IAdtVirtualFolders<Probe>>
>;
export type _HeadersIAdtTypeCatalogue = Assert<
  EveryMemberTakesHeaders<IAdtTypeCatalogue<Probe>>
>;
export type _HeadersIAdtRepositoryStructure = Assert<
  EveryMemberTakesHeaders<IAdtRepositoryStructure<Probe, Probe>>
>;
export type _HeadersIAdtGroupLifecycle = Assert<
  EveryMemberTakesHeaders<
    IAdtGroupLifecycle<Probe, Probe, Probe, Probe, Probe, Probe>
  >
>;
export type _HeadersIAdtDataPreview = Assert<
  EveryMemberTakesHeaders<IAdtDataPreview<Probe, Probe, Probe>>
>;
export type _HeadersIAdtDiscovery = Assert<
  EveryMemberTakesHeaders<IAdtDiscovery<Probe>>
>;
export type _HeadersIAdtObjectAccess = Assert<
  EveryMemberTakesHeaders<
    IAdtObjectAccess<Probe, Probe, Probe>,
    'supportsSourceCode' | 'getObjectSourceUri'
  >
>;
export type _HeadersIAdtRunnable = Assert<
  EveryMemberTakesHeaders<IAdtRunnable<Probe, Probe, Probe>>
>;
export type _HeadersIRunnableWithProfiler = Assert<
  EveryMemberTakesHeaders<IRunnableWithProfiler<Probe, Probe, Probe>>
>;
export type _HeadersIRunnableWithProfiling = Assert<
  EveryMemberTakesHeaders<IRunnableWithProfiling<Probe, Probe, Probe>>
>;
export type _HeadersITraceScheduling = Assert<
  EveryMemberTakesHeaders<ITraceScheduling<Probe, Probe, Probe>>
>;
export type _HeadersIFeedRepository = Assert<
  EveryMemberTakesHeaders<
    IFeedRepository<Probe, Probe, Probe, Probe, Probe, Probe>
  >
>;
export type _HeadersIApplicationLog = Assert<
  EveryMemberTakesHeaders<IApplicationLog<Probe, Probe, Probe>>
>;
export type _HeadersIAtcLog = Assert<
  EveryMemberTakesHeaders<IAtcLog<Probe, Probe>>
>;
export type _HeadersIAtcRunStatusReadable = Assert<
  EveryMemberTakesHeaders<IAtcRunStatusReadable<Probe>>
>;
export type _HeadersIAtcFindings = Assert<
  EveryMemberTakesHeaders<IAtcFindings<Probe>>
>;
export type _HeadersICrossTrace = Assert<
  EveryMemberTakesHeaders<ICrossTrace<ICrossTraceResults>>
>;
export type _HeadersIDdicActivation = Assert<
  EveryMemberTakesHeaders<IDdicActivation<Probe>>
>;
export type _HeadersIGatewayErrorLog = Assert<
  EveryMemberTakesHeaders<IGatewayErrorLog<Probe, Probe>>
>;
export type _HeadersIRuntimeDumps = Assert<
  EveryMemberTakesHeaders<IRuntimeDumps<Probe, Probe>>
>;
export type _HeadersISt05Trace = Assert<
  EveryMemberTakesHeaders<ISt05Trace<Probe, Probe>>
>;
export type _HeadersISystemMessages = Assert<
  EveryMemberTakesHeaders<ISystemMessages<Probe, Probe>>
>;
export type _HeadersITraceListing = Assert<
  EveryMemberTakesHeaders<ITraceListing<ITraceEntry, Probe, Probe>>
>;
export type _HeadersITraceReading = Assert<
  EveryMemberTakesHeaders<ITraceReading<ProbeViews>>
>;
export type _HeadersITraceDeletion = Assert<
  EveryMemberTakesHeaders<ITraceDeletion>
>;
export type _HeadersIAdtTransportSearchConfigurations = Assert<
  EveryMemberTakesHeaders<IAdtTransportSearchConfigurations<Probe>>
>;
export type _HeadersIAdtTransportSortAndCompress = Assert<
  EveryMemberTakesHeaders<IAdtTransportSortAndCompress<Probe>>
>;
export type _HeadersIAdtTransportMoveObjects = Assert<
  EveryMemberTakesHeaders<IAdtTransportMoveObjects<Probe>>
>;
export type _HeadersIAbapDebugger = Assert<
  EveryMemberTakesHeaders<
    IAbapDebugger<
      Probe,
      Probe,
      Probe,
      Probe,
      Probe,
      Probe,
      Probe,
      Probe,
      Probe,
      Probe
    >
  >
>;
export type _HeadersIAmdpDebugger = Assert<
  EveryMemberTakesHeaders<IAmdpDebugger<Probe, Probe, Probe, Probe>>
>;
export type _HeadersIMemorySnapshots = Assert<
  EveryMemberTakesHeaders<
    IMemorySnapshots<Probe, Probe, Probe, Probe, Probe, Probe>
  >
>;
export type _HeadersIAdtServiceBindingTypes = Assert<
  EveryMemberTakesHeaders<IAdtServiceBindingTypes<Probe>>
>;
export type _HeadersIAdtServiceGroupReadable = Assert<
  EveryMemberTakesHeaders<IAdtServiceGroupReadable<Probe>>
>;

/**
 * `ITraceReading.read`'s second overload takes its options through `ViewArgs`,
 * whose three branches the member check above sees only as one: a view with no
 * options, with optional options, and with required options. Each is held here.
 */
interface ProbeViewBranches {
  none: ITraceView<Probe>;
  optional: ITraceView<Probe, Probe | undefined>;
  required: ITraceView<Probe, Probe>;
}
export type _HeadersViewArgsNone = Assert<
  OverloadTakesHeaders<ViewArgs<ProbeViewBranches, 'none'>>
>;
export type _HeadersViewArgsOptional = Assert<
  OverloadTakesHeaders<ViewArgs<ProbeViewBranches, 'optional'>>
>;
export type _HeadersViewArgsRequired = Assert<
  OverloadTakesHeaders<ViewArgs<ProbeViewBranches, 'required'>>
>;
