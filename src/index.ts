/**
 * @mcp-abap-adt/interfaces
 *
 * Shared interfaces for MCP ABAP ADT packages
 * All interfaces follow the convention of starting with 'I' prefix
 */

export type { HttpError, XmlNode } from './adt/AdtTypes';
export { AdtOperationError } from './adt/AdtTypes';
export type {
  IAccessControlConfig,
  IAccessControlState,
  ICreateAccessControlParams,
  IDeleteAccessControlParams,
  IReadAccessControlParams,
  IUpdateAccessControlParams,
} from './adt/IAdtAccessControl';
export type {
  IAppendStructureConfig,
  IAppendStructureState,
  ICreateAppendStructureParams,
  IDeleteAppendStructureParams,
  IUpdateAppendStructureParams,
} from './adt/IAdtAppendStructure';
export type {
  IAuthorizationFieldConfig,
  IAuthorizationFieldState,
  ICreateAuthorizationFieldParams,
} from './adt/IAdtAuthorizationField';
export type {
  BehaviorDefinitionImplementationType,
  IBehaviorDefinitionConfig,
  IBehaviorDefinitionState,
  ICreateBehaviorDefinitionParams,
  IDeleteBehaviorDefinitionParams,
  IReadBehaviorDefinitionParams,
  IUpdateBehaviorDefinitionParams,
} from './adt/IAdtBehaviorDefinition';
export type {
  IBehaviorImplementationConfig,
  IBehaviorImplementationState,
  ICreateBehaviorImplementationParams,
  IDeleteBehaviorImplementationParams,
  IReadBehaviorImplementationParams,
  IUpdateBehaviorImplementationParams,
} from './adt/IAdtBehaviorImplementation';
export type {
  IClassConfig,
  IClassState,
  ICreateClassParams,
  IDeleteClassParams,
  IReadClassParams,
  IUpdateClassParams,
} from './adt/IAdtClass';
export type {
  DataElementTypeKind,
  ICreateDataElementParams,
  IDataElementConfig,
  IDataElementState,
  IDeleteDataElementParams,
  IReadDataElementParams,
  IUpdateDataElementParams,
} from './adt/IAdtDataElement';
export type {
  ICreateDdlParams,
  IDdlConfig,
  IDdlState,
  IDeleteDdlParams,
  IReadDdlParams,
  IUpdateDdlParams,
} from './adt/IAdtDdl';
export type {
  ICreateDomainParams,
  IDeleteDomainParams,
  IDomainConfig,
  IDomainState,
  IFixedValue,
  IReadDomainParams,
  IUpdateDomainParams,
} from './adt/IAdtDomain';
export type {
  EnhancementType,
  ICreateEnhancementParams,
  IDeleteEnhancementParams,
  IEnhancementConfig,
  IEnhancementState,
  IReadEnhancementParams,
  IUpdateEnhancementParams,
} from './adt/IAdtEnhancement';
export type {
  FeatureToggleState,
  ICreateFeatureToggleParams,
  IDeleteFeatureToggleParams,
  IFeatureToggleAttribute,
  IFeatureToggleCheckStateResult,
  IFeatureToggleClientLevel,
  IFeatureToggleConfig,
  IFeatureToggleHeader,
  IFeatureToggleObject,
  IFeatureTogglePlanning,
  IFeatureToggleReleasePlan,
  IFeatureToggleRollout,
  IFeatureToggleRuntimeState,
  IFeatureToggleSource,
  IFeatureToggleState,
  IFeatureToggleUserLevel,
  IToggleFeatureToggleParams,
} from './adt/IAdtFeatureToggle';
export type {
  ICreateFunctionGroupParams,
  IDeleteFunctionGroupParams,
  IFunctionGroupConfig,
  IFunctionGroupState,
  IReadFunctionGroupParams,
  IUpdateFunctionGroupParams,
} from './adt/IAdtFunctionGroup';
export type {
  ICreateFunctionIncludeParams,
  IFunctionIncludeConfig,
  IFunctionIncludeState,
} from './adt/IAdtFunctionInclude';
export type {
  ICreateFunctionModuleParams,
  IDeleteFunctionModuleParams,
  IFunctionModuleConfig,
  IFunctionModuleState,
  IReadFunctionModuleParams,
  IUpdateFunctionModuleParams,
} from './adt/IAdtFunctionModule';
export type {
  ICreateInterfaceParams,
  IDeleteInterfaceParams,
  IInterfaceConfig,
  IInterfaceState,
  IReadInterfaceParams,
  IUpdateInterfaceParams,
} from './adt/IAdtInterface';
export type {
  ICreateMessageClassMessageParams,
  ICreateMessageClassParams,
  IDeleteMessageClassMessageParams,
  IDeleteMessageClassParams,
  IMessageClassConfig,
  IMessageClassMessageConfig,
  IMessageClassMessageState,
  IMessageClassState,
  IParsedMessage,
  IParsedMessageClass,
  IReadMessageClassParams,
  IUpdateMessageClassMessageParams,
  IUpdateMessageClassParams,
} from './adt/IAdtMessageClass';
export type {
  ICreateMetadataExtensionParams,
  IDeleteMetadataExtensionParams,
  IMetadataExtensionConfig,
  IMetadataExtensionCreateParams,
  IMetadataExtensionState,
  IMetadataExtensionValidationParams,
  IReadMetadataExtensionParams,
  IUpdateMetadataExtensionParams,
} from './adt/IAdtMetadataExtension';
// ADT domain
export type {
  IAdtObject,
  IAdtOperationOptions,
  IObjectVersion,
} from './adt/IAdtObject';
export { AdtObjectErrorCodes } from './adt/IAdtObject';
export type { IAdtObjectConfig, IAdtObjectState } from './adt/IAdtObjectState';
export type {
  ICreatePackageParams,
  IDeletePackageParams,
  IPackageConfig,
  IPackageState,
  IReadPackageParams,
  IUpdatePackageParams,
} from './adt/IAdtPackage';
export type {
  ICreateProgramParams,
  IDeleteProgramParams,
  IProgramConfig,
  IProgramState,
  IReadProgramParams,
  IUpdateProgramParams,
} from './adt/IAdtProgram';
export type {
  ICreateScalarFunctionParams,
  IDeleteScalarFunctionParams,
  IScalarFunctionConfig,
  IScalarFunctionState,
  IUpdateScalarFunctionParams,
} from './adt/IAdtScalarFunction';
export type {
  ICreateScalarFunctionImplementationParams,
  IDeleteScalarFunctionImplementationParams,
  IScalarFunctionImplementationConfig,
  IScalarFunctionImplementationState,
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
  IServiceBindingState,
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
  IServiceDefinitionConfig,
  IServiceDefinitionState,
  IUpdateServiceDefinitionParams,
} from './adt/IAdtServiceDefinition';
export type {
  ICreateStructureParams,
  IDeleteStructureParams,
  IReadStructureParams,
  IStructureConfig,
  IStructureField,
  IStructureInclude,
  IStructureState,
  IUpdateStructureParams,
} from './adt/IAdtStructure';
export type {
  ICreateTableParams,
  IDeleteTableParams,
  IReadTableParams,
  ITableConfig,
  ITableState,
  IUpdateTableParams,
} from './adt/IAdtTable';
export type {
  ICreateTableTypeParams,
  IDeleteTableTypeParams,
  IReadTableTypeParams,
  ITableTypeConfig,
  ITableTypeState,
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
  ITransformationState,
  IUpdateTransformationParams,
  TransformationType,
} from './adt/IAdtTransformation';
export type {
  ICreateTransportParams,
  IDeleteTransportParams,
  IReadTransportParams,
  ITransportConfig,
  ITransportState,
  IUpdateTransportParams,
} from './adt/IAdtTransport';
export type {
  ClassUnitTestDefinition,
  ClassUnitTestRunOptions,
  IClassUnitTestDefinition,
  IClassUnitTestRunOptions,
  IReadUnitTestParams,
  IRunUnitTestParams,
  IUnitTestConfig,
  IUnitTestDuration,
  IUnitTestRiskLevel,
  IUnitTestScope,
  IUnitTestState,
} from './adt/IAdtUnitTest';
export type { AuthType as AuthTypeEnum } from './auth/AuthType';
// Auth domain
export type { IAuthorizationConfig } from './auth/IAuthorizationConfig';
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
  IAdtResponse,
} from './connection/IAbapConnection';
export type { IAbapRequestOptions } from './connection/IAbapRequestOptions';
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
  AdtServiceBindingType,
  IActivateServiceBindingParams,
  IAdtService,
  IAdtServiceBinding,
  IAdtServiceOperationOptions,
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
