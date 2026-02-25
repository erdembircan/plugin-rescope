/**
 * Instance-based generic flag parser for CLI arguments.
 * Accepts flag definitions at construction and parses argument arrays into
 * typed flag/positional pairs. Optionally recognizes a leading command
 * (e.g. `add` or `remove`) before any flags or positionals.
 */
export class FlagParser<T extends string, C extends string = never> {
  private flags: T[];
  private commands: ReadonlySet<C>;
  private defaultCommand: C | "";

  /**
   * Creates a FlagParser instance for the given flag names.
   * Flag names are normalized: any `--` prefix is stripped, whitespace is
   * trimmed, and internal spaces are removed.
   *
   * @param flags - Flag names (e.g. `["scope", "output"]`).
   * @param commands - Optional array of valid command names. When provided,
   *   the parser checks whether `args[0]` matches one of these commands.
   *   If it does, the command is consumed and returned in the result;
   *   otherwise the first entry in `commands` is used as the default.
   */
  constructor(flags: T[], commands?: C[]) {
    this.flags = flags.map((flag) => {
      let normalized = flag.trim().replaceAll(" ", "");

      if (normalized.startsWith("--")) {
        normalized = normalized.slice(2);
      }

      return normalized as T;
    });

    if (commands && commands.length > 0) {
      this.commands = new Set(commands);
      this.defaultCommand = commands[0];
    } else {
      this.commands = new Set();
      this.defaultCommand = "" as C | "";
    }
  }

  /**
   * Parses CLI arguments into an optional command, named flags, and
   * positional arguments. If commands were configured, the first argument
   * is checked against them; a matching command is consumed and returned,
   * otherwise the default command is used.
   *
   * Matches `--`-prefixed tokens in `args` against the flag names
   * provided to the constructor.
   *
   * @param args - The raw CLI argument array (e.g. `process.argv.slice(2)`).
   * @returns An object with `command` (the matched or default command, or
   *          `""` when no commands were configured), `flags` (a record mapping
   *          each flag name to its value, or `""` if not provided), and
   *          `positionals` (an array of all non-flag arguments, in order).
   */
  parse(args: string[]): {
    command: C | "";
    flags: Record<T, string>;
    positionals: string[];
  } {
    let command: C | "" = this.defaultCommand;
    let startIndex = 0;

    if (this.commands.size > 0 && args.length > 0) {
      if (this.commands.has(args[0] as C)) {
        command = args[0] as C;
        startIndex = 1;
      }
    }

    const result = {} as Record<T, string>;

    for (const flag of this.flags) {
      result[flag] = "";
    }

    const positionals: string[] = [];
    let i = startIndex;

    while (i < args.length) {
      const arg = args[i];
      const matchedFlag = this.flags.find((f) => `--${f}` === arg);

      if (matchedFlag !== undefined) {
        result[matchedFlag] = args[i + 1] ?? "";
        i += 2;
      } else {
        positionals.push(arg);
        i++;
      }
    }

    return { command, flags: result, positionals };
  }
}
