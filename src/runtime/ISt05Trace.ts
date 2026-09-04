import type { IAdtResponse } from '../adt/IAdtResponse';
import type { IAdtWireResponse } from '../connection/IAbapConnection';

export interface ISt05Trace<TState, TDirectory> {
  /** Which runtime resource this is, for a consumer narrowing a union of them. */
  readonly kind: 'st05Trace';

  getState(): Promise<IAdtResponse<TState>>;
  getDirectory(): Promise<IAdtResponse<TDirectory>>;
}
