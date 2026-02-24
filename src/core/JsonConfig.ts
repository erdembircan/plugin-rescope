import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { ConfigNotFoundError } from "./ConfigNotFoundError.js";

export class JsonConfig {
  private readonly path: string;

  constructor(path: string) {
    this.path = path;
  }

  read(): object {
    if (!existsSync(this.path)) {
      throw new ConfigNotFoundError(this.path);
    }

    const content = readFileSync(this.path, "utf-8");
    return JSON.parse(content) as object;
  }

  update(data: object): void {
    if (!existsSync(this.path)) {
      throw new ConfigNotFoundError(this.path);
    }

    writeFileSync(this.path, JSON.stringify(data, null, 2) + "\n", "utf-8");
  }
}
