/**
 * Feature Toggle (FTG2/FT) ADT operation parameter interfaces (low-level)
 */

import type { IAdtAnalyseOptions, IAnalyse } from './IAdtObject';
import type { IAdtError, IAdtResponse } from './IAdtResponse';

export interface IFeatureToggleReleasePlan {
  version: string;
  sp: string;
}

export interface IFeatureTogglePlanning {
  referenceProduct?: string;
  releaseToCustomer?: IFeatureToggleReleasePlan;
  generalAvailability?: IFeatureToggleReleasePlan;
  generalRollout?: IFeatureToggleReleasePlan;
}

export interface IFeatureToggleRollout {
  lifecycleStatus?: 'new' | 'inValidation' | 'released' | 'discontinued';
  validationStep?: 'internal' | 'releaseToCustomer' | string;
  rolloutStep?:
    | 'releaseToCustomer'
    | 'generalAvailability'
    | 'generalRollout'
    | string;
  strategy?: 'immediate' | 'gradual' | string;
  finalDate?: string;
  event?: 'noRestriction' | string;
  planning?: IFeatureTogglePlanning;
  configurable?: boolean;
  defaultEnabledFor?: 'none' | 'someCustomers' | 'allCustomers' | string;
  reversible?: boolean;
}

export interface IFeatureToggleAttribute {
  key: string;
  value: string;
}

export interface IFeatureToggleHeader {
  description?: string;
  originalLanguage?: string;
  abapLanguageVersion?: string;
}

export interface IFeatureToggleSource {
  header?: IFeatureToggleHeader;
  rollout?: IFeatureToggleRollout;
  toggledPackages?: string[];
  relatedToggles?: string[];
  attributes?: IFeatureToggleAttribute[];
}

export interface IFeatureToggleConfig {
  featureToggleName: string;
  packageName?: string;
  description?: string;
  transportRequest?: string;
  masterSystem?: string;
  responsible?: string;
  source?: IFeatureToggleSource;
}

/**
 * A feature toggle, and what ADT gives one.
 *
 * Until 17.0.0 it extended the wide composite, the full set, and so promised
 * version history and a transport of its own. It has neither: the handler's
 * `getVersions`, `getVersionSource` and `readTransport` all threw.
 *
 * Since 30.0.0 it extends nothing at all. What is below is what is the toggle's
 * alone — switching it, and asking what it is doing right now. The CRUD a
 * toggle also has is the atoms, spelled beside this where an implementation
 * offers them: inheritance decides for the composer what belongs together, and
 * a consumer who wants only the switch had to take eight members to get it.
 */
export interface IFeatureToggleObject<TState> {
  switchOn<E extends IAdtError>(
    config: Partial<IFeatureToggleConfig>,
    opts: { transportRequest: string; userSpecific?: boolean },
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TState, E>>;
  switchOn(
    config: Partial<IFeatureToggleConfig>,
    opts: { transportRequest: string; userSpecific?: boolean },
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TState>>;

  switchOff<E extends IAdtError>(
    config: Partial<IFeatureToggleConfig>,
    opts: { transportRequest: string; userSpecific?: boolean },
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TState, E>>;

  switchOff(
    config: Partial<IFeatureToggleConfig>,
    opts: { transportRequest: string; userSpecific?: boolean },
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TState>>;

  getRuntimeState<E extends IAdtError>(
    config: Partial<IFeatureToggleConfig>,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TState, E>>;
  getRuntimeState(
    config: Partial<IFeatureToggleConfig>,
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TState>>;

  checkState<E extends IAdtError>(
    config: Partial<IFeatureToggleConfig>,
    opts: { userSpecific?: boolean } | undefined,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TState, E>>;
  checkState(
    config: Partial<IFeatureToggleConfig>,
    opts?: { userSpecific?: boolean },
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TState>>;

  readSource<E extends IAdtError>(
    config: Partial<IFeatureToggleConfig>,
    version: 'active' | 'inactive' | undefined,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TState, E>>;
  readSource(
    config: Partial<IFeatureToggleConfig>,
    version?: 'active' | 'inactive',
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TState>>;
}
