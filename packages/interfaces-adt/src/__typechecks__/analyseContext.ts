// Compile-only assertions. If these stop compiling, the types regressed.

import type { IAdtWireResponse } from '@mcp-abap-adt/interfaces-adt-connection';
import type { IAdtAnalyseContext, IAnalyse } from '../adt/IAdtObject';
import { ADT_NO_FAILURE, type IAdtError } from '../adt/IAdtResponse';

declare const verdict: IAdtError;
declare const answer: IAdtWireResponse;

// A reading of two parameters is still one, and a member that has no facts to
// add still calls a reading with two arguments.
const _twoParameters: IAnalyse = (verdict, answer) => {
  void answer;
  return verdict;
};
void _twoParameters(verdict, answer);

// A reading of three gets the facts of the activation, typed.
const _threeParameters: IAnalyse = (verdict, answer, context) => {
  void answer;
  const named: readonly string[] = context?.activation?.named ?? [];
  const list: IAdtWireResponse | undefined =
    context?.activation?.inactiveObjects;
  void list;
  return named.length === 0 ? ADT_NO_FAILURE : verdict;
};
void _threeParameters;

declare const inactiveObjects: IAdtWireResponse;
const _context: IAdtAnalyseContext = {
  activation: { named: ['/sap/bc/adt/oo/classes/zcl_x'], inactiveObjects },
};
void _context;

const _numbers: IAdtAnalyseContext = {
  // @ts-expect-error a named object is its uri, a string
  activation: { named: [1], inactiveObjects },
};
void _numbers;
