/**
 * @mcp-abap-adt/interfaces
 *
 * Shared interfaces for MCP ABAP ADT packages
 * All interfaces follow the convention of starting with 'I' prefix
 */

export type { HttpError, XmlNode } from './adt/AdtTypes';
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
  ICreateAccessControlParams,
  IDeleteAccessControlParams,
  IUpdateAccessControlParams,
} from './adt/IAdtAccessControl';
export type {
  IAppendStructureConfig,
  ICreateAppendStructureParams,
  IDeleteAppendStructureParams,
  IUpdateAppendStructureParams,
} from './adt/IAdtAppendStructure';
export type {
  IAuthorizationFieldConfig,
  ICreateAuthorizationFieldParams,
} from './adt/IAdtAuthorizationField';
export type {
  BehaviorDefinitionImplementationType,
  CheckReporter,
  IBehaviorDefinitionConfig,
  IBehaviorDefinitionCreateParams,
  IBehaviorDefinitionValidationParams,
  ICheckMessage,
  ICheckRunResult,
  ILockResult,
  IUpdateBehaviorDefinitionParams,
  IValidationResult,
} from './adt/IAdtBehaviorDefinition';
export type {
  IBehaviorImplementationConfig,
  ICreateBehaviorImplementationParams,
} from './adt/IAdtBehaviorImplementation';
export type {
  IAdtActivatable,
  IAdtCheckable,
  IAdtCreatable,
  IAdtDeletable,
  IAdtLockable,
  IAdtReadable,
  IAdtTransportAware,
  IAdtUpdatable,
  IAdtValidatable,
  IAdtVersionable,
} from './adt/IAdtCapabilities';
export type {
  IClassConfig,
  ICreateClassParams,
  IDeleteClassParams,
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
  IDeleteDataElementParams,
  IUpdateDataElementParams,
} from './adt/IAdtDataElement';
export type {
  ICreateDdlParams,
  IDdlConfig,
  IDeleteDdlParams,
  IUpdateDdlSourceParams,
} from './adt/IAdtDdl';
export type {
  ICreateDomainParams,
  IDeleteDomainParams,
  IDomainConfig,
  IFixedValue,
  IUpdateDomainParams,
} from './adt/IAdtDomain';
export type {
  EnhancementType,
  ICheckEnhancementParams,
  ICreateEnhancementParams,
  IDeleteEnhancementParams,
  IEnhancementConfig,
  IEnhancementMetadata,
  IUpdateEnhancementParams,
  IValidateEnhancementParams,
} from './adt/IAdtEnhancement';
export type {
  ICreateFeatureToggleParams,
  IDeleteFeatureToggleParams,
  IFeatureToggleAttribute,
  IFeatureToggleConfig,
  IFeatureToggleHeader,
  IFeatureToggleObject,
  IFeatureTogglePlanning,
  IFeatureToggleReleasePlan,
  IFeatureToggleRollout,
  IFeatureToggleSource,
  IToggleFeatureToggleParams,
} from './adt/IAdtFeatureToggle';
export type {
  ICreateFunctionGroupParams,
  IDeleteFunctionGroupParams,
  IFunctionGroupConfig,
  IUpdateFunctionGroupParams,
} from './adt/IAdtFunctionGroup';
export type {
  ICreateFunctionIncludeParams,
  IFunctionIncludeConfig,
} from './adt/IAdtFunctionInclude';
export type {
  ICreateFunctionModuleParams,
  IDeleteFunctionModuleParams,
  IFunctionModuleConfig,
  IUpdateFunctionModuleParams,
} from './adt/IAdtFunctionModule';
export type {
  ICreateIncludeParams,
  IDeleteIncludeParams,
  IIncludeConfig,
  IUpdateIncludeSourceParams,
} from './adt/IAdtInclude';
export type {
  ICreateInterfaceParams,
  IDeleteInterfaceParams,
  IInterfaceConfig,
  IUpdateInterfaceSourceParams,
} from './adt/IAdtInterface';
export type {
  ICreateMessageClassParams,
  IDeleteMessageClassParams,
  IMessageClassConfig,
  IMessageClassMessageConfig,
  IParsedMessage,
  IParsedMessageClass,
} from './adt/IAdtMessageClass';
export type {
  IMetadataExtensionConfig,
  IMetadataExtensionCreateParams,
  IMetadataExtensionValidationParams,
} from './adt/IAdtMetadataExtension';
// ADT domain
export type { IAdtOperationOptions } from './adt/IAdtObject';
export { AdtObjectErrorCodes } from './adt/IAdtObject';
export type { IAdtObjectConfig } from './adt/IAdtObjectState';
export type {
  ICreatePackageParams,
  IDeletePackageParams,
  IPackageConfig,
  IReadPackageParams,
  IUpdatePackageParams,
} from './adt/IAdtPackage';
export type {
  ICreateProgramParams,
  IDeleteProgramParams,
  IProgramConfig,
  IUpdateProgramSourceParams,
} from './adt/IAdtProgram';
export type {
  AdtFailureOrigin,
  IAdtError,
  IAdtFailure,
  IAdtResponse,
  IAdtResult,
  IAdtSuccess,
  IResultStrategy,
} from './adt/IAdtResponse';
export type {
  ICreateScalarFunctionParams,
  IDeleteScalarFunctionParams,
  IScalarFunctionConfig,
  IUpdateScalarFunctionParams,
} from './adt/IAdtScalarFunction';
export type {
  ICreateScalarFunctionImplementationParams,
  IDeleteScalarFunctionImplementationParams,
  IScalarFunctionImplementationConfig,
  IUpdateScalarFunctionImplementationParams,
  ScalarFunctionEngine,
} from './adt/IAdtScalarFunctionImplementation';
export type {
  DesiredPublicationState,
  GeneratedServiceType,
  ICreateServiceBindingParams,
  IDeleteServiceBindingParams,
  IReadServiceBindingParams,
  IServiceBindingConfig,
  IUpdateServiceBindingParams,
  ServiceBindingType,
  ServiceBindingVariant,
  ServiceBindingVersion,
} from './adt/IAdtServiceBinding';
export { SERVICE_BINDING_VARIANT_MAP } from './adt/IAdtServiceBinding';
export type {
  ICreateServiceDefinitionParams,
  IDeleteServiceDefinitionParams,
  IServiceDefinitionConfig,
  IUpdateServiceDefinitionParams,
} from './adt/IAdtServiceDefinition';
export type {
  AdtObjectType,
  AdtObjectTypeLower,
  AdtSourceObjectType,
  AdtSourceObjectTypeLower,
  IGetDiscoveryParams,
  IGetSqlQueryParams,
  IGetTableContentsParams,
  IGetVirtualFoldersContentsParams,
  IGetWhereUsedListParams,
  IGetWhereUsedParams,
  IGetWhereUsedScopeParams,
  IObjectReference,
  ISearchObjectsParams,
  IVirtualFoldersPreselection,
} from './adt/IAdtShared';
export type {
  ICreateStructureParams,
  IDeleteStructureParams,
  IStructureConfig,
  IStructureField,
  IStructureInclude,
  IUpdateStructureParams,
} from './adt/IAdtStructure';
export type {
  ICreateTableParams,
  IDeleteTableParams,
  ITableConfig,
  IUpdateTableParams,
} from './adt/IAdtTable';
export type {
  ICreateTableTypeParams,
  IDeleteTableTypeParams,
  ITableTypeConfig,
  IUpdateTableTypeParams,
  TableTypeAccessType,
  TableTypePrimaryKeyDefinition,
  TableTypePrimaryKeyKind,
  TableTypeRowKind,
} from './adt/IAdtTableType';
export type {
  ICreateTransformationParams,
  IDeleteTransformationParams,
  ITransformationConfig,
  IUpdateTransformationParams,
  TransformationType,
} from './adt/IAdtTransformation';
export type {
  IAdtRequest,
  ICreateTransportParams,
  IListTransportsOptions,
  IListTransportsParams,
  ITransportConfig,
  ITransportSearchConfiguration,
} from './adt/IAdtTransport';
export { TRANSPORT_SEARCH_CONFIGURATIONS_URL } from './adt/IAdtTransport';
export type {
  ClassUnitTestDefinition,
  ClassUnitTestRunOptions,
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
  IAdtPackageBrowsing,
  IAdtRepositoryStructure,
  IGetNodeContentsOptions,
  IGetPackageContentsOptions,
} from './adt/IAdtUtilities';
export type { AuthType as AuthTypeEnum } from './auth/AuthType';
// Auth domain
export type { IAuthorizationConfig } from './auth/IAuthorizationConfig';
export type {
  AuthorizationOutcome,
  AuthorizationRequest,
  IAuthorizationStrategy,
} from './auth/IAuthorizationStrategy';
export type {
  IAuthProvider,
  IRenewableCredential,
} from './auth/IAuthProvider';
export type {
  CallbackServerFactory,
  ICallbackServerHandle,
  ICallbackServerOptions,
} from './auth/ICallbackServer';
export type {
  ICertificateMaterial,
  ICertificateMaterialLoader,
} from './auth/ICertificateMaterialLoader';
export type { IConfig } from './auth/IConfig';
export type { IConnectionConfig } from './auth/IConnectionConfig';
export type { CalmService } from './connection/CalmService';
export { CALM_SERVICES } from './connection/CalmService';
// Connection domain
export type {
  IAbapConnection,
  IAdtWireResponse,
} from './connection/IAbapConnection';
export type { IAbapRequestOptions } from './connection/IAbapRequestOptions';
export type {
  ICalmConnection,
  ICalmResponse,
} from './connection/ICalmConnection';
export type { ICalmRequestOptions } from './connection/ICalmRequestOptions';
export type {
  AdtSessionErrorCode,
  IDeferredResponseConnection,
  ISessionLifecycleAware,
} from './connection/IConnectionCapabilities';
export { ADT_SESSION_ERROR } from './connection/IConnectionCapabilities';
export type {
  IWebSocketCloseInfo,
  IWebSocketConnectOptions,
  IWebSocketMessageEnvelope,
  IWebSocketMessageHandler,
  IWebSocketTransport,
} from './connection/IWebSocketTransport';
export type { NetworkErrorCode } from './connection/NetworkErrors';
export { NETWORK_ERROR_CODES } from './connection/NetworkErrors';
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
// Feeds domain
export type { IFeedRepository } from './feeds/IFeedRepository';
export type {
  IAbapTimestamp,
  IFeedQueryOptions,
} from './feeds/types';
// Headers domain
export * from './Headers';
// Logging domain
export type { ILogger } from './logging/ILogger';
export { LogLevel } from './logging/LogLevel';
export type {
  IApplicationLog,
  IGetApplicationLogObjectOptions,
  IGetApplicationLogSourceOptions,
} from './runtime/IApplicationLog';
export type {
  IAtcLog,
  IGetCheckFailureLogsOptions,
} from './runtime/IAtcLog';
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
  ICrossTraceDocuments,
  ICrossTraceResults,
  IListCrossTracesOptions,
} from './runtime/ICrossTrace';
export type {
  IDdicActivation,
  IGetActivationGraphOptions,
} from './runtime/IDdicActivation';
export type { IGatewayErrorLog } from './runtime/IGatewayErrorLog';
export type {
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
// Runtime domain
// SAP domain
export type { ISapConfig } from './sap/ISapConfig';
export type { SapAuthType, SapConnectionType } from './sap/SapAuthType';
// Service domain
export type {
  IActivateServiceBindingParams,
  IAdtServiceBinding,
  ICheckServiceBindingParams,
  IClassifyServiceBindingParams,
  ICreateAndGenerateServiceBindingParams,
  ICreateAndGenerateServiceBindingParamsLegacy,
  IGenerateServiceBindingParams,
  IGetServiceBindingODataParams,
  IPublishODataV2Params,
  IServiceBindingDocuments,
  IServiceBindingResults,
  ITransportCheckServiceBindingParams,
  IUnpublishODataV2Params,
  IValidateServiceBindingParams,
} from './service/IAdtService';
// Service Key domain
export type { IServiceKeyStore } from './serviceKey/IServiceKeyStore';
// Session domain
export type { ISessionStore } from './session/ISessionStore';
export type { IReadOptions } from './shared/IReadOptions';
export type { ISessionState } from './storage/ISessionState';
// Storage domain
export type { ISessionStorage } from './storage/ISessionStorage';
export type { StoreErrorCode } from './store/StoreErrorCodes';
// Store domain
export { STORE_ERROR_CODES } from './store/StoreErrorCodes';
export type { OAuth2GrantType } from './token/AuthType';
export {
  AUTH_TYPE_AUTHORIZATION_CODE,
  AUTH_TYPE_AUTHORIZATION_CODE_PKCE,
  AUTH_TYPE_CLIENT_CREDENTIALS,
  AUTH_TYPE_CLIENT_X509,
  AUTH_TYPE_PASSWORD,
  AUTH_TYPE_SAML2_BEARER,
  AUTH_TYPE_USER_TOKEN,
} from './token/AuthType';
// Token domain
export type { ITokenProvider } from './token/ITokenProvider';
export type { ITokenProviderOptions } from './token/ITokenProviderOptions';
export type { ITokenRefresher } from './token/ITokenRefresher';
export type { ITokenResult } from './token/ITokenResult';
export type { TokenProviderErrorCode } from './token/TokenProviderErrorCodes';
export { TOKEN_PROVIDER_ERROR_CODES } from './token/TokenProviderErrorCodes';
export type { ITimeoutConfig } from './utils/ITimeoutConfig';
// Utils domain
export type { ITokenRefreshResult } from './utils/ITokenRefreshResult';
export type { IHeaderValidationResult } from './validation/IHeaderValidationResult';
// Validation domain
export type { IValidatedAuthConfig } from './validation/IValidatedAuthConfig';
export { AuthMethodPriority } from './validation/IValidatedAuthConfig';
