// Compile-only assertions. If these stop compiling, the types regressed.

import type { IAdtContentTypes, IAdtHeaders } from '../adt/IAdtContentTypes';

// A consumer's own header set satisfies the contract — the reason this is
// published. Stub a slice of it rather than importing a shipped class (there
// isn't one: the two shipped sets stay in adt-clients as behaviour), which is
// exactly the position a consumer overriding headers is in.
const headers: IAdtHeaders = {
  accept: 'application/vnd.sap.adt.programs.programs+xml',
  contentType: 'application/vnd.sap.adt.programs.programs+xml',
};

const _own: Pick<
  IAdtContentTypes,
  'programCreate' | 'sourceArtifactContentType'
> = {
  programCreate: (): IAdtHeaders => headers,
  sourceArtifactContentType: (): string => 'text/plain',
};
void _own;

const _wrongReturn: Pick<IAdtContentTypes, 'sourceArtifactContentType'> = {
  // @ts-expect-error sourceArtifactContentType returns a string, not headers.
  sourceArtifactContentType: (): IAdtHeaders => headers,
};
void _wrongReturn;

// @ts-expect-error `contentType` is required, not optional — renaming or
// dropping the field on IAdtHeaders would silently make it optional here.
const _headersMissingField: IAdtHeaders = { accept: 'a' };
void _headersMissingField;
