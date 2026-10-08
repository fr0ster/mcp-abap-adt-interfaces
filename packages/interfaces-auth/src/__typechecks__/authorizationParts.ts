// Compile-only assertions of 7.4.0's authorization parts: the answer and the
// verdict between a transport and a protocol, and the three part contracts. If
// these stop compiling, the types regressed. Every `@ts-expect-error` line
// must fail — an unused directive fails `test:check` — and the positive line
// beside it proves the failure is the rule's.

import type {
  ANSWER_REFUSALS,
  AnswerJudge,
  AnswerParameters,
  AnswerRefusal,
  AnswerTransportOptions,
  AnswerVerdict,
  AuthorizationAnswer,
  IAnswerChannel,
  IAnswerTransport,
  IArmedChannel,
  IAuthorizationPresentation,
  IAuthorizationProtocol,
  PasteWords,
  PresentationContext,
} from '../auth/IAuthorizationParts';
import type { IAuthProviderError } from '../error/IAuthProviderError';
import type {
  CONFIG_FIELDS,
  INTERACTIVE_LOGIN_STRATEGIES,
  OPERATIONS,
} from '../error/kinds';
import type * as surface from '../index';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
type Expect<T extends true> = T;

declare const error: IAuthProviderError;
declare const signal: AbortSignal;

// ---- ANSWER_REFUSALS: order pinned, union is the array's element ----------

export type RefusalsAreTheirArray = [
  Expect<Equal<AnswerRefusal, (typeof ANSWER_REFUSALS)[number]>>,
  Expect<
    Equal<
      typeof ANSWER_REFUSALS,
      readonly [
        'not-armed',
        'host',
        'form-token',
        'state',
        'pasted-state',
        'no-payload',
        'unreadable',
        'already-answered',
      ]
    >
  >,
];

// ---- the answer ------------------------------------------------------------

const redirect: AuthorizationAnswer = {
  via: 'redirect',
  method: 'GET',
  params: new URLSearchParams('code=c&state=s'),
};
const pasted: AuthorizationAnswer = { via: 'form', text: 'x' };
const typed: AuthorizationAnswer = { via: 'terminal', text: 'x' };
const given: AuthorizationAnswer = { via: 'consumer', text: 'x' };
void [redirect, pasted, typed, given];

// URLSearchParams satisfies the read-only parameters.
const params: AnswerParameters = new URLSearchParams('a=1');
void params;

// @ts-expect-error — an unknown `via`
const unknownVia: AuthorizationAnswer = { via: 'carrier-pigeon', text: 'x' };
void unknownVia;

// @ts-expect-error — a redirect carries a method and parameters, not a text
const redirectWithText: AuthorizationAnswer = { via: 'redirect', text: 'x' };
void redirectWithText;

const putRedirect: AuthorizationAnswer = {
  via: 'redirect',
  // @ts-expect-error — a redirect's method is GET or POST
  method: 'PUT',
  params,
};
void putRedirect;

// @ts-expect-error — a text answer carries the text
const textless: AuthorizationAnswer = { via: 'terminal' };
void textless;

// ---- the verdict -----------------------------------------------------------

const accept: AnswerVerdict<string> = { verdict: 'accept', payload: 'code' };
const refuse: AnswerVerdict<string> = { verdict: 'refuse', reason: 'state' };
const end: AnswerVerdict<string> = { verdict: 'end', error };
const endShown: AnswerVerdict<string> = {
  verdict: 'end',
  error,
  shown: 'access_denied',
};
const endNotShown: AnswerVerdict<string> = {
  verdict: 'end',
  error,
  shown: undefined,
};
void [accept, refuse, end, endShown, endNotShown];

// @ts-expect-error — a verdict names which it is
const noVerdict: AnswerVerdict<string> = { payload: 'code' };
void noVerdict;

// @ts-expect-error — an unknown verdict
const badVerdict: AnswerVerdict<string> = { verdict: 'maybe' };
void badVerdict;

// @ts-expect-error — the payload is the protocol's TPayload
const wrongPayload: AnswerVerdict<string> = { verdict: 'accept', payload: 1 };
void wrongPayload;

// @ts-expect-error — an accept carries its payload
const acceptNothing: AnswerVerdict<string> = { verdict: 'accept' };
void acceptNothing;

// @ts-expect-error — a refusal names its reason
const refuseNothing: AnswerVerdict<string> = { verdict: 'refuse' };
void refuseNothing;

const refuseFreely: AnswerVerdict<string> = {
  verdict: 'refuse',
  // @ts-expect-error — the reason is one of ANSWER_REFUSALS
  reason: 'because I said so',
};
void refuseFreely;

// @ts-expect-error — an end carries a minted error
const endNothing: AnswerVerdict<string> = { verdict: 'end' };
void endNothing;

const endWithError: AnswerVerdict<string> = {
  verdict: 'end',
  // @ts-expect-error — an end's error is an IAuthProviderError, not an Error
  error: new Error('x'),
};
void endWithError;

// ---- the protocol ----------------------------------------------------------

const words: PasteWords = {
  prompt: 'Paste the code',
  instructions: 'Copy it.',
};
void words;

// @ts-expect-error — paste words carry the instructions
const noInstructions: PasteWords = { prompt: 'Paste' };
void noInstructions;

const judge: AnswerJudge<string> = (answer) =>
  answer.via === 'redirect'
    ? { verdict: 'refuse', reason: 'no-payload' }
    : { verdict: 'accept', payload: answer.text };
void judge;

const protocol: IAuthorizationProtocol<string> = {
  redirect: 'required',
  callbackMethods: ['GET'],
  paste: words,
  begin: (_url: string) => judge,
};
void protocol;

