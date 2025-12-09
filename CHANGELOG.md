# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

