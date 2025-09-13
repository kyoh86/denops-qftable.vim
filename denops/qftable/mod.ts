import * as fn from "jsr:@denops/std@8.0.0/function";
import type { Denops } from "jsr:@denops/std@8.0.0";
import { ensure, is } from "jsr:@core/unknownutil@^4.3.0";

import { isQfItem } from "./type.ts";

import { getColumns } from "./column.ts";
import { getPrinter } from "./printer.ts";
import { getFormatter } from "./format.ts";

export async function show(
  denops: Denops,
  columnNames: string[] | undefined,
  printerName: string | undefined,
  formatterName: string | undefined,
): Promise<void> {
  const columns = getColumns(columnNames);
  const printer = getPrinter(printerName);
  const formatter = getFormatter(formatterName);

  const rows = await Promise.all(
    ensure(
      await fn.getqflist(denops),
      is.ArrayOf(isQfItem),
    ).map(async (item) =>
      await Promise.all(columns.map(async (column) => {
        const value = await column.getValue(denops, item);
        const width = await fn.strdisplaywidth(denops, value);
        column.width = Math.max(column.width, width);
        return value;
      }))
    ),
  );

  await printer.open(denops);
  await formatter(denops, printer, columns, rows);
}
