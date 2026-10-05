// Compile-only assertions. If these stop compiling, the types regressed.

import type { ICertificateMaterial } from '../auth/ICertificateMaterial';
import type {
  IClientAuthentication,
  ITokenRequestAuthentication,
  ITokenRequestDraft,
} from '../auth/IClientAuthentication';
import type { TokenProviderErrorCode } from '../token/TokenProviderErrorCodes';
import { TOKEN_PROVIDER_ERROR_CODES } from '../token/TokenProviderErrorCodes';

// A draft with only what is required, and one carrying the mTLS alias.
const _draft: ITokenRequestDraft = {
  endpoint: 'https://uaa.example/oauth/token',
  clientId: 'sb-client',
  grantType: 'client_credentials',
};
const _draftMtls: ITokenRequestDraft = {
  ..._draft,
  mtlsEndpoint: 'https://mtls.uaa.example/oauth/token',
};
// A device-authorization draft names the token endpoint apart from its own.
const _draftDevice: ITokenRequestDraft = {
  endpoint:
    'https://kc.example/realms/test/protocol/openid-connect/auth/device',
  tokenEndpoint: 'https://kc.example/realms/test/protocol/openid-connect/token',
  clientId: 'sb-client',
  grantType: 'device_authorization',
};
void _draft;
void _draftMtls;
void _draftDevice;

// Every member of the authentication is optional; the empty one is valid.
const _nothing: ITokenRequestAuthentication = {};
const _all: ITokenRequestAuthentication = {
  endpoint: 'https://cert.uaa.example/oauth/token',
  parameters: { client_id: 'sb-client', client_assertion: 'jwt' },
  headers: { Authorization: 'Basic abc' },
};
void _nothing;
void _all;

// A client that presents no TLS material omits `tlsMaterial`.
const _secretClient: IClientAuthentication = {
  authenticate: async (draft: ITokenRequestDraft) => ({
    parameters: { client_id: draft.clientId, client_secret: 's' },
  }),
};
void _secretClient;

// A client that presents a certificate also answers `tlsMaterial`.
const _certClient: IClientAuthentication = {
  authenticate: async (draft: ITokenRequestDraft) => ({
    ...(draft.mtlsEndpoint === undefined
      ? {}
      : { endpoint: draft.mtlsEndpoint }),
    parameters: { client_id: draft.clientId },
  }),
  tlsMaterial: async (): Promise<ICertificateMaterial> => ({
    cert: 'pem',
    key: 'pem',
  }),
};
void _certClient;

// The two codes a client-authentication failure carries.
const _certificateCode: TokenProviderErrorCode =
  TOKEN_PROVIDER_ERROR_CODES.CERTIFICATE_MATERIAL_ERROR;
const _clientAuthCode: TokenProviderErrorCode =
  TOKEN_PROVIDER_ERROR_CODES.CLIENT_AUTHENTICATION_ERROR;
void _certificateCode;
void _clientAuthCode;
