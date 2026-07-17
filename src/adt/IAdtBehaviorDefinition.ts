/**
 * Behavior Definition ADT operation parameter interfaces (snake_case, low-level)
 */

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

export interface ICreateBehaviorDefinitionParams {
  behavior_definition_name: string;
  description: string;
  package_name: string;
  implementation_type: BehaviorDefinitionImplementationType;
  language?: string;
  responsible?: string;
  master_system?: string;
  transport_request?: string;
}

export interface IReadBehaviorDefinitionParams {
  behavior_definition_name: string;
  version?: 'active' | 'inactive';
}

export interface IUpdateBehaviorDefinitionParams {
  name: string;
  sourceCode: string;
  lockHandle: string;
  transportRequest?: string;
}

export interface IDeleteBehaviorDefinitionParams {
  behavior_definition_name: string;
  transport_request?: string;
}
