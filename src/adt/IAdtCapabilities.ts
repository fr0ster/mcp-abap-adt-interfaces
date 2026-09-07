/**
 * Capability atoms — one small interface per operation, and nothing above them.
 *
 * There is no composite. `IAdtObject`, `IAdtCrud`, `IAdtModifiable` and
 * `IAdtSourceObject` were removed in 29.0.0 because they forced one result type
 * on members that answer different things: a create does not answer what a read
 * answers, and a type saying they do was saying something untrue about ADT. A
 * handler declares the atoms it honours, so a consumer reading it learns what
 * that object can do and what comes back, rather than what the fattest object
 * could do.
 *
 * **Each atom names its own result, and one resource.**
 * `IAdtCreatable<TConfig, TCreated>`, `IAdtUpdatable<TConfig, TUpdated>`, and so
 * on. Reading and writing come in pairs — `IAdtReadable`/`IAdtMetadataReadable`
 * and `IAdtUpdatable`/`IAdtMetadataUpdatable` — because an object has up to two
 * resources, a source and its own document, and which it has is a property of
 * the type. One atom carrying both made eight of them answer `read` and
 * `readMetadata` with the identical request; they were split in 36.0.0.
 *
 * The grain comes from ADT itself: a lock and its unlock are one operation seen
 * from two ends, and a version list is useless without the source behind an
 * entry, so each pair is honoured or refused whole. `update` and `delete` were
 * taken for a third such pair until 15.0.0 and are not one: nothing in ADT ties
 * changing an object to removing it.
 *
 * **Nothing here throws.** Until 30.0.0 four members did — `lock`, `unlock`,
 * `getVersions` and `getVersionSource` — on the grounds that they answer a lock
 * handle, nothing, a version list and a source string and so have no failure
 * half. That premise was false: a lock refused because another user holds it is
 * a 403, and a version resource a system does not expose is a 404. They answer
 * like everything else, and decision 20 says why — a thrown error is invisible
 * to the compiler, so a consumer never learns from the type that a failure path
 * exists.
 */
import type {
  IAdtCreateOptions,
  IAdtOperationOptions,
  IAnalyse,
} from './IAdtObject';
import type { IAdtError, IAdtResponse } from './IAdtResponse';

/**
 * Bring an object into existence.
 *
 * Separate from the mutation atoms because creation and mutation do not travel
 * together: a unit-test run is created and never updated.
 */
