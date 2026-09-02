import type { IAdtWireResponse } from '../connection/IAbapConnection';
import type { IListableRuntimeObject } from './types';

export type IRuntimeDumpReadView = 'default' | 'summary' | 'formatted';

export interface IRuntimeDumpsListOptions {
  query?: string;
  inlinecount?: 'allpages' | 'none';
  top?: number;
  skip?: number;
  orderby?: string;
  from?: string;
  to?: string;
}

export interface IRuntimeDumpReadOptions {
  view?: IRuntimeDumpReadView;
}

export interface IRuntimeDumps
  extends IListableRuntimeObject<
    IAdtWireResponse,
    IRuntimeDumpsListOptions,
    'runtimeDumps'
  > {
  listByUser(
    user?: string,
    options?: Omit<IRuntimeDumpsListOptions, 'query'>,
  ): Promise<IAdtWireResponse>;
  getById(
    dumpId: string,
    options?: IRuntimeDumpReadOptions,
  ): Promise<IAdtWireResponse>;
}
