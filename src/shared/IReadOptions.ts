/**
 * Shared read options for ADT source/metadata operations
 */
export interface IReadOptions {
  withLongPolling?: boolean;
  accept?: string;
  version?: 'active' | 'inactive';
}
