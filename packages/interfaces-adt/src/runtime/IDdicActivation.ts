import type { IAdtHeaders } from '../adt/IAdtContentTypes';
import type { IAdtAnalyseOptions, IAnalyse } from '../adt/IAdtObject';
import type { IAdtError, IAdtResponse } from '../adt/IAdtResponse';

export interface IGetActivationGraphOptions {
  objectName?: string;
  objectType?: string;
  logName?: string;
}

export interface IDdicActivation<TGraph> {
  /** Which runtime resource this is, for a consumer narrowing a union of them. */
  readonly kind: 'ddicActivation';

  getGraph<E extends IAdtError>(
    options: { headers?: IAdtHeaders } & IGetActivationGraphOptions &
      IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TGraph, E>>;
  getGraph(
    options?: { headers?: IAdtHeaders } & IGetActivationGraphOptions &
      IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TGraph>>;
}
