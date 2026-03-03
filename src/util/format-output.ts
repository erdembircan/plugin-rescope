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
 * Returns a visual divider line (40 dim horizontal-rule characters).
 *
 * @returns A dim horizontal rule string.
 */
export function divider(): string {
  return pc.dim("\u2500".repeat(40));
}

/**
 * Returns a multi-line section block: blank line, divider, dim label,
 * divider, blank line.  Each element is a separate array entry so the
 * caller can spread them into individual `console.log` calls.
 *
 * @param label - The section label to display.
 * @returns An array of five strings representing the section block.
 */
export function section(label: string): string[] {
  const d = divider();
  return ["", d, pc.dim(`--- ${label} ---`), d, ""];
}
