export class ShellCommandError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShellCommandError";
  }
}
