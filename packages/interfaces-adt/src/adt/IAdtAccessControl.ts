/**
 * Access Control (DCL) ADT operation parameter interfaces (snake_case, low-level)
 */

// Builder configuration (camelCase)
export interface IAccessControlConfig {
  accessControlName: string;
  masterLanguage?: string; // Original/master language for create; falls back to systemContext (SAP_LANGUAGE), then EN
  packageName?: string;
  transportRequest?: string;
  description?: string;
  source?: string;
}
