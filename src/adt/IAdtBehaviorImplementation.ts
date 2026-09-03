/**
 * Behavior Implementation ADT operation parameter interfaces (snake_case, low-level)
 */

import type { IAdtObjectState } from './IAdtObjectState';

export interface ICreateBehaviorImplementationParams {
  class_name: string;
  description?: string;
  package_name: string;
  transport_request?: string;
  master_system?: string;
  responsible?: string;
  behavior_definition: string;
}

// Builder configuration (camelCase)
export interface IBehaviorImplementationConfig {
  className: string; // Required
  description?: string; // Required for create/validate operations, optional for others
  packageName?: string; // Required for create/validate operations, optional for others
  transportRequest?: string; // Only optional parameter
  behaviorDefinition: string; // Required - root entity name (BDEF name)
  sourceCode?: string; // Implementation source code (legacy, use implementationCode instead)
  /**
   * Custom code for implementations include (local handler class) - used in updateImplementations()
   * If provided, takes precedence over sourceCode and default generated code.
   * Should contain the complete local handler class definition and implementation.
   * Example: "CLASS lhc_Z_I_SOME_ENTITY DEFINITION INHERITING FROM cl_abap_behavior_handler..."
   */
  implementationCode?: string;
  masterSystem?: string;
  responsible?: string;
}

export interface IBehaviorImplementationState extends IAdtObjectState {
  // All operation results are in IAdtObjectState:
  // validationResponse, createResult, lockHandle, updateResult, checkResult,
  // unlockResult, activateResult, deleteResult, readResult, transportResult
}
