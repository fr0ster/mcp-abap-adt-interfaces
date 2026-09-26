// Compile-only. If this stops compiling, a member stopped taking the error
// strategy with the call.
//
// Decision 36: the result strategy is given when an implementation is
// constructed, the error strategy with every call — **every** member that
// answers an \`IAdtResponse\`, not the eleven that took it until 10.0.0. A
// lock, a version listing, a dump, a trace and a group deletion each met a
// refusal SAP wrote inside a 200 with no way for the caller to read it.
//
// The list below is every contract with such a member. A new contract with one
// belongs in it; the check is only as wide as the list.

import type {
  IAdtAbapGitClient,
  IAdtActivatable,
  IAdtCheckable,
  IAdtCreatable,
  IAdtDataPreview,
  IAdtDeletable,
  IAdtDiscovery,
  IAdtError,
  IAdtGroupLifecycle,
  IAdtLockable,
  IAdtMetadataReadable,
  IAdtMetadataUpdatable,
  IAdtObjectAccess,
  IAdtObjectSearch,
  IAdtReadable,
  IAdtRepositoryStructure,
  IAdtRequest,
  IAdtResponse,
  IAdtRunnable,
  IAdtTransportAware,
  IAdtTransportObjectActions,
  IAdtTypeCatalogue,
  IAdtUpdatable,
  IAdtValidatable,
  IAdtVersionable,
  IAdtVirtualFolders,
  IAdtWhereUsed,
  IApplicationLog,
  IAtcFindings,
  IAtcLog,
  IAtcRunStatusReadable,
  ICdsTestDoubleCheckable,
  ICrossTrace,
  ICrossTraceResults,
  IDdicActivation,
  IFeatureToggleObject,
  IFeedRepository,
  IGatewayErrorLog,
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
} from '../index';

type Assert<T extends true> = T;

/**
 * What each contract is instantiated with. Not `any`: `keyof any` holds every
 * key, so `Partial<any>` would "take" `analyse` and a member that lost its
 * options would pass — which is exactly what the first version of this file
 * did, caught by removing `lock`'s options and watching it stay green.
 */
interface Probe {
  readonly probe: true;
}

/** A trace view map with one view that takes options, and one that does not. */
interface ProbeViews {
  withOptions: ITraceView<Probe, Probe>;
  withoutOptions: ITraceView<Probe>;
}

/**
 * The last parameter of the overload a caller without a strategy uses.
 * `Required` first: an optional last element is invisible to `[...X, infer L]`.
 */
type LastParameter<F> = F extends (...args: infer P) => unknown
  ? Required<P> extends [...unknown[], infer L]
    ? L
    : never
  : never;

/** A member answering an `IAdtResponse` takes `analyse`; anything else is not asked. */
type TakesAnalyse<F> = F extends (
  ...args: any[]
) => Promise<IAdtResponse<any, IAdtError>>
  ? 'analyse' extends keyof NonNullable<LastParameter<F>>
    ? true
    : false
  : true;

/** `true` when every member of the contract does. */
type EveryMemberTakesAnalyse<I> = false extends {
  [K in keyof I]-?: TakesAnalyse<I[K]>;
}[keyof I]
  ? false
  : true;

export type _IAdtAbapGitClient = Assert<
  EveryMemberTakesAnalyse<IAdtAbapGitClient<Probe, Probe, Probe, Probe, Probe>>
>;
export type _IAdtCreatable = Assert<
  EveryMemberTakesAnalyse<IAdtCreatable<Probe, Probe>>
>;
export type _IAdtReadable = Assert<
  EveryMemberTakesAnalyse<IAdtReadable<Probe, Probe>>
>;
export type _IAdtMetadataReadable = Assert<
  EveryMemberTakesAnalyse<IAdtMetadataReadable<Probe, Probe>>
>;
export type _IAdtUpdatable = Assert<
  EveryMemberTakesAnalyse<IAdtUpdatable<Probe, Probe>>
>;
export type _IAdtMetadataUpdatable = Assert<
  EveryMemberTakesAnalyse<IAdtMetadataUpdatable<Probe, Probe>>
>;
export type _IAdtDeletable = Assert<
  EveryMemberTakesAnalyse<IAdtDeletable<Probe, Probe, Probe>>
>;
export type _IAdtValidatable = Assert<
  EveryMemberTakesAnalyse<IAdtValidatable<Probe, Probe>>
>;
export type _IAdtCheckable = Assert<
  EveryMemberTakesAnalyse<IAdtCheckable<Probe, Probe>>
>;
export type _IAdtActivatable = Assert<
  EveryMemberTakesAnalyse<IAdtActivatable<Probe, Probe>>
>;
export type _IAdtLockable = Assert<
  EveryMemberTakesAnalyse<IAdtLockable<Probe>>
>;
export type _IAdtVersionable = Assert<
  EveryMemberTakesAnalyse<IAdtVersionable<Probe, Probe, Probe>>
