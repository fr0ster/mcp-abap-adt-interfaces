/**
 * AppendStructure (TABL/DS append) ADT operation parameter interfaces (low-level)
 */

export interface IAppendStructureConfig {
  appendStructureName: string;
  baseObject?: string; // required for create (validated in handler)
  masterLanguage?: string;
  packageName?: string;
  transportRequest?: string;
  description?: string;
  sourceCode?: string;
}
