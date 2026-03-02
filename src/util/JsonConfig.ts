import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
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
   * Creates the config file with an empty JSON object if it does not
   * already exist. Parent directories are created as needed.
   */
  create(): void {
    if (existsSync(this.path)) {
      return;
    }

    mkdirSync(dirname(this.path), { recursive: true });
    writeFileSync(this.path, "{}\n", "utf-8");
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
