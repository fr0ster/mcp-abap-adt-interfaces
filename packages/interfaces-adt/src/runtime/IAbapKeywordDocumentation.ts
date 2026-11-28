import type { IAdtAnalyseOptions, IAnalyse } from '../adt/IAdtObject';
import type { IAdtError, IAdtResponse } from '../adt/IAdtResponse';

/**
 * The parameters every form of `/sap/bc/adt/docu/abap/langu` takes besides
 * its own, each sent as given when present. No value is fixed here: what a
 * `version` value selects is not known (measured: some values answer `500`).
 */
interface IKeywordDocumentationCommonParams {
  language?: string | undefined;
  version?: string | undefined;
  format?: string | undefined;
}

/** The query form: the documentation's page for a keyword or term (`query=`). */
export interface IKeywordDocumentationQueryParams
  extends IKeywordDocumentationCommonParams {
  query: string;
}

/**
 * The topic form: one topic by the name a documentation link carries
 * (`object=`). No discovery template announces it; the documentation's own
 * links use it.
 */
export interface IKeywordDocumentationTopicParams
  extends IKeywordDocumentationCommonParams {
  object: string;
}

/** The position form: the documentation for a position in a source (`uri=`). */
export interface IKeywordDocumentationPositionParams
  extends IKeywordDocumentationCommonParams {
  uri: string;
}

/** The options of one keyword-documentation read. */
export interface IKeywordDocumentationOptions {
  /** The Accept of this one request; absent, the implementation sends its own default. */
  accept?: string | undefined;
}

/**
 * The ABAP keyword documentation (`/sap/bc/adt/docu/abap/langu`), one
 * member per form, one `GET` each.
 */
export interface IAbapKeywordDocumentation<TQuery, TTopic, TPosition> {
  /** Which runtime resource this is, for a consumer narrowing a union of them. */
  readonly kind: 'abapKeywordDocumentation';

  query<E extends IAdtError>(
    params: IKeywordDocumentationQueryParams,
    options: IKeywordDocumentationOptions &
      IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TQuery, E | IAdtError>>;
  query(
    params: IKeywordDocumentationQueryParams,
    options?: IKeywordDocumentationOptions & IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TQuery>>;
  topic<E extends IAdtError>(
    params: IKeywordDocumentationTopicParams,
    options: IKeywordDocumentationOptions &
      IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TTopic, E | IAdtError>>;
  topic(
    params: IKeywordDocumentationTopicParams,
    options?: IKeywordDocumentationOptions & IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TTopic>>;
  position<E extends IAdtError>(
    params: IKeywordDocumentationPositionParams,
    options: IKeywordDocumentationOptions &
      IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
  ): Promise<IAdtResponse<TPosition, E | IAdtError>>;
  position(
    params: IKeywordDocumentationPositionParams,
    options?: IKeywordDocumentationOptions & IAdtAnalyseOptions,
  ): Promise<IAdtResponse<TPosition>>;
}