const passcode: IAuthorizationProtocol<string> = {
  redirect: 'unused',
  callbackMethods: [],
  begin: () => judge,
};
void passcode;

const noPaste: IAuthorizationProtocol<string> = {
  redirect: 'unused',
  callbackMethods: [],
  paste: undefined,
  begin: () => judge,
};
void noPaste;

// @ts-expect-error — `begin` is required
const noBegin: IAuthorizationProtocol<string> = {
  redirect: 'unused',
  callbackMethods: [],
};
void noBegin;

const badRedirect: IAuthorizationProtocol<string> = {
  // @ts-expect-error — 'maybe' is not a value of `redirect`
  redirect: 'maybe',
  callbackMethods: [],
  begin: () => judge,
};
void badRedirect;

// @ts-expect-error — `callbackMethods` is required
const noMethods: IAuthorizationProtocol<string> = {
  redirect: 'unused',
  begin: () => judge,
};
void noMethods;

const badMethods: IAuthorizationProtocol<string> = {
  redirect: 'required',
  // @ts-expect-error — only GET and POST
  callbackMethods: ['DELETE'],
  begin: () => judge,
};
void badMethods;

const beginVerdict: IAuthorizationProtocol<string> = {
  redirect: 'unused',
  callbackMethods: [],
  // @ts-expect-error — `begin` returns a judge, not a verdict
  begin: () => accept,
};
void beginVerdict;

// ---- the transport ---------------------------------------------------------

const options: AnswerTransportOptions = {
  signal,
  callbackMethods: ['GET', 'POST'],
  endpoint: '/callback',
};
const optionsAll: AnswerTransportOptions = {
  ...options,
  logger: undefined,
  paste: words,
};
void [options, optionsAll];

// @ts-expect-error — `endpoint` is required
const noEndpoint: AnswerTransportOptions = { signal, callbackMethods: [] };
void noEndpoint;

// @ts-expect-error — `signal` is required
const noSignal: AnswerTransportOptions = {
  callbackMethods: [],
  endpoint: '/callback',
};
void noSignal;

// @ts-expect-error — `callbackMethods` is required
const noCallbackMethods: AnswerTransportOptions = {
  signal,
  endpoint: '/callback',
};
void noCallbackMethods;

const armed: IArmedChannel = { answer: () => Promise.resolve() };
void armed;

const armedWithPayload: IArmedChannel = {
  // @ts-expect-error — an armed channel resolves with nothing: the composer holds the payload
  answer: () => Promise.resolve('code'),
};
void armedWithPayload;

const channel: IAnswerChannel = {
  redirectUri: undefined,
  arm: (_judge: AnswerJudge<unknown>) => armed,
};
const listener: IAnswerChannel = {
  redirectUri: 'http://localhost:61001/callback',
  waitingOn: 'http://localhost:61001',
  routeHint: 'ssh -L 61001:localhost:61001',
  arm: () => armed,
};
void [channel, listener];

// @ts-expect-error — `redirectUri` is required (undefined when there is none)
const noRedirectUri: IAnswerChannel = { arm: () => armed };
void noRedirectUri;

// @ts-expect-error — `arm` is required
const noArm: IAnswerChannel = { redirectUri: undefined };
void noArm;

const transport: IAnswerTransport = {
  label: 'manual',
  open: (_options, use) => use(channel),
};
const consumer: IAnswerTransport = {
  label: 'consumer',
  open: (_options, use) => use(channel),
};
void [transport, consumer];

// `open` keeps the callback's return type.
declare const someTransport: IAnswerTransport;
export type OpenKeepsTheReturn = [
  Expect<Equal<ReturnType<typeof someTransport.open<number>>, Promise<number>>>,
];

const badLabel: IAnswerTransport = {
  // @ts-expect-error — the label is a strategy the errors can name
  label: 'carrier-pigeon',
  open: (_options, use) => use(channel),
};
void badLabel;

// @ts-expect-error — `open` is required
const noOpen: IAnswerTransport = { label: 'browser' };
void noOpen;

// ---- the presentation ------------------------------------------------------

const context: PresentationContext = { redirectUri: undefined, signal };
const contextAll: PresentationContext = {
  redirectUri: 'http://localhost:61001/callback',
  waitingOn: 'http://localhost:61001',
  routeHint: undefined,
  signal,
  logger: undefined,
};
void [context, contextAll];

// @ts-expect-error — `signal` is required
const contextNoSignal: PresentationContext = { redirectUri: undefined };
void contextNoSignal;

const presentation: IAuthorizationPresentation = {
  present: (_url: string, _context: PresentationContext) => {},
};
const asyncPresentation: IAuthorizationPresentation = {
  present: async () => {},
};
void [presentation, asyncPresentation];

// @ts-expect-error — `present` is required
const noPresent: IAuthorizationPresentation = {};
void noPresent;

// ---- the fact sets that grew ----------------------------------------------

const newFields: (typeof CONFIG_FIELDS)[number][] = [
  'endpoint',
  'redirectUri',
  'presentation',
  'transport',
  'protocol',
  'provide',
  'receive',
  'show',
  'callbackServer', // kept: removing a value is a major
];
void newFields;

const consumerLabel: (typeof INTERACTIVE_LOGIN_STRATEGIES)[number] = 'consumer';
const keptLabels: (typeof INTERACTIVE_LOGIN_STRATEGIES)[number][] = [
  'browser',
  'manual',
];
void [consumerLabel, keptLabels];

const newOperations: (typeof OPERATIONS)[number][] = [
  'presenting-authorization-url',
  'judging-answer',
];
void newOperations;

// ---- the runtime surface: the one value --------------------------------------

export type SurfaceHasTheRefusals = [
  Expect<Equal<typeof surface.ANSWER_REFUSALS, typeof ANSWER_REFUSALS>>,
];
