import type { IAdtHeaders } from '../adt/IAdtContentTypes';
import type { IAdtAnalyseOptions, IAnalyse } from '../adt/IAdtObject';
import type { IAdtError, IAdtResponse } from '../adt/IAdtResponse';

export interface ISt05Trace<TState, TDirectory> {
  /** Which runtime resource this is, for a consumer narrowing a union of them. */
  readonly kind: 'st05Trace';

  getState<E extends IAdtError>(
    options: { headers?: IAdtHeaders } & IAdtAnalyseOptions<E> & {
        analyse: IAnalyse<E>;
      },
  ): Promise<IAdtResponse<TState, E>>;
  getState(
    options?: { headers?: IAdtHeaders } & IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TState>>;
  getDirectory<E extends IAdtError>(
    options: { headers?: IAdtHeaders } & IAdtAnalyseOptions<E> & {
        analyse: IAnalyse<E>;
      },
  ): Promise<IAdtResponse<TDirectory, E>>;
  getDirectory(
    options?: { headers?: IAdtHeaders } & IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TDirectory>>;
}
