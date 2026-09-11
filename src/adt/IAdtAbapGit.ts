import type { IAdtResponse } from './IAdtResponse';
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
 * `getRepo` in their own loop.
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

export interface IAbapGitUnlinkArgs {
  package: string;
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

export interface IAdtAbapGitClient<
  TRepos,
  TRepo,
  TErrorLog,
  TPull,
  TExternalRepo,
> {
  link(args: IAbapGitLinkArgs): Promise<IAdtResponse<void>>;
  /**
   * Start a pull — one POST to `args.pullLink`.
   *
   * It does not wait, and it does not look the link up. The caller lists the
   * repositories once, keeps the link, posts, then polls `getRepo` on their own
   * terms and reads `getErrorLog` if the status says to.
   */
  pull(args: IAbapGitPullArgs): Promise<IAdtResponse<TPull>>;
  unlink(args: IAbapGitUnlinkArgs): Promise<IAdtResponse<void>>;
  listRepos(): Promise<IAdtResponse<TRepos>>;
  getRepo(packageName: string): Promise<IAdtResponse<TRepo>>;
  getErrorLog(packageName: string): Promise<IAdtResponse<TErrorLog>>;
  checkExternalRepo(
    args: IAbapGitExternalRepoCredentials,
  ): Promise<IAdtResponse<TExternalRepo>>;
}
