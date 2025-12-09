/**
 * Transport Request Builder Configuration Interface
 */

export interface ITransportBuilderConfig {
  description: string;
  transportType?: 'workbench' | 'customizing';
  targetSystem?: string;
  owner?: string;
  transportNumber?: string; // Set after create, used for read operations
}
