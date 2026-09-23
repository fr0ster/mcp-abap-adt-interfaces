/**
 * @mcp-abap-adt/interfaces-adt
 *
 * ADT contracts: object operations, the ABAP connection, runtime analysis,
 * execution, feeds and service bindings.
 *
 * **Only ADT.** The test is who imports this package: `@mcp-abap-adt/adt-clients`
 * and whatever replaces its objects, and nobody else. Everything that failed
 * that test has left — headers and the HTTP frame to `interfaces-network`, Cloud
 * ALM to `interfaces-calm`, authentication, tokens and stores to
 * `interfaces-auth`, the SAP system configuration to `interfaces-auth-sap`,
 * `HttpError` to `-network` and `XmlNode` to `-utils`.
 */

export type {
  IAbapGitExternalRepoCredentials,
  IAbapGitLinkArgs,
  IAbapGitPullArgs,
  IAbapGitUnlinkArgs,
  IAdtAbapGitClient,
  IAdtAbapGitClientOptions,
} from './adt/IAdtAbapGit';
export type { IAccessControlConfig } from './adt/IAdtAccessControl';
export type { IAppendStructureConfig } from './adt/IAdtAppendStructure';
export type { IAuthorizationFieldConfig } from './adt/IAdtAuthorizationField';
export type {
  BehaviorDefinitionImplementationType,
  IBehaviorDefinitionConfig,
} from './adt/IAdtBehaviorDefinition';
export type { IBehaviorImplementationConfig } from './adt/IAdtBehaviorImplementation';
export type {
  IAdtActivatable,
  IAdtCheckable,
  IAdtCreatable,
  IAdtDeletable,
  IAdtLockable,
  IAdtMetadataReadable,
  IAdtMetadataUpdatable,
  IAdtReadable,
  IAdtTransportAware,
  IAdtUpdatable,
  IAdtValidatable,
  IAdtVersionable,
} from './adt/IAdtCapabilities';
export type {
  IClassConfig,
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
} from './adt/IAdtDataElement';
export type { IDdlConfig } from './adt/IAdtDdl';
export type {
  IDomainConfig,
  IFixedValue,
} from './adt/IAdtDomain';
export type {
  EnhancementType,
  IEnhancementConfig,
} from './adt/IAdtEnhancement';
export type {
  IFeatureToggleAttribute,
  IFeatureToggleConfig,
  IFeatureToggleHeader,
  IFeatureToggleObject,
  IFeatureTogglePlanning,
  IFeatureToggleReleasePlan,
  IFeatureToggleRollout,
  IFeatureToggleSource,
} from './adt/IAdtFeatureToggle';
export type { IFunctionGroupConfig } from './adt/IAdtFunctionGroup';
export type { IFunctionIncludeConfig } from './adt/IAdtFunctionInclude';
export type {
  ICreateFunctionModuleParams,
  IFunctionModuleConfig,
} from './adt/IAdtFunctionModule';
export type { IIncludeConfig } from './adt/IAdtInclude';
export type { IInterfaceConfig } from './adt/IAdtInterface';
export type {
  IMessageClassConfig,
  IMessageClassMessageConfig,
} from './adt/IAdtMessageClass';
export type { IMetadataExtensionConfig } from './adt/IAdtMetadataExtension';
export type {
  IAdtCreateOptions,
  IAdtOperationOptions,
  IAnalyse,
} from './adt/IAdtObject';
export { AdtObjectErrorCodes } from './adt/IAdtObject';
export type { IAdtObjectConfig } from './adt/IAdtObjectState';
export type { IPackageConfig } from './adt/IAdtPackage';
export type { IProgramConfig } from './adt/IAdtProgram';
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
export type { IScalarFunctionConfig } from './adt/IAdtScalarFunction';
export type {
  IScalarFunctionImplementationConfig,
  ScalarFunctionEngine,
} from './adt/IAdtScalarFunctionImplementation';
export type {
  DesiredPublicationState,
  GeneratedServiceType,
  ICreateServiceBindingParams,
  IServiceBindingConfig,
  ServiceBindingType,
  ServiceBindingVariant,
  ServiceBindingVersion,
} from './adt/IAdtServiceBinding';
export { SERVICE_BINDING_VARIANT_MAP } from './adt/IAdtServiceBinding';
export type { IServiceDefinitionConfig } from './adt/IAdtServiceDefinition';
export type {
  AdtObjectType,
  AdtObjectTypeLower,
  AdtSourceObjectType,
  AdtSourceObjectTypeLower,
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
} from './adt/IAdtStructure';
export type { ITableConfig } from './adt/IAdtTable';
export type {
  ITableTypeConfig,
  TableTypeAccessType,
  TableTypePrimaryKeyDefinition,
  TableTypePrimaryKeyKind,
  TableTypeRowKind,
} from './adt/IAdtTableType';
export type {
  ITransformationConfig,
  TransformationType,
} from './adt/IAdtTransformation';
export type {
  AdtTaskType,
  IAbapObjectEntry,
  IAdtRequest,
  IAdtTransportObjectActions,
  IListTransportsOptions,
  IListTransportsParams,
  ITransportConfig,
  ITransportSearchConfiguration,
} from './adt/IAdtTransport';
export {
  ADT_TASK_TYPE,
  TRANSPORT_SEARCH_CONFIGURATIONS_URL,
} from './adt/IAdtTransport';
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
  IAdtObjectSearch,
  IAdtRepositoryStructure,
  IAdtTypeCatalogue,
  IAdtVirtualFolders,
  IAdtWhereUsed,
  IGetNodeContentsOptions,
} from './adt/IAdtUtilities';
export type {
  IAbapConnection,
  IAdtWireResponse,
} from './connection/IAbapConnection';
export type { IAbapRequestOptions } from './connection/IAbapRequestOptions';
export type {
  AdtSessionErrorCode,
  ICriticalSection,
  IDeferredResponseConnection,
  IRequestProfiling,
  ISessionLifecycleAware,
} from './connection/IConnectionCapabilities';
export { ADT_SESSION_ERROR } from './connection/IConnectionCapabilities';
export type { ITimeoutConfig } from './connection/ITimeoutConfig';
export type {
  IClassExecuteWithProfilerOptions,
  IClassExecuteWithProfilingOptions,
  IClassExecuteWithProfilingResult,
  IClassExecutionTarget,
  IClassExecutor,
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
  IApplicationLog,
  IGetApplicationLogObjectOptions,
  IGetApplicationLogSourceOptions,
} from './runtime/IApplicationLog';
export type { IAtcLog, IGetCheckFailureLogsOptions } from './runtime/IAtcLog';
export type {
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
