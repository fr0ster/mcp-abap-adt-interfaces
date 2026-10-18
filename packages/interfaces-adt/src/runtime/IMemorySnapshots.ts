import type { IAdtAnalyseOptions, IAnalyse } from '../adt/IAdtObject';
import type { IAdtError, IAdtResponse } from '../adt/IAdtResponse';

export interface IMemorySnapshotsListOptions {
  user?: string;
  originalUser?: string;
}

/**
 * The limits below are required: a view that takes one answers 400 without it.
 */
export interface ISnapshotRankingListOptions {
  maxNumberOfObjects: number;
  excludeAbapType?: string[];
  sortAscending?: boolean;
  sortByColumnName?: string;
  groupByParentType?: boolean;
}

export interface ISnapshotChildrenOptions {
  maxNumberOfObjects: number;
  sortAscending?: boolean;
  sortByColumnName?: string;
}

export interface ISnapshotReferencesOptions {
  maxNumberOfReferences: number;
}

type WithAnalyse<E extends IAdtError, O = unknown> = O &
  IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> };
type WithoutAnalyse<O = unknown> = O & IAdtAnalyseOptions;

/**
 * The memory snapshots the system lists, one member per request.
 *
 * A snapshot is addressed by the id the list gives it, a memory object inside
 * it by the `key` a ranking list gives it. A delta compares two snapshots: its
 * values are those of `toId`, each with the change from `fromId`.
 *
 * A snapshot written by the debugger reaches the list only later. Reading it
 * needs an authorization of its own; a user without it is answered an empty
 * list, not a refusal.
 */
export interface IMemorySnapshots<
  TList,
  TSnapshot,
  TOverview,
  TRankingList,
  TChildren,
  TReferences,
> {
  /** Which runtime resource this is, for a consumer narrowing a union of them. */
  readonly kind: 'memorySnapshots';

  list<E extends IAdtError>(
    options: WithAnalyse<E, IMemorySnapshotsListOptions>,
  ): Promise<IAdtResponse<TList, E>>;
  list(
    options?: WithoutAnalyse<IMemorySnapshotsListOptions>,
  ): Promise<IAdtResponse<TList>>;

  getById<E extends IAdtError>(
    snapshotId: string,
    options: WithAnalyse<E>,
  ): Promise<IAdtResponse<TSnapshot, E>>;
  getById(
    snapshotId: string,
    options?: WithoutAnalyse,
  ): Promise<IAdtResponse<TSnapshot>>;

  getOverview<E extends IAdtError>(
    snapshotId: string,
    options: WithAnalyse<E>,
  ): Promise<IAdtResponse<TOverview, E>>;
  getOverview(
    snapshotId: string,
    options?: WithoutAnalyse,
  ): Promise<IAdtResponse<TOverview>>;

  getRankingList<E extends IAdtError>(
    snapshotId: string,
    options: WithAnalyse<E, ISnapshotRankingListOptions>,
  ): Promise<IAdtResponse<TRankingList, E>>;
  getRankingList(
    snapshotId: string,
    options: WithoutAnalyse<ISnapshotRankingListOptions>,
  ): Promise<IAdtResponse<TRankingList>>;

  getChildren<E extends IAdtError>(
    snapshotId: string,
    parentKey: string,
    options: WithAnalyse<E, ISnapshotChildrenOptions>,
  ): Promise<IAdtResponse<TChildren, E>>;
  getChildren(
    snapshotId: string,
    parentKey: string,
    options: WithoutAnalyse<ISnapshotChildrenOptions>,
  ): Promise<IAdtResponse<TChildren>>;

  getReferences<E extends IAdtError>(
    snapshotId: string,
    objectKey: string,
    options: WithAnalyse<E, ISnapshotReferencesOptions>,
  ): Promise<IAdtResponse<TReferences, E>>;
  getReferences(
    snapshotId: string,
    objectKey: string,
    options: WithoutAnalyse<ISnapshotReferencesOptions>,
  ): Promise<IAdtResponse<TReferences>>;

  getDeltaOverview<E extends IAdtError>(
    fromId: string,
    toId: string,
    options: WithAnalyse<E>,
  ): Promise<IAdtResponse<TOverview, E>>;
  getDeltaOverview(
    fromId: string,
    toId: string,
    options?: WithoutAnalyse,
  ): Promise<IAdtResponse<TOverview>>;

  getDeltaRankingList<E extends IAdtError>(
    fromId: string,
    toId: string,
    options: WithAnalyse<E, ISnapshotRankingListOptions>,
  ): Promise<IAdtResponse<TRankingList, E>>;
  getDeltaRankingList(
    fromId: string,
    toId: string,
    options: WithoutAnalyse<ISnapshotRankingListOptions>,
  ): Promise<IAdtResponse<TRankingList>>;

  getDeltaChildren<E extends IAdtError>(
    fromId: string,
    toId: string,
    parentKey: string,
    options: WithAnalyse<E, ISnapshotChildrenOptions>,
  ): Promise<IAdtResponse<TChildren, E>>;
  getDeltaChildren(
    fromId: string,
    toId: string,
    parentKey: string,
    options: WithoutAnalyse<ISnapshotChildrenOptions>,
  ): Promise<IAdtResponse<TChildren>>;

  getDeltaReferences<E extends IAdtError>(
    fromId: string,
    toId: string,
    objectKey: string,
    options: WithAnalyse<E, ISnapshotReferencesOptions>,
  ): Promise<IAdtResponse<TReferences, E>>;
  getDeltaReferences(
    fromId: string,
    toId: string,
    objectKey: string,
    options: WithoutAnalyse<ISnapshotReferencesOptions>,
  ): Promise<IAdtResponse<TReferences>>;
}
