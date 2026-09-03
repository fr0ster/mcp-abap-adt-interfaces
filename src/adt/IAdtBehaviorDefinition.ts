/**
 * Behavior Definition ADT operation parameter interfaces (snake_case, low-level)
 */

import type { IAdtWireResponse as AxiosResponse } from '../connection/IAbapConnection';

export type BehaviorDefinitionImplementationType =
  | 'Managed'
  | 'Unmanaged'
  | 'Abstract'
  | 'Projection';

/**
 * Parameters for validating a behavior definition before creation
 */
export interface IBehaviorDefinitionValidationParams {
  /** Name of the behavior definition object */
  objname: string;
  /** Root entity name */
  rootEntity: string;
  /** Description of the behavior definition */
  description: string;
  /** Package name where the object will be created */
  package: string;
  /** Implementation type (Managed, Unmanaged, Abstract, Projection) */
  implementationType: BehaviorDefinitionImplementationType;
}

/**
 * Parameters for creating a behavior definition
 */
export interface IBehaviorDefinitionCreateParams {
  /** Name of the behavior definition */
  name: string;
  /** Description */
  description: string;
  /** Package name */
  package: string;
  /** Implementation type */
  implementationType: BehaviorDefinitionImplementationType;
  /** Language (default: EN) */
  language?: string;
  /** Responsible user */
  responsible?: string;
  /** Master system */
  masterSystem?: string;
  /** Transport request number */
  transportRequest?: string;
}

export interface IUpdateBehaviorDefinitionParams {
  name: string;
  sourceCode: string;
  lockHandle: string;
  transportRequest?: string;
}

// Builder configuration (camelCase)
// Note: packageName, description, implementationType are required for create/validate operations (validated in builder methods)
// rootEntity is required for validate operations
export interface IBehaviorDefinitionConfig {
  name: string; // Required
  masterLanguage?: string; // Original/master language for create; falls back to systemContext (SAP_LANGUAGE), then EN
  packageName?: string; // Required for create/validate operations, optional for others
  transportRequest?: string; // Only optional parameter
  description?: string; // Required for create/validate operations, optional for others
  implementationType?: 'Managed' | 'Unmanaged' | 'Abstract' | 'Projection'; // Required for create/validate operations, optional for others
  rootEntity?: string; // Required for validate operations, optional for others
  sourceCode?: string;
  onLock?: (lockHandle: string) => void;
}

// Result/check helper types — promoted verbatim from adt-clients
// src/core/behaviorDefinition/types.ts (publicly exported, consumer-facing).
export interface IValidationResult {
  severity: 'OK' | 'ERROR' | 'WARNING';
  shortText?: string;
  longText?: string;
}

export interface ILockResult {
  lockHandle: string;
  corrnr?: string;
  corruser?: string;
  corrtext?: string;
  isLocal?: boolean;
  isLinkUp?: boolean;
}

export type CheckReporter = 'bdefImplementationCheck' | 'abapCheckRun';

export interface ICheckMessage {
  uri: string;
  type: 'E' | 'W' | 'I' | 'S';
  shortText: string;
  code: string;
}

export interface ICheckRunResult {
  reporter: CheckReporter;
  triggeringUri: string;
  status: string;
  statusText: string;
  messages?: ICheckMessage[];
}
