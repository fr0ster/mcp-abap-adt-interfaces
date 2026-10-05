/**
 * Branded integers: a fact that is a number carries a range, and the brand
 * says the range was checked. Each brand symbol is declared and not exported,
 * so no code outside this file can write the key; a bare number (`500`) is
 * not one. `@mcp-abap-adt/auth-errors` mints them — `httpStatus()`, `count()`,
 * `port()`, each answering `undefined` outside its range.
 */

declare const httpStatusBrand: unique symbol;
declare const countBrand: unique symbol;
declare const portBrand: unique symbol;

/** An integer HTTP status, 100–599. */
export type HttpStatus = number & { readonly [httpStatusBrand]: 'HttpStatus' };

/** An integer count, 0–1 000 000. */
export type Count = number & { readonly [countBrand]: 'Count' };

/** An integer TCP port, 0–65 535. */
export type Port = number & { readonly [portBrand]: 'Port' };
