/**
 * Header validation result
 */
import type { IValidatedAuthConfig } from './IValidatedAuthConfig';

export interface IHeaderValidationResult {
  /** Is configuration valid? */
  isValid: boolean;
  /** Validated authentication configuration */
  config?: IValidatedAuthConfig;
  /** Validation errors */
  errors: string[];
  /** Warnings */
  warnings: string[];
}

