import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { ConfigNotFoundError } from "#util/ConfigNotFoundError.js";

/**
 * Reads and writes a JSON configuration file on disk.
 */
export class JsonConfig {
  /**
   * Class constructor.
   *
   * @param path - Absolute path to the JSON config file.
   * @param createIfMissing - When `true`, {@link read} returns an empty object
   *   instead of throwing {@link ConfigNotFoundError} when the file does not
   *   exist, and {@link update} creates parent directories before writing.
   */
  constructor(
    private readonly path: string,
    private readonly createIfMissing: boolean = false,
  ) {}

  /**
   * Reads and parses the JSON config file.
   *
   * When `createIfMissing` is enabled and the file does not exist, an empty
   * object is returned without creating the file on disk.
   *
   * @returns The parsed contents of the file.
   * @throws {ConfigNotFoundError} If the file does not exist and
   *   `createIfMissing` is `false`.
   */
  read(): object {
    if (!existsSync(this.path)) {
      if (this.createIfMissing) {
        return {};
      }

      throw new ConfigNotFoundError(this.path);
    }

    const content = readFileSync(this.path, "utf-8");
    return JSON.parse(content) as object;
  }

  /**
   * Serializes the given data and overwrites the JSON config file.
   *
   * When `createIfMissing` is enabled and the file does not exist, parent
   * directories are created before writing.
   *
   * @param data - The object to write as pretty-printed JSON.
   * @throws {ConfigNotFoundError} If the file does not exist and
   *   `createIfMissing` is `false`.
   */
  update(data: object): void {
    if (!existsSync(this.path)) {
      if (this.createIfMissing) {
        mkdirSync(dirname(this.path), { recursive: true });
      } else {
        throw new ConfigNotFoundError(this.path);
      }
    }

    writeFileSync(this.path, JSON.stringify(data, null, 2) + "\n", "utf-8");
  }
}