export interface IAdtCreatable<TConfig, TCreated> {
  /**
   * Create the object — **the POST, and nothing after it.**
   *
   * This used to say "with full operation chain: validate, create, check,
   * lock, check(inactive), update, unlock, activate". It is one request.
   * Validating a name, checking the result, locking, writing source and
   * activating are members of their own, and a caller composes them in the
   * order they want: which of six requests failed is knowable that way and was
   * not before.
   *
   * **It does not take the object's source.** This used to say `sourceCode`
   * applied "where this object's create endpoint carries a body: a DDL source,
   * a table and a program are created from their source". None of the three
   * is: measured across all 27 create implementations in
   * `@mcp-abap-adt/adt-clients`, every one posts a metadata document and not
   * one carries source. So the field is off the member — `config` without it,
   * and {@link IAdtCreateOptions} in place of the write options — because a
   * value that cannot be honoured is worse accepted than refused. Passing it
   * used to compile, run, answer ok and leave an empty object behind.
   *
   * The source is `update`'s, after `lock`.
   *
   * @param config - Object configuration, source excluded
   * @param options - `analyse` for what counts as a failure
   * @returns whatever this implementation’s reading makes of the answer
   */
  create<E extends IAdtError>(
    config: Omit<TConfig, 'sourceCode'>,
    options: IAdtCreateOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TCreated, E>>;
  create(
    config: Omit<TConfig, 'sourceCode'>,
    options?: IAdtCreateOptions,
  ): Promise<IAdtResponse<TCreated>>;
}

/** Obtain a representation of an object — its source, or the metadata about it. */
/**
 * The object has a **source** — an ABAP text, a DDL, a JSON body — at its own
 * `source/main`, and it can be read.
 *
 * One member, because the atom names one resource. It used to name two, and its
 * own documentation confessed what that cost: *"For objects without source code
 * (Domain, DataElement), this returns metadata XML"* and *"readMetadata may
 * delegate to read() as read() already returns metadata"*. Eight types were
 * measured doing exactly that — `read` and `readMetadata` issuing the identical
 * request — which is one endpoint behind two members, the thing decision 16
 * exists to prevent.
 *
 * A domain has no source. It composes {@link IAdtMetadataReadable} and nothing
 * else, and that omission is the statement.
 */
export interface IAdtReadable<TConfig, TSource> {
  /**
   * Read the object's source.
   *
   * @param config - Object identification (name, etc.)
   * @param version - 'active' or 'inactive'
   * @param options - `withLongPolling` waits for the object to become
   *                  available, which is what a read straight after a create or
   *                  an activation needs; `analyse` for the verdict
   * @returns whatever this implementation's reading makes of the answer
   */
  read<E extends IAdtError>(
    config: Partial<TConfig>,
    version: 'active' | 'inactive' | undefined,
    options: { withLongPolling?: boolean } & IAdtOperationOptions<E> & {
        analyse: IAnalyse<E>;
      },
  ): Promise<IAdtResponse<TSource, E>>;
  read(
    config: Partial<TConfig>,
    version?: 'active' | 'inactive',
    options?: { withLongPolling?: boolean } & IAdtOperationOptions,
  ): Promise<IAdtResponse<TSource>>;
}

/**
 * The object has a **document of its own** — the `adtcore` XML describing it:
 * package, responsible, description, its type's own fields — and it can be read.
 *
 * Almost everything has one; a few things are only this. A domain, a data
 * element, a package and a table type *are* their document, and for them this
 * is the whole of reading.
 */
export interface IAdtMetadataReadable<TConfig, TMetadata> {
  /**
   * Read the object's own document.
   *
   * @param config - Object identification (name, etc.)
   * @param options - `withLongPolling` and `version` as for
   *                  {@link IAdtReadable.read}; `analyse` for the verdict
   * @returns whatever this implementation's reading makes of the answer
   */
  readMetadata<E extends IAdtError>(
    config: Partial<TConfig>,
    options: {
      withLongPolling?: boolean;
      version?: 'active' | 'inactive';
    } & IAdtOperationOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TMetadata, E>>;
  readMetadata(
    config: Partial<TConfig>,
    options?: {
      withLongPolling?: boolean;
      version?: 'active' | 'inactive';
    } & IAdtOperationOptions,
  ): Promise<IAdtResponse<TMetadata>>;
}

/**
 * The object's **source** can be written.
 *
 * **`TConfig` is taken as given, not wrapped in `Partial`.** The atoms that
 * *identify* an object — `read`, `delete`, `activate`, `lock` and the rest —
 * wrap it, and are right to: `read({ className })` has no business demanding a
 * package. {@link IAdtCreatable} never did, because a create must say what to
 * make, and a write is no more an identifier than a create is. A service
 * binding's publication needs the protocol that selects its endpoint, and an
 * atom that decided optionality on the implementation's behalf made that
 * requirement unsayable. Implementations pass `Partial<IClassConfig>` where
 * everything really is optional, and their own shape where it is not.
 *
 * `update` writes the source, which is what makes the name mean the same thing
 * across the types that have one. A domain has no source to write; it composes
 * {@link IAdtMetadataUpdatable} instead, and the member it offers says what it
 * writes.
 *
 * **One object is neither.** A service binding has no source and no document to
 * PUT: its `update` is a publication job, `POST …/publishjobs`, which changes
 * the object's state rather than its content. It is still `update` — writing an
 * object's state is what the member is for — but "the source and only the
 * source" would be a claim this atom cannot make for every implementation.
 */
export interface IAdtUpdatable<TConfig, TUpdated> {
  /**
   * Write what the object has — **the write, and nothing around it.**
   *
   * For the types that have a source, that is the source. A service binding has
   * neither a source nor a document to PUT: its `update` is a publication job,
   * `POST …/publishjobs`, which changes the object's state. Writing an object's
   * state is what this member is for, so "writes the source" is a claim the
   * hover text cannot make for every implementation — and the hover is where a
   * consumer reads the contract.
   *
   * This used to say "with full operation chain: lock, check(inactive),
   * update, unlock, check, activate (optional)". It is one request, and the
   * lock is the caller’s: `lock` and `unlock` are members, `lockHandle` goes
   * in the options, and how long a lock is held is a policy no library can
   * choose for every caller of a shared connection.
   *
   * Sending no lock handle is not refused here. ADT judges that, and answers it.
   *
   * @param config - taken as given, so an implementation that needs a field can
   *                 require it — a publication needs the protocol that selects
   *                 its endpoint
   * @param options - `sourceCode`/`xmlContent` for the body, `lockHandle` for
   *                  the lock the caller took, `analyse` for the verdict
   * @returns whatever this implementation’s reading makes of the answer
   */
  update<E extends IAdtError>(
    config: TConfig,
    options: IAdtOperationOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TUpdated, E>>;
  update(
    config: TConfig,
    options?: IAdtOperationOptions,
  ): Promise<IAdtResponse<TUpdated>>;
}

/**
 * The object's **own document** can be written.
 *
 * Three types offer this beside {@link IAdtUpdatable}, because they have two
 * writable resources and ADT keeps them apart: a function include, a scalar
 * function implementation and a feature toggle each answer a document at their
 * own URL and a source at `source/main`. Eight more offer *only* this — a
 * domain, a data element, a package, a table type and their neighbours are
 * their document, and writing them is writing it.
 *
 * The same rule as reading, and for the same reason: the member is named for
 * the resource it addresses, so a caller never has to know which kind of object
 * it is holding to know what `update` will write.
 */
export interface IAdtMetadataUpdatable<TConfig, TMetadataUpdated> {
  /**
   * Write the object's own document.
   *
   * One request, and the lock handle is passed as given — see
   * {@link IAdtUpdatable.update}, which this mirrors in everything but the
   * resource it addresses.
   *
   * @param config - Object configuration with updates
   * @param options - `xmlContent` for the body, `lockHandle` for the lock the
   *                  caller took, `analyse` for the verdict
   * @returns whatever this implementation's reading makes of the answer
   */
  updateMetadata<E extends IAdtError>(
    config: TConfig,
    options: IAdtOperationOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TMetadataUpdated, E>>;
  updateMetadata(
    config: TConfig,
    options?: IAdtOperationOptions,
  ): Promise<IAdtResponse<TMetadataUpdated>>;
}

export interface IAdtDeletable<TConfig, TDeleted, TChecked = string> {
  /**
   * Delete the object. One request, and it is the deletion.
   *
   * **It does not ask first.** {@link IAdtDeletable.checkDeletion} is the
   * question, and it is a separate request answering a separate thing — "is
   * anything still pointing at this?" An implementation that ran it inside this
   * member gave a caller no way to skip it and no way to read what it said, so
   * the two stand side by side and the caller orders them.
   *
   * Deleting without asking is allowed: the server answers its own refusal. What
   * a caller gives up is the *reason* — the check's document names what still
   * references the object, and the deletion's does not.
   *
   * @param config - Object identification
   * @param options - `analyse` for the verdict
   * @returns whatever this implementation's reading makes of the answer
   */
  delete<E extends IAdtError>(
    config: Partial<TConfig>,
    options: IAdtOperationOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TDeleted, E>>;
  delete(
    config: Partial<TConfig>,
    options?: IAdtOperationOptions,
  ): Promise<IAdtResponse<TDeleted>>;

  /**
   * Ask whether the object can be deleted *now*.
   *
   * Almost anything that was created can be deleted; what varies is the moment.
   * Something still references it, a transport holds it, it is locked by another
   * user — and every one of those is a fact about the server at this instant,
   * not about the object's kind. Only the server knows, so the member's whole
   * job is to ask it.
   *
   * That is why it lives here rather than in an atom of its own: it is not a
   * separate capability, it is the question that belongs to deleting. A type
   * that can be deleted can be asked whether it can be deleted right now.
   *
   * One request, like every other member, and the answer is a document rather
   * than a status — ADT reports a refusal inside a 200. The shipped `analyse`
   * reads it; a caller who wants another reading passes their own.
   *
   * @param config - Object identification
   * @param options - `analyse` for the verdict
   * @returns whatever this implementation's reading makes of the answer
   */
  checkDeletion<E extends IAdtError>(
    config: Partial<TConfig>,
    options: IAdtOperationOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TChecked, E>>;
  checkDeletion(
    config: Partial<TConfig>,
    options?: IAdtOperationOptions,
  ): Promise<IAdtResponse<TChecked>>;
}

export interface IAdtValidatable<TConfig, TValidated> {
  /**
   * Validate object configuration before creation
   * @param config - Object configuration
   * @returns State with validation result
   */
  validate<E extends IAdtError>(
    config: Partial<TConfig>,
    options: IAdtOperationOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TValidated, E>>;
  validate(
    config: Partial<TConfig>,
    options?: IAdtOperationOptions,
  ): Promise<IAdtResponse<TValidated>>;
}

export interface IAdtCheckable<TConfig, TChecked> {
  /**
   * Check object (syntax, consistency, etc.)
   * @param config - Object identification
   * @param status - Optional status to check ('active', 'inactive', 'deletion')
   * @returns State with check result
   */
  check<E extends IAdtError>(
    config: Partial<TConfig>,
    status: string | undefined,
    options: IAdtOperationOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TChecked, E>>;
  check(
    config: Partial<TConfig>,
    status?: string,
    options?: IAdtOperationOptions,
  ): Promise<IAdtResponse<TChecked>>;
}

export interface IAdtActivatable<TConfig, TActivated> {
  /**
   * Activate object
   * @param config - Object identification
   * @returns State with activation result
   */
  activate<E extends IAdtError>(
    config: Partial<TConfig>,
    options: IAdtOperationOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TActivated, E>>;
  activate(
    config: Partial<TConfig>,
    options?: IAdtOperationOptions,
  ): Promise<IAdtResponse<TActivated>>;
}

export interface IAdtLockable<TConfig> {
  /**
   * Lock object for modification
   * Sets connection to stateful mode before locking.
   *
   * @param config - Object identification
   * @returns the lock handle that `unlock` and `update` must be given
   *
   * A refusal — another user holds the lock — is a failure in the answer, not
   * an exception. The pair migrated together, because a lock and its unlock are
   * one operation seen from two ends.
   */
  lock(config: Partial<TConfig>): Promise<IAdtResponse<string>>;

  /**
   * Unlock object
   * Sets connection to stateless mode after unlocking.
   * Must use the same session and lock handle from lock() operation.
   *
   * @param config - Object identification
   * @param lockHandle - Lock handle returned from lock() operation
   * @returns nothing to read, and the answer says whether it happened
   */
  unlock(
    config: Partial<TConfig>,
    lockHandle: string,
  ): Promise<IAdtResponse<void>>;
}

export interface IAdtVersionable<TConfig, TVersions, TSource> {
  /**
   * List the version history of this object's source. Identity is passed per
   * call (the implementations are stateless factories) — e.g.
   * `getVersions({ className: 'ZCL_X' })`.
   * An object with no version resource — SAP answers 404 or 406, or the type
   * has no source at all — is a failure in the answer, and the strategy names it
   * in {@link IAdtError.code} as `AdtObjectErrorCodes.UNSUPPORTED_OPERATION`, so
   * a consumer branches on it without a cast. Not an exception: a caller asking
   * a type it did not choose is the normal case here, and a normal case belongs
   * in the return type.
   */
  getVersions(config: Partial<TConfig>): Promise<IAdtResponse<TVersions>>;

  /**
   * Fetch the source code of a specific version.
   * @param contentUri the opaque, complete `contentUri` from a getVersions() entry.
   *
   * Answers like its pair above: a version resource that cannot be read is a
   * failure in the answer.
   */
  getVersionSource(contentUri: string): Promise<IAdtResponse<TSource>>;
}

/**
 * `IAdtSearchable` was here until 30.0.0.
 *
 * Searching is not something an object does to itself, and the question already
 * had a home: {@link IAdtInformationSystem.search}, over
 * `/repository/informationsystem/search`. Declaring it here as well made one
 * endpoint two members across two files — decision 16 — and gave a consumer two
 * places to look for one answer.
 */

export interface IAdtTransportAware<TConfig, TTransport> {
  /**
   * Read transport request information for the object
   * @param config - Object identification
   * @param options - Optional read options
   * @param options.withLongPolling - If true, adds ?withLongPolling=true to wait for object to become available
   *                                  Useful after create/activate operations to wait until object is ready
   * @returns State with transport result
   */
  readTransport<E extends IAdtError>(
    config: Partial<TConfig>,
    options: { withLongPolling?: boolean } & IAdtOperationOptions<E> & {
        analyse: IAnalyse<E>;
      },
  ): Promise<IAdtResponse<TTransport, E>>;
  readTransport(
    config: Partial<TConfig>,
    options?: { withLongPolling?: boolean } & IAdtOperationOptions,
  ): Promise<IAdtResponse<TTransport>>;
}
