/**
 * What an XML parser hands back for one node.
 *
 * It was `XmlNode` in `@mcp-abap-adt/interfaces-adt` until that package's
 * 9.0.0, where nothing used it: a parser's output shape is not an ADT contract,
 * whatever the document happens to contain.
 */
/**
 * Recursive type for XML parser results.
 * Allows property access on deeply nested parsed XML structures.
 *
 * @example
 * ```typescript
 * const result = parser.parse(xmlData) as XmlNode;
 * const data = (result?.['asx:abap'] as XmlNode)?.['asx:values'];
 * ```
 */
export interface XmlNode {
  [key: string]: XmlNode | XmlNode[] | string | number | boolean | undefined;
}
