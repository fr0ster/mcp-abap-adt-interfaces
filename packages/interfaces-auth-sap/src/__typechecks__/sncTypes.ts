// Compile-only assertions. If these stop compiling, the types regressed.

import type { IConnectionConfig } from '../auth/IConnectionConfig';
import type { ISapConfig } from '../sap/ISapConfig';
import type { SapAuthType } from '../sap/SapAuthType';

const _authType: SapAuthType = 'snc';
void _authType;

const _sap: ISapConfig = {
  url: 'http://h:8000',
  authType: 'snc',
  connectionType: 'rfc',
  sncPartnerName: 'p:CN=SID',
  sncQop: '9',
  sncLib: '/lib/sapcrypto.so',
  sncMyName: 'p:CN=USER',
};
void _sap;

// An SNC-only destination, as a store hands it to the broker: no username,
// no password, no UAA fields.
const _conn: IConnectionConfig = {
  serviceUrl: 'http://h:8000',
  authType: 'snc',
  sapClient: '100',
  sncPartnerName: 'p:CN=SID',
  sncQop: '9',
};
void _conn;
