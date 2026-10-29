// Compile-only. If this stops compiling, a member's `headers` no longer says
// what its request sets.
//
// Since 19.0.0 a member whose request sets both `Accept` and `Content-Type`
// takes them as the pair `options.headers: IAdtHeaders`, **required**, and
// sends exactly that pair. A member whose request sets only one of them, or
// neither, is as it was: no `headers` field. Which is which was read from
// `@mcp-abap-adt/adt-clients`, by the majority of a member's implementations
// where they disagree.
//
// For each contract below, every member answering a `Promise` is checked on
// **every** overload, in its last parameter (the options):
// - a member named in `Required`: the options are required, `headers` is
//   required, its type is exactly `IAdtHeaders` — identical and assignable both
//   ways, so `{ accept: string; contentType?: string }` or a `Partial` fails —
//   and the options carry no standalone `accept` or `contentType` beside it;
// - every other member takes no `headers`.
// `Parameters<>` reads only the last overload, so the overloads are read with a
// four-signature pattern, which yields the parameter lists of up to four
// overloads as a union (members here have at most two). A function member that
// answers no `Promise` sends no request and must be named in `Excluded`, and an
// excluded member must indeed answer none. The list of contracts is the one in
// errorStrategyOnEveryMember.ts: a new contract belongs in both, and the check
// is only as wide as the list.

