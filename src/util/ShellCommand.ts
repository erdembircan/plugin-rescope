import { execSync } from "node:child_process";
import { ShellCommandError } from "#util/ShellCommandError.js";

/**
 * Runs shell commands synchronously via `child_process.execSync`.
 */
export class ShellCommand {
  /**
   * Executes a shell command and returns its trimmed stdout output.
   *
   * @param command - The shell command string to run.
   * @returns The trimmed standard output of the command.
   * @throws {ShellCommandError} If the command exits with a non-zero code.
   */
  static execute(command: string): string {
    try {
      return execSync(command, { encoding: "utf-8" }).trim();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new ShellCommandError(message);
    }
  }
}
