/**
 * Configuration - optional composition of authorization and connection configuration
 * Can contain either authorization config, or connection config, or both
 */

import type { IConnectionConfig } from '@mcp-abap-adt/interfaces-auth';
import type { IAuthorizationConfig } from './IAuthorizationConfig';

export type IConfig = Partial<IAuthorizationConfig> &
  Partial<IConnectionConfig>;