import type { IAdtHeaders } from '../adt/IAdtContentTypes';
import type {
  IAbapDebugger,
  IAbapUnitRunner,
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
  IAdtObjectProperties,
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

/** Identical types, not merely mutually assignable. */
type Same<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? [A] extends [B]
      ? [B] extends [A]
        ? true
        : false
      : false
    : false;

/** The parameter lists of every overload (up to four), as a union. */
type OverloadParameters<F> = F extends {
  (...args: infer A1): unknown;
  (...args: infer A2): unknown;
  (...args: infer A3): unknown;
  (...args: infer A4): unknown;
}
  ? A1 | A2 | A3 | A4
  : never;

/** The options of one overload: its last parameter, optional or not. */
type OptionsOf<P> = P extends readonly unknown[]
  ? Required<P> extends [...unknown[], infer L]
    ? NonNullable<L>
    : never
  : never;

/** A member taking `headers` carries no standalone header field beside it. */
type HeaderFieldNames = 'accept' | 'contentType' | 'Accept' | 'Content-Type';
type NoStandaloneHeaderFields<O> = O extends unknown
  ? [Extract<keyof O, HeaderFieldNames>] extends [never]
    ? true
    : false
  : never;

/**
 * Required: the options parameter is not optional, and in each of its union
 * members `headers` is a required property whose type is exactly `IAdtHeaders`.
 */
type HeadersRequiredIn<O> = O extends unknown
  ? 'headers' extends keyof O
    ? Pick<O, 'headers'> extends Required<Pick<O, 'headers'>>
      ? Same<O['headers'], IAdtHeaders>
      : false
    : false
  : never;
type OverloadRequiresHeaders<P> = P extends readonly unknown[]
  ? P extends [...unknown[], infer L]
    ? undefined extends L
      ? false
      : [OptionsOf<P>] extends [never]
        ? false
        : false extends HeadersRequiredIn<OptionsOf<P>>
          ? false
          : false extends NoStandaloneHeaderFields<OptionsOf<P>>
            ? false
            : true
    : false
  : false;

/** No union member of the options has `headers`. */
type HeadersAbsentFrom<O> = O extends unknown
  ? 'headers' extends keyof O
    ? false
    : true
  : never;
type OverloadTakesNoHeaders<P> =
  false extends HeadersAbsentFrom<OptionsOf<P>> ? false : true;

type Rule = 'required' | 'none' | 'excluded';

/** `true` when every overload of the member keeps its rule. */
type MemberKeepsRule<F, R extends Rule> = F extends (
  ...args: never[]
) => unknown
  ? R extends 'excluded'
    ? F extends (...args: never[]) => Promise<unknown>
      ? false
      : true
    : F extends (...args: never[]) => Promise<unknown>
      ? R extends 'required'
        ? false extends OverloadRequiresHeaders<OverloadParameters<F>>
          ? false
          : true
        : false extends OverloadTakesNoHeaders<OverloadParameters<F>>
          ? false
          : true
      : false
  : true;

/**
 * `true` when every member of the contract keeps its rule: the members named
 * in `Req` require the pair, every other request-sending member takes none.
 */
type EveryMemberTakesHeaders<
  I,
  Excluded extends keyof I = never,
  Req extends keyof I = never,
> = false extends {
  [K in keyof I]-?: MemberKeepsRule<
    I[K],
    K extends Excluded ? 'excluded' : K extends Req ? 'required' : 'none'
  >;
}[keyof I]
  ? false
  : true;

export type _HeadersIAdtAbapGitClient = Assert<
  EveryMemberTakesHeaders<
    IAdtAbapGitClient<Probe, Probe, Probe, Probe>,
    never,
    'link' | 'pull' | 'checkExternalRepo'
  >
>;
export type _HeadersIAdtIncludeEnhancementHost = Assert<
  EveryMemberTakesHeaders<IAdtIncludeEnhancementHost<Probe, Probe, Probe>>
>;
export type _HeadersIAdtEnhancementHost = Assert<
  EveryMemberTakesHeaders<IAdtEnhancementHost<Probe, Probe, Probe>>
>;
export type _HeadersIAdtCreatable = Assert<
  EveryMemberTakesHeaders<IAdtCreatable<Probe, Probe>, never, 'create'>
>;
export type _HeadersIAdtReadable = Assert<
  EveryMemberTakesHeaders<IAdtReadable<Probe, Probe>>
>;
export type _HeadersIAdtMetadataReadable = Assert<
  EveryMemberTakesHeaders<IAdtMetadataReadable<Probe, Probe>>
>;
export type _HeadersIAdtUpdatable = Assert<
  EveryMemberTakesHeaders<IAdtUpdatable<Probe, Probe>, never, 'update'>
>;
export type _HeadersIAdtMetadataUpdatable = Assert<
  EveryMemberTakesHeaders<
    IAdtMetadataUpdatable<Probe, Probe>,
    never,
    'updateMetadata'
  >
>;
export type _HeadersIAdtDeletable = Assert<
  EveryMemberTakesHeaders<
    IAdtDeletable<Probe, Probe, Probe>,
    never,
    'delete' | 'checkDeletion'
  >
>;
export type _HeadersIAdtValidatable = Assert<
  EveryMemberTakesHeaders<IAdtValidatable<Probe, Probe>>
>;
export type _HeadersIAdtCheckable = Assert<
  EveryMemberTakesHeaders<IAdtCheckable<Probe, Probe>, never, 'check'>
>;
export type _HeadersIAdtActivatable = Assert<
  EveryMemberTakesHeaders<IAdtActivatable<Probe, Probe>, never, 'activate'>
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
  EveryMemberTakesHeaders<
    IFeatureToggleObject<IFeatureToggleObjectResults>,
    never,
    'checkState'
  >
>;
export type _HeadersIAdtRequest = Assert<
  EveryMemberTakesHeaders<IAdtRequest<Probe>>
>;
export type _HeadersIAdtTransportObjectActions = Assert<
  EveryMemberTakesHeaders<
    IAdtTransportObjectActions<Probe, Probe, Probe, Probe, Probe, Probe>,
    never,
    'removeObject' | 'addObject' | 'createTask' | 'changeTaskType'
  >
>;
export type _HeadersIAbapUnitRunner = Assert<
  EveryMemberTakesHeaders<
    IAbapUnitRunner<Probe, Probe, Probe>,
    never,
    'runSync'
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
  EveryMemberTakesHeaders<
    IAdtWhereUsed<Probe, Probe>,
    'modifyWhereUsedScope',
    'getWhereUsed' | 'getWhereUsedScope'
  >
>;
export type _HeadersIAdtVirtualFolders = Assert<
  EveryMemberTakesHeaders<
    IAdtVirtualFolders<Probe>,
    never,
    'getVirtualFoldersContents'
  >
>;
export type _HeadersIAdtTypeCatalogue = Assert<
  EveryMemberTakesHeaders<IAdtTypeCatalogue<Probe>>
>;
export type _HeadersIAdtObjectProperties = Assert<
  EveryMemberTakesHeaders<IAdtObjectProperties<Probe>>
>;
export type _HeadersIAdtRepositoryStructure = Assert<
  EveryMemberTakesHeaders<
    IAdtRepositoryStructure<Probe, Probe>,
    never,
    'fetchNodeStructure'
  >
>;
export type _HeadersIAdtGroupLifecycle = Assert<
  EveryMemberTakesHeaders<
    IAdtGroupLifecycle<Probe, Probe, Probe, Probe, Probe, Probe>,
    never,
    'activateObjectsGroup' | 'checkDeletionGroup' | 'deleteObjectsGroup'
  >
>;
export type _HeadersIAdtDataPreview = Assert<
  EveryMemberTakesHeaders<
    IAdtDataPreview<Probe, Probe, Probe>,
    never,
    'getSqlQuery' | 'getTableContents'
  >
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
  EveryMemberTakesHeaders<
    ITraceScheduling<Probe, Probe, Probe>,
    never,
    'scheduleTrace'
  >
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
  EveryMemberTakesHeaders<IAdtTransportMoveObjects<Probe>, never, 'moveObjects'>
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
    >,
    never,
    | 'setBreakpoints'
    | 'getChildVariables'
    | 'getVariables'
    | 'syncBreakpoints'
    | 'setDebuggerSettings'
  >
>;
export type _HeadersIAmdpDebugger = Assert<
  EveryMemberTakesHeaders<
    IAmdpDebugger<Probe, Probe, Probe, Probe>,
    never,
    'getDataPreview'
  >
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
