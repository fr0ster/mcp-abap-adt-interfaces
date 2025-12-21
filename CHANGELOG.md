# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.4] - 2025-12-21

### Added
- **Headless Browser Mode**: Added `"headless"` option to `ITokenProviderOptions.browser`
  - `"headless"`: Does not open browser, logs authentication URL and waits for manual callback
  - Ideal for SSH sessions, remote terminals, and environments without display
  - Differs from `"none"` which immediately rejects (for automated tests)
  - Updated JSDoc documentation for browser option with all supported values

## [0.2.3] - 2025-12-19

### Added
- **Store Error Codes**: Added standardized error codes for store operations
  - `STORE_ERROR_CODES` - Object containing error codes for store failures:
    - `FILE_NOT_FOUND` - Service key or session file not found
    - `PARSE_ERROR` - JSON or YAML parsing failed
    - `INVALID_CONFIG` - Required configuration fields are missing
    - `STORAGE_ERROR` - File write or permission error
  - `StoreErrorCode` - Type for store error codes
  - These constants enable auth-stores to provide typed errors to auth-broker
  - Error codes help broker distinguish between file not found, parsing errors, and validation failures
  - Exported from `@mcp-abap-adt/interfaces` package in store domain

## [0.2.2] - 2025-12-19

### Added
- **Token Provider Error Codes**: Added standardized error codes for token provider operations
  - `TOKEN_PROVIDER_ERROR_CODES` - Object containing error codes for token provider failures:
    - `VALIDATION_ERROR` - Authentication configuration validation failed
    - `REFRESH_ERROR` - Token refresh operation failed
    - `SESSION_DATA_ERROR` - Session data is invalid or incomplete
    - `SERVICE_KEY_ERROR` - Service key data is invalid or incomplete
    - `BROWSER_AUTH_ERROR` - Browser authentication failed or was cancelled
  - `TokenProviderErrorCode` - Type for token provider error codes
  - These constants enable consistent error handling across token providers and auth-broker
  - Error codes help distinguish between different types of authentication failures
  - Exported from `@mcp-abap-adt/interfaces` package in token domain

## [0.2.1] - 2025-12-19

### Added
- **Token Refresh Methods in ITokenProvider**: Added two new methods to `ITokenProvider` interface for explicit refresh scenarios
  - `refreshTokenFromSession(authConfig, options?)` - Refresh token using refresh token from session
    - Uses refresh token from `authConfig.refreshToken` to get new access token
    - Typically uses refresh_token grant type or browser-based re-authentication
    - Returns new authorization token and optional new refresh token
  - `refreshTokenFromServiceKey(authConfig, options?)` - Refresh token using UAA credentials from service key
    - Uses UAA credentials (uaaUrl, uaaClientId, uaaClientSecret) without refresh token
    - Typically uses browser-based authorization flow to ensure proper role assignment
    - Returns new authorization token and optional refresh token
  - These methods provide explicit control over token refresh strategy in AuthBroker
  - Allows separation of refresh-by-session vs refresh-by-service-key logic in token providers

## [0.2.0] - 2025-12-19

### Added
- **Network Error Detection Constants and Utility**: Added network error codes and helper function for detecting infrastructure-level connection issues
  - `NETWORK_ERROR_CODES` - Object containing standard network error codes:
    - `ECONNREFUSED` - Connection refused (server not accepting connections)
    - `ETIMEDOUT` - Connection timeout (server not responding)
    - `ENOTFOUND` - DNS resolution failed (hostname not found)
    - `ECONNRESET` - Connection reset by peer
    - `ENETUNREACH` - Network is unreachable
    - `EHOSTUNREACH` - Host is unreachable
  - `NetworkErrorCode` - Type for network error codes
  - `isNetworkError(error: any): boolean` - Utility function to check if an error is a network-level error
  - These constants and utilities help distinguish network/infrastructure errors from application-level HTTP errors
  - Network errors should not trigger retry logic (CSRF, auth) as they indicate VPN, DNS, or connectivity issues
  - Exported from `@mcp-abap-adt/interfaces` package in connection domain

## [0.1.19] - 2025-12-17

