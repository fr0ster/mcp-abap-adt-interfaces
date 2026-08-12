// Compile-only assertions. If these stop compiling, the types regressed.

import type {
  ITransportTree,
  ITransportTreeRequest,
} from '../adt/IAdtTransport';

// Attributes are handed back verbatim: the tm: prefix survives, and nothing is
// renamed into camelCase. A type that promised `number` would be the library
// deciding what the field means.
const request: ITransportTreeRequest = {
  attributes: { 'tm:number': 'TRLK900454', 'tm:status': 'D' },
  containers: [
    { element: 'workbench', attributes: { 'tm:category': 'Workbench' } },
    { element: 'modifiable', attributes: { 'tm:status': 'Modifiable' } },
  ],
  // The operation URIs. A consumer releasing a transport needs these hrefs;
  // rebuilding them by convention is the ADT knowledge we are here to hold.
  links: [
    {
      attributes: {
        href: '/sap/bc/adt/cts/transportrequests/TRLK900454/releasejobs',
        rel: 'http://www.sap.com/cts/relations/releasejobs',
      },
    },
  ],
  longDesc: '',
  tasks: [
    { attributes: { 'tm:number': 'TRLK900455' }, links: [], longDesc: '' },
  ],
};

// A missing key reads as `string | undefined`, so a caller must handle absence.
// Without the `| undefined` the compiler would hand back `string` for a key that
// was never in the payload — noUncheckedIndexedAccess is not set in this repo.
const missing: string | undefined = request.attributes['tm:no_such_attribute'];
void missing;

const tree: ITransportTree = {
  // Whose list this is — the root carries it and nothing else does.
  attributes: {
    'adtcore:name': 'CB9900000000',
    'adtcore:changedAt': '2026-08-12T13:15:12Z',
  },
  requests: [request],
};
void tree;

// Absent and present-but-empty are different states, and the type keeps them apart.
const absent: string | undefined = request.longDesc;
void absent;

// Containers are an ordered LIST, not a fixed triple: the chain is two levels
// without ?targets=true and three with it.
const withTarget: ITransportTreeRequest = {
  ...request,
  containers: [
    { element: 'workbench', attributes: {} },
    { element: 'target', attributes: { 'tm:name': 'Local Change Requests' } },
    { element: 'modifiable', attributes: {} },
  ],
};
void withTarget;

// @ts-expect-error containers is required — a request that forgot where it came from
const _noContainers: ITransportTreeRequest = {
  attributes: {},
  tasks: [],
  links: [],
  longDesc: '',
};
void _noContainers;

// @ts-expect-error tasks is required — absent tasks are [], never undefined
const _noTasks: ITransportTreeRequest = {
  attributes: {},
  containers: [],
  links: [],
  longDesc: '',
};
void _noTasks;

// @ts-expect-error links is required — the payload always has them, so the type says so
const _noLinks: ITransportTreeRequest = {
  attributes: {},
  containers: [],
  tasks: [],
  longDesc: '',
};
void _noLinks;
