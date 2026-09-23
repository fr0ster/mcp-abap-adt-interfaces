/**
 * @mcp-abap-adt/interfaces-adt
 *
 * ADT contracts, the ABAP and Cloud ALM connections, and SAP/BTP configuration and authentication contracts.
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
export type { AssertionErrorCode } from './auth/AssertionErrorCodes';
export { ASSERTION_ERROR_CODES } from './auth/AssertionErrorCodes';
export type { AuthType as AuthTypeEnum } from './auth/AuthType';
export type {
  AssertionContext,
  AssertionReplayKey,
  IAssertionReplayStore,
  IAssertionValidator,
  ValidatedAssertion,
} from './auth/IAssertionValidator';
export type { IAuthorizationConfig } from './auth/IAuthorizationConfig';
export type {
  AuthorizationOutcome,
  AuthorizationRequest,
  IAuthorizationStrategy,
} from './auth/IAuthorizationStrategy';
export type {
  CallbackServerFactory,
  ICallbackServerHandle,
  ICallbackServerOptions,
} from './auth/ICallbackServer';
export type { ICertificateMaterialLoader } from './auth/ICertificateMaterialLoader';
export type { IConfig } from './auth/IConfig';
export type { IConnectionConfig } from './auth/IConnectionConfig';
export type { CalmService } from './connection/CalmService';
export { CALM_SERVICES } from './connection/CalmService';
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
  ICriticalSection,
  IDeferredResponseConnection,
  IRequestProfiling,
  ISessionLifecycleAware,
} from './connection/IConnectionCapabilities';
export { ADT_SESSION_ERROR } from './connection/IConnectionCapabilities';
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
export type { AuthType } from './Headers';
export {
  AUTH_TYPE_BASIC,
  AUTH_TYPE_JWT,
  AUTH_TYPE_XSUAA,
  AUTH_TYPES,
  HEADER_SAP_AUTH_TYPE,
  HEADER_SAP_CLIENT,
  HEADER_SAP_DESTINATION,
  HEADER_SAP_DESTINATION_SERVICE,
  HEADER_SAP_JWT_TOKEN,
  HEADER_SAP_LOGIN,
  HEADER_SAP_PASSWORD,
  HEADER_SAP_REFRESH_TOKEN,
  HEADER_SAP_UAA_CLIENT_ID,
  HEADER_SAP_UAA_CLIENT_SECRET,
  HEADER_SAP_UAA_URL,
  HEADER_SAP_URL,
  HEADER_UAA_CLIENT_ID,
  HEADER_UAA_CLIENT_SECRET,
  HEADER_UAA_URL,
} from './Headers';
export {
  PRESERVED_HEADERS,
  SAP_CONNECTION_HEADERS,
  UAA_HEADERS,
} from './headers/HeaderGroups';
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
export type { ISapConfig } from './sap/ISapConfig';
export type { SapAuthType, SapConnectionType } from './sap/SapAuthType';
export type {
  ICreateAndGenerateServiceBindingParams,
  ICreateAndGenerateServiceBindingParamsLegacy,
} from './service/IAdtService';
export type { IServiceKeyStore } from './serviceKey/IServiceKeyStore';
export type { ISessionStore } from './session/ISessionStore';
export type { IReadOptions } from './shared/IReadOptions';
export type { ISessionState } from './store/ISessionState';
export type { ISessionStorage } from './store/ISessionStorage';
export type { StoreErrorCode } from './store/StoreErrorCodes';
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
export type { ITokenProvider } from './token/ITokenProvider';
export type { ITokenProviderOptions } from './token/ITokenProviderOptions';
export type { ITokenProviderResult } from './token/ITokenProviderResult';
export type { ITokenRefresher } from './token/ITokenRefresher';
export type { ITokenResult } from './token/ITokenResult';
export type { TokenProviderErrorCode } from './token/TokenProviderErrorCodes';
export { TOKEN_PROVIDER_ERROR_CODES } from './token/TokenProviderErrorCodes';
export type { ITokenRefreshResult } from './utils/ITokenRefreshResult';
export type { IHeaderValidationResult } from './validation/IHeaderValidationResult';
export type { IValidatedAuthConfig } from './validation/IValidatedAuthConfig';
export { AuthMethodPriority } from './validation/IValidatedAuthConfig';
