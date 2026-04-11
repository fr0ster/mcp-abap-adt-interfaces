import type { IAdtResponse } from '../connection/IAbapConnection';
import type { IListableRuntimeObject } from './types';

export interface IMemorySnapshotsListOptions {
  user?: string;
  originalUser?: string;
}

export interface ISnapshotRankingListOptions {
  maxNumberOfObjects?: number;
  excludeAbapType?: string[];
  sortAscending?: boolean;
  sortByColumnName?: string;
  groupByParentType?: boolean;
}

export interface ISnapshotChildrenOptions {
  maxNumberOfObjects?: number;
  sortAscending?: boolean;
  sortByColumnName?: string;
}

export interface ISnapshotReferencesOptions {
  maxNumberOfReferences?: number;
}

export interface IMemorySnapshots
  extends IListableRuntimeObject<
    IAdtResponse,
    IMemorySnapshotsListOptions,
    'memorySnapshots'
  > {
  getById(snapshotId: string): Promise<IAdtResponse>;
  getOverview(snapshotId: string): Promise<IAdtResponse>;
  getRankingList(
    snapshotId: string,
    options?: ISnapshotRankingListOptions,
  ): Promise<IAdtResponse>;
  getChildren(
    snapshotId: string,
    parentKey: string,
    options?: ISnapshotChildrenOptions,
  ): Promise<IAdtResponse>;
  getReferences(
    snapshotId: string,
    objectKey: string,
    options?: ISnapshotReferencesOptions,
  ): Promise<IAdtResponse>;
  getDeltaOverview(uri1: string, uri2: string): Promise<IAdtResponse>;
  getDeltaRankingList(
    uri1: string,
    uri2: string,
    options?: ISnapshotRankingListOptions,
  ): Promise<IAdtResponse>;
  getDeltaChildren(
    uri1: string,
    uri2: string,
    parentKey: string,
    options?: ISnapshotChildrenOptions,
  ): Promise<IAdtResponse>;
  getDeltaReferences(
    uri1: string,
    uri2: string,
    objectKey: string,
    options?: ISnapshotReferencesOptions,
  ): Promise<IAdtResponse>;
}
