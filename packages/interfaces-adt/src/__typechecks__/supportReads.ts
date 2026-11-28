// Compile-only assertions. If these stop compiling, the types regressed.
//
// The support reads: the application job catalog and template definitions,
// the ABAP keyword documentation, and the application log's `accept`, checked
// against hand-written objects. Whether adt-clients conforms is that
// package's own test.

import type {
  IAbapKeywordDocumentation,
  IAdtAnalyseOptions,
  IAdtError,
  IAdtResponse,
  IAnalyse,
  IApplicationJobCatalog,
  IApplicationJobTemplate,
  IGetApplicationJobOptions,
  IGetApplicationLogObjectOptions,
  IGetApplicationLogSourceOptions,
  IKeywordDocumentationOptions,
  IKeywordDocumentationPositionParams,
  IKeywordDocumentationQueryParams,
  IKeywordDocumentationTopicParams,
} from '../index';

declare const answer: IAdtResponse<string, IAdtError>;
declare const analyse: IAnalyse<IAdtError>;

// ---- The application log's Accept ----------------------------------------

const _logObject: IGetApplicationLogObjectOptions = { accept: 'text/html' };
const _logSource: IGetApplicationLogSourceOptions = { accept: undefined };
void _logObject;
void _logSource;

// ---- Application job catalog and template --------------------------------

const _jobOptions: IGetApplicationJobOptions = {
  version: 'active',
  accept: undefined,
};
void _jobOptions;
// @ts-expect-error a read version is one of ADT's, not any string
const _badVersion: IGetApplicationJobOptions = { version: 'latest' };
void _badVersion;

const _catalog: IApplicationJobCatalog<string, string> = {
  kind: 'applicationJobCatalog',
  getObject(
    _name: string,
    _options?: IGetApplicationJobOptions & IAdtAnalyseOptions,
  ) {
    return Promise.resolve(answer);
  },
  getSource(
    _name: string,
    _options?: IGetApplicationJobOptions & IAdtAnalyseOptions,
  ) {
    return Promise.resolve(answer);
  },
};
void _catalog;

const _template: IApplicationJobTemplate<string, string> = {
  kind: 'applicationJobTemplate',
  getObject() {
    return Promise.resolve(answer);
  },
  getSource() {
    return Promise.resolve(answer);
  },
};
void _template;

const _wrongKind: IApplicationJobTemplate<string, string> = {
  // @ts-expect-error a template is not a catalog
  kind: 'applicationJobCatalog',
  getObject() {
    return Promise.resolve(answer);
  },
  getSource() {
    return Promise.resolve(answer);
  },
};
void _wrongKind;

// With an `analyse`, the error is the caller's type.
async function _narrowed(c: IApplicationJobCatalog<number, boolean>) {
  const object: IAdtResponse<number, IAdtError> = await c.getObject('N', {
    analyse,
  });
  const source: IAdtResponse<boolean> = await c.getSource('N');
  void object;
  void source;
}
void _narrowed;

// ---- ABAP keyword documentation ------------------------------------------

const _query: IKeywordDocumentationQueryParams = { query: 'q' };
const _topic: IKeywordDocumentationTopicParams = {
  object: 't',
  version: '',
  language: undefined,
};
const _position: IKeywordDocumentationPositionParams = {
  uri: 'u',
  format: 'f',
};
const _docOptions: IKeywordDocumentationOptions = { accept: undefined };
void _query;
void _topic;
void _position;
void _docOptions;

// @ts-expect-error the query form needs its query
const _noQuery: IKeywordDocumentationQueryParams = {};
void _noQuery;
// @ts-expect-error the topic form takes a topic name, not a query
const _topicAsQuery: IKeywordDocumentationTopicParams = { query: 'q' };
void _topicAsQuery;

const _docs: IAbapKeywordDocumentation<string, string, string> = {
  kind: 'abapKeywordDocumentation',
  query() {
    return Promise.resolve(answer);
  },
  topic() {
    return Promise.resolve(answer);
  },
  position() {
    return Promise.resolve(answer);
  },
};
void _docs;

// @ts-expect-error every form is a member
const _twoForms: IAbapKeywordDocumentation<string, string, string> = {
  kind: 'abapKeywordDocumentation',
  query() {
    return Promise.resolve(answer);
  },
  topic() {
    return Promise.resolve(answer);
  },
};
void _twoForms;

async function _docsNarrowed(d: IAbapKeywordDocumentation<1, 2, 3>) {
  const q: IAdtResponse<1, IAdtError> = await d.query(
    { query: 'q' },
    { analyse },
  );
  const t: IAdtResponse<2> = await d.topic({ object: 'o', version: 'X' });
  const p: IAdtResponse<3> = await d.position({ uri: 'u' });
  void q;
  void t;
  void p;
}
void _docsNarrowed;
