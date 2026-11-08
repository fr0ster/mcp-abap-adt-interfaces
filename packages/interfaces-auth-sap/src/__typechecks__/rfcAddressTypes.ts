// Compile-only assertions. If these stop compiling, the types regressed.
//
// 4.0.0: `ISapConfig` is a union by connection type. HTTP carries its URL and
// no RFC key; RFC carries its client, its language and exactly one complete
// address — an application server (`ashost` + `sysnr`) or a message server
// (`mshost` + `group`, its service named by `msserv`, `sysid` or both) — and
// no URL. This file is checked twice: under `tsconfig.json`
// (`exactOptionalPropertyTypes` on) and under `tsconfig.typecheck-loose.json`
// (off), so every case holds in both modes. The one case that differs between
// the modes, `url: undefined` on RFC, is in `rfcAddressStrictTypes.ts` and
// `rfcAddressLooseTypes.ts`.
//
// A refusal is checked twice where it matters: inline, as a literal, and by
// structural assignment of a non-literal value, which an excess-property check
// cannot refuse — only the `?: never` keys do.

import type {
  ISapConfig,
  ISapConfigBase,
  ISapHttpConfig,
  ISapRfcApplicationServer,
  ISapRfcConfig,
  ISapRfcLogon,
  ISapRfcMessageServer,
} from '../index';

declare const host: string;
declare const base: ISapConfigBase;
declare const http: ISapHttpConfig;

/** Both RFC shapes, without `url`. */
const _applicationServer: ISapRfcConfig = {
  connectionType: 'rfc',
  authType: 'snc',
  client: '100',
  language: 'EN',
  ashost: 'sap.example.com',
  sysnr: '00',
  saprouter: '/H/router.example.com/S/3299/H/',
};
void _applicationServer;

const _messageServerMsserv: ISapRfcConfig = {
  connectionType: 'rfc',
  authType: 'basic',
  client: '100',
  language: 'EN',
  mshost: 'ms.example.com',
  msserv: '3600',
  group: 'PUBLIC',
};
void _messageServerMsserv;

const _messageServerSysid: ISapRfcConfig = {
  connectionType: 'rfc',
  authType: 'basic',
  client: '100',
  language: 'EN',
  mshost: 'ms.example.com',
  sysid: 'SID',
  group: 'PUBLIC',
};
void _messageServerSysid;

const _messageServerBoth: ISapRfcMessageServer = {
  connectionType: 'rfc',
  authType: 'basic',
  client: '100',
  language: 'EN',
  mshost: 'ms.example.com',
  msserv: 'sapmsSID',
  sysid: 'SID',
  group: 'PUBLIC',
};
void _messageServerBoth;

/** An HTTP literal without `connectionType` compiles and narrows. */
const _httpLiteral: ISapConfig = { url: 'https://h', authType: 'basic' };
const _httpUrl: string = _httpLiteral.url;
void _httpUrl;

function _narrows(config: ISapConfig): void {
  if (config.connectionType === 'rfc') {
    const rfc: ISapRfcConfig = config;
    const client: string = rfc.client;
    const language: string = rfc.language;
    void client;
    void language;
  } else {
    const narrowed: ISapHttpConfig = config;
    const url: string = narrowed.url;
    void url;
  }
}
void _narrows;

/** A spread of `ISapConfigBase` into each branch literal compiles. */
const _baseIntoHttp: ISapHttpConfig = { ...base, url: 'https://h' };
void _baseIntoHttp;
const _baseIntoApplicationServer: ISapRfcApplicationServer = {
  ...base,
  connectionType: 'rfc',
  client: '100',
  language: 'EN',
  ashost: host,
  sysnr: '00',
};
void _baseIntoApplicationServer;
const _baseIntoMessageServer: ISapRfcMessageServer = {
  ...base,
  connectionType: 'rfc',
  client: '100',
  language: 'EN',
  mshost: host,
  msserv: '3600',
  group: 'PUBLIC',
};
void _baseIntoMessageServer;

