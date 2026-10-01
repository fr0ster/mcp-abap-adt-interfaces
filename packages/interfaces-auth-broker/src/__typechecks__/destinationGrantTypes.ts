// Compile-only assertions. If these stop compiling, the types regressed.

import type { DestinationGrant } from '../auth/DestinationGrant';
import type { IConnectionConfig } from '../auth/IConnectionConfig';

const _grants: DestinationGrant[] = [
  'authorization_code',
  'client_credentials',
  'passcode',
  'oidc_authorization_code',
  'device_code',
  'password',
  'token_exchange',
  'saml2_pure',
  'saml2_bearer',
  'none',
];
void _grants;

// @ts-expect-error — a grant the union does not list
const _unknown: DestinationGrant = 'implicit';
void _unknown;

// A token destination seeded before its first login: the grant and no token.
const _seeded: IConnectionConfig = {
  serviceUrl: 'https://h.abap.example',
  authType: 'jwt',
  grantType: 'authorization_code',
};
void _seeded;

// An OIDC device-code destination; the client is its authorization config.
const _oidc: IConnectionConfig = {
  serviceUrl: 'https://h.abap.example',
  authType: 'jwt',
  grantType: 'device_code',
  oidcIssuerUrl: 'https://idp.example/realms/r',
  oidcDeviceAuthorizationEndpoint: 'https://idp.example/device',
  oidcTokenEndpoint: 'https://idp.example/token',
  oidcScopes: ['openid', 'offline_access'],
};
void _oidc;

// A SAML cookie destination with its IdP trust and stored cookies.
const _saml: IConnectionConfig = {
  serviceUrl: 'https://h.abap.example',
  authType: 'saml',
  grantType: 'saml2_pure',
  sessionCookies: 'SAP_SESSIONID=abc',
  expiresAt: 1_790_000_000_000,
  samlIdpSsoUrl: 'https://idp.example/sso',
  samlIdpEntityId: 'https://idp.example',
  samlIdpCertificates: ['MIIC...'],
  samlSpEntityId: 'https://h.abap.example',
  samlAcsUrl: 'https://h.abap.example/sap/saml2/sp/acs',
  samlIdpInitiated: false,
  samlClockSkewMs: 30_000,
};
void _saml;
