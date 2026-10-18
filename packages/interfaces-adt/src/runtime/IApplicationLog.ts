import type { IAdtAnalyseOptions, IAnalyse } from '../adt/IAdtObject';
import type { IAdtError, IAdtResponse } from '../adt/IAdtResponse';

export interface IGetApplicationLogObjectOptions {
  corrNr?: string;
  lockHandle?: string;
  version?: string;
  accessMode?: string;
  action?: string;
}

export interface IGetApplicationLogSourceOptions {
  corrNr?: string;
  lockHandle?: string;
  version?: string;
}

export interface IApplicationLog<TObject, TSource, TValidation> {
  /** Which runtime resource this is, for a consumer narrowing a union of them. */
  readonly kind: 'applicationLog';

  getObject<E extends IAdtError>(
    objectName: string,
    options: IGetApplicationLogObjectOptions &
      IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TObject, E>>;
  getObject(
    objectName: string,
    options?: IGetApplicationLogObjectOptions & IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TObject>>;
  getSource<E extends IAdtError>(
    objectName: string,
    options: IGetApplicationLogSourceOptions &
      IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TSource, E>>;
  getSource(
    objectName: string,
    options?: IGetApplicationLogSourceOptions & IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TSource>>;
  validateName<E extends IAdtError>(
    objectName: string,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TValidation, E>>;
  validateName(
    objectName: string,
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TValidation>>;
}
