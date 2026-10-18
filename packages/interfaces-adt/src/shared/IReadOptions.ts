/**
 * Shared read options for ADT source/metadata operations.
 *
 * `accept` was here until 19.0.0. A member typed with these options takes the
 * headers of its request as `headers: IAdtHeaders` instead.
 */
export interface IReadOptions {
  withLongPolling?: boolean;
  version?: 'active' | 'inactive';
}
