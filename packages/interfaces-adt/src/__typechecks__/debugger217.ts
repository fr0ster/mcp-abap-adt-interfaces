// Compile-only assertions for the #217 debugger contract. If these stop compiling, the types regressed.
import type {
  IAbapDebugger,
  IDebuggerBreakpoint,
  IDebuggerBreakpointSync,
  IDebuggerIdentity,
  IDebuggerLineBreakpoint,
  IDebuggerSettings,
} from '../index';

// The identity, by mode.
export const userIdentity: IDebuggerIdentity = {
  debuggingMode: 'user',
  requestUser: 'SAPUSER01',
  terminalId: 'A'.repeat(32),
  ideId: 'B'.repeat(32),
};
export const terminalIdentity: IDebuggerIdentity = {
  debuggingMode: 'terminal',
  terminalId: 'A'.repeat(32),
  ideId: 'B'.repeat(32),
};
// @ts-expect-error a user identity names whose requests it catches
export const userWithoutRequestUser: IDebuggerIdentity = {
  debuggingMode: 'user',
  terminalId: 'A',
  ideId: 'B',
};
// @ts-expect-error terminal mode reads no requestUser
export const terminalWithRequestUser: IDebuggerIdentity = {
  debuggingMode: 'terminal',
  requestUser: 'X',
  terminalId: 'A',
  ideId: 'B',
};
const pretypedTerminal = {
  debuggingMode: 'terminal' as const,
  requestUser: 'X',
  terminalId: 'A',
  ideId: 'B',
};
// @ts-expect-error a pre-typed value carrying requestUser fails too
export const terminalFromVariable: IDebuggerIdentity = pretypedTerminal;
// @ts-expect-error the mode is required
export const noMode: IDebuggerIdentity = {
  requestUser: 'X',
  terminalId: 'A',
  ideId: 'B',
};

// condition: line breakpoints only.
export const lineWithCondition: IDebuggerBreakpoint = {
  kind: 'line',
  uri: '/x#start=1',
  condition: 'a = 1',
  clientId: 'a',
};
export const exceptionWithClientId: IDebuggerBreakpoint = {
  kind: 'exception',
  exceptionClass: 'CX_X',
  clientId: 'b',
};
// @ts-expect-error only a line breakpoint takes a condition
export const exceptionWithCondition: IDebuggerBreakpoint = {
  kind: 'exception',
  exceptionClass: 'CX_X',
  condition: 'a = 1',
};
const pretypedStatement = {
  kind: 'statement' as const,
  statement: 'RAISE',
  condition: 'a = 1',
};
// @ts-expect-error a pre-typed value carrying condition fails too
export const statementFromVariable: IDebuggerBreakpoint = pretypedStatement;

// Sync: partial takes line breakpoints and at least one object.
const line: IDebuggerLineBreakpoint = { kind: 'line', uri: '/x#start=1' };
export const fullSync: IDebuggerBreakpointSync = {
  scope: 'full',
  breakpoints: [line, exceptionWithClientId],
};
export const fullClear: IDebuggerBreakpointSync = {
  scope: 'full',
  breakpoints: [],
};
export const partialSync: IDebuggerBreakpointSync = {
  scope: 'partial',
  objects: ['/x'],
  breakpoints: [line],
};
export const partialWithStatement: IDebuggerBreakpointSync = {
  scope: 'partial',
  objects: ['/x'],
  // @ts-expect-error partial replaces line breakpoints only
  breakpoints: [{ kind: 'statement', statement: 'RAISE' }],
};
export const partialNoObjects: IDebuggerBreakpointSync = {
  scope: 'partial',
  // @ts-expect-error partial needs at least one object
  objects: [],
  breakpoints: [line],
};

export const keepAll: IDebuggerSettings = {};
export const someSettings: IDebuggerSettings = {
  systemDebugging: true,
  showDataAging: false,
};

// Members that take the identity or the analyse option.
declare const dbg: IAbapDebugger<
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown
>;
export async function neverRun(): Promise<void> {
  await dbg.attach(userIdentity, 'D1');
  await dbg.attach(terminalIdentity, 'D1', { dynproDebugging: true });
  // @ts-expect-error attach takes the identity, not a user name
  await dbg.attach('SAPUSER01', 'D1');
  await dbg.detachDebugger({ analyse: (verdict) => verdict });
  await dbg.detachDebugger();
}

// clientId: accepted on every kind.
export const statementWithClientId: IDebuggerBreakpoint = {
  kind: 'statement',
  statement: 'RAISE',
  clientId: 'c',
};
export const messageWithClientId: IDebuggerBreakpoint = {
  kind: 'message',
  msgId: 'X',
  msgNo: '001',
  msgTy: 'E',
  clientId: 'd',
};
export const lineWithSkipCount: IDebuggerBreakpoint = {
  kind: 'line',
  uri: '/x#start=1',
  // @ts-expect-error skipCount is removed; the server ignores it
  skipCount: 2,
};