### Added
- **Low-level Update Mode in IAdtOperationOptions**: Added `lockHandle` field to `IAdtOperationOptions` interface
  - `lockHandle?: string` - Lock handle to use for low-level update operations
  - When `lockHandle` is provided in `update()` options, the method will skip lock, check, and unlock operations
  - Performs only the core update operation, useful when managing lock/unlock manually or in custom workflows
  - The update method assumes the object is already locked when `lockHandle` is provided

## [0.1.18] - 2025-12-17

### Added
- **Lock and Unlock Methods in IAdtObject Interface**: Added `lock()` and `unlock()` methods to `IAdtObject` interface
  - `lock(config: Partial<TConfig>): Promise<string>` - Lock object for modification, returns lock handle
  - `unlock(config: Partial<TConfig>, lockHandle: string): Promise<TReadResult>` - Unlock object using lock handle
  - These methods allow consumers to manually manage object locks for custom update workflows
  - Lock sets connection to stateful mode, unlock sets it back to stateless mode
  - Lock handle must be used in subsequent unlock() and update operations

## [0.1.17] - 2025-12-16

### Added
- **Basic Authentication Support for IConnectionConfig**: Added support for basic auth (username/password) in addition to JWT tokens
  - Added optional `username?: string` field for basic authentication (on-premise systems)
  - Added optional `password?: string` field for basic authentication (on-premise systems)
  - Added optional `authType?: 'basic' | 'jwt'` field to indicate authentication type
  - Made `authorizationToken` optional (required for JWT auth, optional for basic auth)
  - This enables on-premise systems to use `--mcp` parameter with basic auth instead of requiring JWT tokens

## [0.1.16] - 2025-12-13

### Changed
- **HTTP timeout docs**: Clarified `timeout` option in `IAdtOperationOptions` to explain behavior and mention `withLongPolling` interplay
- **VSCode spell checking**: Limited spell checker scope to project files to reduce false positives

## [0.1.15] - 2025-12-12

### Added
- **Long Polling Support for Read Operations**: Added optional `withLongPolling` parameter to all GET-based read methods
  - **IAdtObject Interface**:
    - `read(config, version?, options?)` - Added optional `options?: { withLongPolling?: boolean }` parameter
    - `readMetadata(config, options?)` - Added optional `options?: { withLongPolling?: boolean }` parameter
    - `readTransport(config, options?)` - Added optional `options?: { withLongPolling?: boolean }` parameter
  - **IBuilder Interface** (in `@mcp-abap-adt/adt-clients`):
    - `read(version?, options?)` - Added optional `options?: { withLongPolling?: boolean }` parameter
  - **Usage**: When `withLongPolling: true` is specified, the request includes `?withLongPolling=true` query parameter
    - This allows the server to hold the connection open until the object becomes available or a timeout occurs
    - Useful after create/activate operations to wait until object is ready for reading
    - Can replace timeout-based polling in tests and production code
  - **Example**:
    ```typescript
    // Wait for object to become available after creation
    const domain = await adtDomain.read(
      { domainName: 'Z_TEST' },
      'active',
      { withLongPolling: true }
    );
    
    // Read metadata with long polling
    const metadata = await adtDomain.readMetadata(
      { domainName: 'Z_TEST' },
      { withLongPolling: true }
    );
    ```

## [0.1.14] - 2025-12-19

### Added
- **LogLevel Enum**: Added `LogLevel` enum to logging domain exports
  - Defines log levels: `ERROR = 0`, `WARN = 1`, `INFO = 2`, `DEBUG = 3`
  - Exported from `@mcp-abap-adt/interfaces` for use across all packages
  - Allows logger implementations to use standardized log level constants
  - **Usage**: `import { LogLevel } from '@mcp-abap-adt/interfaces';`

## [0.1.13] - 2025-12-19

### Removed
- **Unit Test and Transport Config Types**: Removed `IUnitTestBuilderConfig` and `ITransportBuilderConfig` from package exports
  - These types are now defined locally in `@mcp-abap-adt/adt-clients` package as `IUnitTestConfig` and `ITransportConfig`
  - This change aligns with the pattern used by all other ADT object types (Class, Program, Interface, etc.) which have local Config types
  - **Migration**: If you were importing these types from `@mcp-abap-adt/interfaces`, update your imports to use local types from `@mcp-abap-adt/adt-clients`:
    - `IUnitTestBuilderConfig` → `IUnitTestConfig` from `@mcp-abap-adt/adt-clients/src/core/unitTest/types`
    - `ITransportBuilderConfig` → `ITransportConfig` from `@mcp-abap-adt/adt-clients/src/core/transport/types`
  - **Note**: `IClassUnitTestDefinition` and `IClassUnitTestRunOptions` remain exported from this package as they are shared types

