import { describe, expect, it } from "vitest";
import { positive, negative, section, divider } from "#util/format-output.js";

describe("format-output", () => {
  describe("positive", () => {
    it("returns a string containing the provided message", () => {
      expect(positive("operation succeeded")).toContain("operation succeeded");
    });

    it("returns a non-empty string for any input", () => {
      expect(positive("hello").length).toBeGreaterThan(0);
    });

    it("preserves the full message text", () => {
      const msg = "Claude Code v1.0.26";
      const result = positive(msg);
      expect(result).toContain(msg);
    });
  });

  describe("negative", () => {
    it("returns a string containing the provided message", () => {
      expect(negative("something failed")).toContain("something failed");
    });

    it("returns a non-empty string for any input", () => {
      expect(negative("error").length).toBeGreaterThan(0);
    });

    it("preserves the full message text", () => {
      const msg = "plugin@owner not found in config";
      const result = negative(msg);
      expect(result).toContain(msg);
    });
  });

  describe("section", () => {
    it("returns an array containing the label text", () => {
      const lines = section("my-plugin@owner");
      const joined = lines.join("\n");
      expect(joined).toContain("my-plugin@owner");
    });

    it("includes the divider in its output", () => {
      const lines = section("my-plugin@owner");
      const joined = lines.join("\n");
      expect(joined).toContain(divider());
    });

    it("returns the same structure on repeated calls with the same label", () => {
      expect(section("label")).toEqual(section("label"));
    });
  });

  describe("divider", () => {
    it("returns a non-empty string", () => {
      expect(divider().length).toBeGreaterThan(0);
    });

    it("returns the same value on repeated calls", () => {
      expect(divider()).toBe(divider());
    });
  });

  describe("format types produce distinct output", () => {
    it("positive and negative return different results for the same message", () => {
      const msg = "same message";
      expect(positive(msg)).not.toBe(negative(msg));
    });
  });
});
