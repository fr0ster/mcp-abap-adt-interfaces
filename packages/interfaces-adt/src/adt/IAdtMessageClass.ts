import type { AdtObjectIdentity } from './IAdtCapabilities';
import type { IAdtHeaders } from './IAdtContentTypes';
import type { IAdtAnalyseOptions, IAnalyse } from './IAdtObject';
import type { IAdtError, IAdtResponse, IResultStrategy } from './IAdtResponse';
// Nested shapes a message-class read answers with
// (promoted from adt-clients src/core/messageClass/xml.ts — minimal closure
// needed to compile the Config/State types below)
// High-level configuration (camelCase, public API)
export interface IMessageClassConfig {
  /** Message class name (e.g. ZMY_MSGS) */
  name: string;
  /** Short description */
  description?: string | undefined;
  /** Package name — required for create */
  packageName?: string | undefined;
  /** Transport request — sent as corrNr (create/update) or <del:transportNumber> (delete) for transportable packages */
  transportRequest?: string | undefined;
  /** Master language of the message class on create; with none given, SAP takes its logon language */
  masterLanguage?: string | undefined;
}

// State returned from operations
// ── Individual message config/state ───────────────────────────────────────────

/** Configuration for operating on a single message within a message class. */
export interface IMessageClassMessageConfig {
  /** Parent message class name (e.g. ZMY_MSGS) */
  className: string;
  /** Message number (e.g. '001') */
  msgno: string;
  /** Message text — required for an upsert (`update` without `removeMessage`) */
  msgtext?: string | undefined;
  /** Whether the message is self-explanatory (mc:selfexplainatory attribute) */
  selfExplanatory?: boolean | undefined;
  /** Long description for the message (adtcore:description attribute) */
  description?: string | undefined;
  /** Transport request — sent as &corrNr= on the parent-class PUT for create/update/delete (transportable packages) */
  transportRequest?: string | undefined;
}

/** One strategy per member of a messageClass implementation. See `IClassResults`. */
export interface IMessageClassResults {
  readonly created: IResultStrategy<unknown>;
  readonly source: IResultStrategy<unknown>;
  readonly metadata: IResultStrategy<unknown>;
  readonly validation: IResultStrategy<unknown>;
  readonly deletion: IResultStrategy<unknown>;
  readonly metadataUpdated: IResultStrategy<unknown>;
  /** What a deletion check answers: `del:checkResponse`. */
  readonly deletionCheck: IResultStrategy<unknown>;
}

/**
 * What each member of the message-level handler answers.
 *
 * A message is written through its **parent class's** document: ADT has no
 * resource for one message, so an update PUTs the whole class with that message
 * added, changed (`written`) or removed (`deleted`), and answers what that PUT
 * answered. Since 32.0.0 that PUT is one member, {@link
 * IAdtMessageClassMessageUpdatable.update}, and the locks around it are the
 * caller's.
 */
export interface IMessageClassMessageResults<
  TRead = string,
  TWritten = string,
  TDeleted = string,
> {
  readonly read: IResultStrategy<TRead>;
  readonly written: IResultStrategy<TWritten>;
  readonly deleted: IResultStrategy<TDeleted>;
}

// ── A message's locks and its update, one request each (32.0.0) ───────────────
//
// Until 32.0.0 an implementation's `create`, `update` and `delete` each ran a
// chain of their own: read the class, lock the message, lock the class for the
// message, PUT, unlock the class, unlock the message. A member sends one
// request (C7 of adt-clients #304), so the chain is the caller's, composed from
// these members and the message class's own `lock`, `read` and `unlock`. The
// README's "The identity and the error type" holds the recipe with its
// fallbacks and its cleanup:
//
// 1. on a stateful session: `lockMessage`, then `lockClassForMessage`. On a
//    403 the old code fell back, without telling why it was refused: after a
//    refused `lockMessage` it used the class handle for the message's, and
//    after a refused `lockClassForMessage` it took the plain class lock (the
//    message class's own `lock`). A 403 may mean the system grants no such
//    lock or that another user holds it; whether SAP's two answers differ is
//    not measured, so the caller reads the refusal before it falls back;
// 2. read the class's working-area document (the message's `read` with
//    `'workingArea'`);
// 3. on a stateless session: `update`, with both handles and that document —
//    the PUT carries the handles, so it needs no lock session;
// 4. back on the stateful session: the class's `unlock` with the class handle,
//    then `unlockMessages`, in that order.

