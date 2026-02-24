export class FlagParser<T extends string> {
  private flags: T[];

  /**
   * Creates a FlagParser instance for the given flag names.
   * Flag names must not include the `--` prefix.
   *
   * @param flags - Flag names without the `--` prefix (e.g. `["scope", "output"]`).
   * @throws {Error} If any flag name starts with `--`.
   */
  constructor(flags: T[]) {
    for (const flag of flags) {
      if (flag.startsWith("--")) {
        throw new Error(
          `Flag "${flag}" must not include the "--" prefix. Use "${flag.slice(2)}" instead.`,
        );
      }
    }

    this.flags = flags;
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
