import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JsonConfig } from "#util/JsonConfig.js";
import { ConfigNotFoundError } from "#util/ConfigNotFoundError.js";

vi.mock("node:fs");

describe("JsonConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("read", () => {
    it("returns parsed JSON from the file", () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ key: "value" }));
      const config = new JsonConfig("/path/to/config.json");

      const result = config.read();

      expect(result).toEqual({ key: "value" });
    });

    it("throws ConfigNotFoundError when the file does not exist", () => {
      vi.mocked(existsSync).mockReturnValue(false);
      const config = new JsonConfig("/path/to/missing.json");

      expect(() => config.read()).toThrow(ConfigNotFoundError);
    });

    it("returns an empty object when createIfMissing is true and file does not exist", () => {
      vi.mocked(existsSync).mockReturnValue(false);
      const config = new JsonConfig("/path/to/config.json", true);

      const result = config.read();

      expect(result).toEqual({});
    });

    it("does not write to disk when createIfMissing is true and file does not exist", () => {
      vi.mocked(existsSync).mockReturnValue(false);
      const config = new JsonConfig("/path/to/config.json", true);

      config.read();

      expect(writeFileSync).not.toHaveBeenCalled();
      expect(mkdirSync).not.toHaveBeenCalled();
    });

    it("returns existing file contents when createIfMissing is true and file exists", () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify({ existing: "data" }),
      );
      const config = new JsonConfig("/path/to/config.json", true);

      const result = config.read();

      expect(result).toEqual({ existing: "data" });
    });
  });

  describe("update", () => {
    it("writes data as pretty-printed JSON", () => {
      vi.mocked(existsSync).mockReturnValue(true);
      const config = new JsonConfig("/path/to/config.json");

      config.update({ key: "value" });

      expect(writeFileSync).toHaveBeenCalledWith(
        "/path/to/config.json",
        JSON.stringify({ key: "value" }, null, 2) + "\n",
        "utf-8",
      );
    });

    it("throws ConfigNotFoundError when the file does not exist", () => {
      vi.mocked(existsSync).mockReturnValue(false);
      const config = new JsonConfig("/path/to/missing.json");

      expect(() => config.update({ key: "value" })).toThrow(
        ConfigNotFoundError,
      );
    });

    it("creates parent directories when createIfMissing is true and file does not exist", () => {
      vi.mocked(existsSync).mockReturnValue(false);
      const config = new JsonConfig("/path/to/nested/config.json", true);

      config.update({ key: "value" });

      expect(mkdirSync).toHaveBeenCalledWith("/path/to/nested", {
        recursive: true,
      });
      expect(writeFileSync).toHaveBeenCalledWith(
        "/path/to/nested/config.json",
        JSON.stringify({ key: "value" }, null, 2) + "\n",
        "utf-8",
      );
    });

    it("writes data without creating directories when file already exists", () => {
      vi.mocked(existsSync).mockReturnValue(true);
      const config = new JsonConfig("/path/to/config.json", true);

      config.update({ key: "value" });

      expect(mkdirSync).not.toHaveBeenCalled();
      expect(writeFileSync).toHaveBeenCalledWith(
        "/path/to/config.json",
        JSON.stringify({ key: "value" }, null, 2) + "\n",
        "utf-8",
      );
    });
  });
});