/** The keys that address a message: its class and its number. */
export type MessageClassMessageAddress = 'className' | 'msgno';

/** The message's own locks: one request each. */
export interface IAdtMessageClassMessageLockable {
  /**
   * `POST …/messages/{no}?_action=LOCK_MSG` — the message's own lock. A 403
   * is the answer. It may mean the system grants no message lock or that
   * another user holds this one; which is not measured (see the README's
   * recipe).
   */
  lockMessage<E extends IAdtError>(
    config: AdtObjectIdentity<
      IMessageClassMessageConfig,
      MessageClassMessageAddress
    >,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<string, E | IAdtError>>;
  lockMessage(
    config: AdtObjectIdentity<
      IMessageClassMessageConfig,
      MessageClassMessageAddress
    >,
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<string>>;

  /**
   * `POST …/{class}?_action=LOCK&msgNo={no}&onSave=X` — the class lock taken
   * for this message. A 403 is the answer, for a reason this contract does not
   * know; the old code then took the plain class lock, the message class's own
   * `lock`.
   */
  lockClassForMessage<E extends IAdtError>(
    config: AdtObjectIdentity<
      IMessageClassMessageConfig,
      MessageClassMessageAddress
    >,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<string, E | IAdtError>>;
  lockClassForMessage(
    config: AdtObjectIdentity<
      IMessageClassMessageConfig,
      MessageClassMessageAddress
    >,
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<string>>;

  /** `POST …/messages/{no}?_action=UNLOCK_ALL` — the message's locks given up. */
  unlockMessages<E extends IAdtError>(
    config: AdtObjectIdentity<
      IMessageClassMessageConfig,
      MessageClassMessageAddress
    >,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<void, E | IAdtError>>;
  unlockMessages(
    config: AdtObjectIdentity<
      IMessageClassMessageConfig,
      MessageClassMessageAddress
    >,
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<void>>;
}

/**
 * What a message's `update` is given besides the message: the locks and the
 * class document it updates.
 */
export interface IMessageClassMessageUpdateOptions<
  E extends IAdtError = IAdtError,
> extends IAdtAnalyseOptions<E> {
  readonly headers: IAdtHeaders;
  /**
   * The class's working-area document, as the caller read it under the locks.
   * The update adds, changes or removes this message in it and PUTs the whole.
   */
  readonly classDocument: string;
  /** The class lock's handle: `lockClassForMessage`, or the plain class lock. */
  readonly classLockHandle: string;
  /**
   * The message lock's handle from `lockMessage`. Where `lockMessage` was
   * refused and the caller falls back as the old code did, the class lock's
   * handle (see the README's recipe).
   */
  readonly messageLockHandle: string;
  /** The ETag the read answered, sent as `If-Match`. */
  readonly ifMatch?: string | undefined;
  readonly timeout?: number | undefined;
}

/** The keys a message's upsert needs: its address and its text. */
export type MessageClassMessageUpsertKeys =
  | MessageClassMessageAddress
  | 'msgtext';

/** A message added or changed in its class: its address and its text. */
export type IMessageClassMessageUpsert = AdtObjectIdentity<
  IMessageClassMessageConfig,
  MessageClassMessageUpsertKeys
> & { readonly removeMessage?: never };

/** A message removed from its class document: its address alone. */
export interface IMessageClassMessageRemoval {
  readonly className: string;
  readonly msgno: string;
  readonly transportRequest?: string | undefined;
  readonly removeMessage: true;
}

/**
 * The message's `update`: one PUT of its class's document. An upsert takes
 * the message's address and text and answers `written`; with `removeMessage:
 * true` the message is removed from the document and the answer is `deleted`.
 */
export interface IAdtMessageClassMessageUpdatable<TWritten, TDeleted> {
  update<E extends IAdtError>(
    config: IMessageClassMessageUpsert,
    options: IMessageClassMessageUpdateOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TWritten, E | IAdtError>>;
  update<E extends IAdtError>(
    config: IMessageClassMessageRemoval,
    options: IMessageClassMessageUpdateOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TDeleted, E | IAdtError>>;
  update(
    config: IMessageClassMessageUpsert,
    options: IMessageClassMessageUpdateOptions,
  ): Promise<IAdtResponse<TWritten>>;
  update(
    config: IMessageClassMessageRemoval,
    options: IMessageClassMessageUpdateOptions,
  ): Promise<IAdtResponse<TDeleted>>;
}
