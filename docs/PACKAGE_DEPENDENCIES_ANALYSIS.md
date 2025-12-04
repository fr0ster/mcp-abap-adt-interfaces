# Package Dependencies Analysis

**Last Updated:** 2024-12-04  
**Status:** Active Analysis

---

## Overview

This document analyzes dependencies between **library packages** (`@mcp-abap-adt/*`) to ensure:
1. **Interfaces package has no runtime dependencies** (only devDependencies for TypeScript types)
2. **All library packages depend only on interfaces** (not on concrete implementations)
3. **No circular dependencies** exist between library packages
4. **Unnecessary dependencies are identified** and roadmap for elimination is provided

**Note:** This analysis focuses on **library packages only**. Consumer applications (e.g., `mcp-abap-adt`, `mcp-abap-adt-proxy`) are not analyzed as they are consumers and may have different dependency requirements.

---

## Core Principle

**Interface-Only Communication**: All packages must interact **ONLY through interfaces** defined in `@mcp-abap-adt/interfaces`. No package should know about concrete implementations from other packages.

---

## Library Packages Scope

**Library Packages Analyzed:**
- `@mcp-abap-adt/interfaces` - Interface definitions
- `@mcp-abap-adt/logger` - Logger implementation
- `@mcp-abap-adt/header-validator` - Header validation
- `@mcp-abap-adt/auth-stores` - Store implementations
- `@mcp-abap-adt/connection` - Connection layer
- `@mcp-abap-adt/auth-broker` - Authentication broker
- `@mcp-abap-adt/auth-providers` - Token providers
- `@mcp-abap-adt/adt-clients` - ADT clients

**Consumer Applications (Not Analyzed):**
- `mcp-abap-adt` - Main MCP server (consumer)
- `mcp-abap-adt-proxy` - Proxy server (consumer)

---

## Dependency Graph

### Current State (Library Packages Only)

```
@mcp-abap-adt/interfaces (v0.1.1)
├── No runtime dependencies ✅
└── devDependencies: @types/node, axios (for types), typescript

@mcp-abap-adt/logger (v0.1.0)
├── No dependencies ✅

@mcp-abap-adt/header-validator (v0.1.4)
├── @mcp-abap-adt/interfaces: ^0.1.0 ✅

@mcp-abap-adt/auth-stores (v0.1.3)
├── @mcp-abap-adt/interfaces: ^0.1.0 ✅
└── dotenv: ^17.2.1 (runtime dependency for .env file parsing)

@mcp-abap-adt/connection (v0.1.14)
├── @mcp-abap-adt/interfaces: ^0.1.0 ✅
└── Runtime dependencies: axios, commander, express, open

@mcp-abap-adt/auth-broker (v0.1.8)
├── @mcp-abap-adt/interfaces: ^0.1.0 ✅
├── @mcp-abap-adt/logger: ^0.1.0 ✅
└── @mcp-abap-adt/connection: ^0.1.14 ⚠️ (UNNECESSARY - see analysis below)

@mcp-abap-adt/auth-providers (v0.1.1)
├── @mcp-abap-adt/interfaces: ^0.1.1 ✅
├── @mcp-abap-adt/connection: ^0.1.14 ✅ (used for token validation)
├── @mcp-abap-adt/auth-stores: ^0.1.3 ⚠️ (ONLY in tests - should be devDependency)
├── @mcp-abap-adt/logger: ^0.1.0 ✅
└── Runtime dependencies: axios, express, open

@mcp-abap-adt/adt-clients (v0.1.35)
├── @mcp-abap-adt/interfaces: ^0.1.1 ✅
└── Runtime dependencies: axios, fast-xml-parser, yaml
└── devDependencies: @mcp-abap-adt/connection (for tests only) ✅
```

---

## Detailed Analysis

### ✅ `@mcp-abap-adt/interfaces` (v0.1.1)

