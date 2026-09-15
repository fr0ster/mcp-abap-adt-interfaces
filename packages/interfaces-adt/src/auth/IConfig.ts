/**
 * Configuration - optional composition of authorization and connection configuration
 * Can contain either authorization config, or connection config, or both
 */
import type { IAuthorizationConfig } from './IAuthorizationConfig';
import type { IConnectionConfig } from './IConnectionConfig';

export type IConfig = Partial<IAuthorizationConfig> &
  Partial<IConnectionConfig>;
