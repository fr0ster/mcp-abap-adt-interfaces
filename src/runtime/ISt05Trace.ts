import type { IAdtWireResponse } from '../connection/IAbapConnection';
import type { IRuntimeAnalysisObject } from './types';

export interface ISt05Trace extends IRuntimeAnalysisObject<'st05Trace'> {
  getState(): Promise<IAdtWireResponse>;
  getDirectory(): Promise<IAdtWireResponse>;
}
