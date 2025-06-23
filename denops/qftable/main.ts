import type { Denops } from "jsr:@denops/std@7.6.0";
import { parse } from "jsr:@denops/std@7.6.0/argument";
import { ensure, is } from "jsr:@core/unknownutil@4.3.0";

import { getFlagValue, getFlagValues } from "./flag.ts";
import { show } from "./mod.ts";

export function main(denops: Denops) {
  denops.dispatcher = {
    show: async (
      uParams: unknown,
    ) => {
      const params = ensure(
        uParams,
        is.ObjectOf({
          columns: is.UnionOf([is.Undefined, is.ArrayOf(is.String)]),
          printer: is.UnionOf([is.Undefined, is.String]),
          formatter: is.UnionOf([is.Undefined, is.String]),
        }),
      );
      await show(denops, params.columns, params.printer, params.formatter);
    },
    ["command:show"]: async (args: unknown) => {
      const [_, uFlags] = parse(ensure(args, is.ArrayOf(is.String)));
      const columns = getFlagValues(uFlags, "column");
      const printer = getFlagValue(uFlags, "output");
      const formatter = getFlagValue(uFlags, "format");
      await show(denops, columns, printer, formatter);
    },
  };
}
