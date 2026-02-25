/**
 * Configuration object for command support in FlagParser.
 *
 * @template C - Union of valid command name literals.
 */
export interface CommandConfig<C extends string> {
  /** The set of valid command names the parser should recognize. */
  commands: C[];
  /** The command to use when `args[0]` does not match any known command. */
  default: C;
}

/**
 * Instance-based generic flag parser for CLI arguments.
 * Accepts flag definitions at construction and parses argument arrays into
 * typed flag/positional pairs. Optionally recognizes a leading command
 * (e.g. `add` or `remove`) before any flags or positionals.
 *
 * Supports two kinds of flags:
 * - **Value flags** consume the next argument as their value (e.g. `--scope local`).
 * - **Boolean flags** are standalone toggles with no value (e.g. `--help`).
 *
 * Both kinds are returned in a single `flags` record: value flags map to
 * `string`, boolean flags map to `boolean`.
 */
export class FlagParser<
  T extends string,
  C extends string = never,
  B extends string = never,
> {
  private valueFlags: T[];
  private booleanFlags: B[];
  private commands: ReadonlySet<C>;
  private defaultCommand: C | "";

  /**
   * Creates a FlagParser instance for the given flag names.
   * Flag names are normalized: any `--` prefix is stripped, whitespace is
   * trimmed, and internal spaces are removed.
   *
   * @param flags - Value flag names (e.g. `["scope", "output"]`).
   * @param commandConfig - Optional command configuration object. When
   *   provided, the parser checks whether `args[0]` matches one of the
   *   configured commands. If it does, the command is consumed and returned
   *   in the result; otherwise `commandConfig.default` is used.
   * @param booleanFlags - Optional boolean flag names (e.g. `["help", "verbose"]`).
   *   Boolean flags do not consume a following argument; they are either
   *   `true` (present) or `false` (absent).
   */
  constructor(
    flags: T[],
    commandConfig?: CommandConfig<C>,
    booleanFlags?: B[],
  ) {
    this.valueFlags = flags.map((flag) => {
      let normalized = flag.trim().replaceAll(" ", "");

      if (normalized.startsWith("--")) {
        normalized = normalized.slice(2);
      }

      return normalized as T;
    });

    this.booleanFlags = (booleanFlags ?? []).map((flag) => {
      let normalized = flag.trim().replaceAll(" ", "");

      if (normalized.startsWith("--")) {
        normalized = normalized.slice(2);
      }

      return normalized as B;
    });

    if (commandConfig) {
      this.commands = new Set(commandConfig.commands);
      this.defaultCommand = commandConfig.default;
    } else {
      this.commands = new Set();
      this.defaultCommand = "" as C | "";
    }
  }

  /**
   * Parses CLI arguments into an optional command, a unified flags record,
   * and positional arguments. If a command configuration was provided, the
   * first argument is checked against the known commands; a matching
   * command is consumed and returned, otherwise the configured default
   * command is used.
   *
   * Matches `--`-prefixed tokens in `args` against the flag names
   * provided to the constructor.
   *
   * @param args - The raw CLI argument array (e.g. `process.argv.slice(2)`).
   * @returns An object with `command` (the matched or default command, or
   *          `""` when no commands were configured), `flags` (a record
   *          mapping value flag names to their `string` value or `""` if
   *          not provided, and boolean flag names to `true` or `false`),
   *          and `positionals` (an array of all non-flag arguments, in
   *          order).
   */
  parse(args: string[]): {
    command: C | "";
    flags: Record<T, string> & Record<B, boolean>;
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

    const flags = {} as Record<T, string> & Record<B, boolean>;

    for (const flag of this.valueFlags) {
      (flags as Record<T, string>)[flag] = "";
    }

    for (const flag of this.booleanFlags) {
      (flags as Record<B, boolean>)[flag] = false;
    }

    const positionals: string[] = [];
    let i = startIndex;

    while (i < args.length) {
      const arg = args[i];
      const matchedValueFlag = this.valueFlags.find((f) => `--${f}` === arg);
      const matchedBooleanFlag = this.booleanFlags.find(
        (f) => `--${f}` === arg,
      );

      if (matchedValueFlag !== undefined) {
        (flags as Record<T, string>)[matchedValueFlag] = args[i + 1] ?? "";
        i += 2;
      } else if (matchedBooleanFlag !== undefined) {
        (flags as Record<B, boolean>)[matchedBooleanFlag] = true;
        i++;
      } else {
        positionals.push(arg);
        i++;
      }
    }

    return { command, flags, positionals };
  }
}
