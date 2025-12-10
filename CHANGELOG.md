# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