/** A fieldwise composition into each branch compiles. */
const _fieldwiseHttp: ISapHttpConfig = {
  authType: base.authType,
  url: host,
  client: '100',
};
void _fieldwiseHttp;
const _fieldwiseApplicationServer: ISapRfcApplicationServer = {
  authType: base.authType,
  connectionType: 'rfc',
  client: host,
  language: host,
  ashost: host,
  sysnr: host,
};
void _fieldwiseApplicationServer;
const _fieldwiseMessageServer: ISapRfcMessageServer = {
  authType: base.authType,
  connectionType: 'rfc',
  client: host,
  language: host,
  mshost: host,
  sysid: host,
  group: host,
};
void _fieldwiseMessageServer;

/** Every RFC shape is an `ISapRfcLogon`. */
function _logon(config: ISapRfcConfig): ISapRfcLogon {
  return config;
}
void _logon;

// ---------------------------------------------------------------------------
// Refusals.

// RFC with `url`, inline and by structural assignment.
// @ts-expect-error an RFC config has no url
const _rfcUrlInline: ISapConfig = {
  connectionType: 'rfc',
  authType: 'basic',
  client: '100',
  language: 'EN',
  ashost: 'h',
  sysnr: '00',
  url: 'https://h',
};
void _rfcUrlInline;

declare const applicationServerWithUrl: {
  connectionType: 'rfc';
  authType: 'basic';
  client: string;
  language: string;
  ashost: string;
  sysnr: string;
  url: string;
};
// @ts-expect-error an RFC config has no url
const _rfcUrlStructural: ISapConfig = applicationServerWithUrl;
void _rfcUrlStructural;

declare const messageServerWithUrl: {
  connectionType: 'rfc';
  authType: 'basic';
  client: string;
  language: string;
  mshost: string;
  msserv: string;
  group: string;
  url: string;
};
// @ts-expect-error an RFC config has no url
const _rfcMessageServerUrl: ISapConfig = messageServerWithUrl;
void _rfcMessageServerUrl;

// RFC without `client`, without `language`.
declare const applicationServerNoClient: {
  connectionType: 'rfc';
  authType: 'basic';
  language: string;
  ashost: string;
  sysnr: string;
};
// @ts-expect-error an RFC config states its client
const _noClient: ISapConfig = applicationServerNoClient;
void _noClient;

declare const messageServerNoClient: {
  connectionType: 'rfc';
  authType: 'basic';
  language: string;
  mshost: string;
  msserv: string;
  group: string;
};
// @ts-expect-error an RFC config states its client
const _messageServerNoClient: ISapConfig = messageServerNoClient;
void _messageServerNoClient;

declare const applicationServerNoLanguage: {
  connectionType: 'rfc';
  authType: 'basic';
  client: string;
  ashost: string;
  sysnr: string;
};
// @ts-expect-error an RFC config states its language
const _noLanguage: ISapConfig = applicationServerNoLanguage;
void _noLanguage;

declare const messageServerNoLanguage: {
  connectionType: 'rfc';
  authType: 'basic';
  client: string;
  mshost: string;
  msserv: string;
  group: string;
};
// @ts-expect-error an RFC config states its language
const _messageServerNoLanguage: ISapConfig = messageServerNoLanguage;
void _messageServerNoLanguage;

// An application server: `ashost` without `sysnr`, `sysnr` without `ashost`.
// @ts-expect-error an application server states its system number
const _noSysnr: ISapConfig = {
  connectionType: 'rfc',
  authType: 'basic',
  client: '100',
  language: 'EN',
  ashost: 'h',
};
void _noSysnr;

// @ts-expect-error an application server states its host
const _noAshost: ISapConfig = {
  connectionType: 'rfc',
  authType: 'basic',
  client: '100',
  language: 'EN',
  sysnr: '00',
};
void _noAshost;

// A message server: without `group`, without `mshost`, with neither service.
// @ts-expect-error a message server states its logon group
const _noGroup: ISapConfig = {
  connectionType: 'rfc',
  authType: 'basic',
  client: '100',
  language: 'EN',
  mshost: 'ms',
  msserv: '3600',
};
void _noGroup;

// @ts-expect-error a message server states its host
const _noMshost: ISapConfig = {
  connectionType: 'rfc',
  authType: 'basic',
  client: '100',
  language: 'EN',
  msserv: '3600',
  group: 'PUBLIC',
};
void _noMshost;

