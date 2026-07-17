/**
 * Domain ADT operation parameter interfaces (snake_case, low-level)
 */

export interface IFixedValue {
  low: string;
  text: string;
}

export interface ICreateDomainParams {
  domain_name: string;
  description?: string;
  package_name: string;
  transport_request?: string;
  masterSystem?: string;
  responsible?: string;
  masterLanguage?: string;
  datatype?: string;
  length?: number;
  decimals?: number;
  conversion_exit?: string;
  lowercase?: boolean;
  sign_exists?: boolean;
  value_table?: string;
  activate?: boolean;
  fixed_values?: IFixedValue[];
}

export interface IReadDomainParams {
  domain_name: string;
  version?: 'active' | 'inactive';
}

export interface IUpdateDomainParams {
  domain_name: string;
  description?: string;
  package_name: string;
  transport_request?: string;
  masterSystem?: string;
  responsible?: string;
  datatype?: string;
  length?: number;
  decimals?: number;
  conversion_exit?: string;
  lowercase?: boolean;
  sign_exists?: boolean;
  value_table?: string;
  activate?: boolean;
  fixed_values?: IFixedValue[];
}

export interface IDeleteDomainParams {
  domain_name: string;
  transport_request?: string;
}
