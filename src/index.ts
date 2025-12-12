/**
 * @mcp-abap-adt/interfaces
 * 
 * Shared interfaces for MCP ABAP ADT packages
 * All interfaces follow the convention of starting with 'I' prefix
 */

// Auth domain
export type { IAuthorizationConfig } from './auth/IAuthorizationConfig';
export type { IConnectionConfig } from './auth/IConnectionConfig';
export type { IConfig } from './auth/IConfig';
export type { AuthType } from './auth/AuthType';

// Token domain
export type { ITokenProvider } from './token/ITokenProvider';
export type { ITokenProviderResult } from './token/ITokenProviderResult';
export type { ITokenProviderOptions } from './token/ITokenProviderOptions';

// Session domain
export type { ISessionStore } from './session/ISessionStore';

// Service Key domain
export type { IServiceKeyStore } from './serviceKey/IServiceKeyStore';

// Connection domain
export type { IAbapConnection } from './connection/IAbapConnection';
export type { IAbapRequestOptions } from './connection/IAbapRequestOptions';

// SAP domain
export type { ISapConfig } from './sap/ISapConfig';
export type { SapAuthType } from './sap/SapAuthType';

// Storage domain
export type { ISessionStorage } from './storage/ISessionStorage';
export type { ISessionState } from './storage/ISessionState';

// Logging domain
export type { ILogger } from './logging/ILogger';
export { LogLevel } from './logging/LogLevel';

// Validation domain
export type { IValidatedAuthConfig } from './validation/IValidatedAuthConfig';
export type { IHeaderValidationResult } from './validation/IHeaderValidationResult';
export { AuthMethodPriority } from './validation/IValidatedAuthConfig';

// Utils domain
export type { ITokenRefreshResult } from './utils/ITokenRefreshResult';
export type { ITimeoutConfig } from './utils/ITimeoutConfig';

// Headers domain
export * from './Headers';

// ADT domain
export type { IAdtObject, IAdtOperationOptions } from './adt/IAdtObject';
export { AdtObjectErrorCodes } from './adt/IAdtObject';
export type { IAdtObjectState, IAdtObjectConfig } from './adt/IAdtObjectState';

