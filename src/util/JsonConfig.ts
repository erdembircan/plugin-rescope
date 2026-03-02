import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { ConfigNotFoundError } from "#util/ConfigNotFoundError.js";

/**
 * Reads and writes a JSON configuration file on disk.
 */
export class JsonConfig {
  private readonly path: string;
  private readonly createIfMissing: boolean;

  /**
   * Class constructor.
   *
   * @param path - Absolute path to the JSON config file.
   * @param createIfMissing - When `true`, {@link read} and {@link update}
   *   create the file (and parent directories) with an empty JSON object
   *   instead of throwing {@link ConfigNotFoundError}.
   */
  constructor(path: string, createIfMissing: boolean = false) {
    this.path = path;
    this.createIfMissing = createIfMissing;
  }

  /**
   * Reads and parses the JSON config file.
   *
   * When `createIfMissing` is enabled and the file does not exist, an empty
   * JSON object is written to disk (creating parent directories as needed)
   * and `{}` is returned.
   *
   * @returns The parsed contents of the file.
   * @throws {ConfigNotFoundError} If the file does not exist and
   *   `createIfMissing` is `false`.
   */
  read(): object {
    if (!existsSync(this.path)) {
      if (this.createIfMissing) {
        this.writeEmpty();
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

  /**
   * Creates the config file with an empty JSON object, including any
   * missing parent directories.
   */
  private writeEmpty(): void {
    mkdirSync(dirname(this.path), { recursive: true });
    writeFileSync(this.path, "{}\n", "utf-8");
  }
}
