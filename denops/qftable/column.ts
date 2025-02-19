import type { Denops } from "jsr:@denops/std@~7.4.0";
import * as fn from "jsr:@denops/std@~7.4.0/function";

import type { QfItem } from "./type.ts";

export interface QfColumn {
  getValue(denops: Denops, n: QfItem): Promise<string>;
  title: string;
  width: number;
}

type PostProcessor<T extends keyof QfItem> = (
  denops: Denops,
  x: QfItem[T],
) => Promise<string> | string;

function getField<T extends keyof QfItem>(source: T): (n: QfItem) => QfItem[T] {
  return (n) => n[source];
}

interface ColumnProfile<T extends keyof QfItem> {
  source: T;
  title: string;
  postProcess: PostProcessor<T>;
}

class QfColumnImpl<T extends keyof QfItem> implements QfColumn {
  private fielder: (n: QfItem) => QfItem[T];
  private postProcess: (
    denops: Denops,
    x: QfItem[T],
  ) => Promise<string> | string;
  public title: string;
  public width: number;

  constructor({
    source,
    title,
    postProcess,
  }: ColumnProfile<T>) {
    this.fielder = getField(source);
    this.postProcess = postProcess;
    this.title = title;
    // NOTE: the title is the alphabetical string, so it is safe to use length of the title instead of display-width
    this.width = title.length;
  }

  async getValue(denops: Denops, n: QfItem): Promise<string> {
    const field = this.fielder(n);
    return await this.postProcess(denops, field);
  }
}

const rawString = (_: Denops, s: string): string => s;
const rawNumber = (_: Denops, n: number): string => n.toString();
const rawBoolean = (_: Denops, b: number): string => b ? "yes" : "";

const validColumns: Record<string, () => QfColumn> = {
  bufnr: () =>
    new QfColumnImpl({
      source: "bufnr",
      postProcess: rawNumber,
      title: "Buffer",
    }),
  bufname: () =>
    new QfColumnImpl({
      source: "bufnr",
      postProcess: async (denops: Denops, nr: number) =>
        await fn.bufname(denops, nr),
      title: "Name",
    }),
  module: () =>
    new QfColumnImpl({
      source: "module",
      postProcess: rawString,
      title: "Module",
    }),
  lnum: () =>
    new QfColumnImpl({
      source: "lnum",
      postProcess: rawNumber,
      title: "Line",
    }),
  end_lnum: () =>
    new QfColumnImpl({
      source: "end_lnum",
      postProcess: rawNumber,
      title: "End Line",
    }),
  col: () =>
    new QfColumnImpl({
      source: "col",
      postProcess: rawNumber,
      title: "Column",
    }),
  end_col: () =>
    new QfColumnImpl({
      source: "end_col",
      postProcess: rawNumber,
      title: "End Column",
    }),
  vcol: () =>
    new QfColumnImpl({
      source: "vcol",
      postProcess: rawBoolean,
      title: "Visual Column",
    }),
  nr: () =>
    new QfColumnImpl({
      source: "nr",
      postProcess: rawNumber,
      title: "Error Number",
    }),
  pattern: () =>
    new QfColumnImpl({
      source: "pattern",
      postProcess: rawString,
      title: "Match Pattern",
    }),
  text: () =>
    new QfColumnImpl({
      source: "text",
      postProcess: rawString,
      title: "Text",
    }),
  type: () =>
    new QfColumnImpl({
      source: "type",
      postProcess: rawString,
      title: "Error Type",
    }),
  valid: () =>
    new QfColumnImpl({
      source: "valid",
      postProcess: rawBoolean,
      title: "Valid Error",
    }),
};

const defaultNames = ["bufname", "lnum", "text"];

export function getColumns(names: string[] | undefined): QfColumn[] {
  return (names ?? defaultNames).map(
    (c) => {
      const column = validColumns[c];
      if (!column) {
        throw new Error(`invalid argument: ${c} is not valid column name`);
      }
      return column();
    },
  );
}
