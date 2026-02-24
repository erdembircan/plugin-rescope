export class FlagParser {
  /**
   * Parses CLI arguments into named flags and a positional argument.
   * Flag names are supplied without the `--` prefix; the method matches
   * them against `--`-prefixed tokens in `args`.
   *
   * @param args - The raw CLI argument array (e.g. `process.argv.slice(2)`).
   * @param flags - Flag names without the `--` prefix (e.g. `["scope", "output"]`).
   * @returns An object with `flags` (a record mapping each flag name to its
   *          value, or `""` if not provided) and `positional` (the first
   *          non-flag argument, or `""` if none).
   */
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
      const matchedFlag = flags.find((f) => `--${f}` === arg);

      if (matchedFlag !== undefined) {
        result[matchedFlag] = args[i + 1] ?? "";
        i += 2;
      } else {
        positional = arg;
        i++;
      }
    }

    return { flags: result, positional };
  }
}
