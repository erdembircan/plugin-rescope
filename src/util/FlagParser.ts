export class FlagParser<T extends string> {
  constructor(
    private readonly args: string[],
    private readonly flags: T[],
  ) {}

  parse(): { flags: Record<T, string>; positional: string } {
    const result = {} as Record<T, string>;

    for (const flag of this.flags) {
      result[flag] = "";
    }

    let positional = "";
    let i = 0;

    while (i < this.args.length) {
      const arg = this.args[i];
      const flagIndex = this.flags.indexOf(arg as T);

      if (flagIndex !== -1) {
        result[this.flags[flagIndex]] = this.args[i + 1] ?? "";
        i += 2;
      } else {
        positional = arg;
        i++;
      }
    }

    return { flags: result, positional };
  }
}
