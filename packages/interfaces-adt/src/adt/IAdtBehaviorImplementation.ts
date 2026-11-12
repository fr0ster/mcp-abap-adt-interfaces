/**
 * Behavior Implementation ADT operation parameter interfaces (snake_case, low-level)
 */

// Builder configuration (camelCase)
export interface IBehaviorImplementationConfig {
  className: string; // Required
  description?: string | undefined; // Required for create/validate operations, optional for others
  packageName?: string | undefined; // Required for create/validate operations, optional for others
  transportRequest?: string | undefined; // Only optional parameter
  behaviorDefinition: string; // Required - root entity name (BDEF name)
  source?: string | undefined; // Implementation source code (legacy, use implementationCode instead)
  /**
   * Custom code for implementations include (local handler class) - used in updateImplementations()
   * If provided, takes precedence over `source` and the default generated code.
   * Should contain the complete local handler class definition and implementation.
   * Example: "CLASS lhc_Z_I_SOME_ENTITY DEFINITION INHERITING FROM cl_abap_behavior_handler..."
   */
  implementationCode?: string | undefined;
  masterSystem?: string | undefined;
  responsible?: string | undefined;
}
