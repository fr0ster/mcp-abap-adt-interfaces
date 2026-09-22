/**
 * Domain ADT operation parameter interfaces (snake_case, low-level)
 */

export interface IFixedValue {
  low: string;
  text: string;
}

// Builder configuration (camelCase)
// Note: packageName is required for create/update operations (validated in builder methods)
// description is required for create/update/validate operations
export interface IDomainConfig {
  /**
   * The complete document to write, when this config is used for an update.
   *
   * **An update is a write, not a read-modify-write.** Until 19.0.0 of
   * `adt-clients` the five DDIC-shaped updates fetched the current document,
   * patched the fields named here into it, and PUT the result — two requests in
   * one member, and a merge whose rules nobody outside could change. They no
   * longer do: a caller reads the document with the member that reads it, edits
   * it, and passes it here.
   *
   * So the fields beside this one describe a *create*. On an update they are not
   * sent, and a field left out of `document` is not preserved — there is nothing
   * to preserve it from, because nothing was read.
   *
   * Optional because the same config creates, where there is no document yet.
   */
  document?: string;

  domainName: string;
  masterLanguage?: string; // Original/master language for create; falls back to systemContext (SAP_LANGUAGE), then EN
  packageName?: string; // Required for create/update operations, optional for others
  transportRequest?: string; // Only optional parameter
  description?: string; // Required for create/update/validate operations, optional for others

  /**
   * What the domain IS, sent by the **create** and by nothing else.
   *
   * These three left this type in `interfaces-adt` 4.0.0 because the create
   * accepted them and did not send them: a domain asked for as `CHAR(10)` came
   * back with `<doma:datatype/>` empty, and SAP refused to activate it —
   * `DO(251) Data type ' ' does not exist`. They return because the endpoint
   * was then measured and it does take them: a POST carrying
   * `doma:content/doma:typeInformation` was answered `201`, the document read
   * back as `CHAR`/`000010`, and the activation reported no messages at all.
   * Cloud trial, 2026-09-22; `scripts/probe-domain-create-payload.ts` in
   * `adt-clients` is the measurement, and on-premise is not covered by it.
   *
   * **Absent means absent.** Name none of them and the POST is byte for byte
   * what it was before — no `doma:content` element at all — so a caller who
   * never used them sees no change, including on a system where this was not
   * measured.
   *
   * On an **update** they are still not sent, and nothing here changes that:
   * the whole document goes through `document`, as it has since 19.0.0.
   */
  datatype?: string;
  length?: number;
  decimals?: number;
}
