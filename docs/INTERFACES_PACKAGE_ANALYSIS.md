# Analysis: Extracting Interfaces to Separate Package

## Overview

This document analyzes the feasibility and benefits of extracting all interfaces from various packages into a single dedicated package `@mcp-abap-adt/interfaces`.

## Current State

### Interfaces by Package

#### 1. `@mcp-abap-adt/auth-broker`

**Core Authentication Interfaces:**
- `IAuthorizationConfig` - Authorization values (UAA credentials, refresh token)
- `IConnectionConfig` - Connection values (service URL, token, client, language)
- `IConfig` - Composition type: `Partial<IAuthorizationConfig> & Partial<IConnectionConfig>`
- `IServiceKeyStore` - Interface for service key storage
- `ISessionStore` - Interface for session storage
- `ITokenProvider` - Interface for token providers
- `TokenProviderResult` - Result from token provider
- `TokenProviderOptions` - Options for token providers

**Usage:**
- Used by: `auth-stores`, `auth-providers`, `mcp-abap-adt` (main server)
- Exported from: `src/stores/interfaces.ts`, `src/providers/ITokenProvider.ts`, `src/types.ts`

#### 2. `@mcp-abap-adt/connection`

**Connection Interfaces:**
- `SapConfig` - SAP connection configuration
- `SapAuthType` - Authentication type: `"basic" | "jwt"`
- `AbapConnection` - Main connection interface
- `AbapRequestOptions` - Request options for ADT operations
- `ILogger` - Logger interface
- `ISessionStorage` - Session storage interface
- `SessionState` - Session state structure
- `TokenRefreshResult` - Token refresh result
- `TimeoutConfig` - Timeout configuration

**Usage:**
- Used by: `adt-clients`, `mcp-abap-adt` (main server), `auth-providers`
- Exported from: `src/config/sapConfig.ts`, `src/connection/AbapConnection.ts`, `src/logger.ts`

#### 3. `@mcp-abap-adt/adt-clients`

**Client Interfaces:**
- `IBuilder` - Base builder interface
- `BaseBuilderState` - Base state for builders
- Multiple builder-specific interfaces (ClassBuilder, ProgramBuilder, etc.)
- `IAdtLogger` - ADT-specific logger interface
- `LockState`, `LockRegistry` - Lock management interfaces

**Usage:**
- Used by: `mcp-abap-adt` (main server)
- Mostly internal to clients package

#### 4. `@mcp-abap-adt/header-validator`

**Validation Interfaces:**
- `ValidatedAuthConfig` - Validated authentication configuration
- `HeaderValidationResult` - Header validation result
- `AuthType` - Authentication type: `'jwt' | 'xsuaa' | 'basic'`

**Usage:**
- Used by: `mcp-abap-adt` (main server)
- Mostly internal to header-validator package

## Proposed Structure

### New Package: `@mcp-abap-adt/interfaces`

**Grouping by Purpose (not by source package):**

