import type { IAdtResponse } from '../adt/IAdtResponse';

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
  list(options?: IListCrossTracesOptions): Promise<IAdtResponse<R['list']>>;

  getById(
    traceId: string,
    includeSensitiveData?: boolean,
  ): Promise<IAdtResponse<R['trace']>>;
  getRecords(traceId: string): Promise<IAdtResponse<R['records']>>;
  getRecordContent(
    traceId: string,
    recordNumber: number,
  ): Promise<IAdtResponse<R['recordContent']>>;
  getActivations(): Promise<IAdtResponse<R['activations']>>;
}
