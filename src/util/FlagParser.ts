export class FlagParser {
  static parse<T extends string>(
    args: string[],
    flags: T[],
  ): { flags: Record<T, string>; positional: string } {
    const result = {} as Record<T, string>;

    for (const flag of flags) {
      result[flag] = "";
    }

    let positional = "";
    let i = 0;

    while (i < args.length) {
      const arg = args[i];
      const flagIndex = flags.indexOf(arg as T);

      if (flagIndex !== -1) {
        result[flags[flagIndex]] = args[i + 1] ?? "";
        i += 2;
      } else {
        positional = arg;
        i++;
      }
    }

    return { flags: result, positional };
  }
}
