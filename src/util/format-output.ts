import pc from "picocolors";

/**
 * Formats a positive (success) output line with a green checkmark prefix.
 *
 * @param message - The message to display.
 * @returns Formatted string with green checkmark and message.
 */
export function positive(message: string): string {
  return `  ${pc.green("\u2713")} ${message}`;
}

/**
 * Formats a negative (error/failure) output line with a red cross prefix.
 *
 * @param message - The message to display.
 * @returns Formatted string with red cross and message.
 */
export function negative(message: string): string {
  return `  ${pc.red("\u2717")} ${message}`;
}

/**
 * Formats a header line with a yellow tilde prefix.
 *
 * @param message - The message to display.
 * @returns Formatted string with yellow tilde and message.
 */
export function header(message: string): string {
  return `  ${pc.yellow("~")} ${message}`;
}

/**
 * Returns a visual divider line.
 *
 * @returns A dim horizontal rule string.
 */
export function divider(): string {
  return pc.dim("\u2500".repeat(40));
}
