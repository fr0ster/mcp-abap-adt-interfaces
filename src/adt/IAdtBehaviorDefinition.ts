/**
 * Behavior Definition ADT operation parameter interfaces (snake_case, low-level)
 */

export type BehaviorDefinitionImplementationType =
  | 'managed'
  | 'unmanaged'
  | 'abstract'
  | 'projection'
  | string;

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
  behavior_definition_name: string;
  source_code: string;
  lock_handle: string;
  transport_request?: string;
}

export interface IDeleteBehaviorDefinitionParams {
  behavior_definition_name: string;
  transport_request?: string;
}
