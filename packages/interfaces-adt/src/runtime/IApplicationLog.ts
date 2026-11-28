import type { IAdtAnalyseOptions, IAnalyse } from '../adt/IAdtObject';
import type { IAdtError, IAdtResponse } from '../adt/IAdtResponse';
import type { AdtReadVersion } from '../shared/IReadOptions';

export interface IGetApplicationLogObjectOptions {
  corrNr?: string;
  lockHandle?: string;
  version?: AdtReadVersion;
  accessMode?: string;
  action?: string;
  /** The Accept of this one request; absent, the implementation sends its own default. */
  accept?: string | undefined;
}

export interface IGetApplicationLogSourceOptions {
  corrNr?: string;
  lockHandle?: string;
  version?: AdtReadVersion;
  /** The Accept of this one request; absent, the implementation sends its own default. */
  accept?: string | undefined;
}

export interface IApplicationLog<TObject, TSource, TValidation> {
  /** Which runtime resource this is, for a consumer narrowing a union of them. */
  readonly kind: 'applicationLog';

  getObject<E extends IAdtError>(
    objectName: string,
    options: IGetApplicationLogObjectOptions &
      IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TObject, E | IAdtError>>;
  getObject(
    objectName: string,
    options?: IGetApplicationLogObjectOptions & IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TObject>>;
  getSource<E extends IAdtError>(
    objectName: string,
    options: IGetApplicationLogSourceOptions &
      IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TSource, E | IAdtError>>;
  getSource(
    objectName: string,
    options?: IGetApplicationLogSourceOptions & IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TSource>>;
  validateName<E extends IAdtError>(
    objectName: string,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TValidation, E | IAdtError>>;
  validateName(
    objectName: string,
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TValidation>>;
}
