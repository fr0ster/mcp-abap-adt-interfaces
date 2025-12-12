# @mcp-abap-adt/interfaces

Shared interfaces for MCP ABAP ADT packages.

This package provides all TypeScript interfaces used across the MCP ABAP ADT ecosystem, ensuring consistency and type safety across all packages.

## Installation

```bash
npm install @mcp-abap-adt/interfaces
```

## Overview

This package contains all interfaces organized by domain:

- **`adt/`** - ADT object operations interfaces (IAdtObject, operation options, error codes)
- **`auth/`** - Core authentication interfaces (configs, auth types)
- **`token/`** - Token-related interfaces (token provider, results, options)
- **`session/`** - Session storage interface
- **`serviceKey/`** - Service key storage interface
- **`connection/`** - Connection interfaces (AbapConnection, request options)
- **`sap/`** - SAP-specific configuration (SapConfig, SapAuthType)
- **`storage/`** - Storage interfaces (session storage, state)
- **`logging/`** - Logging interfaces (ILogger, LogLevel enum)
- **`validation/`** - Validation interfaces
- **`utils/`** - Utility types and interfaces

## Interface Naming Convention

**All interfaces start with `I` prefix** (e.g., `IAbapConnection`, `ISapConfig`, `ITokenProvider`).

This ensures consistency across all packages and follows TypeScript naming conventions for interfaces.

## Usage

### Basic Imports

```typescript
import {
  IAuthorizationConfig,
  IConnectionConfig,
  ISessionStore,
  IServiceKeyStore,
  ITokenProvider,
  IAbapConnection,
  ISapConfig,
  ILogger
} from '@mcp-abap-adt/interfaces';
```

### ADT Object Operations

```typescript
import {
  IAdtObject,
  IAdtOperationOptions,
  AdtObjectErrorCodes,
  LogLevel
} from '@mcp-abap-adt/interfaces';

// Example: Read with long polling
const domain = await adtDomain.read(
  { domainName: 'Z_TEST' },
  'active',
  { withLongPolling: true } // Wait until object is available
);

// Example: Read metadata with long polling
const metadata = await adtDomain.readMetadata(
  { domainName: 'Z_TEST' },
  { withLongPolling: true }
);
```

## Responsibilities and Design Principles

### Core Development Principle

**Interface-Only Communication**: This package defines **interfaces only**. It contains no implementations, no dependencies on other packages (except type-only imports), and serves as the single source of truth for all interface definitions.

### Package Responsibilities

This package is responsible for:

1. **Defining interfaces**: Provides all TypeScript interfaces used across MCP ABAP ADT packages
2. **Type safety**: Ensures consistent type definitions across all packages
3. **Version management**: Single version for all interfaces
4. **Documentation**: Centralized documentation for all interfaces

#### What This Package Does

- **Defines interfaces**: All interfaces used across MCP ABAP ADT packages
- **Organizes by domain**: Interfaces grouped by functional domain
- **Follows naming convention**: All interfaces start with `I` prefix
- **Type-only exports**: No runtime code, only type definitions

#### What This Package Does NOT Do

- **Does NOT implement anything**: This is a type-only package
- **Does NOT have runtime dependencies**: Only devDependencies for TypeScript compilation
- **Does NOT know about implementations**: Interfaces are independent of implementations

## Interface Domains

### ADT Domain (`adt/`)
- `IAdtObject<TConfig, TReadResult>` - High-level ADT object operations interface
  - Provides simplified CRUD operations with automatic operation chains, error handling, and resource cleanup
  - Methods: `validate()`, `create()`, `read()`, `readMetadata()`, `readTransport()`, `update()`, `delete()`, `activate()`, `check()`
  - All read methods support optional `withLongPolling` parameter for waiting until object becomes available
  - Supports full operation chains:
    - Create: validate → create → check → lock → check(inactive) → update → unlock → check → activate
    - Update: lock → check(inactive) → update → unlock → check → activate
    - Delete: check(deletion) → delete
- `IAdtOperationOptions` - Unified options for create and update operations
  - Fields: `activateOnCreate`, `activateOnUpdate`, `deleteOnFailure`, `sourceCode`, `xmlContent`, `timeout`
- `AdtObjectErrorCodes` - Error code constants for ADT object operations
  - Constants: `OBJECT_NOT_FOUND`, `OBJECT_NOT_READY`, `VALIDATION_FAILED`, `CREATE_FAILED`, `UPDATE_FAILED`, `DELETE_FAILED`, `ACTIVATE_FAILED`, `CHECK_FAILED`, `LOCK_FAILED`, `UNLOCK_FAILED`
- `IAdtObjectState` - Base state interface for ADT object operations
  - Fields: `validationResponse`, `createResult`, `lockHandle`, `updateResult`, `checkResult`, `unlockResult`, `activateResult`, `deleteResult`, `readResult`, `metadataResult`, `transportResult`, `errors`
- `IAdtObjectConfig` - Base configuration interface for ADT objects
  - Common fields: `packageName`, `description`, `transportRequest`

### Authentication Domain (`auth/`)
- `IAuthorizationConfig` - Authorization values (UAA credentials, refresh token)
- `IConnectionConfig` - Connection values (service URL, token, client, language)
- `IConfig` - Composition of authorization and connection config
- `AuthType` - Auth type: `'jwt' | 'xsuaa' | 'basic'`

### Token Domain (`token/`)
- `ITokenProvider` - Token provider interface
- `ITokenProviderResult` - Result from token provider
- `ITokenProviderOptions` - Options for token providers

### Session Domain (`session/`)
- `ISessionStore` - Session storage interface

### Service Key Domain (`serviceKey/`)
- `IServiceKeyStore` - Service key storage interface

### Connection Domain (`connection/`)
- `IAbapConnection` - Main connection interface for ADT operations
  - Handles HTTP communication with SAP systems
  - Manages session headers (stateful/stateless mode via `setSessionType()`)
  - Note: Token refresh and session state persistence are handled by other packages (e.g., auth-broker)
- `IAbapRequestOptions` - Request options for ADT operations

### SAP Domain (`sap/`)
- `ISapConfig` - SAP connection configuration
- `SapAuthType` - Authentication type: `"basic" | "jwt"`

### Storage Domain (`storage/`)
- `ISessionStorage` - Session storage interface
- `ISessionState` - Session state structure

### Logging Domain (`logging/`)
- `ILogger` - Logger interface
- `LogLevel` - Log level enum (`ERROR = 0`, `WARN = 1`, `INFO = 2`, `DEBUG = 3`)
  - Exported from package root: `import { LogLevel } from '@mcp-abap-adt/interfaces'`

### Validation Domain (`validation/`)
- `IValidatedAuthConfig` - Validated authentication configuration
- `IHeaderValidationResult` - Header validation result
- `AuthMethodPriority` - Authentication method priority enum

### Utilities Domain (`utils/`)
- `ITokenRefreshResult` - Token refresh result
- `ITimeoutConfig` - Timeout configuration

## Dependencies

This package has **no runtime dependencies**. It only has devDependencies for TypeScript compilation:
- `typescript` - TypeScript compiler
- `@types/node` - Node.js type definitions
- `axios` - For AxiosResponse type (dev dependency only)

## Documentation

- **[Package Dependencies Analysis](docs/PACKAGE_DEPENDENCIES_ANALYSIS.md)** - Analysis of dependencies between all `@mcp-abap-adt/*` packages, verification that interfaces package has no runtime dependencies, and roadmap for eliminating unnecessary dependencies

## License

MIT

