/**
 * Behavior Implementation ADT operation parameter interfaces (snake_case, low-level)
 */

export interface ICreateBehaviorImplementationParams {
  class_name: string;
  description?: string;
  package_name: string;
  transport_request?: string;
  master_system?: string;
  responsible?: string;
  behavior_definition: string;
}

export interface IReadBehaviorImplementationParams {
  class_name: string;
  version?: 'active' | 'inactive';
}

export interface IUpdateBehaviorImplementationParams {
  class_name: string;
  source_code: string;
  lock_handle: string;
  transport_request?: string;
}

export interface IDeleteBehaviorImplementationParams {
  class_name: string;
  transport_request?: string;
}
