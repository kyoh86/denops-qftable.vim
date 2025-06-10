import type { Flags } from "jsr:@denops/std@7.5.1/argument";

export function getFlagValue(flags: Flags, key: string): string | undefined {
  if (!(key in flags)) {
    return undefined;
  }
  const v = flags[key];
  if (!v) {
    return undefined;
  }
  if (typeof v === "string") {
    return v;
  }
  if (v.length === 0) {
    return undefined;
  }
  return v[v.length - 1];
}

export function getFlagValues(flags: Flags, key: string): string[] | undefined {
  const v = flags[key];
  if (!v) {
    return undefined;
  }
  if (typeof v === "string") {
    return [v];
  }
  if (v.length === 0) {
    return undefined;
  }
  return v;
}
