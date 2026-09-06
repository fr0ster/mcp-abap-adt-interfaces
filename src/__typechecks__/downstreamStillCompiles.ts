// Compile-only assertions. If these stop compiling, the types regressed.
//
// **"Additive" is a claim about somebody else's code, so it is checked here
// rather than asserted in a changelog.** Review of #69 was right that the first
// shape broke implementations: one generic signature per member meant an
// implementation had to answer `IAdtResponse<T, E>` for every `E`, and an
// ordinary `Promise<IAdtResponse<string>>` no longer satisfied it — TS2416.
//
// The fix for the other finding removed that as a side effect. Two call
// signatures per member — the strategy-bearing one, then the plain one — and a
// method written against 31.0.0 satisfies the pair. These are that fact, kept
// honest: what follows is what a consumer's class looked like before any of
// this — *plus* whatever a later version genuinely required of it.
//
// 35.0.0 added one such requirement, and this file is where that showed. Any
// object that can be deleted can be asked whether it can be deleted, so
// `IAdtDeletable` carries `checkDeletion` and every implementation answers it.
// `WrittenBefore` gained the member below, and the compile error that forced it
// is the whole reason this file exists: "additive" is a claim about somebody
// else's code, and this one was not additive.

import type {
  IAdtActivatable,
  IAdtCreatable,
  IAdtDeletable,
  IAdtOperationOptions,
  IAdtReadable,
  IAdtResponse,
  IAdtUpdatable,
} from '../index';

interface Config {
  name: string;
}

const ok = <T>(value: T): IAdtResponse<T> => ({
  ok: true,
  getResult: () => ({ value }),
});

/** A class, written against 31.0.0, with no type parameter anywhere. */
class WrittenBefore
  implements
    IAdtCreatable<Config, string>,
    IAdtReadable<Config, string, string>,
    IAdtUpdatable<Config, string>,
    IAdtDeletable<Config, void, string>,
    IAdtActivatable<Config, string>
{
  async create(
    config: Config,
    options?: IAdtOperationOptions,
  ): Promise<IAdtResponse<string>> {
    void options;
    return ok(config.name);
  }

  async read(
    config: Partial<Config>,
    version?: 'active' | 'inactive',
    options?: { withLongPolling?: boolean } & IAdtOperationOptions,
  ): Promise<IAdtResponse<string>> {
    void config;
    void version;
    void options;
    return ok('CLASS zcl_x DEFINITION.');
  }

  async readMetadata(
    config: Partial<Config>,
    options?: {
      withLongPolling?: boolean;
      version?: 'active' | 'inactive';
    } & IAdtOperationOptions,
  ): Promise<IAdtResponse<string>> {
    void config;
    void options;
    return ok('<adtcore:objectReference/>');
  }

  async update(
    config: Partial<Config>,
    options?: IAdtOperationOptions,
  ): Promise<IAdtResponse<string>> {
    void config;
    void options;
    return ok('updated');
  }

  async delete(
    config: Partial<Config>,
    options?: IAdtOperationOptions,
  ): Promise<IAdtResponse<void>> {
    void config;
    void options;
    return ok(undefined);
  }

  async checkDeletion(
    config: Partial<Config>,
    options?: IAdtOperationOptions,
  ): Promise<IAdtResponse<string>> {
    void config;
    void options;
    return ok('<del:checkResponse/>');
  }

  async activate(
    config: Partial<Config>,
    options?: IAdtOperationOptions,
  ): Promise<IAdtResponse<string>> {
    void config;
    void options;
    return ok('activated');
  }
}
void WrittenBefore;

/** And a caller written before this still gets what it always got. */
async function _callerWrittenBefore(): Promise<void> {
  const handler = new WrittenBefore();
  const answer = await handler.activate({ name: 'ZCL_X' });
  if (!answer.ok) {
    const message: string = answer.getError().message;
    void message;
  }
}
void _callerWrittenBefore;
