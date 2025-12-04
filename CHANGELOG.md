# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

