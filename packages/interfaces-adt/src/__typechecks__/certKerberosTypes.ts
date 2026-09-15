// Compile-only assertions. If these stop compiling, the types regressed.

import type { ICertificateMaterialLoader } from '../auth/ICertificateMaterialLoader';
import type { ISapConfig } from '../sap/ISapConfig';
import type { SapAuthType } from '../sap/SapAuthType';

const _authTypes: SapAuthType[] = [
  'basic',
  'jwt',
  'saml',
  'certificate',
  'kerberos',
];
void _authTypes;

const _cfg: ISapConfig = {
  url: 'https://h',
  authType: 'certificate',
  certPath: '/c.crt',
  certKeyPath: '/c.key',
  certPfxPath: '/c.pfx',
  certPassphrase: 'pw',
  kerberosSpn: 'HTTP@h',
  kerberosService: 'HTTP',
};
void _cfg;

const _loader: ICertificateMaterialLoader = {
  load: async () => ({ cert: 'C', key: 'K' }),
};
void _loader;
