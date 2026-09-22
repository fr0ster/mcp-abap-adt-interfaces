/**
 * DDL-source ADT operation parameter interfaces (snake_case, low-level).
 * Cover the generic DDL-source endpoint (`/sap/bc/adt/ddic/ddl/sources/`):
 * CDS views, AMDP table functions, and other DDL sources.
 */

// Builder configuration (camelCase)
// Note: packageName is required for create operations (validated in builder methods)
// description is required for create/validate operations
export interface IDdlConfig {
  ddlName: string;
  masterLanguage?: string; // Original/master language for create; falls back to systemContext (SAP_LANGUAGE), then EN
  packageName?: string; // Required for create operations, optional for others
  transportRequest?: string; // Only optional parameter
  description?: string; // Required for create/validate operations, optional for others
  ddlSource?: string;
  sessionId?: string;
  onLock?: (lockHandle: string) => void;
}
