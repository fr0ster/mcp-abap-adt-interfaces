import type { IAdtAnalyseOptions, IAnalyse } from '../adt/IAdtObject';
import type { IAdtError, IAdtResponse } from '../adt/IAdtResponse';
import type { AdtReadVersion } from '../shared/IReadOptions';

/** The options of one read of an application job catalog or template. */
export interface IGetApplicationJobOptions {
  /** Sent as the `version` query parameter. */
  version?: AdtReadVersion | undefined;
  /** The Accept of this one request; absent, the implementation sends its own default. */
  accept?: string | undefined;
}

/**
 * An application job catalog (`SAJC`), read as its definition: its ADT object
 * document (`getObject`, `GET /sap/bc/adt/applicationjob/catalogs/<name>`) and
 * its source (`getSource`, the same address plus `/source/main`). One request
 * each. A definition, not job runs or job logs.
 */
export interface IApplicationJobCatalog<TObject, TSource> {
  /** Which runtime resource this is, for a consumer narrowing a union of them. */
  readonly kind: 'applicationJobCatalog';

  getObject<E extends IAdtError>(
    name: string,
    options: IGetApplicationJobOptions &
      IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TObject, E | IAdtError>>;
  getObject(
    name: string,
    options?: IGetApplicationJobOptions & IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TObject>>;
  getSource<E extends IAdtError>(
    name: string,
    options: IGetApplicationJobOptions &
      IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TSource, E | IAdtError>>;
  getSource(
    name: string,
    options?: IGetApplicationJobOptions & IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TSource>>;
}

/**
 * An application job template (`SAJT`), read as its definition: its ADT object
 * document (`getObject`, `GET /sap/bc/adt/applicationjob/templates/<name>`) and
 * its source (`getSource`, plus `/source/main`). One request each.
 */
export interface IApplicationJobTemplate<TObject, TSource> {
  /** Which runtime resource this is, for a consumer narrowing a union of them. */
  readonly kind: 'applicationJobTemplate';

  getObject<E extends IAdtError>(
    name: string,
    options: IGetApplicationJobOptions &
      IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TObject, E | IAdtError>>;
  getObject(
    name: string,
    options?: IGetApplicationJobOptions & IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TObject>>;
  getSource<E extends IAdtError>(
    name: string,
    options: IGetApplicationJobOptions &
      IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TSource, E | IAdtError>>;
  getSource(
    name: string,
    options?: IGetApplicationJobOptions & IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TSource>>;
}
