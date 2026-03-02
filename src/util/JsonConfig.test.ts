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
import { ConfigNotFoundError } from "#util/ConfigNotFoundError.js";

describe("JsonConfig", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = join(tmpdir(), `jsonconfig-test-${Date.now()}`);
    mkdirSync(tempDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe("read", () => {
    it("returns parsed JSON from the file", () => {
      const filePath = join(tempDir, "config.json");
      writeFileSync(filePath, JSON.stringify({ key: "value" }), "utf-8");
      const config = new JsonConfig(filePath);

      const result = config.read();

      expect(result).toEqual({ key: "value" });
    });

    it("throws ConfigNotFoundError when the file does not exist", () => {
      const filePath = join(tempDir, "missing.json");
      const config = new JsonConfig(filePath);

      expect(() => config.read()).toThrow(ConfigNotFoundError);
    });

    it("creates the file with an empty JSON object when createIfMissing is true", () => {
      const filePath = join(tempDir, "config.json");
      const config = new JsonConfig(filePath, true);

      const result = config.read();

      expect(result).toEqual({});
      expect(existsSync(filePath)).toBe(true);
      expect(JSON.parse(readFileSync(filePath, "utf-8"))).toEqual({});
    });

    it("creates parent directories when createIfMissing is true", () => {
      const filePath = join(tempDir, "nested", "deep", "config.json");
      const config = new JsonConfig(filePath, true);

      const result = config.read();

      expect(result).toEqual({});
      expect(existsSync(filePath)).toBe(true);
    });

    it("returns existing file contents when createIfMissing is true and file exists", () => {
      const filePath = join(tempDir, "config.json");
      const data = { existing: "data" };
      writeFileSync(filePath, JSON.stringify(data), "utf-8");
      const config = new JsonConfig(filePath, true);

      const result = config.read();

      expect(result).toEqual(data);
    });
  });

  describe("update", () => {
    it("writes data as pretty-printed JSON", () => {
      const filePath = join(tempDir, "config.json");
      writeFileSync(filePath, "{}", "utf-8");
      const config = new JsonConfig(filePath);

      config.update({ key: "value" });

      const content = readFileSync(filePath, "utf-8");
      expect(content).toBe(JSON.stringify({ key: "value" }, null, 2) + "\n");
    });

    it("throws ConfigNotFoundError when the file does not exist", () => {
      const filePath = join(tempDir, "missing.json");
      const config = new JsonConfig(filePath);

      expect(() => config.update({ key: "value" })).toThrow(
        ConfigNotFoundError,
      );
    });

    it("creates the file when createIfMissing is true and file does not exist", () => {
      const filePath = join(tempDir, "config.json");
      const config = new JsonConfig(filePath, true);

      config.update({ key: "value" });

      expect(existsSync(filePath)).toBe(true);
      expect(JSON.parse(readFileSync(filePath, "utf-8"))).toEqual({
        key: "value",
      });
    });

    it("creates parent directories when createIfMissing is true", () => {
      const filePath = join(tempDir, "nested", "deep", "config.json");
      const config = new JsonConfig(filePath, true);

      config.update({ key: "value" });

      expect(existsSync(filePath)).toBe(true);
      expect(JSON.parse(readFileSync(filePath, "utf-8"))).toEqual({
        key: "value",
      });
    });
  });
});
