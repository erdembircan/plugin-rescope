import { describe, expect, it } from "vitest";
import { FlagParser } from "#util/FlagParser.js";

describe("FlagParser", () => {
  it("parses flags with their values", () => {
    const result = FlagParser.parse(
      ["--scope", "local", "--output", "dist"],
      ["scope", "output"],
    );

    expect(result.flags["scope"]).toBe("local");
    expect(result.flags["output"]).toBe("dist");
  });

  it("defaults missing flags to empty string", () => {
    const result = FlagParser.parse(["--scope", "local"], ["scope", "output"]);

    expect(result.flags["scope"]).toBe("local");
    expect(result.flags["output"]).toBe("");
  });

  it("extracts the positional argument", () => {
    const result = FlagParser.parse(["my-plugin"], ["scope"]);

    expect(result.positional).toBe("my-plugin");
  });

  it("defaults positional to empty string when not provided", () => {
    const result = FlagParser.parse(["--scope", "local"], ["scope"]);

    expect(result.positional).toBe("");
  });

  it("parses a mix of flags and positional argument", () => {
    const result = FlagParser.parse(
      ["--scope", "local", "my-plugin"],
      ["scope"],
    );

    expect(result.flags["scope"]).toBe("local");
    expect(result.positional).toBe("my-plugin");
  });

  it("handles positional argument before flags", () => {
    const result = FlagParser.parse(
      ["my-plugin", "--scope", "local"],
      ["scope"],
    );

    expect(result.flags["scope"]).toBe("local");
    expect(result.positional).toBe("my-plugin");
  });

  it("returns all empty values when args is empty", () => {
    const result = FlagParser.parse([], ["scope", "output"]);

    expect(result.flags["scope"]).toBe("");
    expect(result.flags["output"]).toBe("");
    expect(result.positional).toBe("");
  });
});
