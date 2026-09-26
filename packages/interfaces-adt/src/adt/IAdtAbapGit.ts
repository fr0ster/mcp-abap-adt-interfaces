import type { IAdtAnalyseOptions, IAnalyse } from './IAdtObject';
import type { IAdtError, IAdtResponse } from './IAdtResponse';
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
  link<E extends IAdtError>(
    args: IAbapGitLinkArgs,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<void, E>>;
  link(
    args: IAbapGitLinkArgs,
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<void>>;
  /**
   * Start a pull — one POST to `args.pullLink`.
   *
   * It does not wait, and it does not look the link up. The caller lists the
   * repositories once, keeps the link, posts, then polls `listRepos` on their
   * own terms and reads `getErrorLog` if the status says to.
   */
  pull<E extends IAdtError>(
    args: IAbapGitPullArgs,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TPull, E>>;
  pull(
    args: IAbapGitPullArgs,
    options?: IAdtAnalyseOptions,
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
   */
  getErrorLog<E extends IAdtError>(
    logLink: string,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TErrorLog, E>>;
  getErrorLog(
    logLink: string,
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TErrorLog>>;
  checkExternalRepo<E extends IAdtError>(
    args: IAbapGitExternalRepoCredentials,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TExternalRepo, E>>;
  checkExternalRepo(
    args: IAbapGitExternalRepoCredentials,
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TExternalRepo>>;
}
