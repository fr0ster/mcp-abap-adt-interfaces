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
 *
 * **One result type per answer since 11.0.0.** All five members answered
 * `TState`, and they answer four different things: a switch, the runtime
 * state, a state check and the toggle's source. A result strategy given at
 * construction (decision 22) could shape only one of them; the record below
 * names each, and travels as one parameter because five positional ones would
 * be a signature nobody can call — the same form as {@link ICrossTraceResults}.
 */
export interface IFeatureToggleObjectResults {
  /** What `switchOn` and `switchOff` answer. */
  switched: unknown;
  /** What `getRuntimeState` answers. */
  runtimeState: unknown;
  /** What `checkState` answers. */
  checkState: unknown;
  /** What `readSource` answers. */
  source: unknown;
}

export interface IFeatureToggleObject<R extends IFeatureToggleObjectResults> {
  switchOn<E extends IAdtError>(
    config: Partial<IFeatureToggleConfig>,
    opts: { transportRequest: string; userSpecific?: boolean },
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<R['switched'], E>>;
  switchOn(
    config: Partial<IFeatureToggleConfig>,
    opts: { transportRequest: string; userSpecific?: boolean },
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<R['switched']>>;

  switchOff<E extends IAdtError>(
    config: Partial<IFeatureToggleConfig>,
    opts: { transportRequest: string; userSpecific?: boolean },
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<R['switched'], E>>;

  switchOff(
    config: Partial<IFeatureToggleConfig>,
    opts: { transportRequest: string; userSpecific?: boolean },
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<R['switched']>>;

  getRuntimeState<E extends IAdtError>(
    config: Partial<IFeatureToggleConfig>,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<R['runtimeState'], E>>;
  getRuntimeState(
    config: Partial<IFeatureToggleConfig>,
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<R['runtimeState']>>;

  checkState<E extends IAdtError>(
    config: Partial<IFeatureToggleConfig>,
    opts: { userSpecific?: boolean } | undefined,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<R['checkState'], E>>;
  checkState(
    config: Partial<IFeatureToggleConfig>,
    opts?: { userSpecific?: boolean },
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<R['checkState']>>;

  readSource<E extends IAdtError>(
    config: Partial<IFeatureToggleConfig>,
    version: 'active' | 'inactive' | undefined,
    options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<R['source'], E>>;
  readSource(
    config: Partial<IFeatureToggleConfig>,
    version?: 'active' | 'inactive',
    options?: IAdtAnalyseOptions,
  ): Promise<IAdtResponse<R['source']>>;
}