## [0.1.12] - 2025-12-10

### Added
- **IAdtObject Interface - Metadata Reading**: Added `readMetadata()` method to `IAdtObject` interface
  - `readMetadata(config: Partial<TConfig>): Promise<TReadResult>` - Reads object metadata (characteristics: package, responsible, description, etc.)
  - For objects with source code (Class, Interface, Program), reads metadata separately from source code
  - For objects without source code (Domain, DataElement), may delegate to `read()` as `read()` already returns metadata
  - Returns state with metadata result in `metadataResult` field
- **IAdtObjectState - Metadata Result Field**: Added `metadataResult?: AxiosResponse` field to `IAdtObjectState`
  - Stores metadata read result from `readMetadata()` method
  - Contains object characteristics (package, responsible, description, etc.)

## [0.1.11] - 2025-12-10

### Changed
- **IAdtObjectConfig Interface - Common Fields**: Extended `IAdtObjectConfig` with common fields shared across all ADT object configurations
  - Added `packageName?: string` - Package name (required for create operations, optional for others)
  - Added `description?: string` - Description (required for create/validate operations, optional for others)
  - `transportRequest?: string` - Transport request (already existed)
  - All specific configuration types (e.g., `IAdtClassConfig`, `DomainBuilderConfig`) should extend `IAdtObjectConfig` to inherit these common fields

## [0.1.10] - 2025-12-10

### Added
- **IAdtObject Interface - Transport Request Reading**: Added `readTransport()` method to `IAdtObject` interface
  - `readTransport(config: Partial<TConfig>): Promise<TReadResult>` - Reads transport request information for the object
  - Returns state with transport result in `transportResult` field
  - Allows consumers to query transport request details for any ADT object

## [0.1.9] - 2025-12-10

### Changed
- **IAdtObject Interface - Unified Return Types**: All methods now return `Promise<TReadResult>` instead of mixed types
  - `validate()`: Changed from `Promise<AxiosResponse>` to `Promise<TReadResult>`
  - `check()`: Changed from `Promise<AxiosResponse>` to `Promise<TReadResult>`
  - `activate()`: Changed from `Promise<AxiosResponse>` to `Promise<TReadResult>`
  - `delete()`: Changed from `Promise<AxiosResponse>` to `Promise<TReadResult>`
  - This provides consistent return types across all IAdtObject methods
  - State types (e.g., `ClassBuilderState`) should include fields for all operation results

## [0.1.8] - 2025-12-10

### Added
- **ADT Object Error Codes**: Added `AdtObjectErrorCodes` constants for error handling
  - Constants for all IAdtObject operation errors: `OBJECT_NOT_FOUND`, `OBJECT_NOT_READY`, `VALIDATION_FAILED`, `CREATE_FAILED`, `UPDATE_FAILED`, `DELETE_FAILED`, `ACTIVATE_FAILED`, `CHECK_FAILED`, `LOCK_FAILED`, `UNLOCK_FAILED`
  - Allows consumers to catch specific errors by error code
  - Exported from package root: `import { AdtObjectErrorCodes } from '@mcp-abap-adt/interfaces'`

## [0.1.7] - 2025-12-10

### Added
- **Transport Request Builder Configuration Interface**: Added `ITransportBuilderConfig` interface
  - Configuration interface for Transport Request operations
  - Fields: `description`, `transportType`, `targetSystem`, `owner`, `transportNumber`
  - Located in `src/adt/ITransportBuilderConfig.ts`
  - Exported from package root: `import { ITransportBuilderConfig } from '@mcp-abap-adt/interfaces'`
- **Unit Test Builder Configuration Interfaces**: Added unit test configuration interfaces
  - `IUnitTestBuilderConfig` - Main configuration interface for unit test operations
    - Fields: `tests`, `options`, `runId`, `status`, `result`
  - `IClassUnitTestDefinition` - Interface for defining class unit tests
    - Fields: `containerClass`, `testClass`
  - `IClassUnitTestRunOptions` - Interface for unit test run options
    - Fields: `title`, `context`, `scope`, `riskLevel`, `duration`
  - Located in `src/adt/IUnitTestBuilderConfig.ts`
  - Exported from package root: `import { IUnitTestBuilderConfig, IClassUnitTestDefinition, IClassUnitTestRunOptions } from '@mcp-abap-adt/interfaces'`

