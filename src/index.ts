/**
 * @mcp-abap-adt/interfaces
 *
 * Shared interfaces for MCP ABAP ADT packages
 * All interfaces follow the convention of starting with 'I' prefix
 */

// ADT domain
export type { IAdtObject, IAdtOperationOptions } from './adt/IAdtObject';
export { AdtObjectErrorCodes } from './adt/IAdtObject';
export type { IAdtObjectConfig, IAdtObjectState } from './adt/IAdtObjectState';
export type { AuthType } from './auth/AuthType';
// Auth domain
export type { IAuthorizationConfig } from './auth/IAuthorizationConfig';
export type { IConfig } from './auth/IConfig';
export type { IConnectionConfig } from './auth/IConnectionConfig';
// Connection domain
export type { IAbapConnection } from './connection/IAbapConnection';
export type { IAbapRequestOptions } from './connection/IAbapRequestOptions';
export type { NetworkErrorCode } from './connection/NetworkErrors';
export {
  isNetworkError,
  NETWORK_ERROR_CODES,
} from './connection/NetworkErrors';
// Headers domain
export * from './Headers';
// Logging domain
export type { ILogger } from './logging/ILogger';
export { LogLevel } from './logging/LogLevel';
// SAP domain
export type { ISapConfig } from './sap/ISapConfig';
export type { SapAuthType } from './sap/SapAuthType';
// Service Key domain
export type { IServiceKeyStore } from './serviceKey/IServiceKeyStore';
// Session domain
export type { ISessionStore } from './session/ISessionStore';
export type { ISessionState } from './storage/ISessionState';
// Storage domain
export type { ISessionStorage } from './storage/ISessionStorage';
export type { StoreErrorCode } from './store/StoreErrorCodes';
// Store domain
export { STORE_ERROR_CODES } from './store/StoreErrorCodes';
// Token domain
export type { ITokenProvider } from './token/ITokenProvider';
export type { ITokenProviderOptions } from './token/ITokenProviderOptions';
export type { ITokenProviderResult } from './token/ITokenProviderResult';
export type { ITokenRefresher } from './token/ITokenRefresher';
export type { TokenProviderErrorCode } from './token/TokenProviderErrorCodes';
export { TOKEN_PROVIDER_ERROR_CODES } from './token/TokenProviderErrorCodes';
export type { ITimeoutConfig } from './utils/ITimeoutConfig';
// Utils domain
export type { ITokenRefreshResult } from './utils/ITokenRefreshResult';
export type { IHeaderValidationResult } from './validation/IHeaderValidationResult';
// Validation domain
export type { IValidatedAuthConfig } from './validation/IValidatedAuthConfig';
export { AuthMethodPriority } from './validation/IValidatedAuthConfig';
