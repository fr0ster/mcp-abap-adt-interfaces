import type { IAdtResponse } from '../adt/IAdtResponse';
import type { IAdtWireResponse } from '../connection/IAbapConnection';

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

  getObject(
    objectName: string,
    options?: IGetApplicationLogObjectOptions,
  ): Promise<IAdtResponse<TObject>>;
  getSource(
    objectName: string,
    options?: IGetApplicationLogSourceOptions,
  ): Promise<IAdtResponse<TSource>>;
  validateName(objectName: string): Promise<IAdtResponse<TValidation>>;
}
