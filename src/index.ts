/**
 * @mcp-abap-adt/interfaces
 *
 * Shared interfaces for MCP ABAP ADT packages
 * All interfaces follow the convention of starting with 'I' prefix
 */

export type { HttpError, XmlNode } from './adt/AdtTypes';
export { AdtOperationError } from './adt/AdtTypes';
export type {
  ICreateAccessControlParams,
  IDeleteAccessControlParams,
  IReadAccessControlParams,
  IUpdateAccessControlParams,
} from './adt/IAdtAccessControl';
export type {
  BehaviorDefinitionImplementationType,
  ICreateBehaviorDefinitionParams,
  IDeleteBehaviorDefinitionParams,
  IReadBehaviorDefinitionParams,
  IUpdateBehaviorDefinitionParams,
} from './adt/IAdtBehaviorDefinition';
export type {
  ICreateBehaviorImplementationParams,
  IDeleteBehaviorImplementationParams,
  IReadBehaviorImplementationParams,
  IUpdateBehaviorImplementationParams,
} from './adt/IAdtBehaviorImplementation';
export type {
  ICreateClassParams,
  IDeleteClassParams,
  IReadClassParams,
  IUpdateClassParams,
} from './adt/IAdtClass';
export type {
  DataElementTypeKind,
  ICreateDataElementParams,
  IDeleteDataElementParams,
  IReadDataElementParams,
  IUpdateDataElementParams,
} from './adt/IAdtDataElement';
export type {
  ICreateDomainParams,
  IDeleteDomainParams,
  IFixedValue,
  IReadDomainParams,
  IUpdateDomainParams,
} from './adt/IAdtDomain';
export type {
  EnhancementType,
  ICreateEnhancementParams,
  IDeleteEnhancementParams,
  IReadEnhancementParams,
  IUpdateEnhancementParams,
} from './adt/IAdtEnhancement';
export type {
  ICreateFunctionGroupParams,
  IDeleteFunctionGroupParams,
  IReadFunctionGroupParams,
  IUpdateFunctionGroupParams,
} from './adt/IAdtFunctionGroup';
export type {
  ICreateFunctionModuleParams,
  IDeleteFunctionModuleParams,
  IReadFunctionModuleParams,
  IUpdateFunctionModuleParams,
} from './adt/IAdtFunctionModule';
export type {
  ICreateInterfaceParams,
  IDeleteInterfaceParams,
  IReadInterfaceParams,
  IUpdateInterfaceParams,
} from './adt/IAdtInterface';
export type {
  ICreateMetadataExtensionParams,
  IDeleteMetadataExtensionParams,
  IReadMetadataExtensionParams,
  IUpdateMetadataExtensionParams,
} from './adt/IAdtMetadataExtension';
// ADT domain
export type { IAdtObject, IAdtOperationOptions } from './adt/IAdtObject';
export { AdtObjectErrorCodes } from './adt/IAdtObject';
export type { IAdtObjectConfig, IAdtObjectState } from './adt/IAdtObjectState';
export type {
  ICreatePackageParams,
  IDeletePackageParams,
  IReadPackageParams,
  IUpdatePackageParams,
} from './adt/IAdtPackage';
export type {
  ICreateProgramParams,
  IDeleteProgramParams,
  IReadProgramParams,
  IUpdateProgramParams,
} from './adt/IAdtProgram';
export type {
  DesiredPublicationState,
  GeneratedServiceType,
  ICreateServiceBindingParams,
  IDeleteServiceBindingParams,
  IReadServiceBindingParams,
  IUpdateServiceBindingParams,
  ServiceBindingType,
  ServiceBindingVariant,
  ServiceBindingVersion,
} from './adt/IAdtServiceBinding';
export { SERVICE_BINDING_VARIANT_MAP } from './adt/IAdtServiceBinding';
export type {
  ICreateServiceDefinitionParams,
  IDeleteServiceDefinitionParams,
  IReadServiceDefinitionParams,
  IUpdateServiceDefinitionParams,
} from './adt/IAdtServiceDefinition';
export type {
  ICreateStructureParams,
  IDeleteStructureParams,
  IReadStructureParams,
  IUpdateStructureParams,
} from './adt/IAdtStructure';
export type {
  ICreateTableParams,
  IDeleteTableParams,
  IReadTableParams,
  IUpdateTableParams,
} from './adt/IAdtTable';
export type {
  ICreateTableTypeParams,
  IDeleteTableTypeParams,
  IReadTableTypeParams,
  IUpdateTableTypeParams,
  TableTypeAccessType,
  TableTypePrimaryKeyDefinition,
  TableTypePrimaryKeyKind,
  TableTypeRowKind,
} from './adt/IAdtTableType';
export type {
  ICreateTransportParams,
  IDeleteTransportParams,
  IReadTransportParams,
  IUpdateTransportParams,
} from './adt/IAdtTransport';
export type {
  IReadUnitTestParams,
  IRunUnitTestParams,
  IUnitTestDuration,
  IUnitTestRiskLevel,
  IUnitTestScope,
} from './adt/IAdtUnitTest';
export type {
  ICreateViewParams,
  IDeleteViewParams,
  IReadViewParams,
  IUpdateViewParams,
} from './adt/IAdtView';
export type { AuthType as AuthTypeEnum } from './auth/AuthType';
// Auth domain
export type { IAuthorizationConfig } from './auth/IAuthorizationConfig';
export type { IConfig } from './auth/IConfig';
export type { IConnectionConfig } from './auth/IConnectionConfig';
// Connection domain
export type {
  IAbapConnection,
  IAdtResponse,
} from './connection/IAbapConnection';
export type { IAbapRequestOptions } from './connection/IAbapRequestOptions';
export { CALM_SERVICES } from './connection/CalmService';
export type { CalmService } from './connection/CalmService';
export type {
  ICalmConnection,
  ICalmResponse,
} from './connection/ICalmConnection';
export type { ICalmRequestOptions } from './connection/ICalmRequestOptions';
export type {
  IWebSocketCloseInfo,
  IWebSocketConnectOptions,
  IWebSocketMessageEnvelope,
  IWebSocketMessageHandler,
  IWebSocketTransport,
} from './connection/IWebSocketTransport';
export type { NetworkErrorCode } from './connection/NetworkErrors';
export {
  isNetworkError,
  NETWORK_ERROR_CODES,
} from './connection/NetworkErrors';
export type { IExecutor } from './execution/IExecutor';
// Feeds domain
export type { IFeedRepository } from './feeds/IFeedRepository';
export type {
  IAbapTimestamp,
  ICallStackEntry,
  IFeedDescriptor,
  IFeedEntry,
  IFeedQueryOptions,
  IFeedVariant,
  IGatewayErrorDetail,
  IGatewayErrorEntry,
  IGatewayException,
  ISourceCodeLine,
  ISystemMessageEntry,
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
  ICrossTrace,
  IListCrossTracesOptions,
} from './runtime/ICrossTrace';
export type {
  IDdicActivation,
  IGetActivationGraphOptions,
} from './runtime/IDdicActivation';
// Runtime domain object interfaces
export type {
  IAbapDebugger,
  IAbapDebuggerStepMethod,
  IAmdpDebugger,
  IDebugger,
  IGetAmdpCellSubstringOptions,
  IGetAmdpDataPreviewOptions,
  IGetDebuggerOptions,
  IGetSystemAreaOptions,
  IGetVariableAsCsvOptions,
  IGetVariableAsJsonOptions,
  IGetVariableValueStatementOptions,
  ILaunchDebuggerOptions,
  IStartAmdpDebuggerOptions,
  IStopDebuggerOptions,
} from './runtime/IDebugger';
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
// Runtime domain
export type {
  IListableRuntimeObject,
  IRuntimeAnalysisObject,
} from './runtime/types';
// SAP domain
export type { ISapConfig } from './sap/ISapConfig';
export type { SapAuthType, SapConnectionType } from './sap/SapAuthType';
// Service domain
export type {
  IActivateServiceBindingParams,
  IAdtService,
  ICheckServiceBindingParams,
  IClassifyServiceBindingParams,
  ICreateAndGenerateServiceBindingParams,
  IGenerateServiceBindingParams,
  IGetServiceBindingODataParams,
  IPublishODataV2Params,
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
