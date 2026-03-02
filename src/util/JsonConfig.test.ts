import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { JsonConfig } from "#util/JsonConfig.js";

describe("JsonConfig", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = join(tmpdir(), `jsonconfig-test-${Date.now()}`);
    mkdirSync(tempDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe("create", () => {
    it("creates a file with an empty JSON object when it does not exist", () => {
      const filePath = join(tempDir, "config.json");
      const config = new JsonConfig(filePath);

      config.create();

      expect(existsSync(filePath)).toBe(true);
      expect(JSON.parse(readFileSync(filePath, "utf-8"))).toEqual({});
    });

    it("creates parent directories when they do not exist", () => {
      const filePath = join(tempDir, "nested", "deep", "config.json");
      const config = new JsonConfig(filePath);

      config.create();

      expect(existsSync(filePath)).toBe(true);
      expect(JSON.parse(readFileSync(filePath, "utf-8"))).toEqual({});
    });

    it("does not overwrite an existing file", () => {
      const filePath = join(tempDir, "config.json");
      const customData = { existing: "data" };
      writeFileSync(filePath, JSON.stringify(customData), "utf-8");

      const config = new JsonConfig(filePath);
      config.create();

      const content = JSON.parse(readFileSync(filePath, "utf-8"));
      expect(content).toEqual(customData);
    });
  });
});
