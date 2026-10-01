/**
 * Configuration - optional composition of authorization and connection configuration
 * Can contain either authorization config, or connection config, or both
 */

import type { IAuthorizationConfig } from '@mcp-abap-adt/interfaces-auth-sap';
import type { IConnectionConfig } from './IConnectionConfig';

export type IConfig = Partial<IAuthorizationConfig> &
  Partial<IConnectionConfig>;
