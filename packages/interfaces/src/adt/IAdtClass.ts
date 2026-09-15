/**
 * Class ADT operation parameter interfaces (snake_case, low-level)
 */

export interface ICreateClassParams {
  class_name: string;
  description?: string;
  package_name: string;
  transport_request?: string;
  master_system?: string;
  responsible?: string;
  masterLanguage?: string;
  superclass?: string;
  final?: boolean;
  abstract?: boolean;
  create_protected?: boolean;
  template_xml?: string;
}

export interface IDeleteClassParams {
  class_name: string;
  transport_request?: string;
}

// AdtClass configuration (camelCase)
// Note: packageName is required for create operations (validated in builder methods)
// description is required for create/validate operations
export interface IClassConfig {
  className: string;
  masterLanguage?: string; // Original/master language for create; falls back to systemContext (SAP_LANGUAGE), then EN
  description?: string; // Required for create/validate operations, optional for others
  packageName?: string; // Required for create operations, optional for others
  transportRequest?: string; // Only optional parameter
  sourceCode?: string;
  testClassCode?: string;
  testClassName?: string;
  localTypesCode?: string; // Local helper classes, interface definitions and type declarations
  definitionsCode?: string; // Class-relevant local types (private section types)
  macrosCode?: string; // Macro definitions (legacy ABAP)
  superclass?: string;
  final?: boolean;
  abstract?: boolean;
  createProtected?: boolean;
  masterSystem?: string;
  responsible?: string;
  classTemplate?: string;
}

// Class-includes config types — promoted verbatim from adt-clients
// src/core/class/AdtLocal{TestClass,Types,Definitions,Macros}.ts
// (publicly exported; the `TConfig` of the atoms a class handler declares).
export interface ILocalTestClassConfig {
  className: string;
  /**
   * Source of the whole testclasses include. ADT addresses the include, not a
   * single test class inside it, so there is no field naming one.
   */
  testClassCode?: string;
  transportRequest?: string;
}

export interface ILocalTypesConfig {
  className: string;
  localTypesCode?: string;
  transportRequest?: string;
}

export interface ILocalDefinitionsConfig {
  className: string;
  definitionsCode?: string;
  transportRequest?: string;
}

export interface ILocalMacrosConfig {
  className: string;
  macrosCode?: string;
  transportRequest?: string;
}
