/**
 * @mcp-abap-adt/interfaces-adt-connection
 *
 * The ABAP connection: what an ADT request is sent through, and what comes
 * back off the wire.
 *
 * **Its own package because it moves on its own schedule.** These four files
 * were `interfaces-adt/src/connection/` until 11.0.0, and every release of the
 * object contracts — 9, 10 and 11 in one day, none touching them — made the
 * connector either follow or install a second copy. The subject is still ADT
 * (decision 35); what separated it is the release rate (decision 38).
 */
export type { IAbapConnection, IAdtWireResponse } from './IAbapConnection';
export type { IAbapRequestOptions } from './IAbapRequestOptions';
export type {
  AdtSessionErrorCode,
  ICriticalSection,
  IDeferredResponseConnection,
  IRequestProfiling,
  ISessionLifecycleAware,
} from './IConnectionCapabilities';
export { ADT_SESSION_ERROR } from './IConnectionCapabilities';
export type { ITimeoutConfig } from './ITimeoutConfig';