// @ts-expect-error a message server names its service by msserv or sysid
const _noService: ISapConfig = {
  connectionType: 'rfc',
  authType: 'basic',
  client: '100',
  language: 'EN',
  mshost: 'ms',
  group: 'PUBLIC',
};
void _noService;

// Keys of both addresses: the whole of each, inline; then each foreign key of
// the other address on its own, by structural assignment.
// @ts-expect-error one address only
const _bothAddresses: ISapConfig = {
  connectionType: 'rfc',
  authType: 'basic',
  client: '100',
  language: 'EN',
  ashost: 'h',
  sysnr: '00',
  mshost: 'ms',
  msserv: '3600',
  group: 'PUBLIC',
};
void _bothAddresses;

interface ApplicationServerKeys {
  connectionType: 'rfc';
  authType: 'basic';
  client: string;
  language: string;
  ashost: string;
  sysnr: string;
}
interface MessageServerKeys {
  connectionType: 'rfc';
  authType: 'basic';
  client: string;
  language: string;
  mshost: string;
  msserv: string;
  group: string;
}

declare const applicationServerMshost: ApplicationServerKeys & {
  mshost: string;
};
// @ts-expect-error an application server takes no message-server key
const _asMshost: ISapConfig = applicationServerMshost;
void _asMshost;

declare const applicationServerMsserv: ApplicationServerKeys & {
  msserv: string;
};
// @ts-expect-error an application server takes no message-server key
const _asMsserv: ISapConfig = applicationServerMsserv;
void _asMsserv;

declare const applicationServerSysid: ApplicationServerKeys & {
  sysid: string;
};
// @ts-expect-error an application server takes no message-server key
const _asSysid: ISapConfig = applicationServerSysid;
void _asSysid;

declare const applicationServerGroup: ApplicationServerKeys & {
  group: string;
};
// @ts-expect-error an application server takes no message-server key
const _asGroup: ISapConfig = applicationServerGroup;
void _asGroup;

declare const messageServerAshost: MessageServerKeys & { ashost: string };
// @ts-expect-error a message server takes no application-server key
const _msAshost: ISapConfig = messageServerAshost;
void _msAshost;

declare const messageServerSysnr: MessageServerKeys & { sysnr: string };
// @ts-expect-error a message server takes no application-server key
const _msSysnr: ISapConfig = messageServerSysnr;
void _msSysnr;

// HTTP with each RFC key and `language`, inline and by structural assignment.
interface HttpKeys {
  authType: 'basic';
  url: string;
}

// @ts-expect-error HTTP takes no RFC key
const _httpAshostInline: ISapConfig = {
  authType: 'basic',
  url: 'https://h',
  ashost: 'h',
};
void _httpAshostInline;
declare const httpAshost: HttpKeys & { ashost: string };
// @ts-expect-error HTTP takes no RFC key
const _httpAshost: ISapConfig = httpAshost;
void _httpAshost;

// @ts-expect-error HTTP takes no RFC key
const _httpSysnrInline: ISapConfig = {
  authType: 'basic',
  url: 'https://h',
  sysnr: '00',
};
void _httpSysnrInline;
declare const httpSysnr: HttpKeys & { sysnr: string };
// @ts-expect-error HTTP takes no RFC key
const _httpSysnr: ISapConfig = httpSysnr;
void _httpSysnr;

// @ts-expect-error HTTP takes no RFC key
const _httpMshostInline: ISapConfig = {
  authType: 'basic',
  url: 'https://h',
  mshost: 'ms',
};
void _httpMshostInline;
declare const httpMshost: HttpKeys & { mshost: string };
// @ts-expect-error HTTP takes no RFC key
const _httpMshost: ISapConfig = httpMshost;
void _httpMshost;

// @ts-expect-error HTTP takes no RFC key
const _httpMsservInline: ISapConfig = {
  authType: 'basic',
  url: 'https://h',
  msserv: '3600',
};
void _httpMsservInline;
declare const httpMsserv: HttpKeys & { msserv: string };
// @ts-expect-error HTTP takes no RFC key
const _httpMsserv: ISapConfig = httpMsserv;
void _httpMsserv;

