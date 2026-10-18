import type { IAdtAnalyseOptions, IAnalyse } from '../adt/IAdtObject';
import type { IAdtError, IAdtResponse } from '../adt/IAdtResponse';

export interface ISt05Trace<TState, TDirectory> {
  /** Which runtime resource this is, for a consumer narrowing a union of them. */
  readonly kind: 'st05Trace';

  getState<E extends IAdtError>(
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TState, E>>;
  getState(options?: IAdtAnalyseOptions): Promise<IAdtResponse<TState>>;
  getDirectory<E extends IAdtError>(
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TDirectory, E>>;
  getDirectory(options?: IAdtAnalyseOptions): Promise<IAdtResponse<TDirectory>>;
}
