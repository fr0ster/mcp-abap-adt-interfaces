import type { IAdtHeaders } from './IAdtContentTypes';
import type { IAdtAnalyseOptions, IAnalyse } from './IAdtObject';
import type { AdtNoFailure, IAdtError, IAdtResponse } from './IAdtResponse';

export interface IAbapGitLinkArgs {
  package: string;
  url: string;
  branchName?: string;
  remoteUser?: string;
  remotePassword?: string;
  transportRequest?: string;
}

/**
 * What starting a pull needs.
 *
 * **No waiting since 43.0.0.** `pollIntervalMs`, `maxPollDurationMs`, `signal`
 * and `onProgress` were here, and `pull` polled the repository until its status
 * left `R`. That is a wait on an asynchronous server job, and a wait is the
 * caller's: how long to allow, how often to ask, whether to give up and what to
 * do then are decisions about their application, not about ADT. They ask
 * `listRepos` in their own loop and read the repository they started.
 *
 * `pullLink` is the href the pull is posted to, which `listRepos` reports. The
 * member used to list the repositories itself to find it — a second request,
 * and a lookup the caller could not skip when they already had the link.
 */
export interface IAbapGitPullArgs {
  package: string;
  pullLink: string;
  branchName?: string;
  remoteUser?: string;
  remotePassword?: string;
  transportRequest?: string;
}

/**
 * What removing a repository link needs: the repository's own key.
 *
 * `DELETE /abapgit/repos/{key}` is addressed by the key `listRepos` reports
 * (`abapgitrepo:key`). Until 11.0.0 this took the package and the member listed
 * every repository to find the key — two requests, and a "not found" the
 * library composed from its own lookup rather than anything SAP said.
 */
export interface IAbapGitUnlinkArgs {
  repositoryId: string;
  transportRequest?: string;
}

export interface IAbapGitExternalRepoCredentials {
  url: string;
  remoteUser?: string;
  remotePassword?: string;
}

export interface IAdtAbapGitClientOptions {
  contentTypeVersion?: 'v3' | 'v4';
}

/**
 * One request per member, each addressed by what the server gave the caller.
 *
 * **`getRepo` left in 11.0.0.** It listed every repository and picked the one
 * for a package — a filter over a document, which is the result strategy's to
 * do, and a "not found" the library composed from its own search. A caller
 * reads `listRepos` through the strategy of their choice and takes the entry
 * they want.
 */
