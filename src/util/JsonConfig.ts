import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { ConfigNotFoundError } from "#util/ConfigNotFoundError.js";

/**
 * Reads and writes a JSON configuration file on disk.
 */
export class JsonConfig {
  private readonly path: string;

  /**
   * Class constructor.
   *
   * @param path - Absolute path to the JSON config file.
   */
  constructor(path: string) {
    this.path = path;
  }

  /**
   * Reads and parses the JSON config file.
   *
   * @returns The parsed contents of the file.
   * @throws {ConfigNotFoundError} If the file does not exist.
   */
  read(): object {
    if (!existsSync(this.path)) {
      throw new ConfigNotFoundError(this.path);
    }

    const content = readFileSync(this.path, "utf-8");
    return JSON.parse(content) as object;
  }

  /**
   * Serializes the given data and overwrites the JSON config file.
   *
   * @param data - The object to write as pretty-printed JSON.
   * @throws {ConfigNotFoundError} If the file does not exist.
   */
  update(data: object): void {
    if (!existsSync(this.path)) {
      throw new ConfigNotFoundError(this.path);
    }

    writeFileSync(this.path, JSON.stringify(data, null, 2) + "\n", "utf-8");
  }
}
