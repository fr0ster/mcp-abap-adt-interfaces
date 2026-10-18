import type { IAdtAnalyseOptions, IAnalyse } from '../adt/IAdtObject';
import type { IAdtError, IAdtResponse } from '../adt/IAdtResponse';

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
  list<E extends IAdtError>(
    options: IRuntimeDumpsListOptions &
      IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TList, E>>;
  list(
    options?: IRuntimeDumpsListOptions & IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TList>>;

  listByUser<E extends IAdtError>(
    user: string | undefined,
    options: Omit<IRuntimeDumpsListOptions, 'query'> &
      IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TList, E>>;
  listByUser(
    user?: string,
    options?: Omit<IRuntimeDumpsListOptions, 'query'> & IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TList>>;
  getById<E extends IAdtError>(
    dumpId: string,
    options: IRuntimeDumpReadOptions &
      IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TDump, E>>;
  getById(
    dumpId: string,
    options?: IRuntimeDumpReadOptions & IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TDump>>;
}
