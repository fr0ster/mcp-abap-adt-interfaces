// Compile-only assertions. If these stop compiling, the types regressed.
//
// 1.4.0: a destination's means carry the RFC address, so a URL-free RFC
// destination passes through the broker and the stores. The seven are the
// SAP NW RFC SDK's connection parameters, each optional and each
// `?: string | undefined`: a store holds what the destination states, and
// its consumer — not the store — decides what an RFC destination must state.
// `language` and `sapClient` were there before.

import type { IConnectionConfig } from '../auth/IConnectionConfig';

// An application-server destination, as a store hands it to the broker.
const _applicationServer: IConnectionConfig = {
  authType: 'snc',
  sapClient: '100',
  language: 'EN',
  ashost: 'sap.example.com',
  sysnr: '00',
  saprouter: '/H/router.example.com/S/3299/H/',
  sncPartnerName: 'p:CN=SID',
};
void _applicationServer;

// A message-server destination.
const _messageServer: IConnectionConfig = {
  authType: 'basic',
  sapClient: '100',
  language: 'EN',
  mshost: 'ms.example.com',
  msserv: '3600',
  sysid: 'SID',
  group: 'PUBLIC',
};
void _messageServer;

// Each of the seven may be `undefined` as well as absent, under
// `exactOptionalPropertyTypes`.
const _undefinedEach: IConnectionConfig = {
  ashost: undefined,
  sysnr: undefined,
  mshost: undefined,
  msserv: undefined,
  sysid: undefined,
  group: undefined,
  saprouter: undefined,
};
void _undefinedEach;

// Each of the seven reads as `string | undefined`.
function _reads(config: IConnectionConfig): (string | undefined)[] {
  return [
    config.ashost,
    config.sysnr,
    config.mshost,
    config.msserv,
    config.sysid,
    config.group,
    config.saprouter,
  ];
}
void _reads;