// @ts-expect-error HTTP takes no RFC key
const _httpSysidInline: ISapConfig = {
  authType: 'basic',
  url: 'https://h',
  sysid: 'SID',
};
void _httpSysidInline;
declare const httpSysid: HttpKeys & { sysid: string };
// @ts-expect-error HTTP takes no RFC key
const _httpSysid: ISapConfig = httpSysid;
void _httpSysid;

// @ts-expect-error HTTP takes no RFC key
const _httpGroupInline: ISapConfig = {
  authType: 'basic',
  url: 'https://h',
  group: 'PUBLIC',
};
void _httpGroupInline;
declare const httpGroup: HttpKeys & { group: string };
// @ts-expect-error HTTP takes no RFC key
const _httpGroup: ISapConfig = httpGroup;
void _httpGroup;

// @ts-expect-error HTTP takes no RFC key
const _httpSaprouterInline: ISapConfig = {
  authType: 'basic',
  url: 'https://h',
  saprouter: '/H/router/S/3299/H/',
};
void _httpSaprouterInline;
declare const httpSaprouter: HttpKeys & { saprouter: string };
// @ts-expect-error HTTP takes no RFC key
const _httpSaprouter: ISapConfig = httpSaprouter;
void _httpSaprouter;

// @ts-expect-error HTTP takes no language
const _httpLanguageInline: ISapConfig = {
  authType: 'basic',
  url: 'https://h',
  language: 'EN',
};
void _httpLanguageInline;
declare const httpLanguage: HttpKeys & { language: string };
// @ts-expect-error HTTP takes no language
const _httpLanguage: ISapConfig = httpLanguage;
void _httpLanguage;

// A spread of an `ISapHttpConfig` into an RFC literal: its `url` comes along.
// @ts-expect-error an RFC config has no url
const _httpIntoRfc: ISapRfcConfig = {
  ...http,
  connectionType: 'rfc',
  client: '100',
  language: 'EN',
  ashost: 'h',
  sysnr: '00',
};
void _httpIntoRfc;

// Reading `url` on the unnarrowed union compiles — both shapes declare it,
// RFC as `url?: never` — and reads `string | undefined`; only a narrowed
// HTTP config reads it as a definite `string`.
declare const unnarrowed: ISapConfig;
const _unnarrowedUrl: string | undefined = unnarrowed.url;
void _unnarrowedUrl;
// @ts-expect-error unnarrowed, the url may be absent
const _definiteUrl: string = unnarrowed.url;
void _definiteUrl;

// 4.0.0: `ISapConfig` is a union type alias, so an interface cannot extend it.
// @ts-expect-error an interface cannot extend a union
interface _ExtendsUnion extends ISapConfig {
  extra: string;
}
// Extend the branch meant (the interfaces), or intersect in a type alias
// (the union, and the message server, which is itself an intersection).
interface _ExtendsHttp extends ISapHttpConfig {
  extra: string;
}
interface _ExtendsApplicationServer extends ISapRfcApplicationServer {
  extra: string;
}
type _WithExtra = ISapConfig & { extra: string };
type _MessageServerWithExtra = ISapRfcMessageServer & { extra: string };
const _extendedHttp: _ExtendsHttp = {
  url: 'https://h',
  authType: 'basic',
  extra: 'x',
};
const _extendedAs: _ExtendsApplicationServer = {
  connectionType: 'rfc',
  authType: 'basic',
  client: '100',
  language: 'EN',
  ashost: 'h',
  sysnr: '00',
  extra: 'x',
};
const _withExtra: _WithExtra = {
  url: 'https://h',
  authType: 'basic',
  extra: 'x',
};
const _msWithExtra: _MessageServerWithExtra = {
  connectionType: 'rfc',
  authType: 'basic',
  client: '100',
  language: 'EN',
  mshost: 'ms',
  sysid: 'SID',
  group: 'PUBLIC',
  extra: 'x',
};
void _extendedHttp;
void _extendedAs;
void _withExtra;
void _msWithExtra;
