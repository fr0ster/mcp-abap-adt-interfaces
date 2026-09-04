import type { IAdtResponse } from './IAdtResponse';
export interface IAbapGitLinkArgs {
  package: string;
  url: string;
  branchName?: string;
  remoteUser?: string;
  remotePassword?: string;
  transportRequest?: string;
}

export interface IAbapGitPullArgs<TStatus> {
  package: string;
  branchName?: string;
  remoteUser?: string;
  remotePassword?: string;
  transportRequest?: string;
  pollIntervalMs?: number;
  maxPollDurationMs?: number;
  signal?: AbortSignal;
  /**
   * Reported while the pull runs, with whatever the implementation shapes a
   * repository status into — the same reading its `getRepo` answers. The shape
   * is the implementation's since 31.0.0, so it arrives as a type parameter
   * rather than as a type this package declares.
   */
  onProgress?: (status: TStatus) => void;
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
  pull(args: IAbapGitPullArgs<TRepo>): Promise<IAdtResponse<TPull>>;
  unlink(args: IAbapGitUnlinkArgs): Promise<IAdtResponse<void>>;
  listRepos(): Promise<IAdtResponse<TRepos>>;
  getRepo(packageName: string): Promise<IAdtResponse<TRepo>>;
  getErrorLog(packageName: string): Promise<IAdtResponse<TErrorLog>>;
  checkExternalRepo(
    args: IAbapGitExternalRepoCredentials,
  ): Promise<IAdtResponse<TExternalRepo>>;
}