```
@mcp-abap-adt/interfaces/
├── src/
│   ├── auth/
│   │   ├── IAuthorizationConfig.ts      # Authorization values (UAA, refresh token)
│   │   ├── IConnectionConfig.ts         # Connection values (URL, token, client)
│   │   ├── IConfig.ts                   # Composition of auth + connection config
│   │   └── AuthType.ts                  # Auth type: 'jwt' | 'xsuaa' | 'basic'
│   ├── token/
│   │   ├── ITokenProvider.ts            # Token provider interface
│   │   ├── TokenProviderResult.ts       # Token provider result
│   │   ├── TokenProviderOptions.ts      # Token provider options
│   │   └── TokenRefreshResult.ts        # Token refresh result
│   ├── session/
│   │   └── ISessionStore.ts             # Session storage interface
│   ├── serviceKey/
│   │   └── IServiceKeyStore.ts          # Service key storage interface
│   ├── connection/
│   │   ├── AbapConnection.ts            # Main connection interface
│   │   └── AbapRequestOptions.ts        # Request options for ADT operations
│   ├── sap/
│   │   ├── SapConfig.ts                 # SAP connection configuration
│   │   └── SapAuthType.ts               # Authentication type: "basic" | "jwt"
│   ├── storage/
│   │   ├── ISessionStorage.ts           # Session storage interface
│   │   └── SessionState.ts               # Session state structure
│   ├── logging/
│   │   └── ILogger.ts                   # Logger interface
│   ├── validation/
│   │   ├── ValidatedAuthConfig.ts       # Validated authentication configuration
│   │   └── HeaderValidationResult.ts    # Header validation result
│   ├── utils/
│   │   └── TimeoutConfig.ts             # Timeout configuration
│   └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

**Grouping Logic:**
- **`auth/`** - Core authentication interfaces (configs, auth types)
- **`token/`** - Token-related interfaces (token provider, provider results, refresh results, options)
- **`session/`** - Session storage interface
- **`serviceKey/`** - Service key storage interface
- **`connection/`** - Connection interfaces (AbapConnection, request options)
- **`sap/`** - SAP-specific configuration (SapConfig, SapAuthType)
- **`storage/`** - Storage interfaces (session storage, state)
- **`logging/`** - Logging interfaces
- **`validation/`** - Validation interfaces
- **`utils/`** - Utility types and interfaces

## Benefits

### 1. Single Source of Truth
- **All interfaces in one place**: No duplication, clear ownership
- **Version management**: Single version for all interfaces
- **Consistency**: Guaranteed consistency across packages

### 2. Dependency Management
- **Clear dependencies**: Packages depend on interfaces, not on each other
- **Reduced coupling**: Packages don't need to import from each other for interfaces
- **Easier updates**: Interface changes in one place affect all packages consistently

### 3. Type Safety
- **Shared types**: All packages use the same type definitions
- **Compile-time checks**: TypeScript ensures interface compatibility
- **Better IDE support**: Autocomplete and type checking work across packages

### 4. Testing
- **Easier mocking**: Mock implementations can be created once and reused
- **Test utilities**: Shared test interfaces and mocks
- **Consistency**: All tests use the same interface definitions

### 5. Documentation
- **Centralized docs**: All interfaces documented in one place
- **Clear contracts**: Easy to see what interfaces are available
- **Version history**: Clear history of interface changes

### 6. Development Workflow
- **Parallel development**: Teams can work on different packages without conflicts
- **Interface-first design**: Design interfaces first, then implement
- **Clear boundaries**: Clear separation between interface definitions and implementations

## Challenges

### 1. Migration Complexity
- **Breaking changes**: All packages need to be updated simultaneously
- **Version coordination**: Need to coordinate versions across packages
- **Testing**: Extensive testing required to ensure compatibility

### 2. Circular Dependencies Risk
- **Dependency graph**: Need to ensure no circular dependencies
- **Build order**: Packages must build in correct order
- **Type resolution**: TypeScript must resolve types correctly

### 3. Version Management
- **Semantic versioning**: Interface changes affect all packages
- **Breaking changes**: Need careful versioning strategy
- **Backward compatibility**: May need to maintain old interfaces temporarily

### 4. Package Size
- **Minimal package**: Should contain only interfaces, no implementations
- **Tree shaking**: Ensure unused interfaces can be tree-shaken
- **Bundle size**: Minimal impact on bundle size

## Migration Plan

### Phase 1: Create Interfaces Package
1. Create new repository `mcp-abap-adt-interfaces`
2. Set up package structure with TypeScript configuration
3. Copy all interfaces from existing packages
4. **Rename interfaces** to follow `I` prefix convention (see [Interface Renaming Convention](#interface-renaming-convention))
5. Organize interfaces by domain (auth, token, session, serviceKey, connection, sap, storage, logging, validation, utils)
6. Create comprehensive README and documentation
7. Publish initial version (e.g., `0.1.0`)

### Phase 2: Update Packages to Use Interfaces Package
1. **auth-broker**: 
   - Remove interface definitions, import from `@mcp-abap-adt/interfaces`
   - Update interface names (e.g., `TokenProviderResult` → `ITokenProviderResult`)
2. **connection**: 
   - Remove interface definitions, import from `@mcp-abap-adt/interfaces`
   - Update interface names (e.g., `AbapConnection` → `IAbapConnection`, `SapConfig` → `ISapConfig`)
3. **header-validator**: 
   - Remove interface definitions, import from `@mcp-abap-adt/interfaces`
   - Update interface names (e.g., `ValidatedAuthConfig` → `IValidatedAuthConfig`)
4. **auth-stores**: Update imports to use `@mcp-abap-adt/interfaces` with new names
5. **auth-providers**: Update imports to use `@mcp-abap-adt/interfaces` with new names
6. **adt-clients**: Update imports to use `@mcp-abap-adt/interfaces` with new names

### Phase 3: Update Main Server
1. **mcp-abap-adt**: Update all imports to use `@mcp-abap-adt/interfaces`
2. Update all type references
3. Test thoroughly

### Phase 4: Cleanup
1. Remove duplicate interface definitions from all packages
2. Update documentation
3. Update CHANGELOG files
4. Tag new versions

## Interface Renaming Convention

**Rule**: All interfaces must start with `I` prefix (e.g., `IAbapConnection`, `ISapConfig`).

This ensures consistency across all packages and follows TypeScript naming conventions for interfaces.

### Interface Renaming Table

| Old Name | New Name | Source Package | Notes |
|----------|----------|---------------|-------|
| `TokenProviderResult` | `ITokenProviderResult` | `auth-broker` | Interface for token provider result |
| `TokenProviderOptions` | `ITokenProviderOptions` | `auth-broker` | Interface for token provider options |
| `AbapConnection` | `IAbapConnection` | `connection` | Main connection interface |
| `AbapRequestOptions` | `IAbapRequestOptions` | `connection` | Request options interface |
| `SapConfig` | `ISapConfig` | `connection` | SAP configuration interface |
| `SessionState` | `ISessionState` | `connection` | Session state interface |
| `TokenRefreshResult` | `ITokenRefreshResult` | `connection` | Token refresh result interface |
| `FileSessionStorageOptions` | `IFileSessionStorageOptions` | `connection` | File session storage options |
| `TimeoutConfig` | `ITimeoutConfig` | `connection` | Timeout configuration interface |
| `ValidatedAuthConfig` | `IValidatedAuthConfig` | `header-validator` | Validated auth config interface |
| `HeaderValidationResult` | `IHeaderValidationResult` | `header-validator` | Header validation result interface |

### Interfaces Already Following Convention

These interfaces already start with `I` and don't need renaming:
- `IAuthorizationConfig` (auth-broker)
- `IConnectionConfig` (auth-broker)
- `IServiceKeyStore` (auth-broker)
- `ISessionStore` (auth-broker)
- `ITokenProvider` (auth-broker)
- `ILogger` (connection)
- `ISessionStorage` (connection)

### Types (Not Interfaces)

These are type aliases, not interfaces, so they don't need `I` prefix:
- `IConfig` (auth-broker) - type alias
- `SapAuthType` (connection) - type alias
- `AuthType` (header-validator) - type alias

### Migration Steps for Renaming

1. **In interfaces package**: Create interfaces with new names (with `I` prefix)
2. **In source packages**: Add type aliases for backward compatibility:
   ```typescript
   // Temporary backward compatibility
   export type TokenProviderResult = ITokenProviderResult;
   export type AbapConnection = IAbapConnection;
   // etc.
   ```
3. **Update all packages**: Replace old names with new names
4. **Remove backward compatibility aliases**: After all packages are updated
5. **Update documentation**: Reflect new interface names

## Dependency Graph

### Current State
```
auth-broker (defines interfaces)
├── auth-stores (imports from auth-broker)
├── auth-providers (imports from auth-broker)
└── mcp-abap-adt (imports from auth-broker)

