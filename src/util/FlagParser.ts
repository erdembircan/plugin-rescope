export class FlagParser<T extends string> {
  private flags: T[];

  /**
   * Creates a FlagParser instance for the given flag names.
   * Flag names are normalized: any `--` prefix is stripped, whitespace is
   * trimmed, and internal spaces are removed.
   *
   * @param flags - Flag names (e.g. `["scope", "output"]`).
   */
  constructor(flags: T[]) {
    this.flags = flags.map((flag) => {
      let normalized = flag.trim().replaceAll(" ", "");

      if (normalized.startsWith("--")) {
        normalized = normalized.slice(2);
      }

      return normalized as T;
    });
  }

  /**
   * Parses CLI arguments into named flags and a positional argument.
   * Matches `--`-prefixed tokens in `args` against the flag names
   * provided to the constructor.
   *
   * @param args - The raw CLI argument array (e.g. `process.argv.slice(2)`).
   * @returns An object with `flags` (a record mapping each flag name to its
   *          value, or `""` if not provided) and `positional` (the first
   *          non-flag argument, or `""` if none).
   */
  parse(args: string[]): { flags: Record<T, string>; positional: string } {
    const result = {} as Record<T, string>;

    for (const flag of this.flags) {
      result[flag] = "";
    }

    let positional = "";
    let i = 0;

    while (i < args.length) {
      const arg = args[i];
      const matchedFlag = this.flags.find((f) => `--${f}` === arg);

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
