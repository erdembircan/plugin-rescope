import { describe, expect, it } from "vitest";
import { FlagParser } from "#util/FlagParser.js";

describe("FlagParser", () => {
  it("parses flags with their values", () => {
    const parser = new FlagParser(
      ["--scope", "local", "--output", "dist"],
      ["--scope", "--output"],
    );

    const result = parser.parse();

    expect(result.flags["--scope"]).toBe("local");
    expect(result.flags["--output"]).toBe("dist");
  });

  it("defaults missing flags to empty string", () => {
    const parser = new FlagParser(
      ["--scope", "local"],
      ["--scope", "--output"],
    );

    const result = parser.parse();

    expect(result.flags["--scope"]).toBe("local");
    expect(result.flags["--output"]).toBe("");
  });

  it("extracts the positional argument", () => {
    const parser = new FlagParser(["my-plugin"], ["--scope"]);

    const result = parser.parse();

    expect(result.positional).toBe("my-plugin");
  });

  it("defaults positional to empty string when not provided", () => {
    const parser = new FlagParser(["--scope", "local"], ["--scope"]);

    const result = parser.parse();

    expect(result.positional).toBe("");
  });

  it("parses a mix of flags and positional argument", () => {
    const parser = new FlagParser(
      ["--scope", "local", "my-plugin"],
      ["--scope"],
    );

    const result = parser.parse();

    expect(result.flags["--scope"]).toBe("local");
    expect(result.positional).toBe("my-plugin");
  });

  it("handles positional argument before flags", () => {
    const parser = new FlagParser(
      ["my-plugin", "--scope", "local"],
      ["--scope"],
    );

    const result = parser.parse();

    expect(result.flags["--scope"]).toBe("local");
    expect(result.positional).toBe("my-plugin");
  });

  it("returns all empty values when args is empty", () => {
    const parser = new FlagParser([], ["--scope", "--output"]);

    const result = parser.parse();

    expect(result.flags["--scope"]).toBe("");
    expect(result.flags["--output"]).toBe("");
    expect(result.positional).toBe("");
  });
});
