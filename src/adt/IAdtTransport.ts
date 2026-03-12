/**
 * Transport ADT operation parameter interfaces (snake_case, low-level)
 */

export interface ICreateTransportParams {
  description: string;
  transport_type?: string;
  target_system?: string;
  owner?: string;
}

export interface IReadTransportParams {
  transport_number: string;
}

export interface IUpdateTransportParams {
  transport_number: string;
  description?: string;
  target_system?: string;
}

export interface IDeleteTransportParams {
  transport_number: string;
}
