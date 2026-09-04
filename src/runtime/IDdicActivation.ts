import type { IAdtResponse } from '../adt/IAdtResponse';

export interface IGetActivationGraphOptions {
  objectName?: string;
  objectType?: string;
  logName?: string;
}

export interface IDdicActivation<TGraph> {
  /** Which runtime resource this is, for a consumer narrowing a union of them. */
  readonly kind: 'ddicActivation';

  getGraph(options?: IGetActivationGraphOptions): Promise<IAdtResponse<TGraph>>;
}
