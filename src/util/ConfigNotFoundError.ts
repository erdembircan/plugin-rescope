export class ConfigNotFoundError extends Error {
  constructor(path: string) {
    super(`Config file not found: ${path}`);
    this.name = "ConfigNotFoundError";
  }
}
