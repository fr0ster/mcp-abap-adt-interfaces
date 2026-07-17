/**
 * AuthorizationField (SUSO / AUTH) ADT operation parameter interfaces (low-level)
 */

export interface ICreateAuthorizationFieldParams {
  authorization_field_name: string;
  description?: string;
  package_name: string;
  transport_request?: string;
  master_system?: string;
  responsible?: string;

  field_name?: string;
  roll_name?: string;
  check_table?: string;
  exit_fb?: string;
  abap_language_version?: string;
  search?: string;
  objexit?: string;
  domname?: string;
  outputlen?: string;
  convexit?: string;
  orglvlinfo?: string;
  col_searchhelp?: string;
  col_searchhelp_name?: string;
  col_searchhelp_descr?: string;
}
