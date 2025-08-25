import type { Denops } from "jsr:@denops/std@8.0.0";
import * as fn from "jsr:@denops/std@8.0.0/function";

export interface Printer {
  open(denops: Denops): Promise<void>;
  put(denops: Denops, text: string): Promise<void>;
}

class CurPrinter implements Printer {
  private line: number = 0;

  constructor(_: string) {}

  async open(denops: Denops): Promise<void> {
    this.line = await fn.line(denops, ".");
  }

  async put(denops: Denops, text: string): Promise<void> {
    await fn.append(denops, this.line, text);
    this.line++;
  }
}

class BufPrinter {
  private line: number = 0;

  constructor(private target: string, private cmd: string) {}

  async open(denops: Denops): Promise<void> {
    this.line = 1;
    await fn.execute(denops, `${this.cmd} ${this.target}`);
  }

  async put(denops: Denops, text: string): Promise<void> {
    await fn.setline(denops, this.line, text);
    this.line++;
  }
}

class HbufPrinter extends BufPrinter {
  constructor(target: string) {
    super(target, "new");
  }
}

class VbufPrinter extends BufPrinter {
  constructor(target: string) {
    super(target, "vnew");
  }
}

class RegPrinter implements Printer {
  private option: string;

  constructor(private regname: string) {
    if (regname && !/^[a-zA-Z0-9*+]$/.test(regname)) {
      throw new Error(
        `invalid argument: ${regname} is not valid register name`,
      );
    }
    this.option = "l";
  }

  open(_: Denops): Promise<void> {
    return Promise.resolve();
  }

  async put(denops: Denops, text: string): Promise<void> {
    await fn.setreg(denops, this.regname, text, this.option);
    this.option += "a";
  }
}

const validPrinters: Record<string, { new (target: string): Printer }> = {
  cur: CurPrinter,
  hnew: HbufPrinter,
  vnew: VbufPrinter,
  reg: RegPrinter,
};

export function getPrinter(
  output: string | undefined,
): Printer {
  if (!output) {
    return new HbufPrinter("");
  }
  const terms = output.split(":");
  const printer = validPrinters[terms[0]];
  if (!printer) {
    throw new Error(
      `invalid argument: ${terms[0]} is not valid printer name`,
    );
  }
  if (terms.length >= 2) {
    name = terms[1];
  }
  return new printer(name);
}
