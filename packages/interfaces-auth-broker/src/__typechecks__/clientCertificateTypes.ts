// Compile-only assertions. If these stop compiling, the types regressed.

import type { IClientCertificate } from '../serviceKey/IClientCertificate';
import type { IServiceKeyStore } from '../serviceKey/IServiceKeyStore';

const _cert: IClientCertificate = {
  uaaUrl: 'https://sub.authentication.eu10.hana.ondemand.com',
  clientId: 'sb-x',
  certificate: '-----BEGIN CERTIFICATE-----',
  key: '-----BEGIN PRIVATE KEY-----',
  certUrl: 'https://sub.authentication.cert.eu10.hana.ondemand.com',
};
void _cert;

// @ts-expect-error — the certificate is readonly
_cert.clientId = 'other';

// A store without the method still satisfies the contract.
const _without: IServiceKeyStore = {
  getServiceKey: async () => null,
  getAuthorizationConfig: async () => null,
  getConnectionConfig: async () => null,
};
void _without;

// A store with it, answering a certificate or null.
const _with: IServiceKeyStore = {
  ..._without,
  getClientCertificate: async (_destination: string) => _cert,
};
void _with;
const _none: IServiceKeyStore = {
  ..._without,
  getClientCertificate: async () => null,
};
void _none;