>;
export type _IAdtTransportAware = Assert<
  EveryMemberTakesAnalyse<IAdtTransportAware<Probe, Probe>>
>;
export type _IFeatureToggleObject = Assert<
  EveryMemberTakesAnalyse<IFeatureToggleObject<Probe>>
>;
export type _IAdtRequest = Assert<EveryMemberTakesAnalyse<IAdtRequest<Probe>>>;
export type _IAdtTransportObjectActions = Assert<
  EveryMemberTakesAnalyse<
    IAdtTransportObjectActions<Probe, Probe, Probe, Probe, Probe, Probe>
  >
>;
export type _ITestRunInformation = Assert<
  EveryMemberTakesAnalyse<ITestRunInformation<Probe, Probe>>
>;
export type _ICdsTestDoubleCheckable = Assert<
  EveryMemberTakesAnalyse<ICdsTestDoubleCheckable<Probe>>
>;
export type _IAdtObjectSearch = Assert<
  EveryMemberTakesAnalyse<IAdtObjectSearch<Probe>>
>;
export type _IAdtWhereUsed = Assert<
  EveryMemberTakesAnalyse<IAdtWhereUsed<Probe, Probe>>
>;
export type _IAdtVirtualFolders = Assert<
  EveryMemberTakesAnalyse<IAdtVirtualFolders<Probe>>
>;
export type _IAdtTypeCatalogue = Assert<
  EveryMemberTakesAnalyse<IAdtTypeCatalogue<Probe>>
>;
export type _IAdtRepositoryStructure = Assert<
  EveryMemberTakesAnalyse<IAdtRepositoryStructure<Probe, Probe>>
>;
export type _IAdtGroupLifecycle = Assert<
  EveryMemberTakesAnalyse<
    IAdtGroupLifecycle<Probe, Probe, Probe, Probe, Probe, Probe>
  >
>;
export type _IAdtDataPreview = Assert<
  EveryMemberTakesAnalyse<IAdtDataPreview<Probe, Probe, Probe>>
>;
export type _IAdtDiscovery = Assert<
  EveryMemberTakesAnalyse<IAdtDiscovery<Probe>>
>;
export type _IAdtObjectAccess = Assert<
  EveryMemberTakesAnalyse<IAdtObjectAccess<Probe, Probe, Probe>>
>;
export type _IAdtRunnable = Assert<
  EveryMemberTakesAnalyse<IAdtRunnable<Probe, Probe, Probe>>
>;
export type _IRunnableWithProfiler = Assert<
  EveryMemberTakesAnalyse<IRunnableWithProfiler<Probe, Probe, Probe>>
>;
export type _IRunnableWithProfiling = Assert<
  EveryMemberTakesAnalyse<IRunnableWithProfiling<Probe, Probe, Probe>>
>;
export type _ITraceScheduling = Assert<
  EveryMemberTakesAnalyse<ITraceScheduling<Probe, Probe, Probe>>
>;
export type _IFeedRepository = Assert<
  EveryMemberTakesAnalyse<
    IFeedRepository<Probe, Probe, Probe, Probe, Probe, Probe>
  >
>;
export type _IApplicationLog = Assert<
  EveryMemberTakesAnalyse<IApplicationLog<Probe, Probe, Probe>>
>;
export type _IAtcLog = Assert<EveryMemberTakesAnalyse<IAtcLog<Probe, Probe>>>;
export type _IAtcRunStatusReadable = Assert<
  EveryMemberTakesAnalyse<IAtcRunStatusReadable<Probe>>
>;
export type _IAtcFindings = Assert<
  EveryMemberTakesAnalyse<IAtcFindings<Probe>>
>;
export type _ICrossTrace = Assert<
  EveryMemberTakesAnalyse<ICrossTrace<ICrossTraceResults>>
>;
export type _IDdicActivation = Assert<
  EveryMemberTakesAnalyse<IDdicActivation<Probe>>
>;
export type _IGatewayErrorLog = Assert<
  EveryMemberTakesAnalyse<IGatewayErrorLog<Probe, Probe>>
>;
export type _IRuntimeDumps = Assert<
  EveryMemberTakesAnalyse<IRuntimeDumps<Probe, Probe>>
>;
export type _ISt05Trace = Assert<
  EveryMemberTakesAnalyse<ISt05Trace<Probe, Probe>>
>;
export type _ISystemMessages = Assert<
  EveryMemberTakesAnalyse<ISystemMessages<Probe, Probe>>
>;
export type _ITraceListing = Assert<
  EveryMemberTakesAnalyse<ITraceListing<ITraceEntry, Probe, Probe>>
>;
export type _ITraceReading = Assert<
  EveryMemberTakesAnalyse<ITraceReading<ProbeViews>>
>;
export type _ITraceDeletion = Assert<EveryMemberTakesAnalyse<ITraceDeletion>>;
