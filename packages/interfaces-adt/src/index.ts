/**
 * @mcp-abap-adt/interfaces-adt
 *
 * ADT contracts: object operations, runtime analysis, execution, feeds and
 * service bindings. The ABAP connection they are sent through is
 * `@mcp-abap-adt/interfaces-adt-connection` since 11.0.0, and is not re-exported
 * here (decision 34).
 *
 * **Only ADT.** The test is who imports this package: `@mcp-abap-adt/adt-clients`
 * and whatever replaces its objects, and nobody else. Everything that failed
 * that test has left — headers and the HTTP frame to `interfaces-network`, Cloud
 * ALM to `interfaces-calm`, authentication, tokens and stores to
 * `interfaces-auth`, the SAP system configuration to `interfaces-auth-sap`,
 * `HttpError` to `-network` and `XmlNode` to `-utils`.
 */

export type {
  AdtApi,
  AdtApiWith,
  AdtObjectKind,
  AdtParentedTypeCode,
  AdtSourceTypeCode,
  AdtTypeCode,
  AdtTypeCodeOf,
  AdtTypeCodeWith,
  AdtVariant,
  IAdtTypeTables,
} from './adt/AdtTypeTables';
export {
  ADT_TYPES_BASIS_740,
  ADT_TYPES_CLOUD,
  ADT_TYPES_ONPREM,
} from './adt/AdtTypeTables';
export type {
  IAbapGitExternalRepoCredentials,
  IAbapGitLinkArgs,
  IAbapGitPullArgs,
  IAbapGitUnlinkArgs,
  IAdtAbapGitClient,
  IAdtAbapGitClientOptions,
} from './adt/IAdtAbapGit';
export type {
  IAccessControlConfig,
  IAccessControlResults,
} from './adt/IAdtAccessControl';
export type {
  IAppendStructureConfig,
  IAppendStructureResults,
} from './adt/IAdtAppendStructure';
export type {
  IAuthorizationFieldConfig,
  IAuthorizationFieldResults,
} from './adt/IAdtAuthorizationField';
export type {
  BehaviorDefinitionImplementationType,
  IBehaviorDefinitionConfig,
  IBehaviorDefinitionResults,
} from './adt/IAdtBehaviorDefinition';
export type { IBehaviorImplementationConfig } from './adt/IAdtBehaviorImplementation';
export type {
  AdtIdentity,
  IAdtActivatable,
  IAdtCheckable,
  IAdtCreatable,
  IAdtDeletable,
  IAdtEnhancementHost,
  IAdtIncludeEnhancementHost,
  IAdtLockable,
  IAdtMetadataReadable,
  IAdtMetadataUpdatable,
  IAdtParentNamed,
  IAdtReadable,
  IAdtTransportAware,
  IAdtUpdatable,
  IAdtValidatable,
  IAdtVersionable,
} from './adt/IAdtCapabilities';
export type {
  IClassConfig,
  IClassResults,
  ILocalDefinitionsConfig,
  ILocalMacrosConfig,
  ILocalTestClassConfig,
  ILocalTypesConfig,
} from './adt/IAdtClass';
export type {
  IAdtClientOptions,
  IAdtSystemContext,
} from './adt/IAdtClientOptions';
export type { IAdtContentTypes, IAdtHeaders } from './adt/IAdtContentTypes';
export type {
  DataElementTypeKind,
  ICreateDataElementParams,
  IDataElementConfig,
  IDataElementResults,
} from './adt/IAdtDataElement';
export type { IDdlConfig, IDdlResults } from './adt/IAdtDdl';
export type {
  IDomainConfig,
  IDomainResults,
  IFixedValue,
} from './adt/IAdtDomain';
export type {
  EnhancementType,
  IEnhancementConfig,
  IEnhancementResults,
} from './adt/IAdtEnhancement';
export type {
  IFeatureToggleAttribute,
  IFeatureToggleConfig,
  IFeatureToggleHeader,
  IFeatureToggleObject,
  IFeatureToggleObjectResults,
  IFeatureTogglePlanning,
  IFeatureToggleReleasePlan,
  IFeatureToggleResults,
  IFeatureToggleRollout,
  IFeatureToggleSource,
} from './adt/IAdtFeatureToggle';
export type {
  IFunctionGroupConfig,
  IFunctionGroupResults,
} from './adt/IAdtFunctionGroup';
export type {
  IFunctionIncludeConfig,
  IFunctionIncludeResults,
} from './adt/IAdtFunctionInclude';
export type {
  ICreateFunctionModuleParams,
  IFunctionModuleConfig,
  IFunctionModuleResults,
} from './adt/IAdtFunctionModule';
export type { IIncludeConfig, IIncludeResults } from './adt/IAdtInclude';
export type { IInterfaceConfig, IInterfaceResults } from './adt/IAdtInterface';
export type {
  IMessageClassConfig,
  IMessageClassMessageConfig,
  IMessageClassMessageResults,
  IMessageClassResults,
} from './adt/IAdtMessageClass';
export type {
  IMetadataExtensionConfig,
  IMetadataExtensionResults,
} from './adt/IAdtMetadataExtension';
export type {
  IAdtAnalyseOptions,
  IAdtCreateOptions,
  IAdtOperationOptions,
  IAnalyse,
} from './adt/IAdtObject';
export { AdtObjectErrorCodes } from './adt/IAdtObject';
export type { IAdtObjectConfig } from './adt/IAdtObjectState';
export type { IPackageConfig, IPackageResults } from './adt/IAdtPackage';
export type { IProgramConfig, IProgramResults } from './adt/IAdtProgram';
export type {
  AdtFailureOrigin,
  AdtNoFailure,
  IAdtError,
  IAdtFailure,
  IAdtResponse,
  IAdtResult,
  IAdtSuccess,
  IResultStrategy,
} from './adt/IAdtResponse';
export { ADT_NO_FAILURE } from './adt/IAdtResponse';
export type {
  IScalarFunctionConfig,
  IScalarFunctionResults,
} from './adt/IAdtScalarFunction';
export type {
  IScalarFunctionImplementationConfig,
  IScalarFunctionImplementationResults,
  ScalarFunctionEngine,
} from './adt/IAdtScalarFunctionImplementation';
export type {
  DesiredPublicationState,
  GeneratedServiceType,
  IAdtServiceBindingTypes,
  IAdtServiceGroupReadable,
  ICreateServiceBindingParams,
  IServiceBindingConfig,
  IServiceBindingPublicationConfig,
  IServiceGroupParams,
  IServiceResults,
  ServiceBindingType,
  ServiceBindingVariant,
  ServiceBindingVersion,
} from './adt/IAdtServiceBinding';
export { SERVICE_BINDING_VARIANT_MAP } from './adt/IAdtServiceBinding';
export type {
  IServiceDefinitionConfig,
  IServiceDefinitionResults,
} from './adt/IAdtServiceDefinition';
export type {
  IAdtAnsweredObject,
  IGetDiscoveryParams,
  IGetSqlQueryParams,
  IGetTableContentsParams,
  IGetVirtualFoldersContentsParams,
  IGetWhereUsedParams,
  IGetWhereUsedScopeParams,
  IObjectReference,
  ISearchObjectsParams,
  IVirtualFoldersPreselection,
} from './adt/IAdtShared';
export type {
  IStructureConfig,
  IStructureField,
  IStructureInclude,
  IStructureResults,
} from './adt/IAdtStructure';
export type { ITableConfig, ITableResults } from './adt/IAdtTable';
export type {
  ITableTypeConfig,
  ITableTypeResults,
  TableTypeAccessType,
  TableTypePrimaryKeyDefinition,
  TableTypePrimaryKeyKind,
  TableTypeRowKind,
} from './adt/IAdtTableType';
export type {
  ITransformationConfig,
  ITransformationResults,
  TransformationType,
} from './adt/IAdtTransformation';
export type {
  AdtTaskType,
  IAbapObjectEntry,
  IAdtRequest,
  IAdtTransportMoveObjects,
  IAdtTransportObjectActions,
  IAdtTransportSearchConfigurations,
  IAdtTransportSortAndCompress,
  IListTransportsOptions,
  IListTransportsParams,
  ITransportConfig,
  ITransportResults,
  ITransportSearchConfiguration,
} from './adt/IAdtTransport';
export {
  ADT_TASK_TYPE,
  TRANSPORT_SEARCH_CONFIGURATIONS_URL,
} from './adt/IAdtTransport';
export type {
  AdtApiEntry,
  AdtApiName,
  AdtApiTable,
  AdtCollection,
  AdtOperation,
  AdtOperations,
  AdtTypeEvidence,
  IAdtCodedApiEntry,
  IAdtCodeFacts,
  IAdtCodelessApiEntry,
} from './adt/IAdtTypeTable';
export type {
  ICdsTestDoubleCheckable,
  ICdsUnitTestConfig,
  IClassUnitTestDefinition,
  IClassUnitTestRunOptions,
  ITestRunInformation,
  IUnitTestConfig,
  IUnitTestDuration,
  IUnitTestResultOptions,
  IUnitTestRiskLevel,
  IUnitTestScope,
} from './adt/IAdtUnitTest';
export type {
  IAdtDataPreview,
  IAdtDiscovery,
  IAdtGroupLifecycle,
  IAdtInformationSystem,
  IAdtObjectAccess,
  IAdtObjectProperties,
  IAdtObjectSearch,
  IAdtRepositoryStructure,
  IAdtTypeCatalogue,
  IAdtVirtualFolders,
  IAdtWhereUsed,
  IGetNodeContentsOptions,
  IUtilResults,
} from './adt/IAdtUtilities';
export type {
  IClassExecuteOptions,
  IClassExecuteWithProfilerOptions,
  IClassExecuteWithProfilingOptions,
  IClassExecuteWithProfilingResult,
  IClassExecutionTarget,
  IClassExecutor,
  IProgramExecuteOptions,
  IProgramExecuteWithProfilerOptions,
  IProgramExecuteWithProfilingOptions,
  IProgramExecuteWithProfilingResult,
  IProgramExecutionTarget,
  IProgramExecutor,
} from './execution/IAdtExecutors';
export type {
  IAdtRunnable,
  IRunnableWithProfiler,
  IRunnableWithProfiling,
} from './execution/IAdtRunnable';
export type { ITraceScheduling } from './execution/ITraceScheduling';
export type { IFeedRepository } from './feeds/IFeedRepository';
export type { IAbapTimestamp, IFeedQueryOptions } from './feeds/types';
export type {
  IAbapDebugger,
  IAttachOptions,
  IDebuggeeIds,
  IDebuggerBreakpoint,
  IDebuggerBreakpointSync,
  IDebuggerIdentity,
  IDebuggerLineBreakpoint,
  IDebuggerSettings,
  IDebuggerStepMethod,
  IDebuggerStepToLineMethod,
} from './runtime/IAbapDebugger';
export type {
  IAmdpBreakpoint,
  IAmdpDebugger,
  IAmdpStepMethod,
  IGetAmdpDataPreviewOptions,
  IStartAmdpDebuggerOptions,
} from './runtime/IAmdpDebugger';
export type {
  IApplicationLog,
  IGetApplicationLogObjectOptions,
  IGetApplicationLogSourceOptions,
} from './runtime/IApplicationLog';
export type { IAtcLog, IGetCheckFailureLogsOptions } from './runtime/IAtcLog';
export type {
  AtcClassIncludeKind,
  AtcNamedObjectType,
  AtcObjectType,
  IAtcFindings,
  IAtcObjectRef,
  IAtcRunOptions,
  IAtcRunStatusReadable,
  IAtcRunTarget,
} from './runtime/IAtcRun';
export type {
  ICrossTrace,
  ICrossTraceResults,
  IListCrossTracesOptions,
} from './runtime/ICrossTrace';
export type {
  IDdicActivation,
  IGetActivationGraphOptions,
} from './runtime/IDdicActivation';
export type { IGatewayErrorLog } from './runtime/IGatewayErrorLog';
export type {
  IMemorySnapshots,
  IMemorySnapshotsListOptions,
  ISnapshotChildrenOptions,
  ISnapshotRankingListOptions,
  ISnapshotReferencesOptions,
} from './runtime/IMemorySnapshots';
export type {
  IProfiler,
  IProfilerListOptions,
  IProfilerTraceDbAccessesOptions,
  IProfilerTraceHitListOptions,
  IProfilerTraceParameters,
  IProfilerTraceStatementsOptions,
} from './runtime/IProfiler';
export type {
  IRuntimeDumpReadOptions,
  IRuntimeDumpReadView,
  IRuntimeDumps,
  IRuntimeDumpsListOptions,
} from './runtime/IRuntimeDumps';
export type { ISt05Trace } from './runtime/ISt05Trace';
export type { ISystemMessages } from './runtime/ISystemMessages';
export type {
  ITraceDeletion,
  ITraceEntry,
  ITraceFamily,
  ITraceListing,
  ITraceReading,
  ITraceState,
  ITraceView,
  ViewArgs,
  ViewOptions,
  ViewResult,
} from './runtime/ITrace';
export type {
  ICreateAndGenerateServiceBindingParams,
  ICreateAndGenerateServiceBindingParamsLegacy,
} from './service/IAdtService';
export type { IReadOptions } from './shared/IReadOptions';
