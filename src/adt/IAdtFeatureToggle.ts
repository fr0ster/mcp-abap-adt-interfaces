/**
 * Feature Toggle (FTG2/FT) ADT operation parameter interfaces (low-level)
 */

import type {
  IAdtActivatable,
  IAdtCheckable,
  IAdtCreatable,
  IAdtDeletable,
  IAdtLockable,
  IAdtReadable,
  IAdtUpdatable,
  IAdtValidatable,
} from './IAdtCapabilities';
import type { IAdtResponse } from './IAdtResponse';

export type FeatureToggleState = 'on' | 'off' | 'undefined';

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

export interface ICreateFeatureToggleParams {
  feature_toggle_name: string;
  description?: string;
  package_name: string;
  transport_request?: string;
  master_system?: string;
  responsible?: string;
  source?: IFeatureToggleSource;
}

export interface IDeleteFeatureToggleParams {
  feature_toggle_name: string;
  transport_request?: string;
}

export interface IToggleFeatureToggleParams {
  feature_toggle_name: string;
  state: 'on' | 'off';
  is_user_specific: boolean;
  transport_request?: string;
}

export interface IFeatureToggleClientLevel {
  client: string;
  description?: string;
  state: FeatureToggleState;
}

export interface IFeatureToggleUserLevel {
  user: string;
  state: FeatureToggleState;
}

export interface IFeatureToggleRuntimeState {
  name: string;
  clientState: FeatureToggleState;
  userState: FeatureToggleState;
  clientChangedBy?: string;
  clientChangedOn?: string;
  clientStates: IFeatureToggleClientLevel[];
  userStates: IFeatureToggleUserLevel[];
}

export interface IFeatureToggleCheckStateResult {
  currentState: FeatureToggleState;
  transportPackage?: string;
  transportUri?: string;
  customizingTransportAllowed: boolean;
}

export interface IFeatureToggleConfig {
  featureToggleName: string;
  packageName?: string;
  description?: string;
  transportRequest?: string;
  masterSystem?: string;
  responsible?: string;
  source?: IFeatureToggleSource;
  onLock?: (lockHandle: string) => void;
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
export interface IFeatureToggleObject {
  switchOn(
    config: Partial<IFeatureToggleConfig>,
    opts: { transportRequest: string; userSpecific?: boolean },
  ): Promise<IAdtResponse<IFeatureToggleRuntimeState>>;

  switchOff(
    config: Partial<IFeatureToggleConfig>,
    opts: { transportRequest: string; userSpecific?: boolean },
  ): Promise<IAdtResponse<IFeatureToggleRuntimeState>>;

  getRuntimeState(
    config: Partial<IFeatureToggleConfig>,
  ): Promise<IAdtResponse<IFeatureToggleRuntimeState>>;

  checkState(
    config: Partial<IFeatureToggleConfig>,
    opts?: { userSpecific?: boolean },
  ): Promise<IAdtResponse<IFeatureToggleRuntimeState>>;

  readSource(
    config: Partial<IFeatureToggleConfig>,
    version?: 'active' | 'inactive',
  ): Promise<IAdtResponse<IFeatureToggleRuntimeState>>;
}
