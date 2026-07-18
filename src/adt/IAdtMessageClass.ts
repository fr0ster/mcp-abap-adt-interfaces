export interface ICreateMessageClassParams {
  name: string;
  description: string;
  package_name: string;
  transport_request?: string;
  master_language?: string;
}
export interface IReadMessageClassParams {
  name: string;
}
export interface IUpdateMessageClassParams {
  name: string;
  description?: string;
  transport_request?: string;
}
export interface IDeleteMessageClassParams {
  name: string;
  transport_request?: string;
}
export interface ICreateMessageClassMessageParams {
  class_name: string;
  msgno: string;
  msgtext: string;
  self_explanatory?: boolean;
  description?: string;
  transport_request?: string;
}
export interface IUpdateMessageClassMessageParams {
  class_name: string;
  msgno: string;
  msgtext?: string; // optional: update may change only description or self_explanatory
  self_explanatory?: boolean;
  description?: string;
  transport_request?: string;
}
export interface IDeleteMessageClassMessageParams {
  class_name: string;
  msgno: string;
  transport_request?: string;
}