**Dependencies:**
- **Runtime dependencies:** None ✅
- **devDependencies:** 
  - `@types/node: ^24.2.1` ✅ (TypeScript types)
  - `axios: ^1.11.0` ✅ (used only for type reference in `IAbapConnection.ts` - `AxiosResponse` type)
  - `typescript: ^5.9.2` ✅ (build tool)

**Analysis:**
- ✅ **No runtime dependencies** - package contains only TypeScript interfaces
- ✅ **axios in devDependencies** - used only for type reference (`export type AxiosResponse = any;`), not imported
- ✅ **Clean package** - follows principle of interface-only package

**Recommendation:** ✅ **No changes needed**

---

### ✅ `@mcp-abap-adt/logger` (v0.1.0)

**Dependencies:**
- **Runtime dependencies:** None ✅
- **devDependencies:** Standard TypeScript tooling

**Analysis:**
- ✅ **No dependencies** - standalone logger implementation
- ✅ **Clean package**

**Recommendation:** ✅ **No changes needed**

---

### ✅ `@mcp-abap-adt/header-validator` (v0.1.4)

**Dependencies:**
- **Runtime dependencies:** 
  - `@mcp-abap-adt/interfaces: ^0.1.0` ✅
- **devDependencies:** Standard TypeScript tooling

**Analysis:**
- ✅ **Only depends on interfaces** - follows principle
- ✅ **No concrete implementation dependencies**

**Recommendation:** ✅ **No changes needed**

---

### ✅ `@mcp-abap-adt/auth-stores` (v0.1.3)

**Dependencies:**
- **Runtime dependencies:** 
  - `@mcp-abap-adt/interfaces: ^0.1.0` ✅
  - `dotenv: ^17.2.1` ✅ (legitimate runtime dependency for .env file parsing)
- **devDependencies:** Standard TypeScript tooling

**Analysis:**
- ✅ **Only depends on interfaces** - follows principle
- ✅ **dotenv is legitimate** - needed for parsing .env files

**Recommendation:** ✅ **No changes needed**

---

### ✅ `@mcp-abap-adt/connection` (v0.1.14)

**Dependencies:**
- **Runtime dependencies:** 
  - `@mcp-abap-adt/interfaces: ^0.1.0` ✅
  - `axios: ^1.11.0` ✅ (HTTP client)
  - `commander: ^14.0.2` ✅ (CLI tool)
  - `express: ^5.1.0` ✅ (HTTP server for auth flow)
  - `open: ^11.0.0` ✅ (browser opening)
- **devDependencies:** Standard TypeScript tooling

**Analysis:**
- ✅ **Only depends on interfaces** - follows principle
- ✅ **All runtime dependencies are legitimate** - needed for connection functionality

**Recommendation:** ✅ **No changes needed**

---

### ⚠️ `@mcp-abap-adt/auth-broker` (v0.1.8)

**Dependencies:**
- **Runtime dependencies:** 
  - `@mcp-abap-adt/interfaces: ^0.1.0` ✅
  - `@mcp-abap-adt/logger: ^0.1.0` ✅
  - `@mcp-abap-adt/connection: ^0.1.14` ⚠️ **UNNECESSARY**

**Code Analysis:**
- ✅ **No imports from `@mcp-abap-adt/connection`** in source code
- ✅ **Uses only interfaces** from `@mcp-abap-adt/interfaces`
- ✅ **Uses logger** from `@mcp-abap-adt/logger`

**Problem:**
- ⚠️ **`@mcp-abap-adt/connection` is listed as dependency but not used**
- This creates unnecessary coupling and increases bundle size

**Recommendation:** 
- ❌ **Remove `@mcp-abap-adt/connection` from dependencies**
- ✅ **Keep only `@mcp-abap-adt/interfaces` and `@mcp-abap-adt/logger`**

