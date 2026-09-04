import type { IAdtResponse } from '../adt/IAdtResponse';

export type IRuntimeDumpReadView = 'default' | 'summary' | 'formatted';

export interface IRuntimeDumpsListOptions {
  query?: string;
  inlinecount?: 'allpages' | 'none';
  top?: number;
  skip?: number;
  orderby?: string;
  from?: string;
  to?: string;
}

export interface IRuntimeDumpReadOptions {
  view?: IRuntimeDumpReadView;
}

export interface IRuntimeDumps<TList, TDump> {
  /** Which runtime resource this is, for a consumer narrowing a union of them. */
  readonly kind: 'runtimeDumps';

  /** The dumps this system holds. */
  list(options?: IRuntimeDumpsListOptions): Promise<IAdtResponse<TList>>;

  listByUser(
    user?: string,
    options?: Omit<IRuntimeDumpsListOptions, 'query'>,
  ): Promise<IAdtResponse<TList>>;
  getById(
    dumpId: string,
    options?: IRuntimeDumpReadOptions,
  ): Promise<IAdtResponse<TDump>>;
}
