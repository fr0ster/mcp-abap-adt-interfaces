/**
 * ADT Content-Type / Accept header provider — the contract a consumer
 * overrides when its SAP system needs different Accept/Content-Type headers.
 *
 * Each method returns { accept, contentType } for a specific operation.
 * Accept can contain multiple values (comma-separated), Content-Type is always single.
 *
 * The two shipped implementations (base v1 headers for older systems; modern
 * v2+ headers for S/4 HANA/BTP) stay in adt-clients — they are behaviour
 * (concrete classes), not contract.
 */

export interface IAdtHeaders {
  accept: string;
  contentType: string;
}

export interface IAdtContentTypes {
  // Program
  programCreate(): IAdtHeaders;
  programRead(): IAdtHeaders;

  /**
   * Standalone `PROG/I` include creation.
   *
   * Measured `application/vnd.sap.adt.programs.includes.v2+xml` — NOT the
   * program type. The two collections advertise different accepts, so reusing
   * `programCreate()` here posts a document the server does not accept.
   */
  includeCreate(): IAdtHeaders;

  // Class
  classCreate(): IAdtHeaders;
  classRead(): IAdtHeaders;

  // Interface
  interfaceCreate(): IAdtHeaders;

  // Domain
  domainCreate(): IAdtHeaders;
  domainRead(): IAdtHeaders;
  domainUpdate(): IAdtHeaders;

  // Data Element
  dataElementCreate(): IAdtHeaders;
  dataElementRead(): IAdtHeaders;
  dataElementUpdate(): IAdtHeaders;

  // Structure
  structureCreate(): IAdtHeaders;

  // Table
  tableCreate(): IAdtHeaders;

  // Package
  packageCreate(): IAdtHeaders;
  packageRead(): IAdtHeaders;
  packageUpdate(): IAdtHeaders;

  // Function Group
  functionGroupCreate(): IAdtHeaders;
  functionGroupUpdate(): IAdtHeaders;

  // Source code artifact content type (used in checkRun XML payload)
  // Unicode systems: 'text/plain; charset=utf-8'
  // Non-unicode legacy systems: 'text/plain'
  sourceArtifactContentType(): string;
}
