import { describe, expect, it } from "vitest";
import { FormatOutput } from "#util/FormatOutput.js";

describe("FormatOutput", () => {
  describe("header", () => {
    it("returns a string containing the provided label", () => {
      expect(FormatOutput.header("my-plugin@owner")).toContain(
        "my-plugin@owner",
      );
    });

    it("returns a non-empty string for any input", () => {
      expect(FormatOutput.header("test").length).toBeGreaterThan(0);
    });

    it("preserves the full label text", () => {
      const label = "complex-plugin@some-org";
      expect(FormatOutput.header(label)).toContain(label);
    });
  });

  describe("footer", () => {
    it("returns a non-empty string", () => {
      expect(FormatOutput.footer().length).toBeGreaterThan(0);
    });

    it("returns the same value on repeated calls", () => {
      expect(FormatOutput.footer()).toBe(FormatOutput.footer());
    });
  });

  describe("positive", () => {
    it("returns a string containing the provided message", () => {
      expect(FormatOutput.positive("operation succeeded")).toContain(
        "operation succeeded",
      );
    });

    it("returns a non-empty string for any input", () => {
      expect(FormatOutput.positive("hello").length).toBeGreaterThan(0);
    });

    it("preserves the full message text", () => {
      const msg = "Claude Code v1.0.26";
      expect(FormatOutput.positive(msg)).toContain(msg);
    });
  });

  describe("negative", () => {
    it("returns a string containing the provided message", () => {
      expect(FormatOutput.negative("something failed")).toContain(
        "something failed",
      );
    });

    it("returns a non-empty string for any input", () => {
      expect(FormatOutput.negative("error").length).toBeGreaterThan(0);
    });

    it("preserves the full message text", () => {
      const msg = "plugin@owner not found in config";
      expect(FormatOutput.negative(msg)).toContain(msg);
    });
  });

  describe("format types produce distinct output", () => {
    it("positive and negative return different results for the same message", () => {
      const msg = "same message";
      expect(FormatOutput.positive(msg)).not.toBe(FormatOutput.negative(msg));
    });

    it("header and footer return different results", () => {
      expect(FormatOutput.header("label")).not.toBe(FormatOutput.footer());
    });
  });
});
