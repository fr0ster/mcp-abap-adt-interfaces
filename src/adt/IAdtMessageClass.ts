export interface ICreateMessageClassParams {
  name: string;
  description: string;
  package_name: string;
  transport_request?: string;
  master_language?: string;
}
export interface IDeleteMessageClassParams {
  name: string;
  transport_request?: string;
}

// Nested shapes a message-class read answers with
// (promoted from adt-clients src/core/messageClass/xml.ts — minimal closure
// needed to compile the Config/State types below)
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
