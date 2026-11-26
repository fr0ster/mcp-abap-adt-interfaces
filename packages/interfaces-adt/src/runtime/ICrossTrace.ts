import type { IAdtAnalyseOptions, IAnalyse } from '../adt/IAdtObject';
import type { IAdtError, IAdtResponse } from '../adt/IAdtResponse';

export interface IListCrossTracesOptions {
  traceUser?: string;
  actCreateUser?: string;
  actChangeUser?: string;
}

/**
 * One key per distinct answer this contract has, not one per member.
 *
 * Five separate type parameters would make the fourth unnameable without
 * spelling the first three; a record names them, and a consumer overriding one
 * reading writes the key rather than counting positions. The same shape
 * `@mcp-abap-adt/adt-clients` carries its result sets in.
 */
export interface ICrossTraceResults {
  list: unknown;
  trace: unknown;
  records: unknown;
  recordContent: unknown;
  activations: unknown;
}

export interface ICrossTrace<R extends ICrossTraceResults> {
  /** Which runtime resource this is, for a consumer narrowing a union of them. */
  readonly kind: 'crossTrace';

  /** The traces this system holds. */
  list<E extends IAdtError>(
    options: IListCrossTracesOptions &
      IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<R['list'], E | IAdtError>>;
  list(
    options?: IListCrossTracesOptions & IAdtAnalyseOptions,
  ): Promise<IAdtResponse<R['list']>>;

  getById<E extends IAdtError>(
    traceId: string,
    includeSensitiveData: boolean | undefined,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<R['trace'], E | IAdtError>>;
  getById(
    traceId: string,
    includeSensitiveData?: boolean,
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<R['trace']>>;
  getRecords<E extends IAdtError>(
    traceId: string,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<R['records'], E | IAdtError>>;
  getRecords(
    traceId: string,
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<R['records']>>;
  getRecordContent<E extends IAdtError>(
    traceId: string,
    recordNumber: number,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<R['recordContent'], E | IAdtError>>;
  getRecordContent(
    traceId: string,
    recordNumber: number,
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<R['recordContent']>>;
  getActivations<E extends IAdtError>(
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<R['activations'], E | IAdtError>>;
  getActivations(
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<R['activations']>>;
}
