# Migrating to `@mcp-abap-adt/interfaces-adt-connection` 5.0.0

`IAbapConnection.makeAdtRequest` takes no type parameters:

```ts
// 4.x
makeAdtRequest<T = unknown, D = unknown>(options: IAbapRequestOptions): Promise<IAdtWireResponse<T, D>>;
// 5.0.0
makeAdtRequest(options: IAbapRequestOptions): Promise<IAdtWireResponse>;
```

The answer's `data` is `unknown`. `IAdtWireResponse<T = unknown, D = unknown>`
is unchanged.

## A caller that passed type arguments

The call no longer compiles. Drop the type arguments and read `data` as what
it is, `unknown`, narrowing it where it is read:

```diff
- const answer = await connection.makeAdtRequest<string>(options);
- const text: string = answer.data;
+ const answer = await connection.makeAdtRequest(options);
+ const text = typeof answer.data === 'string' ? answer.data : '';
```

An object is narrowed by a check of its own (`'field' in data`, or a type
guard), never by an assertion: what came off the wire is data from outside the
type system. A caller that passed no type arguments changes nothing.

## A function that forwards the call

A wrapper that took `<T, D>` only to hand them to `makeAdtRequest` drops them
and answers `Promise<IAdtWireResponse>`:

```diff
- function send<T = unknown, D = unknown>(options: IAbapRequestOptions): Promise<IAdtWireResponse<T, D>> {
-   return connection.makeAdtRequest<T, D>(options);
- }
+ function send(options: IAbapRequestOptions): Promise<IAdtWireResponse> {
+   return connection.makeAdtRequest(options);
+ }
```

## An implementation of `IAbapConnection`

- **Generic** (`makeAdtRequest<T = unknown, D = unknown>(…)`): nothing to do. A
  generic method is assignable to the non-generic member, so the
  implementation conforms as it is, and its own callers keep their type
  arguments when they hold the implementation's own type.
- **A recorder, a forwarder or a test stand-in** that answers a fixed shape:
  declare it non-generic and drop the assertion the generic member forced on
  it:

  ```diff
  - makeAdtRequest: async <T = unknown, D = unknown>() =>
  -   ({ data: undefined, status: 200, statusText: 'OK', headers: {} }) as unknown as IAdtWireResponse<T, D>,
  + makeAdtRequest: async (): Promise<IAdtWireResponse> => ({
  +   data: undefined,
  +   status: 200,
  +   statusText: 'OK',
  +   headers: {},
  + }),
  ```

## A package that takes an `IAbapConnection` in its own signatures

A non-generic connection is not assignable to 4.x's `IAbapConnection` (`unknown`
is not assignable to a caller's `T`). To accept one, name `^5.0.0`. For that
package's callers this is no break: any connection they hold today is generic,
and a generic connection is assignable to the 5.0.0 parameter. Keep one copy of
this package in the tree: 4.x's and 5.0.0's `IAbapConnection` differ in
`makeAdtRequest`, so a non-generic connection typed by 5.0.0 is not assignable
where a 4.x copy is named.