**Action Required:** See [Roadmap: Eliminate Unnecessary Dependencies](#roadmap-eliminate-unnecessary-dependencies)

---

### ⚠️ `@mcp-abap-adt/auth-providers` (v0.1.1)

**Dependencies:**
- **Runtime dependencies:** 
  - `@mcp-abap-adt/interfaces: ^0.1.1` ✅
  - `@mcp-abap-adt/connection: ^0.1.14` ✅ (used for token validation)
  - `@mcp-abap-adt/auth-stores: ^0.1.3` ⚠️ **ONLY in tests**
  - `@mcp-abap-adt/logger: ^0.1.0` ✅
  - `axios: ^1.11.0` ✅
  - `express: ^5.1.0` ✅
  - `open: ^11.0.0` ✅

**Code Analysis:**
- ✅ **Uses `@mcp-abap-adt/connection`** for token validation (legitimate)
- ⚠️ **Uses `@mcp-abap-adt/auth-stores`** ONLY in integration tests:
  - `src/__tests__/providers/BtpTokenProvider.integration.test.ts`
  - `src/__tests__/providers/XsuaaTokenProvider.integration.test.ts`
  - `src/__tests__/providers/AbapTokenProvider.integration.test.ts`

**Problem:**
- ⚠️ **`@mcp-abap-adt/auth-stores` should be in `devDependencies`**, not `dependencies`
- Integration tests need stores, but production code doesn't

**Recommendation:**
- ❌ **Move `@mcp-abap-adt/auth-stores` to `devDependencies`**
- ✅ **Keep `@mcp-abap-adt/connection` in dependencies** (used for token validation)

**Action Required:** See [Roadmap: Eliminate Unnecessary Dependencies](#roadmap-eliminate-unnecessary-dependencies)

---

### ✅ `@mcp-abap-adt/adt-clients` (v0.1.35)

**Dependencies:**
- **Runtime dependencies:** 
  - `@mcp-abap-adt/interfaces: ^0.1.1` ✅
  - `axios: ^1.11.0` ✅
  - `fast-xml-parser: ^5.2.5` ✅
  - `yaml: ^2.3.4` ✅
- **devDependencies:** 
  - `@mcp-abap-adt/connection: ^0.1.14` ✅ (only for tests)

**Analysis:**
- ✅ **Only depends on interfaces** in runtime dependencies
- ✅ **connection in devDependencies** - used only for tests
- ✅ **All runtime dependencies are legitimate**

**Recommendation:** ✅ **No changes needed**

---

## Summary of Issues (Library Packages Only)

### Critical Issues

1. **`@mcp-abap-adt/auth-broker`** has unnecessary dependency on `@mcp-abap-adt/connection`
   - **Impact:** Unnecessary coupling, larger bundle size
   - **Priority:** High
   - **Effort:** Low (just remove from package.json)

2. **`@mcp-abap-adt/auth-providers`** has `@mcp-abap-adt/auth-stores` in dependencies instead of devDependencies
   - **Impact:** Unnecessary runtime dependency, larger bundle size
   - **Priority:** Medium
   - **Effort:** Low (move to devDependencies)

### No Issues Found

- ✅ `@mcp-abap-adt/interfaces` - clean, no runtime dependencies
- ✅ `@mcp-abap-adt/logger` - no dependencies
- ✅ `@mcp-abap-adt/header-validator` - only interfaces
- ✅ `@mcp-abap-adt/auth-stores` - only interfaces + legitimate dotenv
- ✅ `@mcp-abap-adt/connection` - only interfaces + legitimate runtime deps
- ✅ `@mcp-abap-adt/adt-clients` - only interfaces + legitimate runtime deps

---

## Roadmap: Eliminate Unnecessary Dependencies

### Phase 1: Remove `@mcp-abap-adt/connection` from `auth-broker`

**Package:** `@mcp-abap-adt/auth-broker`  
**Current Version:** `0.1.8`  
**Target Version:** `0.1.9`

**Steps:**
1. ✅ Verify no imports from `@mcp-abap-adt/connection` in source code
2. Remove `@mcp-abap-adt/connection` from `dependencies` in `package.json`
3. Run `npm install` to update `package-lock.json`
4. Run `npm run build` to verify compilation
5. Run `npm test` to verify tests pass
6. Update `CHANGELOG.md` with removal
7. Update version to `0.1.9`
8. Publish new version

**Estimated Time:** 15 minutes

**Files to Modify:**
- `package.json` - remove dependency
- `CHANGELOG.md` - document change
- `package-lock.json` - will be auto-updated

---

### Phase 2: Move `@mcp-abap-adt/auth-stores` to devDependencies in `auth-providers`

**Package:** `@mcp-abap-adt/auth-providers`  
**Current Version:** `0.1.1`  
**Target Version:** `0.1.2`

**Steps:**
1. ✅ Verify `@mcp-abap-adt/auth-stores` is only used in tests
2. Remove `@mcp-abap-adt/auth-stores` from `dependencies` in `package.json`
3. Add `@mcp-abap-adt/auth-stores` to `devDependencies` in `package.json`
4. Run `npm install` to update `package-lock.json`
5. Run `npm run build` to verify compilation
6. Run `npm test` to verify tests pass (integration tests need stores)
7. Update `CHANGELOG.md` with change
8. Update version to `0.1.2`
9. Publish new version

**Estimated Time:** 15 minutes

**Files to Modify:**
- `package.json` - move dependency to devDependencies
- `CHANGELOG.md` - document change
- `package-lock.json` - will be auto-updated

---

## Verification Checklist

After implementing the roadmap, verify:

- [ ] `auth-broker` builds without `connection` dependency
- [ ] `auth-broker` tests pass
- [ ] `auth-providers` builds with `auth-stores` in devDependencies
- [ ] `auth-providers` integration tests pass (they need stores)
- [ ] All packages that depend on `auth-broker` and `auth-providers` still work
- [ ] No circular dependencies introduced
- [ ] Bundle sizes are reduced

---

## Dependency Principles

### ✅ Allowed Dependencies

1. **Interfaces package** (`@mcp-abap-adt/interfaces`)
   - All packages can depend on this
   - No runtime dependencies allowed

2. **Logger package** (`@mcp-abap-adt/logger`)
   - Can be used by any package that needs logging
   - No dependencies itself

3. **Third-party packages** (axios, express, etc.)
   - Allowed if needed for functionality
   - Should be minimal and well-justified

### ❌ Forbidden Dependencies

1. **Concrete implementations** from other packages
   - Example: `auth-broker` should NOT depend on `auth-stores` implementations
   - Example: `auth-providers` should NOT depend on `auth-broker` implementations

2. **Packages not used in production code**
   - Should be in `devDependencies` if only used in tests
   - Example: `auth-stores` in `auth-providers` (only in tests)

3. **Unused dependencies**
   - Remove if not imported anywhere in source code
   - Example: `connection` in `auth-broker`

---

## Future Considerations

### Potential Improvements

1. **Consider extracting token validation** from `connection` to a separate utility
   - Would allow `auth-providers` to validate tokens without depending on full `connection` package
   - Low priority - current dependency is legitimate

2. **Consider creating a lightweight validation package**
   - If multiple packages need token validation
   - Would reduce coupling further

3. **Monitor bundle sizes**
   - Track bundle size changes after dependency removals
   - Ensure improvements are measurable

---

## Conclusion

**Current State (Library Packages Only):**
- ✅ **6 out of 8 library packages** follow dependency principles correctly
- ⚠️ **2 library packages** have unnecessary dependencies (both easy to fix)

**After Roadmap Implementation:**
- ✅ **All 8 library packages** will follow dependency principles
- ✅ **No unnecessary dependencies** will remain
- ✅ **Cleaner dependency graph** with minimal coupling between library packages

**Note:** Consumer applications (`mcp-abap-adt`, `mcp-abap-adt-proxy`) are not part of this analysis as they may have different dependency requirements and are not library packages.

**Recommendation:** ✅ **Proceed with roadmap implementation** - both fixes are low-effort and high-value.

