// Compile-only assertions. If these stop compiling, the types regressed.

import type {
  DebuggerStepAction,
  IDebuggerAttachParams,
  IDebuggerGetVariablesParams,
  IDebuggerListenParams,
  IDebuggerStepParams,
} from '../runtime/IAdtDebuggerSession';

// The step action is a closed union — a debugger cannot be asked to do
// something this package has not named.
const _step: DebuggerStepAction = 'step_into';
void _step;

// @ts-expect-error not a member of the union
const _bogus: DebuggerStepAction = 'teleport';
void _bogus;

// Every field is optional, but the ones given must be the right shape.
const _listen: IDebuggerListenParams = {
  timeoutSeconds: 30,
  user: 'DEVELOPER',
};
void _listen;

const _attach: IDebuggerAttachParams = {
  sessionId: 'session-1',
};
void _attach;

// @ts-expect-error sessionId is required, not optional
const _attachMissingField: IDebuggerAttachParams = {};
void _attachMissingField;

const _stepParams: IDebuggerStepParams = {
  action: 'step_over',
  value: 'v1',
};
void _stepParams;

// @ts-expect-error action is required, not optional
const _stepMissingField: IDebuggerStepParams = {};
void _stepMissingField;

const _variables: IDebuggerGetVariablesParams = {
  frameId: 'frame-1',
  filter: 'LT_*',
};
void _variables;
