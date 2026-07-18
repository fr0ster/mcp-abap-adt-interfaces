import type { IAdtObjectState } from './IAdtObjectState';

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

// Nested shapes referenced by IMessageClassState/IMessageClassMessageState
// (promoted from adt-clients src/core/messageClass/xml.ts — minimal closure
// needed to compile the Config/State types below)
export interface IParsedMessage {
  msgno: string;
  msgtext: string;
  selfExplanatory?: boolean;
  description?: string;
  rawAttrs?: Record<string, string>;
}

export interface IParsedMessageClass {
  name: string;
  description?: string;
  language?: string;
  masterLanguage?: string;
  masterSystem?: string;
  responsible?: string;
  packageName?: string;
  messages: IParsedMessage[];
  rawAttrs?: Record<string, string>;
}

// High-level configuration (camelCase, public API)
export interface IMessageClassConfig {
  /** Message class name (e.g. ZMY_MSGS) */
  name: string;
  /** Short description */
  description?: string;
  /** Package name — required for create */
  packageName?: string;
  /** Transport request — sent as corrNr (create/update) or <del:transportNumber> (delete) for transportable packages */
  transportRequest?: string;
  /** Master language of the message class — defaults to 'EN' on create */
  masterLanguage?: string;
}

// State returned from operations
export interface IMessageClassState extends IAdtObjectState {
  /** Parsed message class returned after read() */
  messageClass?: IParsedMessageClass;
}

// ── Individual message config/state ───────────────────────────────────────────

/** Configuration for operating on a single message within a message class. */
export interface IMessageClassMessageConfig {
  /** Parent message class name (e.g. ZMY_MSGS) */
  className: string;
  /** Message number (e.g. '001') */
  msgno: string;
  /** Message text — required for create/update */
  msgtext?: string;
  /** Whether the message is self-explanatory (mc:selfexplainatory attribute) */
  selfExplanatory?: boolean;
  /** Long description for the message (adtcore:description attribute) */
  description?: string;
  /** Transport request — sent as &corrNr= on the parent-class PUT for create/update/delete (transportable packages) */
  transportRequest?: string;
}

/** State returned from operations on a single message. */
export interface IMessageClassMessageState extends IAdtObjectState {
  /** The individual message extracted from the parent class */
  message?: IParsedMessage;
}
