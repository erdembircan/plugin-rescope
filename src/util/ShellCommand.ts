import { execSync } from "node:child_process";
import { ShellCommandError } from "./ShellCommandError.js";

export class ShellCommand {
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
