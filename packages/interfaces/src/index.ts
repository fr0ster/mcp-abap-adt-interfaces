/**
 * @mcp-abap-adt/interfaces
 *
 * Shared interfaces for MCP ABAP ADT packages
 * All interfaces follow the convention of starting with 'I' prefix
 */

export type {
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  AdtFailureOrigin,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  AdtNoFailure,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  AdtObjectType,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  AdtObjectTypeLower,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  AdtSessionErrorCode,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  AdtSourceObjectType,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  AdtSourceObjectTypeLower,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  AtcObjectType,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  AuthorizationOutcome,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  AuthorizationRequest,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  AuthType,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  AuthTypeEnum,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  BehaviorDefinitionImplementationType,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  CallbackServerFactory,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  CalmService,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  DataElementTypeKind,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  DesiredPublicationState,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  EnhancementType,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  GeneratedServiceType,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  HttpError,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAbapConnection,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAbapGitExternalRepoCredentials,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAbapGitLinkArgs,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAbapGitPullArgs,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAbapGitUnlinkArgs,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAbapObjectEntry,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAbapRequestOptions,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAbapTimestamp,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAccessControlConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IActivateServiceBindingParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAdtAbapGitClient,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAdtAbapGitClientOptions,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAdtActivatable,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAdtCheckable,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAdtClientOptions,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAdtContentTypes,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAdtCreatable,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAdtCreateOptions,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAdtDataPreview,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAdtDeletable,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAdtDiscovery,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAdtError,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAdtFailure,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAdtGroupLifecycle,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAdtHeaders,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAdtInformationSystem,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAdtLockable,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAdtMetadataReadable,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAdtMetadataUpdatable,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAdtObjectAccess,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAdtObjectConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAdtObjectSearch,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAdtOperationOptions,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAdtReadable,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAdtRepositoryStructure,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAdtRequest,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAdtResponse,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAdtResult,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAdtRunnable,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAdtSuccess,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAdtSystemContext,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAdtTransportAware,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAdtTransportObjectActions,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAdtTypeCatalogue,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAdtUpdatable,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAdtValidatable,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAdtVersionable,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAdtVirtualFolders,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAdtWhereUsed,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAdtWireResponse,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAnalyse,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAppendStructureConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IApplicationLog,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAtcFindings,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAtcLog,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAtcObjectRef,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAtcRunOptions,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAtcRunStatusReadable,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAtcRunTarget,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAuthorizationConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAuthorizationFieldConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IAuthorizationStrategy,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IBehaviorDefinitionConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IBehaviorDefinitionCreateParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IBehaviorDefinitionValidationParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IBehaviorImplementationConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ICallbackServerHandle,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ICallbackServerOptions,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ICalmConnection,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ICalmRequestOptions,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ICalmResponse,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ICdsTestDoubleCheckable,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ICdsUnitTestConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ICertificateMaterialLoader,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ICheckEnhancementParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ICheckServiceBindingParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IClassConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IClassExecuteWithProfilerOptions,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IClassExecuteWithProfilingOptions,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IClassExecuteWithProfilingResult,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IClassExecutionTarget,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IClassExecutor,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IClassifyServiceBindingParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IClassUnitTestDefinition,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IClassUnitTestRunOptions,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IConnectionConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ICreateAccessControlParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ICreateAndGenerateServiceBindingParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ICreateAndGenerateServiceBindingParamsLegacy,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ICreateAppendStructureParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ICreateAuthorizationFieldParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ICreateBehaviorImplementationParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ICreateClassParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ICreateDataElementParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ICreateDdlParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ICreateDomainParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ICreateEnhancementParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ICreateFeatureToggleParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ICreateFunctionGroupParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ICreateFunctionIncludeParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ICreateFunctionModuleParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ICreateIncludeParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ICreateInterfaceParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ICreateMessageClassParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ICreatePackageParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ICreateProgramParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ICreateScalarFunctionImplementationParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ICreateScalarFunctionParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ICreateServiceBindingParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ICreateServiceDefinitionParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ICreateStructureParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ICreateTableParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ICreateTableTypeParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ICreateTransformationParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ICreateTransportParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ICriticalSection,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ICrossTrace,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ICrossTraceResults,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IDataElementConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IDdicActivation,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IDdlConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IDeferredResponseConnection,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IDeleteAccessControlParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IDeleteAppendStructureParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IDeleteClassParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IDeleteDataElementParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IDeleteDdlParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IDeleteDomainParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IDeleteEnhancementParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IDeleteFeatureToggleParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IDeleteFunctionGroupParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IDeleteFunctionModuleParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IDeleteIncludeParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IDeleteInterfaceParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IDeletePackageParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IDeleteProgramParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IDeleteScalarFunctionImplementationParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IDeleteScalarFunctionParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IDeleteServiceBindingParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IDeleteServiceDefinitionParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IDeleteStructureParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IDeleteTableParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IDeleteTableTypeParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IDeleteTransformationParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IDomainConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IEnhancementConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IFeatureToggleAttribute,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IFeatureToggleConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IFeatureToggleHeader,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IFeatureToggleObject,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IFeatureTogglePlanning,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IFeatureToggleReleasePlan,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IFeatureToggleRollout,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IFeatureToggleSource,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IFeedQueryOptions,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IFeedRepository,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IFixedValue,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IFunctionGroupConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IFunctionIncludeConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IFunctionModuleConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IGatewayErrorLog,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IGenerateServiceBindingParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IGetActivationGraphOptions,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IGetApplicationLogObjectOptions,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IGetApplicationLogSourceOptions,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IGetCheckFailureLogsOptions,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IGetDiscoveryParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IGetNodeContentsOptions,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IGetServiceBindingODataParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IGetSqlQueryParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IGetTableContentsParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IGetVirtualFoldersContentsParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IGetWhereUsedParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IGetWhereUsedScopeParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IHeaderValidationResult,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IIncludeConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IInterfaceConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IListCrossTracesOptions,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IListTransportsOptions,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IListTransportsParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ILocalDefinitionsConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ILocalMacrosConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ILocalTestClassConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ILocalTypesConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IMessageClassConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IMessageClassMessageConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IMetadataExtensionConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IMetadataExtensionCreateParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IMetadataExtensionValidationParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IObjectReference,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IPackageConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IProfiler,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IProfilerListOptions,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IProfilerTraceDbAccessesOptions,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IProfilerTraceHitListOptions,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IProfilerTraceParameters,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IProfilerTraceStatementsOptions,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IProgramConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IProgramExecuteWithProfilerOptions,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IProgramExecuteWithProfilingOptions,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IProgramExecuteWithProfilingResult,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IProgramExecutionTarget,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IProgramExecutor,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IPublishODataV2Params,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IReadOptions,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IReadServiceBindingParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IRequestProfiling,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IResultStrategy,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IRunnableWithProfiler,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IRunnableWithProfiling,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IRuntimeDumpReadOptions,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IRuntimeDumpReadView,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IRuntimeDumps,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IRuntimeDumpsListOptions,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ISapConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IScalarFunctionConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IScalarFunctionImplementationConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ISearchObjectsParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IServiceBindingConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IServiceDefinitionConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IServiceKeyStore,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ISessionLifecycleAware,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ISessionStore,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ISt05Trace,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IStructureConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IStructureField,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IStructureInclude,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ISystemMessages,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ITableConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ITableTypeConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ITestRunInformation,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IToggleFeatureToggleParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ITokenProvider,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ITokenProviderOptions,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ITokenRefresher,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ITokenRefreshResult,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ITokenResult,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ITraceDeletion,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ITraceEntry,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ITraceFamily,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ITraceListing,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ITraceReading,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ITraceScheduling,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ITraceState,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ITraceView,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ITransformationConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ITransportCheckServiceBindingParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ITransportConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ITransportSearchConfiguration,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IUnitTestConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IUnitTestDuration,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IUnitTestResultOptions,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IUnitTestRiskLevel,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IUnitTestScope,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IUnpublishODataV2Params,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IUpdateAccessControlParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IUpdateAppendStructureParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IUpdateBehaviorDefinitionParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IUpdateDataElementParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IUpdateDdlSourceParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IUpdateDomainParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IUpdateEnhancementParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IUpdateFunctionGroupParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IUpdateFunctionModuleParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IUpdateIncludeSourceParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IUpdateInterfaceSourceParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IUpdatePackageParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IUpdateProgramSourceParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IUpdateScalarFunctionImplementationParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IUpdateScalarFunctionParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IUpdateServiceBindingParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IUpdateServiceDefinitionParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IUpdateStructureParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IUpdateTableParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IUpdateTableTypeParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IUpdateTransformationParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IValidatedAuthConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IValidateEnhancementParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IValidateServiceBindingParams,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  IVirtualFoldersPreselection,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  OAuth2GrantType,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  SapAuthType,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  SapConnectionType,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ScalarFunctionEngine,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ServiceBindingType,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ServiceBindingVariant,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ServiceBindingVersion,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  StoreErrorCode,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  TableTypeAccessType,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  TableTypePrimaryKeyDefinition,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  TableTypePrimaryKeyKind,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  TableTypeRowKind,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  TokenProviderErrorCode,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  TransformationType,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ViewArgs,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ViewOptions,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ViewResult,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  XmlNode,
} from '@mcp-abap-adt/interfaces-adt';
export {
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ADT_NO_FAILURE,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  ADT_SESSION_ERROR,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  AdtObjectErrorCodes,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  AUTH_TYPE_AUTHORIZATION_CODE,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  AUTH_TYPE_AUTHORIZATION_CODE_PKCE,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  AUTH_TYPE_BASIC,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  AUTH_TYPE_CLIENT_CREDENTIALS,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  AUTH_TYPE_CLIENT_X509,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  AUTH_TYPE_JWT,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  AUTH_TYPE_PASSWORD,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  AUTH_TYPE_SAML2_BEARER,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  AUTH_TYPE_USER_TOKEN,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  AUTH_TYPE_XSUAA,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  AUTH_TYPES,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  AuthMethodPriority,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  CALM_SERVICES,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  HEADER_BTP_DESTINATION,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  HEADER_MCP_DESTINATION,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  HEADER_MCP_URL,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  HEADER_SAP_AUTH_TYPE,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  HEADER_SAP_CLIENT,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  HEADER_SAP_DESTINATION,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  HEADER_SAP_DESTINATION_SERVICE,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  HEADER_SAP_JWT_TOKEN,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  HEADER_SAP_LOGIN,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  HEADER_SAP_PASSWORD,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  HEADER_SAP_REFRESH_TOKEN,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  HEADER_SAP_UAA_CLIENT_ID,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  HEADER_SAP_UAA_CLIENT_SECRET,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  HEADER_SAP_UAA_URL,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  HEADER_SAP_URL,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  HEADER_UAA_CLIENT_ID,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  HEADER_UAA_CLIENT_SECRET,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  HEADER_UAA_URL,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  SERVICE_BINDING_VARIANT_MAP,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  STORE_ERROR_CODES,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  TOKEN_PROVIDER_ERROR_CODES,
  /** @deprecated Import from @mcp-abap-adt/interfaces-adt */
  TRANSPORT_SEARCH_CONFIGURATIONS_URL,
} from '@mcp-abap-adt/interfaces-adt';
export type {
  /** @deprecated Import from @mcp-abap-adt/interfaces-auth */
  IAuthProvider,
  /** @deprecated Import from @mcp-abap-adt/interfaces-auth */
  ICertificateMaterial,
  /** @deprecated Import from @mcp-abap-adt/interfaces-auth */
  IRenewableCredential,
} from '@mcp-abap-adt/interfaces-auth';
export type {
  /** @deprecated Import from @mcp-abap-adt/interfaces-network */
  ITimeoutConfig,
  /** @deprecated Import from @mcp-abap-adt/interfaces-network */
  IWebSocketCloseInfo,
  /** @deprecated Import from @mcp-abap-adt/interfaces-network */
  IWebSocketConnectOptions,
  /** @deprecated Import from @mcp-abap-adt/interfaces-network */
  IWebSocketMessageEnvelope,
  /** @deprecated Import from @mcp-abap-adt/interfaces-network */
  IWebSocketMessageHandler,
  /** @deprecated Import from @mcp-abap-adt/interfaces-network */
  IWebSocketTransport,
  /** @deprecated Import from @mcp-abap-adt/interfaces-network */
  NetworkErrorCode,
} from '@mcp-abap-adt/interfaces-network';
export {
  /** @deprecated Import from @mcp-abap-adt/interfaces-network */
  HEADER_ACCEPT,
  /** @deprecated Import from @mcp-abap-adt/interfaces-network */
  HEADER_AUTHORIZATION,
  /** @deprecated Import from @mcp-abap-adt/interfaces-network */
  HEADER_CONTENT_TYPE,
  /** @deprecated Import from @mcp-abap-adt/interfaces-network */
  HEADER_MCP_SESSION_ID,
  /** @deprecated Import from @mcp-abap-adt/interfaces-network */
  HEADER_SESSION_ID,
  /** @deprecated Import from @mcp-abap-adt/interfaces-network */
  HEADER_X_MCP_SESSION_ID,
  /** @deprecated Import from @mcp-abap-adt/interfaces-network */
  NETWORK_ERROR_CODES,
} from '@mcp-abap-adt/interfaces-network';
export type {
  /** @deprecated Import from @mcp-abap-adt/interfaces-utils */
  ILogger,
} from '@mcp-abap-adt/interfaces-utils';
export {
  /** @deprecated Import from @mcp-abap-adt/interfaces-utils */
  LogLevel,
} from '@mcp-abap-adt/interfaces-utils';
// Headers domain
export * from './Headers';
export type { ISessionState } from './storage/ISessionState';
// Storage domain
export type { ISessionStorage } from './storage/ISessionStorage';