## [0.1.6] - 2025-12-09

### Added
- **Unified Operation Options Interface**: Created `IAdtOperationOptions` interface
  - Unified interface for both create and update operations (replaces `CreateOptions` and `UpdateOptions`)
  - Includes all fields from both interfaces: `activateOnCreate`, `activateOnUpdate`, `deleteOnFailure`, `sourceCode`, `xmlContent`, `timeout`
  - `sourceCode` and `xmlContent` now available for update operations (previously only in create)
  - `timeout?: number` - Timeout for operations in milliseconds (default: 1000)
    - Prevents operation failures due to system not completing commands in time
    - Increase timeout for complex operations or slow systems

### Changed
- **Operation Options Interfaces**: Unified `CreateOptions` and `UpdateOptions` into `IAdtOperationOptions`
  - Both create and update operations now use the same interface
  - `sourceCode` and `xmlContent` are now available for update operations
  - Removed `lockHandle` field from update options (update operations always start with lock internally)
  - All interfaces now follow `I` prefix convention (`IAdtOperationOptions`)

### Removed
- **Deprecated Interfaces**: Removed `CreateOptions` and `UpdateOptions` interfaces
  - Replaced by unified `IAdtOperationOptions` interface
  - No backward compatibility maintained (version < 1.0.0)

## [0.1.5] - 2025-12-09

### Added
- **High-Level ADT Object Operations Interface**: Added `IAdtObject` interface for high-level CRUD operations
  - `IAdtObject<TConfig, TReadResult>` - Main interface for ADT object operations
  - Provides simplified CRUD operations with automatic operation chains, error handling, and resource cleanup
  - Methods: `validate()`, `create()`, `read()`, `update()`, `delete()`, `activate()`, `check()`
  - Supports full operation chains:
    - Create: validate → create → check → lock → check(inactive) → update → unlock → check → activate
    - Update: lock → check(inactive) → update → unlock → check → activate
    - Delete: check(deletion) → delete
- **Operation Options Interfaces**: Added options interfaces for create and update operations
  - `CreateOptions` - Options for create operations:
    - `activateOnCreate?: boolean` - Activate object after creation (default: false)
    - `deleteOnFailure?: boolean` - Delete object if creation fails (default: false)
    - `sourceCode?: string` - Source code to use for update after create
    - `xmlContent?: string` - XML content to use for update after create
  - `UpdateOptions` - Options for update operations:
    - `activateOnUpdate?: boolean` - Activate object after update (default: false)
    - `deleteOnFailure?: boolean` - Delete object if update fails (default: false)
    - `lockHandle?: string` - Lock handle if object is already locked
- **ADT Domain**: New domain for ADT client interfaces
  - All interfaces exported from `@mcp-abap-adt/interfaces` under ADT domain
  - Located in `src/adt/IAdtObject.ts`

## [0.1.4] - 2025-12-08

### Breaking Changes

- **Session State Methods Removed from IAbapConnection**: Removed session state management methods from connection interface
  - `getSessionState()` method removed from `IAbapConnection`
  - `setSessionState()` method removed from `IAbapConnection`
  - Session state management is no longer a responsibility of connection package
  - Connection package now focuses solely on HTTP communication
  - Session state persistence should be handled by higher-level packages (e.g., auth-broker)

### Changed

- **Connection Package Scope**: Updated `IAbapConnection` interface to reflect connection package responsibilities
  - Connection package handles only HTTP communication and session headers
  - Token refresh is not a responsibility of connection package - handled by `@mcp-abap-adt/auth-broker` package
  - Session state persistence is not part of connection package scope

### Migration Guide

If you were using session state methods:

**Before (0.1.x)**:
```typescript
const state = connection.getSessionState();
connection.setSessionState(state);
```

**After (0.1.4)**:
```typescript
// Session state management is now handled by auth-broker or other higher-level packages
// Connection package only handles HTTP communication
```

## [0.1.3] - 2025-12-07

