import { is, type Predicate } from "jsr:@core/unknownutil@4.3.0";

export type QfItem = {
  bufnr: number;
  module: string;
  lnum: number;
  end_lnum: number;
  col: number;
  end_col: number;
  vcol: number;
  nr: number;
  pattern: string;
  text: string;
  type: string;
  valid: number;
  user_data: unknown;
};

export const isQfItem = is.ObjectOf({
  bufnr: is.Number,
  module: is.String,
  lnum: is.Number,
  end_lnum: is.Number,
  col: is.Number,
  end_col: is.Number,
  vcol: is.Number,
  nr: is.Number,
  pattern: is.String,
  text: is.String,
  type: is.String,
  valid: is.Number,
  user_data: is.Unknown,
}) satisfies Predicate<QfItem>;