export interface IAdtAbapGitClient<TRepos, TErrorLog, TPull, TExternalRepo> {
  /**
   * @deprecated Since 30.2.0 — use the new form ({@link IAdtAbapGitLinkNewForm}:
   * `credentials: IAbapGitCredentials | null`, no `remoteUser`/`remotePassword`).
   * Its options carry `credentials?: never`, so the two forms never mix.
   */
  link<E extends IAdtError>(
    args: IAbapGitLinkArgs,
    options: { headers: IAdtHeaders } & IAdtAnalyseOptions<E> & {
        analyse: IAnalyse<E>;
      } & { readonly credentials?: never },
  ): Promise<IAdtResponse<void, E>>;
  /**
   * @deprecated Since 30.2.0 — use the new form ({@link IAdtAbapGitLinkNewForm}).
   */
  link(
    args: IAbapGitLinkArgs,
    options: { headers: IAdtHeaders } & IAdtAnalyseOptions & {
        readonly credentials?: never;
      },
  ): Promise<IAdtResponse<void>>;
  /**
   * Start a pull — one POST to `args.pullLink`.
   *
   * It does not wait, and it does not look the link up. The caller lists the
   * repositories once, keeps the link, posts, then polls `listRepos` on their
   * own terms and reads `getErrorLog` if the status says to.
   *
   * @deprecated Since 30.2.0 — use the key-based `pullRepo`
   * ({@link IAdtAbapGitPullRepo}). Its options carry `credentials?: never`.
   */
  pull<E extends IAdtError>(
    args: IAbapGitPullArgs,
    options: { headers: IAdtHeaders } & IAdtAnalyseOptions<E> & {
        analyse: IAnalyse<E>;
      } & { readonly credentials?: never },
  ): Promise<IAdtResponse<TPull, E>>;
  /**
   * @deprecated Since 30.2.0 — use the key-based `pullRepo`
   * ({@link IAdtAbapGitPullRepo}).
   */
  pull(
    args: IAbapGitPullArgs,
    options: { headers: IAdtHeaders } & IAdtAnalyseOptions & {
        readonly credentials?: never;
      },
  ): Promise<IAdtResponse<TPull>>;
  unlink<E extends IAdtError>(
    args: IAbapGitUnlinkArgs,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<void, E>>;
  unlink(
    args: IAbapGitUnlinkArgs,
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<void>>;
  listRepos<E extends IAdtError>(
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TRepos, E>>;
  listRepos(options?: IAdtAnalyseOptions): Promise<IAdtResponse<TRepos>>;
  /**
   * The error log of a repository's last run — one GET to `logLink`.
   *
   * `logLink` is the href `listRepos` reports for the repository. Until 11.0.0
   * this took a package, listed every repository to find the link, and
   * answered an empty log when there was none — a second request, and a reading
   * of the list that was not the caller's.
   *
   * @deprecated Since 30.2.0 — use `getRunLog` ({@link IAdtAbapGitRunLog}),
   * addressed by the repository's key and the log's `appLogKey`.
   */
  getErrorLog<E extends IAdtError>(
    logLink: string,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TErrorLog, E>>;
  /**
   * @deprecated Since 30.2.0 — use `getRunLog` ({@link IAdtAbapGitRunLog}).
   */
  getErrorLog(
    logLink: string,
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TErrorLog>>;
  /**
   * @deprecated Since 30.2.0 — use the new form
   * ({@link IAdtAbapGitCheckExternalRepoNewForm}: `credentials:
   * IAbapGitCredentials | null`). The `remoteUser`/`remotePassword` this form
   * takes are written where SAP does not read them. Its options carry
   * `credentials?: never`, so the two forms never mix.
   */
  checkExternalRepo<E extends IAdtError>(
    args: IAbapGitExternalRepoCredentials,
    options: { headers: IAdtHeaders } & IAdtAnalyseOptions<E> & {
        analyse: IAnalyse<E>;
      } & { readonly credentials?: never },
  ): Promise<IAdtResponse<TExternalRepo, E>>;
  /**
   * @deprecated Since 30.2.0 — use the new form
   * ({@link IAdtAbapGitCheckExternalRepoNewForm}).
   */
  checkExternalRepo(
    args: IAbapGitExternalRepoCredentials,
    options: { headers: IAdtHeaders } & IAdtAnalyseOptions & {
        readonly credentials?: never;
      },
  ): Promise<IAdtResponse<TExternalRepo>>;
}

// ---------------------------------------------------------------------------
// 30.2.0 — the key-based members and the facts forms.
//
// Every member below is addressed by what SAP gave the caller — a repository's
// `key`, a remote `url` — and answers through the **facts** contract: what a
// result strategy reads and what an analyser judges is a reduction of SAP's
// document to named fields (`IAbapGitFactsResponse`), never the document
// itself, and the default error carries the status and the T100 key only
// (`IAbapGitStructuredError`), never SAP's text. A credential is never part of
// either. The legacy members of `IAdtAbapGitClient` keep their wire-typed
// contract, deprecated.

/**
 * A remote repository's credential, as SAP's abapGit takes it: a user and a
 * password or token (a token goes as the password).
 *
 * Given as `options.credentials` on the new forms — never as an argument — and
 * written by the implementation exactly where the route reads it.
 */
export interface IAbapGitCredentials {
  readonly user: string;
  readonly password: string;
}

/**
 * What a facts reading hands on: the HTTP status, as an integer, and the
 * route's facts — the fields its reducer keeps from SAP's document, and
 * nothing else. No body, no headers, no status text.
 */
export interface IAbapGitFactsResponse<F> {
  readonly status: number;
  readonly facts: F;
}

/** The facts of a failed abapGit request: its status and its T100 key. */
export interface IAbapGitErrorFacts {
  /** The HTTP status of the answer, as an integer. */
  readonly status: number;
  /** `T100KEY-ID` of SAP's exception document, when it carries one. */
  readonly messageClass?: string | undefined;
  /** `T100KEY-NO`, the three-digit string as SAP writes it. */
  readonly messageNumber?: string | undefined;
  /** The git host's HTTP status SAP reports (`http_status`), as an integer. */
  readonly gitHttpStatus?: number | undefined;
}

/**
 * The failure every new form answers with by default.
 *
 * It carries facts, not text: `message` is fixed words of the implementation,
 * never what SAP said; `response` is always absent; `request` names the method
 * and the path without its query. Nothing in it can carry a credential.
 */
export interface IAbapGitStructuredError extends IAdtError {
  /** Fixed words of the implementation — never SAP's text. */
  readonly message: string;
  readonly facts: IAbapGitErrorFacts;
  /** Never present: the document stays with the implementation. */
  readonly response?: undefined;
  /** The method, and the path without its query. */
  readonly request?:
    | { readonly method: string; readonly path: string }
    | undefined;
  /**
   * Never present: `IAdtError.rfc` carries the RFC SDK's `key`, free text the
   * SDK fills, and a facts error keeps the status and the T100 key only.
   */
  readonly rfc?: never;
  /** Never present: `<type id>` is read out of SAP's document, not a kept fact. */
  readonly adtType?: never;
  /** Never present: `<namespace id>` is read out of SAP's document. */
  readonly namespace?: never;
  /** Never present: an open string, not a kept fact; `facts` carries the T100 key. */
  readonly code?: never;
}

/**
 * A new form's result strategy: it is handed the facts answer, not the wire
 * document, so an `IResultStrategy` does not fit it.
 */
export type IAbapGitFactsResultStrategy<T, F> = (
  answer: IAbapGitFactsResponse<F>,
) => T;

/**
 * A new form's analyser: the library's structured verdict and the facts
 * answer (absent when no answer arrived), never the document — so an
 * `IAnalyse` does not fit it. What it returns is the caller's.
 */
export type IAbapGitFactsAnalyse<
  F,
  E extends IAbapGitStructuredError = IAbapGitStructuredError,
> = (
  verdict: IAbapGitStructuredError | AdtNoFailure,
  answer?: IAbapGitFactsResponse<F>,
) => E | AdtNoFailure;

/**
 * The options of a facts member. Not an `IAdtAnalyseOptions`: its `analyse`
 * is an `IAbapGitFactsAnalyse`. `credentials` is optional here — a member that
 * takes no credential is called without it.
 */
export type IAbapGitFactsOptions<
  F,
  E extends IAbapGitStructuredError = IAbapGitStructuredError,
> = {
  readonly analyse?: IAbapGitFactsAnalyse<F, E>;
  readonly credentials?: IAbapGitCredentials;
};

/**
 * The options of the new form of `link` and `checkExternalRepo`:
 * `credentials` is required — a credential, or `null` for an anonymous call —
 * and is what selects the new form (the legacy options carry
 * `credentials?: never`). `undefined` is neither.
 */
export type IAbapGitNewFormOptions<
  F,
  E extends IAbapGitStructuredError = IAbapGitStructuredError,
> = Omit<IAbapGitFactsOptions<F, E>, 'credentials'> & {
  readonly credentials: IAbapGitCredentials | null;
};

/** The ADT media types of a member that negotiates them; required. */
export type IAbapGitHeaderOptions = { readonly headers: IAdtHeaders };

/** A repository, by the key `listRepos` reports (`abapgitrepo:key`). */
export interface IAbapGitRepoKeyArgs {
  readonly key: string;
}

/**
 * The new form of `link`: no `remoteUser`/`remotePassword` (the credential is
 * `options.credentials`), and `branchName` required.
 */
export interface IAbapGitLinkNewArgs {
  readonly package: string;
  readonly url: string;
  readonly branchName: string;
  readonly transportRequest?: string;
  /** Cloud only: how folders map to packages. */
  readonly folderLogic?: 'FULL' | 'PREFIX';
  readonly remoteUser?: never;
  readonly remotePassword?: never;
}

/** The new form of `checkExternalRepo`: the remote URL alone. */
export interface IAbapGitExternalRepoArgs {
  readonly url: string;
  readonly remoteUser?: never;
  readonly remotePassword?: never;
}

/** One object `getModifiedObjects` reports, as `pullRepo` takes it back. */
export interface IAbapGitModifiedObject {
  readonly uri: string;
  readonly type: string;
  readonly name: string;
  readonly packageName: string;
  /** `@agitpullmodifiedobjects:action`, as an integer. */
  readonly action: number;
}

/**
 * Which modified objects a pull may overwrite — the entries
 * `getModifiedObjects` answers, handed back unchanged.
 */
export interface IAbapGitPullSelection {
  readonly overwriteObjects: readonly IAbapGitModifiedObject[];
  readonly packageWarningObjects: readonly IAbapGitModifiedObject[];
}

/**
 * A key-based pull. `branchName` is required: the caller passes the branch
 * `listRepos` reports for the key.
 */
export interface IAbapGitPullRepoArgs {
  readonly key: string;
  readonly branchName: string;
  readonly transportRequest?: string;
  readonly selection?: IAbapGitPullSelection;
}

/**
 * A run's log, by the repository's key and the log's `appLogKey`. SAP loads
 * the log by `appLogKey` alone; pairing it with the key is the caller's.
 */
export interface IAbapGitRunLogArgs {
  readonly key: string;
  readonly appLogKey: string;
}

/** One file of a staged object. */
export interface IAbapGitStagedFile {
  readonly name: string;
  readonly path: string;
  readonly localState: string;
  readonly remoteState: string;
}

/** One object of a repository's staging, as `getStaging` reports it. */
export interface IAbapGitStagedObject {
  readonly wbkey: string;
  readonly version: string;
  readonly uri: string;
  readonly type: string;
  readonly name: string;
  readonly packageName: string;
  readonly files: readonly IAbapGitStagedFile[];
}

/** A commit: its message, its author and its committer — all required. */
export interface IAbapGitCommit {
  readonly text: string;
  readonly author: { readonly name: string; readonly email: string };
  readonly committer: { readonly name: string; readonly email: string };
}

/** What a push sends: the staged objects and the commit. */
export interface IAbapGitPushArgs {
  readonly key: string;
  readonly staged: readonly IAbapGitStagedObject[];
  readonly comment: IAbapGitCommit;
}

/** One file of a repository, in the system's version or the remote's. */
export interface IAbapGitFileArgs {
  readonly key: string;
  readonly filename: string;
  readonly version: 'local' | 'remote';
}

/** A remote branch, read for the package it would be linked to. */
export interface IAbapGitBranchInfoArgs {
  readonly url: string;
  readonly branch: string;
  readonly package: string;
}

/** Switch a repository's branch; `create` is required. */
export interface IAbapGitSwitchBranchArgs {
  readonly key: string;
  readonly branch: string;
  readonly create: boolean;
}

// --- The atoms ---------------------------------------------------------------
//
// One interface per member, generic over the result its slot's reader gives
// (`T`) and the facts its route's reducer gives (`F`): the analyser sees `F`,
// the caller reads `T`. Exactly two overloads each — the caller's error
// subtype `E`, or the default `IAbapGitStructuredError` — and no wire-typed
// one.

/**
 * The options of `listReposQuiet`: the facts options without a credential.
 * The pre-read sends none, so `credentials?: never` refuses one.
 */
export type IAbapGitQuietOptions<
  F,
  E extends IAbapGitStructuredError = IAbapGitStructuredError,
> = Omit<IAbapGitFactsOptions<F, E>, 'credentials'> & {
  readonly credentials?: never;
};

/** `listReposQuiet` — the repository list, read without a credential. */
export interface IAdtAbapGitListReposQuiet<T, F> {
  listReposQuiet<E extends IAbapGitStructuredError>(
    options: IAbapGitQuietOptions<F, E> & {
      analyse: IAbapGitFactsAnalyse<F, E>;
    },
  ): Promise<IAdtResponse<T, E>>;
  listReposQuiet(
    options?: IAbapGitQuietOptions<F>,
  ): Promise<IAdtResponse<T, IAbapGitStructuredError>>;
}

/** The new form of `link` — `credentials: IAbapGitCredentials | null`. */
export interface IAdtAbapGitLinkNewForm<T, F> {
  link<E extends IAbapGitStructuredError>(
    args: IAbapGitLinkNewArgs,
    options: IAbapGitHeaderOptions &
      IAbapGitNewFormOptions<F, E> & { analyse: IAbapGitFactsAnalyse<F, E> },
  ): Promise<IAdtResponse<T, E>>;
  link(
    args: IAbapGitLinkNewArgs,
    options: IAbapGitHeaderOptions & IAbapGitNewFormOptions<F>,
  ): Promise<IAdtResponse<T, IAbapGitStructuredError>>;
}

/** The new form of `checkExternalRepo` — `credentials: IAbapGitCredentials | null`. */
export interface IAdtAbapGitCheckExternalRepoNewForm<T, F> {
  checkExternalRepo<E extends IAbapGitStructuredError>(
    args: IAbapGitExternalRepoArgs,
    options: IAbapGitHeaderOptions &
      IAbapGitNewFormOptions<F, E> & { analyse: IAbapGitFactsAnalyse<F, E> },
  ): Promise<IAdtResponse<T, E>>;
  checkExternalRepo(
    args: IAbapGitExternalRepoArgs,
    options: IAbapGitHeaderOptions & IAbapGitNewFormOptions<F>,
  ): Promise<IAdtResponse<T, IAbapGitStructuredError>>;
}

/** `pullRepo` — a pull addressed by the repository's key. */
export interface IAdtAbapGitPullRepo<T, F> {
  pullRepo<E extends IAbapGitStructuredError>(
    args: IAbapGitPullRepoArgs,
    options: IAbapGitHeaderOptions &
      IAbapGitFactsOptions<F, E> & { analyse: IAbapGitFactsAnalyse<F, E> },
  ): Promise<IAdtResponse<T, E>>;
  pullRepo(
    args: IAbapGitPullRepoArgs,
    options: IAbapGitHeaderOptions & IAbapGitFactsOptions<F>,
  ): Promise<IAdtResponse<T, IAbapGitStructuredError>>;
}

/** `pullRepoInDialog` — the dialog pull, addressed as `pullRepo`. */
export interface IAdtAbapGitPullRepoInDialog<T, F> {
  pullRepoInDialog<E extends IAbapGitStructuredError>(
    args: IAbapGitPullRepoArgs,
    options: IAbapGitHeaderOptions &
      IAbapGitFactsOptions<F, E> & { analyse: IAbapGitFactsAnalyse<F, E> },
  ): Promise<IAdtResponse<T, E>>;
  pullRepoInDialog(
    args: IAbapGitPullRepoArgs,
    options: IAbapGitHeaderOptions & IAbapGitFactsOptions<F>,
  ): Promise<IAdtResponse<T, IAbapGitStructuredError>>;
}

/** `getBranchInfo` — a remote branch, for a package. */
export interface IAdtAbapGitBranchInfo<T, F> {
  getBranchInfo<E extends IAbapGitStructuredError>(
    args: IAbapGitBranchInfoArgs,
    options: IAbapGitHeaderOptions &
      IAbapGitFactsOptions<F, E> & { analyse: IAbapGitFactsAnalyse<F, E> },
  ): Promise<IAdtResponse<T, E>>;
  getBranchInfo(
    args: IAbapGitBranchInfoArgs,
    options: IAbapGitHeaderOptions & IAbapGitFactsOptions<F>,
  ): Promise<IAdtResponse<T, IAbapGitStructuredError>>;
}

/** `getModifiedObjects` — what a pull would overwrite. */
export interface IAdtAbapGitModifiedObjects<T, F> {
  getModifiedObjects<E extends IAbapGitStructuredError>(
    args: IAbapGitRepoKeyArgs,
    options: IAbapGitFactsOptions<F, E> & {
      analyse: IAbapGitFactsAnalyse<F, E>;
    },
  ): Promise<IAdtResponse<T, E>>;
  getModifiedObjects(
    args: IAbapGitRepoKeyArgs,
    options?: IAbapGitFactsOptions<F>,
  ): Promise<IAdtResponse<T, IAbapGitStructuredError>>;
}

/** `getStatus` — a repository's status. */
export interface IAdtAbapGitStatus<T, F> {
  getStatus<E extends IAbapGitStructuredError>(
    args: IAbapGitRepoKeyArgs,
    options: IAbapGitFactsOptions<F, E> & {
      analyse: IAbapGitFactsAnalyse<F, E>;
    },
  ): Promise<IAdtResponse<T, E>>;
  getStatus(
    args: IAbapGitRepoKeyArgs,
    options?: IAbapGitFactsOptions<F>,
  ): Promise<IAdtResponse<T, IAbapGitStructuredError>>;
}

/** `getStaging` — a repository's unstaged, staged and ignored objects. */
export interface IAdtAbapGitStaging<T, F> {
  getStaging<E extends IAbapGitStructuredError>(
    args: IAbapGitRepoKeyArgs,
    options: IAbapGitFactsOptions<F, E> & {
      analyse: IAbapGitFactsAnalyse<F, E>;
    },
  ): Promise<IAdtResponse<T, E>>;
  getStaging(
    args: IAbapGitRepoKeyArgs,
    options?: IAbapGitFactsOptions<F>,
  ): Promise<IAdtResponse<T, IAbapGitStructuredError>>;
}

/** `checkRepo` — a repository's connection to its remote. */
export interface IAdtAbapGitCheckRepo<T, F> {
  checkRepo<E extends IAbapGitStructuredError>(
    args: IAbapGitRepoKeyArgs,
    options: IAbapGitFactsOptions<F, E> & {
      analyse: IAbapGitFactsAnalyse<F, E>;
    },
  ): Promise<IAdtResponse<T, E>>;
  checkRepo(
    args: IAbapGitRepoKeyArgs,
    options?: IAbapGitFactsOptions<F>,
  ): Promise<IAdtResponse<T, IAbapGitStructuredError>>;
}

/** `getRunLog` — a run's log, by key and `appLogKey`. */
export interface IAdtAbapGitRunLog<T, F> {
  getRunLog<E extends IAbapGitStructuredError>(
    args: IAbapGitRunLogArgs,
    options: IAbapGitFactsOptions<F, E> & {
      analyse: IAbapGitFactsAnalyse<F, E>;
    },
  ): Promise<IAdtResponse<T, E>>;
  getRunLog(
    args: IAbapGitRunLogArgs,
    options?: IAbapGitFactsOptions<F>,
  ): Promise<IAdtResponse<T, IAbapGitStructuredError>>;
}

/** `push` — the staged objects, committed and pushed. */
export interface IAdtAbapGitPush<T, F> {
  push<E extends IAbapGitStructuredError>(
    args: IAbapGitPushArgs,
    options: IAbapGitFactsOptions<F, E> & {
      analyse: IAbapGitFactsAnalyse<F, E>;
    },
  ): Promise<IAdtResponse<T, E>>;
  push(
    args: IAbapGitPushArgs,
    options?: IAbapGitFactsOptions<F>,
  ): Promise<IAdtResponse<T, IAbapGitStructuredError>>;
}

/** `getFile` — one file of a repository. */
export interface IAdtAbapGitFile<T, F> {
  getFile<E extends IAbapGitStructuredError>(
    args: IAbapGitFileArgs,
    options: IAbapGitFactsOptions<F, E> & {
      analyse: IAbapGitFactsAnalyse<F, E>;
    },
  ): Promise<IAdtResponse<T, E>>;
  getFile(
    args: IAbapGitFileArgs,
    options?: IAbapGitFactsOptions<F>,
  ): Promise<IAdtResponse<T, IAbapGitStructuredError>>;
}

/** `switchBranch` — a repository's branch, switched or created. */
export interface IAdtAbapGitSwitchBranch<T, F> {
  switchBranch<E extends IAbapGitStructuredError>(
    args: IAbapGitSwitchBranchArgs,
    options: IAbapGitFactsOptions<F, E> & {
      analyse: IAbapGitFactsAnalyse<F, E>;
    },
  ): Promise<IAdtResponse<T, E>>;
  switchBranch(
    args: IAbapGitSwitchBranchArgs,
    options?: IAbapGitFactsOptions<F>,
  ): Promise<IAdtResponse<T, IAbapGitStructuredError>>;
}
