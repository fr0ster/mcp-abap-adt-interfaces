/**
 * Transformation ADT operation parameter interfaces (low-level)
 *
 * Note: only the low-level params + the nested shapes they reference are
 * promoted here. Config/State/domain-object types (ITransformationConfig,
 * ITransformationState, etc.) are out of scope for this task and are
 * promoted separately.
 */

export type TransformationType = 'SimpleTransformation' | 'XSLTProgram';

export interface ICreateTransformationParams {
  transformation_name: string;
  transformation_type: TransformationType;
  description?: string;
  package_name: string;
  transport_request?: string;
  masterSystem?: string;
  responsible?: string;
  masterLanguage?: string;
}

export interface IUpdateTransformationParams {
  transformation_name: string;
  source_code: string;
  transport_request?: string;
}

export interface IDeleteTransformationParams {
  transformation_name: string;
  transport_request?: string;
}
