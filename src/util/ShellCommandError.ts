/**
 * Thrown when a shell command executed via {@link ShellCommand.execute} fails.
 */
export class ShellCommandError extends Error {
  /**
   * @param message - The error message from the failed command.
   */
  constructor(message: string) {
    super(message);
    this.name = "ShellCommandError";
  }
}
