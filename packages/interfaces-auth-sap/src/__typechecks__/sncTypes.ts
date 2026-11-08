// Compile-only assertions. If these stop compiling, the types regressed.

import type { ISapConfig } from '../sap/ISapConfig';
import type { SapAuthType } from '../sap/SapAuthType';

const _authType: SapAuthType = 'snc';
void _authType;

const _sap: ISapConfig = {
  authType: 'snc',
  connectionType: 'rfc',
  client: '100',
  language: 'EN',
  ashost: 'h',
  sysnr: '00',
  sncPartnerName: 'p:CN=SID',
  sncQop: '9',
  sncLib: '/lib/sapcrypto.so',
  sncMyName: 'p:CN=USER',
};
void _sap;
