import type { Denops } from "jsr:@denops/std@8.0.0";
import type { QfColumn } from "./column.ts";
import type { Printer } from "./printer.ts";

type Formatter = (
  denops: Denops,
  printer: Printer,
  columns: QfColumn[],
  rows: string[][],
) => Promise<void>;

const enline = (s: string[]) => "| " + s.join(" | ") + " |";

async function formatMarkdown(
  d: Denops,
  printer: Printer,
  cols: QfColumn[],
  rows: string[][],
): Promise<void> {
  const pad = (s: string, i: number) => s.padEnd(cols[i].width);
  await printer.put(d, enline(cols.map((c) => c.title).map(pad)));
  await printer.put(d, enline(cols.map(() => "-").map(pad)));
  for await (const row of rows) {
    await printer.put(d, enline(row.map(pad)));
  }
}

const validFormatters: Record<string, Formatter> = {
  markdown: formatMarkdown,
};

const defaultFormatter = "markdown";

export function getFormatter(format: string | undefined): Formatter {
  const formatter = validFormatters[format ?? defaultFormatter];
  if (!formatter) {
    throw new Error(`invalid argument: no valid format`);
  }
  return formatter;
}
