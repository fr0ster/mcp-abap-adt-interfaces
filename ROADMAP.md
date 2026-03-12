# Roadmap: Typed CRUD Parameter Interfaces for All ADT Objects

## Goal

Every ADT object type must have four dedicated parameter interfaces in `@mcp-abap-adt/interfaces`:

- `ICreateXxxParams` — required fields for creation
- `IReadXxxParams` — object name + optional version/options
- `IUpdateXxxParams` — all fields optional (read-modify-write pattern)
- `IDeleteXxxParams` — object name + optional transport_request

**Naming convention:** all fields snake_case (low-level API layer).
**Location:** `src/adt/IAdtXxx.ts`, one file per object type.

---

## PR #0 — Package interfaces (current state)

**Branch:** `feat/package-params-interfaces`

Adds `src/adt/IAdtPackage.ts` with:
- `ICreatePackageParams` — `record_changes: boolean` required (must be explicit on create)
- `IUpdatePackageParams` — `record_changes?: boolean` optional (read-modify-write)
- `IDeletePackageParams` — `package_name` + optional `transport_request`

Missing: `IReadPackageParams` — to be added in PR #1.

---

## PR #1 — Full CRUD interfaces for all 22 ADT object types

**Scope:**

### Prerequisite: shared types

- Move `IReadOptions` from `adt-clients/src/core/shared/types.ts` to `src/shared/IReadOptions.ts`
- Export from `index.ts`

### New interface files

| File | Object type | Notes |
|------|-------------|-------|
| `src/adt/IAdtPackage.ts` | package | Extend with `IReadPackageParams` |
| `src/adt/IAdtClass.ts` | class | Migrate from adt-clients |
| `src/adt/IAdtProgram.ts` | program | Migrate + rename to snake_case |
| `src/adt/IAdtInterface.ts` | interface | Migrate + fix snake_case |
| `src/adt/IAdtView.ts` | view | Migrate |
| `src/adt/IAdtTable.ts` | table | Migrate |
| `src/adt/IAdtStructure.ts` | structure | Migrate + fix snake_case |
| `src/adt/IAdtDomain.ts` | domain | Migrate |
| `src/adt/IAdtDataElement.ts` | dataElement | Migrate |
| `src/adt/IAdtFunctionGroup.ts` | functionGroup | Migrate + fix snake_case |
| `src/adt/IAdtFunctionModule.ts` | functionModule | Migrate + fix snake_case |
| `src/adt/IAdtAccessControl.ts` | accessControl | Migrate |
| `src/adt/IAdtServiceDefinition.ts` | serviceDefinition | Migrate |
| `src/adt/IAdtServiceBinding.ts` | service/serviceBinding | Migrate from `IAdtService.ts` (currently camelCase → snake_case) |
| `src/adt/IAdtBehaviorDefinition.ts` | behaviorDefinition | Migrate + add missing IDelete |
| `src/adt/IAdtBehaviorImplementation.ts` | behaviorImplementation | Migrate + add missing IUpdate/IDelete |
| `src/adt/IAdtMetadataExtension.ts` | metadataExtension | Migrate + add missing IUpdate/IDelete |
| `src/adt/IAdtEnhancement.ts` | enhancement | Migrate |
| `src/adt/IAdtTableType.ts` | tabletype | Migrate |
| `src/adt/IAdtTransport.ts` | transport | Migrate + add missing IRead/IUpdate/IDelete |
| `src/adt/IAdtUnitTest.ts` | unitTest | Add minimal IRead (run params) |

### Standard IReadXxxParams shape

```typescript
export interface IReadXxxParams {
  xxx_name: string;
  version?: 'active' | 'inactive';
}
```

`IReadOptions` (accept negotiation, long polling) passed separately as `options?` parameter in function signatures — not part of the interface.

### Naming inconsistencies to fix in adt-clients (after PR #1 is published)

Modules with mixed camelCase/snake_case that need updating when adt-clients imports from interfaces:
- `interface` — IUpdateInterfaceSourceParams, IDeleteInterfaceParams
- `structure` — ICreateStructureParams, IUpdateStructureParams
- `functionGroup` — ICreateFunctionGroupParams
- `functionModule` — ICreateFunctionModuleParams, IUpdateFunctionModuleParams
- `program` — ICreateProgramParams, IUpdateProgramSourceParams, IDeleteProgramParams
- `service` — all IAdtService params (camelCase → snake_case)

---

## PR #2 — Update adt-clients to import from interfaces

**Scope:** Remove local param interfaces from all `types.ts` files, re-export from `@mcp-abap-adt/interfaces`.

This PR has zero logic changes — imports only.

---

## Status

| PR | Status |
|----|--------|
| PR #0 — Package interfaces | done (v4.0.0) |
| PR #1 — Full CRUD interfaces (22 types) | done (v5.0.0) |
| PR #2 — service binding snake_case migration | done (v5.0.0) |
| PR #3 — adt-clients import migration | planned |
