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
  IBehaviorDefinitionConfig,
  IBehaviorDefinitionCreateParams,
  IBehaviorDefinitionValidationParams,
  IUpdateBehaviorDefinitionParams,
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
  IMessageClassConfig,
  IMessageClassMessageConfig,
} from './adt/IAdtMessageClass';
export type {
  IMetadataExtensionConfig,
  IMetadataExtensionCreateParams,
  IMetadataExtensionValidationParams,
} from './adt/IAdtMetadataExtension';
export type {
  IAdtCreateOptions,
  IAdtOperationOptions,
  IAnalyse,
} from './adt/IAdtObject';
export { AdtObjectErrorCodes } from './adt/IAdtObject';
export type { IAdtObjectConfig } from './adt/IAdtObjectState';
export type {
  ICreatePackageParams,
  IDeletePackageParams,
  IPackageConfig,
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
  HEADER_BTP_DESTINATION,
  HEADER_MCP_DESTINATION,
  HEADER_MCP_URL,
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
  IActivateServiceBindingParams,
  ICheckServiceBindingParams,
  IClassifyServiceBindingParams,
  ICreateAndGenerateServiceBindingParams,
  ICreateAndGenerateServiceBindingParamsLegacy,
  IGenerateServiceBindingParams,
  IGetServiceBindingODataParams,
  IPublishODataV2Params,
  ITransportCheckServiceBindingParams,
  IUnpublishODataV2Params,
  IValidateServiceBindingParams,
} from './service/IAdtService';
export type { IServiceKeyStore } from './serviceKey/IServiceKeyStore';
export type { ISessionStore } from './session/ISessionStore';
export type { IReadOptions } from './shared/IReadOptions';
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
export type { ITokenRefresher } from './token/ITokenRefresher';
export type { ITokenResult } from './token/ITokenResult';
export type { TokenProviderErrorCode } from './token/TokenProviderErrorCodes';
export { TOKEN_PROVIDER_ERROR_CODES } from './token/TokenProviderErrorCodes';
export type { ITokenRefreshResult } from './utils/ITokenRefreshResult';
export type { IHeaderValidationResult } from './validation/IHeaderValidationResult';
export type { IValidatedAuthConfig } from './validation/IValidatedAuthConfig';
export { AuthMethodPriority } from './validation/IValidatedAuthConfig';
