/**
 * Thrown when a required configuration file does not exist on disk.
 */
export class ConfigNotFoundError extends Error {
  /**
   * Class constructor.
   *
   * @param path - Absolute path to the missing config file.
   */
  constructor(path: string) {
    super(`Config file not found: ${path}`);
    this.name = "ConfigNotFoundError";
  }
}