connection (defines interfaces)
├── adt-clients (imports from connection)
├── auth-providers (imports from connection)
└── mcp-abap-adt (imports from connection)

header-validator (defines interfaces)
└── mcp-abap-adt (imports from header-validator)
```

### Proposed State
```
interfaces (defines all interfaces)
├── auth-broker (imports from interfaces)
├── auth-stores (imports from interfaces)
├── auth-providers (imports from interfaces)
├── connection (imports from interfaces)
├── adt-clients (imports from interfaces)
├── header-validator (imports from interfaces)
└── mcp-abap-adt (imports from interfaces)
```

## Interface Categorization by Purpose

### Authentication Domain (`auth/`)
**Purpose**: Core authentication interfaces (configs, auth types)
- `IAuthorizationConfig` - Authorization values (UAA credentials, refresh token)
- `IConnectionConfig` - Connection values (service URL, token, client, language)
- `IConfig` - Composition of authorization and connection config
- `AuthType` - Auth type: `'jwt' | 'xsuaa' | 'basic'`

### Token Domain (`token/`)
**Purpose**: Token-related interfaces (provider, results, options)
- `ITokenProvider` - Token provider interface
- `TokenProviderResult` - Result from token provider
- `TokenProviderOptions` - Options for token providers
- `TokenRefreshResult` - Token refresh result

### Session Domain (`session/`)
**Purpose**: Session storage interface
- `ISessionStore` - Session storage interface (loads/saves session data)

### Service Key Domain (`serviceKey/`)
**Purpose**: Service key storage interface
- `IServiceKeyStore` - Service key storage interface (loads service keys)

### Connection Domain (`connection/`)
**Purpose**: Connection and request handling
- `AbapConnection` - Main connection interface for ADT operations
- `AbapRequestOptions` - Request options for ADT operations

### SAP Domain (`sap/`)
**Purpose**: SAP-specific configuration types
- `SapConfig` - SAP connection configuration
- `SapAuthType` - Authentication type: `"basic" | "jwt"`

### Storage Domain (`storage/`)
**Purpose**: Storage and state management
- `ISessionStorage` - Session storage interface
- `SessionState` - Session state structure (cookies, CSRF tokens)

### Logging Domain (`logging/`)
**Purpose**: Logging interfaces
- `ILogger` - Logger interface

### Validation Domain (`validation/`)
**Purpose**: Validation and header processing
- `ValidatedAuthConfig` - Validated authentication configuration
- `HeaderValidationResult` - Header validation result

### Utilities Domain (`utils/`)
**Purpose**: Utility types and helper interfaces
- `TimeoutConfig` - Timeout configuration

## Recommendations

### ✅ Recommended Approach

1. **Create interfaces package**: Single source of truth for all interfaces
2. **Gradual migration**: Migrate packages one by one to minimize risk
3. **Version strategy**: Use semantic versioning with clear breaking change policy
4. **Documentation**: Comprehensive documentation for all interfaces
5. **Testing**: Extensive testing during migration

### ⚠️ Considerations

1. **Breaking changes**: All packages need coordinated version updates
2. **Migration timeline**: Plan for 2-3 weeks for complete migration
3. **Testing**: Extensive integration testing required
4. **Documentation**: Update all package documentation

## Next Steps

1. **Review this analysis** with the team
2. **Create GitHub repository** for `@mcp-abap-adt/interfaces`
3. **Set up package structure** with TypeScript configuration
4. **Create initial version** with interfaces from `auth-broker`
5. **Plan migration timeline** for all packages
6. **Execute migration** following the phased approach

## Conclusion

Extracting interfaces to a separate package provides significant benefits:
- **Single source of truth** for all interfaces
- **Better dependency management** and reduced coupling
- **Improved type safety** and consistency
- **Easier testing** and mocking
- **Clearer documentation** and contracts

The main challenges are:
- **Migration complexity** requiring coordinated updates
- **Version management** across multiple packages
- **Testing effort** to ensure compatibility

**Recommendation**: Proceed with the extraction, following a phased migration approach to minimize risk.

