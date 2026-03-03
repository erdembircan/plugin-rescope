import pc from "picocolors";

/**
 * Formats CLI output lines using a pipe border design.
 *
 * Each plugin block is framed with box-drawing characters:
 *
 * ```
 *   ┌ plugin-name
 *   │ ✓ success message
 *   └─
 * ```
 */
export class FormatOutput {
  /**
   * Returns the header line for a plugin block.
   *
   * @param label - The plugin name to display in bold.
   * @returns Formatted header string: `  ┌ {bold label}`
   */
  static header(label: string): string {
    return `  ${pc.dim("\u250c")} ${pc.bold(label)}`;
  }

  /**
   * Returns the footer line that closes a plugin block.
   *
   * @returns Formatted footer string: `  └─`
   */
  static footer(): string {
    return `  ${pc.dim("\u2514\u2500")}`;
  }

  /**
   * Returns a positive (success) output line with a green checkmark.
   *
   * @param message - The message to display.
   * @returns Formatted string: `  │ ✓ {green message}`
   */
  static positive(message: string): string {
    return `  ${pc.dim("\u2502")} ${pc.green(`\u2713 ${message}`)}`;
  }

  /**
   * Returns a negative (error/failure) output line with a red cross.
   *
   * @param message - The message to display.
   * @returns Formatted string: `  │ ✗ {red message}`
   */
  static negative(message: string): string {
    return `  ${pc.dim("\u2502")} ${pc.red(`\u2717 ${message}`)}`;
  }
}