### Added
- **Session ID Header Constants**: Added constants for session identification headers
  - `HEADER_SESSION_ID` - Standard session ID header (`x-session-id`)
  - `HEADER_MCP_SESSION_ID` - MCP session ID header (`mcp-session-id`)
  - `HEADER_X_MCP_SESSION_ID` - Extended MCP session ID header (`x-mcp-session-id`)
  - These constants are used for session identification in proxy requests

## [0.1.2] - 2025-12-07

### Added
- **HTTP Header Constants**: Added `Headers.ts` module with all HTTP header constants used across MCP ABAP ADT packages
  - Proxy routing headers: `HEADER_BTP_DESTINATION`, `HEADER_MCP_DESTINATION`, `HEADER_MCP_URL`
  - SAP ABAP connection headers: `HEADER_SAP_DESTINATION`, `HEADER_SAP_DESTINATION_SERVICE`, `HEADER_SAP_URL`, `HEADER_SAP_JWT_TOKEN`, `HEADER_SAP_AUTH_TYPE`, `HEADER_SAP_CLIENT`, `HEADER_SAP_LOGIN`, `HEADER_SAP_PASSWORD`, `HEADER_SAP_REFRESH_TOKEN`
  - UAA/XSUAA headers: `HEADER_SAP_UAA_URL`, `HEADER_UAA_URL`, `HEADER_SAP_UAA_CLIENT_ID`, `HEADER_UAA_CLIENT_ID`, `HEADER_SAP_UAA_CLIENT_SECRET`, `HEADER_UAA_CLIENT_SECRET`
  - Standard HTTP headers: `HEADER_AUTHORIZATION`, `HEADER_CONTENT_TYPE`, `HEADER_ACCEPT`
  - Header groups: `PROXY_ROUTING_HEADERS`, `SAP_CONNECTION_HEADERS`, `UAA_HEADERS`, `PRESERVED_HEADERS`, `PROXY_MODIFIED_HEADERS`
  - Authentication type constants: `AUTH_TYPE_JWT`, `AUTH_TYPE_BASIC`, `AUTH_TYPE_XSUAA`, `AUTH_TYPES`
  - Special constant `HEADER_SAP_DESTINATION_SERVICE` for SAP destination service on Cloud (URL automatically derived from service key)
- All header constants are exported from package root for easy import: `import { HEADER_SAP_DESTINATION } from '@mcp-abap-adt/interfaces'`

## [0.1.1] - 2024-12-04

### Changed
- **ILogger Interface**: Simplified to include only core logging methods (info, error, warn, debug)
  - Removed domain-specific methods (csrfToken, tlsConfig, browserAuth, refresh, success, browserUrl, browserOpening, testSkip)
  - Interface now focuses on universal logging capabilities without implementation-specific details
- **ITokenProviderOptions**: Enhanced documentation with detailed descriptions of browser and logger options

## [0.1.0] - 2025-12-04

### Added
- Initial release of interfaces package
- All interfaces from `@mcp-abap-adt/auth-broker`
- All interfaces from `@mcp-abap-adt/connection`
- All interfaces from `@mcp-abap-adt/header-validator`
- Interface renaming to follow `I` prefix convention:
  - `TokenProviderResult` → `ITokenProviderResult`
  - `TokenProviderOptions` → `ITokenProviderOptions`
  - `AbapConnection` → `IAbapConnection`
  - `AbapRequestOptions` → `IAbapRequestOptions`
  - `SapConfig` → `ISapConfig`
  - `SessionState` → `ISessionState`
  - `TokenRefreshResult` → `ITokenRefreshResult`
  - `TimeoutConfig` → `ITimeoutConfig`
  - `ValidatedAuthConfig` → `IValidatedAuthConfig`
  - `HeaderValidationResult` → `IHeaderValidationResult`
- Organized interfaces by domain:
  - `auth/` - Authentication interfaces
  - `token/` - Token-related interfaces
  - `session/` - Session storage interface
  - `serviceKey/` - Service key storage interface
  - `connection/` - Connection interfaces
  - `sap/` - SAP-specific configuration
  - `storage/` - Storage interfaces
  - `logging/` - Logging interfaces
  - `validation/` - Validation interfaces
  - `utils/` - Utility types and interfaces

[0.1.0]: https://github.com/fr0ster/mcp-abap-adt-interfaces/releases/tag/v0.1.0
